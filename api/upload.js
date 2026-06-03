const { createClient } = require('@supabase/supabase-js');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

module.exports.config = { api: { bodyParser: false } };

const BUCKET = 'documentos';

function supabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

async function ensureBucket(sb) {
  const { data: buckets, error } = await sb.storage.listBuckets();
  if (error) throw new Error('Erro ao listar buckets: ' + error.message);
  if (!buckets.find(b => b.name === BUCKET)) {
    const { error: ce } = await sb.storage.createBucket(BUCKET, {
      public: false,
      fileSizeLimit: '10MB',
    });
    if (ce) throw new Error('Erro ao criar bucket: ' + ce.message);
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const sb = supabaseAdmin();
  const form = formidable({ maxFileSize: 10 * 1024 * 1024 });

  try {
    const [fields, files] = await form.parse(req);

    const protocolo = (fields.protocolo?.[0] || 'sem-protocolo').replace(/[^a-zA-Z0-9-]/g, '-');
    const tipoDoc  = (fields.tipo_doc?.[0]  || 'outros').replace(/[^a-zA-Z0-9-]/g, '-');
    const file = files.file?.[0];

    if (!file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

    await ensureBucket(sb);

    const originalName = file.originalFilename || 'arquivo';
    const ext      = path.extname(originalName) || '.bin';
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 60);
    const storagePath = `${protocolo}/${tipoDoc}/${Date.now()}_${baseName}${ext}`;

    const fileBuffer = fs.readFileSync(file.filepath);

    const { data, error } = await sb.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: file.mimetype || 'application/octet-stream',
        upsert: false,
      });

    fs.unlink(file.filepath, () => {});

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ ok: true, path: data.path });

  } catch (err) {
    console.error('[upload]', err);
    return res.status(500).json({ error: err.message });
  }
};
