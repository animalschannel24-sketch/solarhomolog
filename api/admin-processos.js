const crypto = require('crypto');

function verifyToken(token) {
  if (!token || !process.env.ADMIN_PASSWORD) return false;
  const expected = crypto
    .createHmac('sha256', process.env.ADMIN_SECRET || 'sh-admin-salt-2025')
    .update(process.env.ADMIN_PASSWORD)
    .digest('hex');
  return token === expected;
}

async function sb(path, opts = {}) {
  const url = process.env.SUPABASE_URL + path;
  const r = await fetch(url, {
    ...opts,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_KEY,
      Authorization: 'Bearer ' + process.env.SUPABASE_SERVICE_KEY,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  return r;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!verifyToken(token)) return res.status(401).json({ error: 'Unauthorized' });

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Supabase não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_KEY.' });
  }

  // GET ?id= → documents for a processo
  const { id, protocolo } = req.query || {};
  if (id) {
    const prefix = protocolo && protocolo !== id ? protocolo : id;
    try {
      const listRes = await sb('/storage/v1/object/list/documentos', {
        method: 'POST',
        body: JSON.stringify({ prefix: prefix + '/', limit: 100, offset: 0 }),
      });
      const files = await listRes.json();
      if (!Array.isArray(files)) {
        return res.json({ docs: [] });
      }

      // Generate signed URLs
      const paths = files.map(f => prefix + '/' + f.name);
      let signedUrls = [];
      if (paths.length > 0) {
        const signRes = await sb('/storage/v1/object/sign/documentos', {
          method: 'POST',
          body: JSON.stringify({ expiresIn: 3600, paths }),
        });
        signedUrls = await signRes.json();
      }

      const docs = files.map((f, i) => ({
        name: prefix + '/' + f.name,
        metadata: f.metadata,
        signedUrl: signedUrls[i]
          ? process.env.SUPABASE_URL + signedUrls[i].signedURL
          : null,
      }));

      return res.json({ docs });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // GET → list all processos
  try {
    const r = await sb('/rest/v1/processos?select=*&order=created_at.desc', {
      headers: { Prefer: 'return=representation' },
    });
    const processos = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: processos?.message || 'Erro ao consultar processos.' });
    res.json({ processos: Array.isArray(processos) ? processos : [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
