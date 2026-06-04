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
  const r = await fetch(process.env.SUPABASE_URL + path, {
    ...opts,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_KEY,
      Authorization: 'Bearer ' + process.env.SUPABASE_SERVICE_KEY,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(opts.headers || {}),
    },
  });
  return r;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!verifyToken(token)) return res.status(401).json({ error: 'Unauthorized' });

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Supabase não configurado.' });
  }

  if (req.method === 'POST') {
    const { processo_id, data_visita, valor_deslocamento, endereco, distancia_km, observacoes } = req.body || {};
    if (!processo_id || !data_visita || !endereco) {
      return res.status(400).json({ error: 'processo_id, data_visita e endereco são obrigatórios.' });
    }
    try {
      const r = await sb('/rest/v1/visitas', {
        method: 'POST',
        body: JSON.stringify({ processo_id, data_visita, valor_deslocamento, endereco, distancia_km, observacoes, status: 'agendada' }),
      });
      const visita = await r.json();
      if (!r.ok) return res.status(r.status).json({ error: visita?.message || 'Erro ao salvar visita.' });
      return res.json({ visita: Array.isArray(visita) ? visita[0] : visita });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // GET → list all visitas ordered by date
  try {
    const r = await sb('/rest/v1/visitas?select=*&order=data_visita.asc');
    const visitas = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: visitas?.message || 'Erro ao consultar visitas.' });
    res.json({ visitas: Array.isArray(visitas) ? visitas : [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
