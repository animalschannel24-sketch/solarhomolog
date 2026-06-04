const crypto = require('crypto');

function makeToken(password) {
  return crypto
    .createHmac('sha256', process.env.ADMIN_SECRET || 'sh-admin-salt-2025')
    .update(password)
    .digest('hex');
}

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { password } = req.body || {};
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) return res.status(500).json({ error: 'ADMIN_PASSWORD não configurado no ambiente.' });
  if (!password || password !== expected) return res.status(401).json({ error: 'Senha incorreta.' });

  res.json({ ok: true, token: makeToken(password) });
};
