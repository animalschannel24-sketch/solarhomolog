const ORIGIN = 'Rua Taipu 417, Santana de Parnaíba, SP, Brasil';

module.exports = async (req, res) => {
  const dest = (req.query.dest || '').trim();
  if (!dest) return res.status(400).json({ error: 'Parâmetro dest obrigatório' });

  const key = process.env.GOOGLE_MAPS_KEY;
  console.log('[distancia] GOOGLE_MAPS_KEY presente:', !!key, '| primeiros 6 chars:', key ? key.slice(0, 6) : 'N/A');
  if (!key) return res.status(500).json({ error: 'Chave da API não configurada no servidor' });

  const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
  url.searchParams.set('origins', ORIGIN);
  url.searchParams.set('destinations', dest);
  url.searchParams.set('key', key);
  url.searchParams.set('language', 'pt-BR');
  url.searchParams.set('units', 'metric');

  console.log('[distancia] Consultando Google Maps para destino:', dest);

  try {
    const gmResp = await fetch(url.toString());
    console.log('[distancia] Status HTTP Google:', gmResp.status);
    const data = await gmResp.json();
    console.log('[distancia] Status resposta Google:', data.status, '| elemento[0]:', JSON.stringify(data.rows?.[0]?.elements?.[0]));
    res.status(200).json(data);
  } catch (err) {
    console.error('[distancia] Erro ao consultar Google Maps:', err);
    res.status(500).json({ error: 'Erro ao consultar a API do Google Maps', detail: err.message });
  }
};
