const crypto = require('crypto');

function verifyToken(token) {
  if (!token || !process.env.ADMIN_PASSWORD) return false;
  const expected = crypto
    .createHmac('sha256', process.env.ADMIN_SECRET || 'sh-admin-salt-2025')
    .update(process.env.ADMIN_PASSWORD)
    .digest('hex');
  return token === expected;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!verifyToken(token)) return res.status(401).json({ error: 'Unauthorized' });

  if (!process.env.MP_ACCESS_TOKEN) {
    return res.status(500).json({ error: 'MP_ACCESS_TOKEN não configurado.' });
  }

  try {
    const begin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = new Date().toISOString();

    const r = await fetch(
      `https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&range=date_created&begin_date=${begin}&end_date=${end}&limit=100`,
      { headers: { Authorization: 'Bearer ' + process.env.MP_ACCESS_TOKEN } }
    );
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data?.message || 'Erro na API do Mercado Pago.' });

    const todos = data.results || [];

    // IDs de pagamentos vinculados a processos no Supabase
    let mpIdsSupabase = new Set();
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      const sbRes = await fetch(
        process.env.SUPABASE_URL + '/rest/v1/pagamentos?select=mp_payment_id&mp_payment_id=not.is.null',
        {
          headers: {
            apikey: process.env.SUPABASE_SERVICE_KEY,
            Authorization: 'Bearer ' + process.env.SUPABASE_SERVICE_KEY,
          },
        }
      );
      if (sbRes.ok) {
        const rows = await sbRes.json();
        if (Array.isArray(rows)) rows.forEach(r => mpIdsSupabase.add(String(r.mp_payment_id)));
      }
    }

    const pagamentos = todos.filter(p => {
      const desc = (p.description || '').toLowerCase();
      if (desc.includes('solarhomolog')) return true;
      if (mpIdsSupabase.has(String(p.id))) return true;
      return false;
    });

    res.json({ pagamentos });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
