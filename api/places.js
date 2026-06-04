module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const q = (req.query.q || '').trim();
  console.log('[places] query recebido:', JSON.stringify(q));

  if (q.length < 3) return res.status(200).json({ predictions: [] });

  const key = process.env.GOOGLE_MAPS_KEY;
  console.log('[places] GOOGLE_MAPS_KEY presente:', !!key, key ? '(início: ' + key.slice(0, 6) + ')' : '');
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
    console.log('[places] Google status:', data.status,
      '| error_message:', data.error_message || 'nenhum',
      '| predictions:', data.predictions?.length ?? 0);

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return res.status(200).json({
        predictions: [],
        _debug: { status: data.status, error_message: data.error_message || null },
      });
    }

    const predictions = (data.predictions || []).map(p => ({ description: p.description }));
    res.status(200).json({ predictions });
  } catch (err) {
    console.error('[places] Erro ao chamar Google:', err);
    res.status(500).json({ error: 'Erro ao buscar sugestões', detail: err.message });
  }
};
