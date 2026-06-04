module.exports = async (req, res) => {
  const q = (req.query.q || '').trim();
  if (q.length < 3) return res.status(200).json({ predictions: [] });

  const key = process.env.GOOGLE_MAPS_KEY;
  if (!key) return res.status(500).json({ error: 'Chave não configurada' });

  const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
  url.searchParams.set('input', q);
  url.searchParams.set('key', key);
  url.searchParams.set('language', 'pt-BR');
  url.searchParams.set('components', 'country:br');
  url.searchParams.set('types', 'address');

  try {
    const r = await fetch(url.toString());
    const data = await r.json();
    const predictions = (data.predictions || []).map(p => ({ description: p.description }));
    res.status(200).json({ predictions });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar sugestões', detail: err.message });
  }
};
