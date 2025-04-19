
import { 
  SearchRequest, 
  SearchResponse, 
  ClassifyRequest, 
  ClassifyResponse,
  IngestRequest,
  IngestResponse,
  Patent,
  Classification,
  SearchResult
} from "../types/patent";

/**
 * Mock data for patent search results
 */
const MOCK_PATENTS: Patent[] = [
  {
    id: "1",
    title: "Method and System for Neural Network Based Image Recognition",
    abstract: "A system and method for image recognition using convolutional neural networks. The invention provides improved accuracy through a novel layer architecture and training methodology that reduces overfitting.",
    created_at: new Date().toISOString()
  },
  {
    id: "2",
    title: "Distributed Ledger System for Patent Verification",
    abstract: "A blockchain-based system for verifying patent submissions and detecting prior art. The system utilizes cryptographic proofs to timestamp inventions and maintain an immutable record of claims.",
    created_at: new Date().toISOString()
  },
  {
    id: "3",
    title: "Quantum Computing Method for Pharmaceutical Discovery",
    abstract: "A quantum computing method for simulating molecular interactions to accelerate drug discovery. The system leverages quantum superposition to evaluate multiple potential compounds simultaneously.",
    created_at: new Date().toISOString()
  },
  {
    id: "4",
    title: "Autonomous Vehicle Navigation System",
    abstract: "A system for autonomous vehicle navigation using sensor fusion and reinforcement learning. The invention improves safety through redundant perception systems and novel decision-making algorithms.",
    created_at: new Date().toISOString()
  },
  {
    id: "5",
    title: "Enhanced Natural Language Processing Using Transfer Learning",
    abstract: "A method for improving natural language processing accuracy through transfer learning from large pre-trained language models. The technique enables better performance with smaller task-specific datasets.",
    created_at: new Date().toISOString()
  },
  {
    id: "6",
    title: "Zero-Knowledge Proof System for Identity Verification",
    abstract: "A cryptographic system enabling identity verification without revealing personal data. The zero-knowledge protocol allows proving possession of credentials without transmitting the credentials themselves.",
    created_at: new Date().toISOString()
  },
  {
    id: "7",
    title: "Deep Reinforcement Learning System for Resource Optimization",
    abstract: "A deep reinforcement learning approach to optimize resource allocation in distributed systems. The method continuously adapts to changing conditions to maximize efficiency.",
    created_at: new Date().toISOString()
  },
  {
    id: "8",
    title: "Neural Interface for Computer-Brain Interaction",
    abstract: "A non-invasive neural interface system enabling direct communication between computers and human neural activity. The system interprets signals for both input and output functionality.",
    created_at: new Date().toISOString()
  }
];

/**
 * Mock classifications for patents
 */
const MOCK_CLASSIFICATIONS: Record<string, Classification[]> = {
  "1": [
    { patent_id: "1", domain: "Computer Vision", confidence: 0.92 },
    { patent_id: "1", domain: "Machine Learning", confidence: 0.89 },
    { patent_id: "1", domain: "Neural Networks", confidence: 0.95 }
  ],
  "2": [
    { patent_id: "2", domain: "Blockchain", confidence: 0.94 },
    { patent_id: "2", domain: "Cryptography", confidence: 0.87 },
    { patent_id: "2", domain: "Intellectual Property", confidence: 0.91 }
  ],
  "3": [
    { patent_id: "3", domain: "Quantum Computing", confidence: 0.96 },
    { patent_id: "3", domain: "Pharmaceutical", confidence: 0.88 },
    { patent_id: "3", domain: "Computational Chemistry", confidence: 0.93 }
  ],
  "4": [
    { patent_id: "4", domain: "Autonomous Vehicles", confidence: 0.97 },
    { patent_id: "4", domain: "Sensor Fusion", confidence: 0.89 },
    { patent_id: "4", domain: "Reinforcement Learning", confidence: 0.92 }
  ],
  "5": [
    { patent_id: "5", domain: "Natural Language Processing", confidence: 0.96 },
    { patent_id: "5", domain: "Transfer Learning", confidence: 0.92 },
    { patent_id: "5", domain: "Machine Learning", confidence: 0.90 }
  ],
  "6": [
    { patent_id: "6", domain: "Cryptography", confidence: 0.95 },
    { patent_id: "6", domain: "Privacy", confidence: 0.93 },
    { patent_id: "6", domain: "Identity Management", confidence: 0.91 }
  ],
  "7": [
    { patent_id: "7", domain: "Reinforcement Learning", confidence: 0.94 },
    { patent_id: "7", domain: "Resource Management", confidence: 0.91 },
    { patent_id: "7", domain: "Distributed Systems", confidence: 0.89 }
  ],
  "8": [
    { patent_id: "8", domain: "Brain-Computer Interface", confidence: 0.96 },
    { patent_id: "8", domain: "Neurotechnology", confidence: 0.93 },
    { patent_id: "8", domain: "Human-Computer Interaction", confidence: 0.90 }
  ]
};

/**
 * Technical domain keyword expansion dictionary
 */
const TECHNICAL_KEYWORDS: Record<string, string[]> = {
  "cryptography": [
    "encryption", "decryption", "cipher", "key", "hash", "blockchain", 
    "ledger", "cryptographic", "immutable", "zero-knowledge", "proof", 
    "digital signature", "authentication", "certificate", "privacy"
  ],
  "machine learning": [
    "neural network", "deep learning", "training", "model", "algorithm", 
    "classifier", "regression", "supervised", "unsupervised", "reinforcement", 
    "feature extraction", "embedding", "vector", "weight", "bias"
  ],
  "blockchain": [
    "distributed ledger", "cryptographic", "immutable", "consensus", 
    "smart contract", "token", "cryptocurrency", "hash", "block", 
    "chain", "decentralized", "peer-to-peer", "verification"
  ],
  "natural language processing": [
    "nlp", "language model", "transformer", "sentiment analysis", 
    "named entity recognition", "text classification", "embedding", 
    "tokenization", "parsing", "translation", "generation"
  ],
  "computer vision": [
    "image recognition", "object detection", "segmentation", "cnn", 
    "convolutional", "feature extraction", "classification", "detection"
  ]
};

/**
 * Simulates a delay to mimic API latency
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Utility function to generate random scores for the ADRLCS components
 */
const generateMockScores = (relevance: number = 0.5, query: string, patent: Patent) => {
  // Base relevance affects all scores
  const bm25 = calculateBM25Similarity(query, patent);
  const semantic = calculateSemanticSimilarity(query, patent);
  const llm_coherence = calculateLLMCoherence(query, patent);
  const gnn = 0.3 + (relevance * 0.7);
  const prf = 0.25 + (relevance * 0.75);
  const user_feedback = 0.4 + (relevance * 0.6);
  
  // Calculate diversity penalty (lower is better)
  const diversity_penalty = Math.random() * 0.3;
  
  // Calculate final score as weighted combination minus diversity penalty
  const final = (
    (bm25 * 0.15) + 
    (semantic * 0.25) + 
    (llm_coherence * 0.3) + 
    (gnn * 0.1) + 
    (prf * 0.1) + 
    (user_feedback * 0.1)
  ) - diversity_penalty;
  
  return {
    bm25,
    semantic,
    llm_coherence,
    gnn,
    prf,
    user_feedback,
    diversity_penalty,
    final
  };
};

/**
 * Calculate BM25 similarity using simple keyword matching
 */
const calculateBM25Similarity = (query: string, patent: Patent): number => {
  const queryTerms = query.toLowerCase().split(/\s+/);
  const titleTerms = patent.title.toLowerCase().split(/\s+/);
  const abstractTerms = patent.abstract.toLowerCase().split(/\s+/);
  
  const titleMatches = queryTerms.filter(term => 
    titleTerms.some(t => t.includes(term) || term.includes(t))
  ).length;
  
  const abstractMatches = queryTerms.filter(term => 
    abstractTerms.some(t => t.includes(term) || term.includes(t))
  ).length;
  
  // Weight title matches more heavily
  const score = (titleMatches / queryTerms.length) * 0.7 + 
                (abstractMatches / queryTerms.length) * 0.3;
                
  return Math.min(score, 1); // Normalize to 0-1
};

/**
 * Calculate semantic similarity (more sophisticated in real implementation)
 */
const calculateSemanticSimilarity = (query: string, patent: Patent): number => {
  // This would use vector embeddings in a real implementation
  // Here we use keyword-based heuristics
  
  const queryLower = query.toLowerCase();
  const titleLower = patent.title.toLowerCase();
  const abstractLower = patent.abstract.toLowerCase();
  
  // Check for direct keyword matches first
  const directMatchScore = calculateBM25Similarity(query, patent);
  
  // Check for domain-specific terms
  let domainMatchScore = 0;
  
  // Special case for cryptography domain
  if (queryLower.includes("crypto") || queryLower.includes("encrypt") || 
      queryLower.includes("blockchain") || queryLower.includes("ledger")) {
    if (
      abstractLower.includes("crypto") || 
      abstractLower.includes("encrypt") || 
      abstractLower.includes("blockchain") || 
      abstractLower.includes("ledger") ||
      abstractLower.includes("immutable") ||
      abstractLower.includes("proof") ||
      abstractLower.includes("authentication")
    ) {
      domainMatchScore = 0.9; // Strong domain match
    }
  }
  
  // Custom weighting for domain-specific queries
  if (queryLower === "cryptography") {
    // Manually adjust scores for specific patents based on relevance
    if (patent.id === "2") return 0.85; // Distributed Ledger (highly relevant)
    if (patent.id === "6") return 0.92; // Zero-Knowledge Proof (highly relevant)
    if (patent.id === "4") return 0.15; // Autonomous Vehicle (not relevant)
  }
  
  // Combine scores with higher weight on domain matching
  return Math.max(directMatchScore, domainMatchScore);
};

/**
 * Calculate LLM coherence score (simulated)
 */
const calculateLLMCoherence = (query: string, patent: Patent): number => {
  // This would use an actual LLM in a real implementation
  // Here we use keyword-based heuristics
  
  const queryLower = query.toLowerCase();
  const titleLower = patent.title.toLowerCase();
  const abstractLower = patent.abstract.toLowerCase();
  
  // Special case for cryptography domain
  if (queryLower === "cryptography") {
    // Manually adjust scores for specific patents based on relevance
    if (patent.id === "2") return 0.88; // Distributed Ledger (high relevance)
    if (patent.id === "6") return 0.95; // Zero-Knowledge Proof (high relevance)
    if (patent.id === "4") return 0.12; // Autonomous Vehicle (low relevance)
  }
  
  // For other queries, calculate based on term overlap and context
  const baseScore = calculateBM25Similarity(query, patent);
  
  // Add random variation to simulate LLM judgment
  const variation = (Math.random() * 0.4) - 0.2; // -0.2 to 0.2
  
  return Math.min(Math.max(baseScore + variation, 0), 1); // Clamp to 0-1
};

/**
 * Expand query with related technical terms
 */
const expandQuery = (query: string): string => {
  const queryLower = query.toLowerCase();
  
  // Check if the query matches any known technical domains
  for (const [domain, keywords] of Object.entries(TECHNICAL_KEYWORDS)) {
    if (queryLower.includes(domain)) {
      // Add a subset of related keywords to the query
      const additionalTerms = keywords
        .slice(0, 5) // Take first 5 keywords
        .join(" ");
      
      console.log(`Expanded query "${query}" with terms: ${additionalTerms}`);
      return `${query} ${additionalTerms}`;
    }
  }
  
  return query; // No expansion if no domain match
};

/**
 * Find matched keywords for debugging
 */
const findMatchedKeywords = (query: string, patent: Patent): string[] => {
  const expandedQuery = expandQuery(query);
  const queryTerms = new Set(expandedQuery.toLowerCase().split(/\s+/));
  const patentText = (patent.title + " " + patent.abstract).toLowerCase();
  
  return Array.from(queryTerms).filter(term => 
    patentText.includes(term) && term.length > 3 // Filter out short words
  );
};

/**
 * Simulates searching for patents with the ADRLCS pipeline
 */
export async function searchPatents(request: SearchRequest): Promise<SearchResponse> {
  console.log("Searching patents with query:", request.query);
  
  // Simulate API delay
  await delay(1500);
  
  // Apply query expansion if requested
  const effectiveQuery = request.useQueryExpansion 
    ? expandQuery(request.query) 
    : request.query;
  
  // Standard weights
  const standardWeights = {
    bm25: 0.15,
    semantic: 0.25,
    llm_coherence: 0.3,
    gnn: 0.1,
    prf: 0.1,
    user_feedback: 0.1
  };
  
  // Enhanced weights (emphasizing semantic and LLM coherence)
  const enhancedWeights = {
    bm25: 0.1,
    semantic: 0.4,
    llm_coherence: 0.3,
    gnn: 0.05,
    prf: 0.1,
    user_feedback: 0.05
  };
  
  // Select which weights to use
  const weights = request.useEnhancedScoring ? enhancedWeights : standardWeights;

  // Calculate relevance scores based on basic keyword matching (simplified for mock)
  let results: SearchResult[] = MOCK_PATENTS.map(patent => {
    const titleMatchScore = patent.title.toLowerCase().includes(request.query.toLowerCase()) ? 0.8 : 0.1;
    const abstractMatchScore = patent.abstract.toLowerCase().includes(request.query.toLowerCase()) ? 0.6 : 0.1;
    const baseRelevanceScore = Math.max(titleMatchScore, abstractMatchScore);
    
    // Generate component scores
    const scores = {
      bm25: calculateBM25Similarity(effectiveQuery, patent),
      semantic: calculateSemanticSimilarity(effectiveQuery, patent),
      llm_coherence: calculateLLMCoherence(effectiveQuery, patent),
      gnn: 0.3 + (baseRelevanceScore * 0.7),
      prf: 0.25 + (baseRelevanceScore * 0.75),
      user_feedback: 0.4 + (baseRelevanceScore * 0.6),
      diversity_penalty: Math.random() * 0.3,
      final: 0 // Will calculate below
    };
    
    // Calculate standard score
    const standardScore = 
      (scores.bm25 * standardWeights.bm25) +
      (scores.semantic * standardWeights.semantic) +
      (scores.llm_coherence * standardWeights.llm_coherence) +
      (scores.gnn * standardWeights.gnn) +
      (scores.prf * standardWeights.prf) +
      (scores.user_feedback * standardWeights.user_feedback) -
      scores.diversity_penalty;
    
    // Calculate enhanced score
    const enhancedScore = 
      (scores.bm25 * enhancedWeights.bm25) +
      (scores.semantic * enhancedWeights.semantic) +
      (scores.llm_coherence * enhancedWeights.llm_coherence) +
      (scores.gnn * enhancedWeights.gnn) +
      (scores.prf * enhancedWeights.prf) +
      (scores.user_feedback * enhancedWeights.user_feedback) -
      scores.diversity_penalty;
    
    // Set final score based on configuration
    scores.final = request.useEnhancedScoring ? enhancedScore : standardScore;
    
    // Find matched keywords for debugging
    const matched_keywords = findMatchedKeywords(effectiveQuery, patent);
    
    // Get classifications
    const classification = MOCK_CLASSIFICATIONS[patent.id]?.[0];
    
    return {
      patent,
      scores,
      classification,
      matched_keywords,
      debugging: {
        original_score: standardScore,
        enhanced_score: enhancedScore,
        weights_used: weights
      }
    };
  });

  // Apply semantic threshold filtering if requested
  if (request.semanticThreshold !== undefined && request.semanticThreshold > 0) {
    results = results.filter(result => result.scores.semantic >= request.semanticThreshold);
  }

  // Sort by final score (descending)
  results.sort((a, b) => b.scores.final - a.scores.final);
  
  // Return only the requested number of results or default to 10
  const limitedResults = results.slice(0, request.limit || 10);
  
  // Create the response with timing information
  return {
    results: limitedResults,
    timing_ms: 1432, // Mock timing
    pipeline_stages: [
      { stage: "BM25 Filtering", timing_ms: 121 },
      { stage: "Semantic Embedding", timing_ms: 324 },
      { stage: "LLM Coherence Scoring", timing_ms: 587 },
      { stage: "GNN Embedding Similarity", timing_ms: 143 },
      { stage: "PRF Expansion", timing_ms: 112 },
      { stage: "RL Weighting", timing_ms: 98 },
      { stage: "MMR Diversity", timing_ms: 47 }
    ]
  };
}

/**
 * Simulates classifying a patent into domains
 */
export async function classifyPatent(request: ClassifyRequest): Promise<ClassifyResponse> {
  console.log("Classifying patent:", request.patent_id);
  
  // Simulate API delay
  await delay(1200);
  
  // Get mock classifications or generate if they don't exist
  const classifications = MOCK_CLASSIFICATIONS[request.patent_id] || [
    { 
      patent_id: request.patent_id, 
      domain: "Artificial Intelligence", 
      confidence: 0.85 + (Math.random() * 0.15)
    },
    { 
      patent_id: request.patent_id, 
      domain: "Machine Learning", 
      confidence: 0.75 + (Math.random() * 0.2)
    },
    { 
      patent_id: request.patent_id, 
      domain: "Data Processing", 
      confidence: 0.65 + (Math.random() * 0.25)
    }
  ];
  
  return {
    classifications,
    success: true
  };
}

/**
 * Simulates ingesting a new patent
 */
export async function ingestPatent(request: IngestRequest): Promise<IngestResponse> {
  console.log("Ingesting new patent:", request.title);
  
  // Simulate API delay
  await delay(1000);
  
  // Generate a mock UUID
  const patent_id = Math.random().toString(36).substring(2, 15);
  
  return {
    patent_id,
    success: true
  };
}
