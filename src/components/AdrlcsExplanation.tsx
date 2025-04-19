
import React from "react";

const AdrlcsExplanation: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold text-patent-primary mb-4">ADRLCS Pipeline Explained</h2>
      
      <p className="text-gray-700 mb-6">
        The Advanced Deep Retrieval Learning with Combined Signals (ADRLCS) pipeline is a state-of-the-art
        approach to patent retrieval that combines multiple relevance signals for optimal ranking.
      </p>
      
      <div className="space-y-6">
        {/* BM25 */}
        <div className="border-l-4 border-patent-primary pl-4">
          <h3 className="text-lg font-medium text-patent-primary mb-2">BM25 Filtering</h3>
          <p className="text-sm text-gray-600">
            BM25 is a bag-of-words retrieval function that ranks documents based on the query terms appearing 
            in each document. It provides a strong baseline for keyword matching and serves as an initial filter
            in our pipeline. We implement this using Postgres full-text search capabilities.
          </p>
        </div>
        
        {/* Bi-encoder */}
        <div className="border-l-4 border-patent-secondary pl-4">
          <h3 className="text-lg font-medium text-patent-primary mb-2">Semantic Bi-encoder</h3>
          <p className="text-sm text-gray-600">
            We use the Sentence-Transformers "all-MiniLM-L6-v2" model to generate dense vector embeddings
            of patents and queries. These embeddings capture semantic meaning beyond keywords, allowing
            for similarity matching based on conceptual understanding rather than exact term matching.
            Vectors are stored in pgvector for efficient similarity search.
          </p>
        </div>
        
        {/* LLM Coherence */}
        <div className="border-l-4 border-patent-highlight pl-4">
          <h3 className="text-lg font-medium text-patent-primary mb-2">LLM Coherence Scoring</h3>
          <p className="text-sm text-gray-600">
            We use GPT-4 with chain-of-thought prompting to evaluate the relevance between a query and 
            patent. The LLM analyzes both inputs and provides a coherence score based on technical alignment,
            conceptual overlap, and potential relevance. This approach captures nuanced relationships missed
            by other methods.
          </p>
        </div>
        
        {/* GNN Embeddings */}
        <div className="border-l-4 border-patent-primary pl-4">
          <h3 className="text-lg font-medium text-patent-primary mb-2">GNN Embeddings</h3>
          <p className="text-sm text-gray-600">
            Using GraphSAGE on the citation network, we generate graph neural network embeddings that capture
            the position of each patent in the broader citation landscape. Patents with similar citation patterns
            receive similar embeddings, helping to identify related patents even when text similarity is low.
          </p>
        </div>
        
        {/* PRF */}
        <div className="border-l-4 border-patent-secondary pl-4">
          <h3 className="text-lg font-medium text-patent-primary mb-2">Pseudo-Relevance Feedback (PRF)</h3>
          <p className="text-sm text-gray-600">
            PRF improves search results by assuming top-ranked documents are relevant and using them to expand
            the original query. We average the embeddings of the top 5 results from the initial search to create
            an expanded query vector, then re-score patents against this enriched representation.
          </p>
        </div>
        
        {/* RL Weight Adaptation */}
        <div className="border-l-4 border-patent-highlight pl-4">
          <h3 className="text-lg font-medium text-patent-primary mb-2">RL Weight Adaptation</h3>
          <p className="text-sm text-gray-600">
            A contextual bandit algorithm dynamically adjusts the weights of different signals based on query 
            context and historical performance. This reinforcement learning approach optimizes the combination of
            signals for different types of queries, improving results over time through user feedback.
          </p>
        </div>
        
        {/* MMR Diversity */}
        <div className="border-l-4 border-patent-primary pl-4">
          <h3 className="text-lg font-medium text-patent-primary mb-2">MMR Diversity Penalty</h3>
          <p className="text-sm text-gray-600">
            Maximal Marginal Relevance (MMR) balances relevance with diversity by penalizing results that are
            too similar to higher-ranked results. This ensures a broader coverage of the patent landscape in the
            search results, providing users with diverse but relevant patents.
          </p>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-patent-primary mb-4">ADRLCS Pipeline Architecture</h3>
        
        <div className="overflow-x-auto">
          <pre className="bg-gray-50 p-4 rounded text-xs font-mono text-gray-800">
{`
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │     │                     │
│  Query Processing   │────▶│  Signal Generation  │────▶│  Signal Combination │
│                     │     │                     │     │                     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
          │                          ▲                            │
          │                          │                            │
          ▼                          │                            ▼
┌─────────────────────┐              │              ┌─────────────────────┐
│                     │              │              │                     │
│   BM25 Filtering    │──────────────┘              │   Result Ranking    │
│                     │                             │                     │
└─────────────────────┘                             └─────────────────────┘
                                                             │
┌─────────────────────┐     ┌─────────────────────┐         │
│                     │     │                     │         │
│  Semantic Encoding  │────▶│     User Interface  │◀────────┘
│                     │     │                     │
└─────────────────────┘     └─────────────────────┘
`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default AdrlcsExplanation;
