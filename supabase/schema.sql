-- ============================================================
-- ScanIA - Schema SQL completo
-- Execute este script no SQL Editor do seu projeto Supabase
-- ============================================================

-- Tabela de comprovantes
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name TEXT,
  date DATE,
  total_amount INTEGER, -- valor em centavos
  category TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  image_url TEXT,
  raw_text TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de itens do comprovante
CREATE TABLE IF NOT EXISTS receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price INTEGER, -- centavos
  total_price INTEGER, -- centavos
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS receipts_user_id_idx ON receipts(user_id);
CREATE INDEX IF NOT EXISTS receipts_date_idx ON receipts(date DESC);
CREATE INDEX IF NOT EXISTS receipt_items_receipt_id_idx ON receipt_items(receipt_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS receipts_updated_at ON receipts;
CREATE TRIGGER receipts_updated_at
  BEFORE UPDATE ON receipts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;

-- Remove policies existentes antes de recriar
DO $$
BEGIN
  DROP POLICY IF EXISTS "receipts_select" ON receipts;
  DROP POLICY IF EXISTS "receipts_insert" ON receipts;
  DROP POLICY IF EXISTS "receipts_update" ON receipts;
  DROP POLICY IF EXISTS "receipts_delete" ON receipts;
  DROP POLICY IF EXISTS "receipt_items_select" ON receipt_items;
  DROP POLICY IF EXISTS "receipt_items_insert" ON receipt_items;
  DROP POLICY IF EXISTS "receipt_items_update" ON receipt_items;
  DROP POLICY IF EXISTS "receipt_items_delete" ON receipt_items;
END $$;

-- Policies para receipts
CREATE POLICY "receipts_select" ON receipts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "receipts_insert" ON receipts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "receipts_update" ON receipts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "receipts_delete" ON receipts
  FOR DELETE USING (auth.uid() = user_id);

-- Policies para receipt_items
CREATE POLICY "receipt_items_select" ON receipt_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM receipts WHERE id = receipt_id AND user_id = auth.uid())
  );

CREATE POLICY "receipt_items_insert" ON receipt_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM receipts WHERE id = receipt_id AND user_id = auth.uid())
  );

CREATE POLICY "receipt_items_update" ON receipt_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM receipts WHERE id = receipt_id AND user_id = auth.uid())
  );

CREATE POLICY "receipt_items_delete" ON receipt_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM receipts WHERE id = receipt_id AND user_id = auth.uid())
  );

-- ============================================================
-- Storage bucket para imagens
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Policies do Storage
DO $$
BEGIN
  DROP POLICY IF EXISTS "storage_receipts_select" ON storage.objects;
  DROP POLICY IF EXISTS "storage_receipts_insert" ON storage.objects;
  DROP POLICY IF EXISTS "storage_receipts_delete" ON storage.objects;
END $$;

CREATE POLICY "storage_receipts_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'receipts');

CREATE POLICY "storage_receipts_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'receipts' AND auth.uid() IS NOT NULL
  );

CREATE POLICY "storage_receipts_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]
  );
