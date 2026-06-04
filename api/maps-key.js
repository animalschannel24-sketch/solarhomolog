module.exports = (req, res) => {
  const key = process.env.GOOGLE_MAPS_KEY;
  if (!key) return res.status(500).json({ error: 'Chave não configurada' });
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).json({ key });
};
