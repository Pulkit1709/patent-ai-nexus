
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
 * Simulates a delay to mimic API latency
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Utility function to generate random scores for the ADRLCS components
 */
const generateMockScores = (relevance: number = 0.5) => {
  // Base relevance affects all scores
  const bm25 = 0.3 + (relevance * 0.7);
  const semantic = 0.4 + (relevance * 0.6);
  const llm_coherence = 0.2 + (relevance * 0.8);
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
 * Simulates searching for patents with the ADRLCS pipeline
 */
export async function searchPatents(request: SearchRequest): Promise<SearchResponse> {
  console.log("Searching patents with query:", request.query);
  
  // Simulate API delay
  await delay(1500);

  // Calculate relevance scores based on basic keyword matching (simplified for mock)
  const results: SearchResult[] = MOCK_PATENTS.map(patent => {
    const titleMatchScore = patent.title.toLowerCase().includes(request.query.toLowerCase()) ? 0.8 : 0.1;
    const abstractMatchScore = patent.abstract.toLowerCase().includes(request.query.toLowerCase()) ? 0.6 : 0.1;
    const relevanceScore = Math.max(titleMatchScore, abstractMatchScore);
    
    return {
      patent,
      scores: generateMockScores(relevanceScore),
      classification: MOCK_CLASSIFICATIONS[patent.id]?.[0]
    };
  });

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
