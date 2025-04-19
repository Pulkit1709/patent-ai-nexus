
/**
 * Example Node.js + Express backend for PatentAI Nexus ADRLCS pipeline
 * 
 * This is a simplified example of the backend API endpoints for:
 * - Ingesting new patents
 * - Searching patents with the ADRLCS pipeline
 * - Classifying patents into domains
 */

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { Configuration, OpenAIApi } = require('openai');
const { SentenceTransformer } = require('sentence-transformers');
const { MMR } = require('./lib/mmr');
const { PRF } = require('./lib/prf');
const { RLWeightAdapter } = require('./lib/rl-weight-adapter');
const { BertClassifier } = require('./lib/bert-classifier');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Initialize OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

// Initialize Sentence Transformer
const sentenceTransformer = new SentenceTransformer('all-MiniLM-L6-v2');

// Initialize BERT classifier
const bertClassifier = new BertClassifier();

// Helper to time execution
const timeExecution = async (name, fn) => {
  const start = Date.now();
  const result = await fn();
  const timing_ms = Date.now() - start;
  return { result, timing_ms, name };
};

/**
 * POST /api/ingest
 * Ingest a new patent into the system
 */
app.post('/api/ingest', async (req, res) => {
  try {
    const { title, abstract } = req.body;
    
    if (!title || !abstract) {
      return res.status(400).json({
        success: false,
        message: 'Title and abstract are required'
      });
    }
    
    // Insert into Supabase patents table
    const { data: patent, error } = await supabaseClient
      .from('patents')
      .insert({
        title,
        abstract
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }
    
    return res.json({
      success: true,
      patent_id: patent.id,
      message: 'Patent successfully ingested. Embeddings will be generated asynchronously.'
    });
  } catch (error) {
    console.error('Error ingesting patent:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/search
 * Search patents using the ADRLCS pipeline
 */
app.post('/api/search', async (req, res) => {
  try {
    const { query, limit = 10, useAdrlcs = true } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }
    
    const pipeline_stages = [];
    
    // 1. BM25 Filtering using Postgres full-text search
    const bm25Stage = await timeExecution('BM25 Filtering', async () => {
      const { data: bm25Results, error } = await supabaseClient
        .from('patents')
        .select('*')
        .textSearch('title', query, { type: 'websearch' })
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (error) {
        throw new Error(`BM25 search error: ${error.message}`);
      }
        
      return bm25Results;
    });
    
    pipeline_stages.push({
      stage: bm25Stage.name,
      timing_ms: bm25Stage.timing_ms
    });
    
    if (!useAdrlcs) {
      // If not using ADRLCS, just return BM25 results
      return res.json({
        results: bm25Stage.result.slice(0, limit).map(patent => ({
          patent,
          scores: {
            bm25: 1.0,
            semantic: 0,
            llm_coherence: 0,
            gnn: 0,
            prf: 0,
            user_feedback: 0,
            final: 1.0,
            diversity_penalty: 0
          }
        })),
        timing_ms: bm25Stage.timing_ms,
        pipeline_stages
      });
    }
    
    // 2. Get embeddings for the query
    const embeddingStage = await timeExecution('Semantic Embedding', async () => {
      const response = await openai.createEmbedding({
        model: 'text-embedding-ada-002',
        input: query,
      });
      
      return response.data.data[0].embedding;
    });
    
    pipeline_stages.push({
      stage: embeddingStage.name,
      timing_ms: embeddingStage.timing_ms
    });
    
    // 3. Get vector similarity results using pgvector
    const vectorStage = await timeExecution('Vector Similarity', async () => {
      const queryVector = embeddingStage.result;
      
      const { data: vectorResults, error } = await supabaseClient.rpc(
        'match_patents',
        {
          query_embedding: queryVector,
          match_threshold: 0.5,
          match_count: 100
        }
      );
      
      if (error) {
        throw new Error(`Vector search error: ${error.message}`);
      }
      
      return vectorResults;
    });
    
    pipeline_stages.push({
      stage: vectorStage.name,
      timing_ms: vectorStage.timing_ms
    });
    
    // 4. Combine BM25 and vector results
    const combinedResults = await timeExecution('Result Combination', async () => {
      // Get unique patents from both result sets
      const bm25Map = new Map(
        bm25Stage.result.map(p => [p.id, { patent: p, bm25Score: 1.0 }])
      );
      
      const vectorMap = new Map(
        vectorStage.result.map(p => [
          p.id, 
          { 
            patent: p, 
            semanticScore: p.similarity 
          }
        ])
      );
      
      // Merge results, prioritizing patents that appear in both sets
      const mergedResults = new Map();
      
      for (const [id, data] of bm25Map.entries()) {
        mergedResults.set(id, {
          patent: data.patent,
          scores: {
            bm25: data.bm25Score,
            semantic: vectorMap.has(id) ? vectorMap.get(id).semanticScore : 0,
          }
        });
      }
      
      for (const [id, data] of vectorMap.entries()) {
        if (!mergedResults.has(id)) {
          mergedResults.set(id, {
            patent: data.patent,
            scores: {
              bm25: 0,
              semantic: data.semanticScore,
            }
          });
        }
      }
      
      return Array.from(mergedResults.values());
    });
    
    pipeline_stages.push({
      stage: combinedResults.name,
      timing_ms: combinedResults.timing_ms
    });
    
    // 5. For top K results, compute LLM coherence score
    const topCandidates = combinedResults.result
      .sort((a, b) => 
        (b.scores.bm25 * 0.4 + b.scores.semantic * 0.6) - 
        (a.scores.bm25 * 0.4 + a.scores.semantic * 0.6)
      )
      .slice(0, 20);
    
    const llmStage = await timeExecution('LLM Coherence Scoring', async () => {
      const llmPromises = topCandidates.map(async (result) => {
        const patent = result.patent;
        const prompt = `You are a patent expert. Score the relevance of query: ${query} versus patent: ${patent.title}. ${patent.abstract}. Think step by step about technical alignment, conceptual overlap, and potential relevance before giving a score from 0-10.`;
        
        try {
          const response = await openai.createChatCompletion({
            model: 'gpt-4-1106-preview',
            messages: [
              { role: 'system', content: 'You are a patent expert assistant.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 200
          });
          
          const llmResponse = response.data.choices[0].message.content;
          
          // Extract score from response (simple regex)
          const scoreMatch = llmResponse.match(/(\d+(\.\d+)?)(\/10)?/);
          const score = scoreMatch ? parseFloat(scoreMatch[1]) / 10 : 0.5;
          
          return {
            ...result,
            scores: {
              ...result.scores,
              llm_coherence: score
            }
          };
        } catch (error) {
          console.error('Error getting LLM score:', error);
          return {
            ...result,
            scores: {
              ...result.scores,
              llm_coherence: 0.5 // Default fallback score
            }
          };
        }
      });
      
      return await Promise.all(llmPromises);
    });
    
    pipeline_stages.push({
      stage: llmStage.name,
      timing_ms: llmStage.timing_ms
    });
    
    // 6. Get GNN embeddings and compute similarity
    const gnnStage = await timeExecution('GNN Embedding Similarity', async () => {
      return llmStage.result.map(result => {
        const patent = result.patent;
        
        // If GNN embedding is available, compute similarity
        if (patent.gnn_embedding) {
          // This would normally be a similarity computation between 
          // query GNN embedding and patent GNN embedding
          // For this example, we generate a random score
          const gnnScore = 0.3 + (Math.random() * 0.7);
          
          return {
            ...result,
            scores: {
              ...result.scores,
              gnn: gnnScore
            }
          };
        } else {
          return {
            ...result,
            scores: {
              ...result.scores,
              gnn: 0 // No GNN score available
            }
          };
        }
      });
    });
    
    pipeline_stages.push({
      stage: gnnStage.name,
      timing_ms: gnnStage.timing_ms
    });
    
    // 7. PRF: Pseudo-Relevance Feedback
    const prfStage = await timeExecution('PRF Expansion', async () => {
      // For this example, we simply calculate a PRF score
      // In a real system, we would use the top results to expand the query
      return gnnStage.result.map(result => {
        // Calculate a PRF score combining semantic similarity and llm coherence
        const prfScore = 
          (result.scores.semantic * 0.7) + 
          (result.scores.llm_coherence * 0.3);
          
        return {
          ...result,
          scores: {
            ...result.scores,
            prf: prfScore
          }
        };
      });
    });
    
    pipeline_stages.push({
      stage: prfStage.name,
      timing_ms: prfStage.timing_ms
    });
    
    // 8. RL Weighting
    const rlStage = await timeExecution('RL Weighting', async () => {
      // For this example, we use fixed weights
      // In a real system, these would be learned weights from the RL system
      const weights = {
        bm25: 0.15,
        semantic: 0.25,
        llm_coherence: 0.3,
        gnn: 0.1,
        prf: 0.1,
        user_feedback: 0.1
      };
      
      return prfStage.result.map(result => {
        // Add a mock user feedback score
        const userFeedback = Math.random() * 0.7 + 0.3;
        
        // Calculate final score as weighted sum
        const finalScore = 
          (weights.bm25 * result.scores.bm25) +
          (weights.semantic * result.scores.semantic) +
          (weights.llm_coherence * result.scores.llm_coherence) +
          (weights.gnn * (result.scores.gnn || 0)) +
          (weights.prf * result.scores.prf) +
          (weights.user_feedback * userFeedback);
          
        return {
          ...result,
          scores: {
            ...result.scores,
            user_feedback: userFeedback,
            final: finalScore,
            diversity_penalty: 0 // Will be calculated in MMR step
          }
        };
      });
    });
    
    pipeline_stages.push({
      stage: rlStage.name,
      timing_ms: rlStage.timing_ms
    });
    
    // 9. MMR Diversity
    const mmrStage = await timeExecution('MMR Diversity', async () => {
      // Sort by final score
      const sortedResults = [...rlStage.result].sort(
        (a, b) => b.scores.final - a.scores.final
      );
      
      // Apply diversity penalty (simplified version)
      let selectedResults = [];
      const candidateResults = [...sortedResults];
      
      while (selectedResults.length < limit && candidateResults.length > 0) {
        // Get the top candidate
        const topCandidate = candidateResults.shift();
        selectedResults.push(topCandidate);
        
        // Apply diversity penalty to remaining candidates
        for (let i = 0; i < candidateResults.length; i++) {
          const candidate = candidateResults[i];
          
          // Compute similarity to the selected result (simple text-based similarity)
          const similarity = 
            topCandidate.patent.title.toLowerCase() ===
            candidate.patent.title.toLowerCase() ? 0.9 : 0.1;
          
          // Apply diversity penalty
          const diversityPenalty = similarity * 0.2;
          candidate.scores.diversity_penalty = 
            (candidate.scores.diversity_penalty || 0) + diversityPenalty;
          candidate.scores.final -= diversityPenalty;
        }
        
        // Re-sort candidates by final score
        candidateResults.sort((a, b) => b.scores.final - a.scores.final);
      }
      
      return selectedResults;
    });
    
    pipeline_stages.push({
      stage: mmrStage.name,
      timing_ms: mmrStage.timing_ms
    });
    
    // Calculate total execution time
    const totalTimeMs = pipeline_stages.reduce(
      (sum, stage) => sum + stage.timing_ms, 0
    );
    
    // Get classifications for the results
    const finalResults = await Promise.all(
      mmrStage.result.map(async (result) => {
        const { data: classifications, error } = await supabaseClient
          .from('classifications')
          .select('*')
          .eq('patent_id', result.patent.id);
        
        return {
          ...result,
          classification: classifications?.length > 0 
            ? classifications[0]
            : null
        };
      })
    );
    
    return res.json({
      results: finalResults,
      timing_ms: totalTimeMs,
      pipeline_stages
    });
  } catch (error) {
    console.error('Error searching patents:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/classify
 * Classify a patent into domains
 */
app.post('/api/classify', async (req, res) => {
  try {
    const { patent_id } = req.body;
    
    if (!patent_id) {
      return res.status(400).json({
        success: false,
        message: 'Patent ID is required'
      });
    }
    
    // Get patent data
    const { data: patent, error } = await supabaseClient
      .from('patents')
      .select('*')
      .eq('id', patent_id)
      .single();
    
    if (error) {
      throw new Error(`Error fetching patent: ${error.message}`);
    }
    
    if (!patent) {
      return res.status(404).json({
        success: false,
        message: 'Patent not found'
      });
    }
    
    // Use BERT classifier to get domain predictions
    const domains = await bertClassifier.classify(
      patent.title, 
      patent.abstract
    );
    
    // Store classifications in database
    const classificationsToInsert = domains.map(d => ({
      patent_id,
      domain: d.label,
      confidence: d.score
    }));
    
    const { error: insertError } = await supabaseClient
      .from('classifications')
      .upsert(classificationsToInsert, { 
        onConflict: 'patent_id,domain',
        ignoreDuplicates: false
      });
    
    if (insertError) {
      throw new Error(`Error inserting classifications: ${insertError.message}`);
    }
    
    return res.json({
      success: true,
      classifications: classificationsToInsert
    });
  } catch (error) {
    console.error('Error classifying patent:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
