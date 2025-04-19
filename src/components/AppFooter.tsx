
import React from "react";

const AppFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-patent-primary tracking-wider uppercase mb-4">
              About PatentAI Nexus
            </h3>
            <p className="text-sm text-gray-600">
              An advanced patent search system utilizing the ADRLCS pipeline to combine multiple relevance signals
              for optimal ranking of patents based on user queries.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-patent-primary tracking-wider uppercase mb-4">
              ADRLCS Pipeline
            </h3>
            <ul className="space-y-2 text-sm">
              <li>BM25 Filtering</li>
              <li>Semantic Bi-encoder</li>
              <li>LLM Coherence Scoring</li>
              <li>GNN Embeddings</li>
              <li>PRF Methodology</li>
              <li>RL Weight Adaptation</li>
              <li>MMR Diversity</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-patent-primary tracking-wider uppercase mb-4">
              Technical Stack
            </h3>
            <ul className="space-y-2 text-sm">
              <li>Frontend: React, TypeScript, Tailwind CSS</li>
              <li>Backend: Node.js, Express, TypeScript</li>
              <li>Database: Supabase with pgvector</li>
              <li>AI: OpenAI API, Sentence-Transformers, GraphSAGE</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} PatentAI Nexus. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
