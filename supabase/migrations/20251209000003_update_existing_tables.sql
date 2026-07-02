-- Update existing tables to remove ChromaDB/Mem0 references
-- and add new tracking columns for pgvector migration

-- ============================================================================
-- UPDATE knowledge_files TABLE
-- Remove ChromaDB-specific column, add embedding tracking
-- ============================================================================

-- Drop ChromaDB reference column
ALTER TABLE knowledge_files
  DROP COLUMN IF EXISTS chroma_id;

-- Add new tracking columns for pgvector
ALTER TABLE knowledge_files
  ADD COLUMN IF NOT EXISTS embedding_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reindex_required BOOLEAN DEFAULT FALSE;

-- CREATE INDEX IF NOT EXISTS for reindexing queries
CREATE INDEX IF NOT EXISTS knowledge_files_reindex_idx
  ON knowledge_files(reindex_required)
  WHERE reindex_required = TRUE;

COMMENT ON COLUMN knowledge_files.embedding_count IS 'Number of embeddings/chunks for this file';
COMMENT ON COLUMN knowledge_files.reindex_required IS 'Flag to trigger re-indexing';

-- ============================================================================
-- UPDATE brand_knowledge_files TABLE
-- Remove OpenAI vector store columns, add embedding tracking
-- ============================================================================

-- Drop OpenAI-specific columns
ALTER TABLE brand_knowledge_files
  DROP COLUMN IF EXISTS openai_file_id,
  DROP COLUMN IF EXISTS openai_vector_store_id;

-- Add new tracking columns
ALTER TABLE brand_knowledge_files
  ADD COLUMN IF NOT EXISTS embedding_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reindex_required BOOLEAN DEFAULT FALSE;

-- CREATE INDEX IF NOT EXISTS for reindexing queries
CREATE INDEX IF NOT EXISTS brand_files_reindex_idx
  ON brand_knowledge_files(reindex_required)
  WHERE reindex_required = TRUE;

COMMENT ON COLUMN brand_knowledge_files.embedding_count IS 'Number of embeddings/chunks for this file';
COMMENT ON COLUMN brand_knowledge_files.reindex_required IS 'Flag to trigger re-indexing';

-- ============================================================================
-- UPDATE knowledge categories TABLE (renamed to knowledge_base_categories in 20251104204700)
-- Remove ChromaDB collection reference
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'knowledge_base_categories'
  ) THEN
    ALTER TABLE public.knowledge_base_categories
      DROP COLUMN IF EXISTS chroma_collection;
    COMMENT ON TABLE public.knowledge_base_categories IS 'Knowledge categories, linked to embeddings via knowledge_sources';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'company_knowledge_categories'
  ) THEN
    ALTER TABLE public.company_knowledge_categories
      DROP COLUMN IF EXISTS chroma_collection;
    COMMENT ON TABLE public.company_knowledge_categories IS 'Knowledge categories, linked to embeddings via knowledge_sources';
  END IF;
END $$;
