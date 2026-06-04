-- ============================================================
-- SOLARHOMOLOG — SCHEMA SUPABASE
-- ============================================================

-- PROCESSOS
CREATE TABLE IF NOT EXISTS processos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  nome_cliente     TEXT NOT NULL,
  email_cliente    TEXT NOT NULL,
  telefone         TEXT,
  cpf_cnpj         TEXT,
  tipo_pessoa      TEXT CHECK (tipo_pessoa IN ('pf', 'pj')) DEFAULT 'pf',
  uc               TEXT NOT NULL,
  concessionaria   TEXT NOT NULL,
  endereco         TEXT,
  cep              TEXT,
  cidade           TEXT,
  estado           TEXT,
  kw               NUMERIC(10, 2),
  kwh_medio        NUMERIC(10, 2),
  valor_servico    NUMERIC(10, 2),
  protocolo        TEXT UNIQUE,
  status           TEXT NOT NULL DEFAULT 'aguardando_docs'
                     CHECK (status IN ('aguardando_docs','em_analise','protocolado','aprovado','reprovado')),
  observacoes      TEXT,
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_processos_status     ON processos (status);
CREATE INDEX IF NOT EXISTS idx_processos_created_at ON processos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_processos_user_id    ON processos (user_id);
CREATE INDEX IF NOT EXISTS idx_processos_uc         ON processos (uc);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_processos_updated_at
  BEFORE UPDATE ON processos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- VISITAS
CREATE TABLE IF NOT EXISTS visitas (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processo_id         UUID NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  data_visita         TIMESTAMPTZ NOT NULL,
  endereco            TEXT NOT NULL,
  distancia_km        NUMERIC(8, 1),
  valor_deslocamento  NUMERIC(10, 2),
  status              TEXT NOT NULL DEFAULT 'agendada'
                        CHECK (status IN ('agendada','concluida','cancelada')),
  observacoes         TEXT
);

CREATE INDEX IF NOT EXISTS idx_visitas_processo_id  ON visitas (processo_id);
CREATE INDEX IF NOT EXISTS idx_visitas_data_visita  ON visitas (data_visita ASC);
CREATE INDEX IF NOT EXISTS idx_visitas_status       ON visitas (status);


-- PAGAMENTOS (cache local dos registros do Mercado Pago)
CREATE TABLE IF NOT EXISTS pagamentos (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processo_id         UUID REFERENCES processos(id) ON DELETE SET NULL,
  mp_payment_id       BIGINT UNIQUE,
  transaction_amount  NUMERIC(10, 2) NOT NULL,
  payment_type_id     TEXT,
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','approved','in_process','rejected','cancelled','refunded','charged_back')),
  description         TEXT,
  payer_email         TEXT,
  date_created        TIMESTAMPTZ,
  date_approved       TIMESTAMPTZ,
  qr_code             TEXT,
  qr_code_base64      TEXT
);

CREATE INDEX IF NOT EXISTS idx_pagamentos_processo_id   ON pagamentos (processo_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status        ON pagamentos (status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_date_created  ON pagamentos (date_created DESC);
CREATE INDEX IF NOT EXISTS idx_pagamentos_mp_id         ON pagamentos (mp_payment_id);


-- NOTIFICAÇÕES (histórico de e-mails enviados)
CREATE TABLE IF NOT EXISTS notificacoes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processo_id   UUID NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  status_novo   TEXT NOT NULL,
  email_para    TEXT NOT NULL,
  mensagem      TEXT,
  resend_id     TEXT,
  enviado       BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_processo_id ON notificacoes (processo_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created_at  ON notificacoes (created_at DESC);


-- ROW LEVEL SECURITY
ALTER TABLE processos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- Service role tem acesso total (usado pelas serverless functions)
CREATE POLICY "service_role_all_processos"    ON processos    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_visitas"      ON visitas      FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_pagamentos"   ON pagamentos   FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_notificacoes" ON notificacoes FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Usuário autenticado vê apenas o próprio processo
CREATE POLICY "usuario_ve_proprio_processo" ON processos
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());


-- STORAGE: bucket de documentos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos',
  'documentos',
  FALSE,
  10485760,  -- 10 MB
  ARRAY['image/jpeg','image/png','image/webp','application/pdf']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "service_role_storage" ON storage.objects
  FOR ALL TO service_role USING (bucket_id = 'documentos') WITH CHECK (bucket_id = 'documentos');

CREATE POLICY "usuario_upload_proprio" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "usuario_le_proprio" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);
