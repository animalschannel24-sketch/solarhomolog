const ORIGIN = 'Rua Taipu 417, Santana de Parnaíba, SP, Brasil';

module.exports = async (req, res) => {
  const dest = (req.query.dest || '').trim();
  if (!dest) return res.status(400).json({ error: 'Parâmetro dest obrigatório' });

  const key = process.env.GOOGLE_MAPS_KEY;
  if (!key) return res.status(500).json({ error: 'Chave da API não configurada no servidor' });

  const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
  url.searchParams.set('origins', ORIGIN);
  url.searchParams.set('destinations', dest);
  url.searchParams.set('key', key);
  url.searchParams.set('language', 'pt-BR');
  url.searchParams.set('units', 'metric');

  try {
    const gmResp = await fetch(url.toString());
    const data   = await gmResp.json();
    res.status(200).json(data);
  } catch {
    res.status(500).json({ error: 'Erro ao consultar a API do Google Maps' });
  }
};
