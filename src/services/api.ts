
import { supabase } from "@/integrations/supabase/client";
import { SearchRequest, SearchResponse, IngestRequest, IngestResponse, ClassifyRequest, ClassifyResponse } from "@/types/patent";

export async function searchPatents(request: SearchRequest): Promise<SearchResponse> {
  const { query, limit = 10, useAdrlcs = true } = request;
  
  // For now, implement basic search using text similarity
  const { data: results, error } = await supabase
    .from('patents')
    .select(`
      id,
      title,
      abstract,
      created_at,
      classifications (
        domain,
        confidence
      )
    `)
    .textSearch('title', query, { type: 'websearch' })
    .limit(limit);

  if (error) throw error;

  // Transform to SearchResponse format
  return {
    results: results.map(patent => ({
      patent: {
        id: patent.id,
        title: patent.title,
        abstract: patent.abstract,
        created_at: patent.created_at
      },
      scores: {
        bm25: 0.8, // Placeholder scores for now
        semantic: 0.7,
        llm_coherence: 0.6,
        gnn: 0.5,
        prf: 0.4,
        user_feedback: 0.3,
        final: 0.7,
        diversity_penalty: 0.1
      },
      classification: patent.classifications?.[0]
    })),
    timing_ms: 100,
    pipeline_stages: [
      { stage: 'BM25 Search', timing_ms: 50 },
      { stage: 'Result Ranking', timing_ms: 50 }
    ]
  };
}

export async function ingestPatent(request: IngestRequest): Promise<IngestResponse> {
  const { title, abstract } = request;
  
  const { data, error } = await supabase
    .from('patents')
    .insert([{ title, abstract }])
    .select()
    .single();

  if (error) throw error;

  return {
    patent_id: data.id,
    success: true
  };
}

export async function classifyPatent(request: ClassifyRequest): Promise<ClassifyResponse> {
  const { patent_id } = request;
  
  // For now, return mock classification
  const classifications = [{
    patent_id,
    domain: "Machine Learning",
    confidence: 0.85
  }];

  return {
    classifications,
    success: true
  };
}
