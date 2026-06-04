module.exports = (req, res) => {
  const key = process.env.GOOGLE_MAPS_KEY;
  console.log('[maps-key] GOOGLE_MAPS_KEY presente:', !!key, key ? '(primeiros 6: ' + key.slice(0, 6) + ')' : '');
  if (!key) return res.status(500).json({ error: 'Chave não configurada' });
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).json({ key });
};
