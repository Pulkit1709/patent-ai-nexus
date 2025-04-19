
# ADRLCS Patent Search Pipeline

## Overview

The Advanced Deep Retrieval Learning with Combined Signals (ADRLCS) pipeline is a state-of-the-art approach to patent retrieval that combines multiple relevance signals for optimal ranking. This document explains the key components of the pipeline and how they work together to provide highly relevant patent search results.

## Pipeline Components

### 1. BM25 Filtering (Postgres FT)

BM25 is a bag-of-words retrieval function that ranks documents based on the query terms appearing in each document. It provides a strong baseline for keyword matching and serves as an initial filter in our pipeline.

**Implementation Details:**
- Utilizes Postgres full-text search capabilities
- Creates GIN indexes on patent titles and abstracts
- Applies term frequency-inverse document frequency (TF-IDF) weighting
- Ranks documents based on term overlap with query

BM25 provides a solid foundation for keyword-based matching but struggles with semantic understanding and synonyms.

### 2. Bi-encoder (Sentence-Transformers)

We use the Sentence-Transformers "all-MiniLM-L6-v2" model to generate dense vector embeddings of patents and queries. These embeddings capture semantic meaning beyond keywords.

**Implementation Details:**
- Uses "all-MiniLM-L6-v2" to generate 384-dimensional embeddings
- Stores embeddings in pgvector for efficient similarity search
- Computes cosine similarity between query and patent embeddings
- Captures semantic relationships and handles synonyms effectively

The bi-encoder component helps identify patents that are conceptually related to the query even when they don't share exact terminology.

### 3. LLM Coherence Scoring (GPT-4)

We use GPT-4 with chain-of-thought prompting to evaluate the relevance between a query and patent. This captures nuanced relationships missed by other methods.

**Implementation Details:**
- Prompt template: "You are a patent expert. Score the relevance of query: {query} versus patent: {patent_title}. {patent_abstract}. Think step by step about technical alignment, conceptual overlap, and potential relevance before giving a score from 0-10."
- Extracts numerical score from GPT-4 response
- Applied only to top candidates due to computational cost
- Captures complex relationships and domain-specific relevance

LLM coherence scoring is particularly effective for understanding complex technical relationships and domain-specific terminology.

### 4. GNN Embeddings (GraphSAGE)

Using GraphSAGE on the citation network, we generate graph neural network embeddings that capture the position of each patent in the broader citation landscape.

**Implementation Details:**
- Constructs citation graph from patent-to-patent references
- Applies GraphSAGE to generate 256-dimensional node embeddings
- Updates embeddings incrementally as new patents are added
- Captures the citation context of each patent

GNN embeddings help identify patents that occupy similar positions in the citation network, which often indicates related technologies even when text content differs.

### 5. PRF Methodology

Pseudo-Relevance Feedback (PRF) improves search results by assuming top-ranked documents are relevant and using them to expand the original query.

**Implementation Details:**
- Takes the top 5 results from initial semantic search
- Averages their embedding vectors to create an expanded query
- Re-ranks results using similarity to this expanded representation
- Balances original query with discovered concept space

PRF is particularly effective for queries where the user's terminology might differ from standard patent language or when the query is underspecified.

### 6. RL Weight Adaptation (Contextual Bandit)

A contextual bandit algorithm dynamically adjusts the weights of different signals based on query context and historical performance.

**Implementation Details:**
- Extracts context features from queries and result sets
- Uses a small MLP to predict optimal weights for each signal
- Updates model based on user feedback and click behavior
- Optimizes for different query types over time

This reinforcement learning approach allows the system to adapt to different query types and user preferences over time.

### 7. MMR Diversity Penalty

Maximal Marginal Relevance (MMR) balances relevance with diversity by penalizing results that are too similar to higher-ranked results.

**Implementation Details:**
- Computes similarity between candidate patents
- Applies penalty to candidates similar to already-selected results
- Balances relevance score with diversity considerations
- Tunable lambda parameter controls diversity-relevance tradeoff

MMR ensures that search results cover a broader spectrum of relevant patents rather than showing many similar ones.

## Combining Signals

The final ranking score is computed as a weighted sum of all signals minus the MMR diversity penalty:

```
final_score = (w_bm25 * bm25_score) + 
              (w_sem * semantic_score) + 
              (w_llm * llm_coherence_score) + 
              (w_gnn * gnn_score) + 
              (w_prf * prf_score) + 
              (w_user * user_feedback_score) - 
              (diversity_penalty)
```

Where the weights (w_*) are determined by the RL component based on query context.

## Performance Considerations

- BM25 and vector search are applied to the full dataset
- LLM coherence scoring is only applied to the top ~100 candidates due to computational cost
- Caching is used extensively to minimize redundant computations
- Background jobs update embeddings and GNN representations as new patents are added

## Future Enhancements

- Integration of multi-modal embeddings for patent figures
- Domain-specific fine-tuning of embeddings
- Explainable ranking with feature attribution
- Cross-lingual patent retrieval capabilities
