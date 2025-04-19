
# PatentAI Nexus: ADRLCS Patent Search

An advanced patent search application implementing the ADRLCS (Advanced Deep Retrieval Learning with Combined Signals) pipeline for enhanced relevance ranking.

## Project Overview

PatentAI Nexus combines multiple AI techniques to provide highly relevant patent search results:

- **BM25 Filtering**: Keyword-based filtering using Postgres full-text search
- **Semantic Embeddings**: Dense vector representations using OpenAI Embeddings API
- **LLM Coherence**: GPT-4 chain-of-thought scoring of query-patent relevance
- **GNN Embeddings**: GraphSAGE representations of patents in the citation network
- **PRF Expansion**: Query expansion through pseudo-relevance feedback
- **RL Weighting**: Dynamic signal weighting using contextual bandits
- **MMR Diversity**: Balancing relevance with result diversity

## Project Structure

```
/
├── frontend (React, TypeScript, Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── docs/
│   └── ...
├── backend (Node.js, Express, TypeScript)
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   └── models/
│   └── ...
└── supabase/
    ├── migrations/
    ├── functions/
    └── ...
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key

### Supabase Setup

1. Create a new Supabase project

2. Enable pgvector extension:
   ```sql
   -- Enable pgvector extension
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

3. Create necessary tables:
   ```sql
   -- Patents table
   CREATE TABLE patents (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     title TEXT NOT NULL,
     abstract TEXT NOT NULL,
     embedding VECTOR(1536),
     gnn_embedding VECTOR(256),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Citations table
   CREATE TABLE citations (
     from_uuid UUID REFERENCES patents(id),
     to_uuid UUID REFERENCES patents(id),
     PRIMARY KEY (from_uuid, to_uuid)
   );

   -- Classifications table
   CREATE TABLE classifications (
     patent_id UUID REFERENCES patents(id),
     domain TEXT NOT NULL,
     confidence FLOAT NOT NULL,
     PRIMARY KEY (patent_id, domain)
   );
   ```

4. Deploy Edge Function for embeddings:
   ```bash
   supabase functions deploy patent-embedding
   ```

### Environment Setup

Create a `.env.local` file with the following variables:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key
OPENAI_API_KEY=your-openai-key
```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

### Backend Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

## ADRLCS Architecture

```
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
```

## Edge Function for Embeddings

The Supabase Edge Function `patent-embedding` processes new patents to:
1. Generate OpenAI embeddings for the patent text
2. Compute GNN embeddings based on citation data
3. Update the patent record with both embeddings

## Testing

### Backend Tests

Run the Jest test suite:
```bash
cd backend
npm test
```

### Frontend Tests

Run the Cypress E2E tests:
```bash
cd frontend
npm run test:e2e
```

## Documentation

See `src/docs/ADRLCS.md` for detailed explanation of the ADRLCS pipeline components.

## License

MIT
