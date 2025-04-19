
/**
 * Core types for the AI Patent Search application using the ADRLCS pipeline
 */

/**
 * Represents a patent record in the database
 */
export interface Patent {
  id: string;
  title: string;
  abstract: string;
  embedding?: number[]; // Vector embedding from OpenAI
  gnn_embedding?: number[]; // Graph Neural Network embedding
  created_at: string;
}

/**
 * Represents a citation relationship between two patents
 */
export interface Citation {
  from_uuid: string;
  to_uuid: string;
}

/**
 * Represents a domain classification for a patent
 */
export interface Classification {
  patent_id: string;
  domain: string;
  confidence: number;
}

/**
 * Represents a search result with scoring components from the ADRLCS pipeline
 */
export interface SearchResult {
  patent: Patent;
  scores: {
    bm25: number;
    semantic: number;
    llm_coherence: number;
    gnn: number;
    prf: number;
    user_feedback: number;
    final: number;
    diversity_penalty: number;
  };
  classification?: Classification;
  matched_keywords?: string[];
  debugging?: {
    original_score?: number;
    enhanced_score?: number;
    weights_used?: Record<string, number>;
  };
}

/**
 * Parameters for the search request
 */
export interface SearchRequest {
  query: string;
  limit?: number;
  useAdrlcs?: boolean; // Toggle to use full ADRLCS pipeline or just basic search
  semanticThreshold?: number; // Minimum semantic similarity score (0-1)
  useEnhancedScoring?: boolean; // Use improved scoring weights
  useQueryExpansion?: boolean; // Expand query with technical terms
}

/**
 * Response from the search API
 */
export interface SearchResponse {
  results: SearchResult[];
  timing_ms: number;
  pipeline_stages: {
    stage: string;
    timing_ms: number;
  }[];
}

/**
 * Request to classify a patent
 */
export interface ClassifyRequest {
  patent_id: string;
}

/**
 * Response from the classify API
 */
export interface ClassifyResponse {
  classifications: Classification[];
  success: boolean;
}

/**
 * Request to ingest a new patent
 */
export interface IngestRequest {
  title: string;
  abstract: string;
}

/**
 * Response from the ingest API
 */
export interface IngestResponse {
  patent_id: string;
  success: boolean;
}
