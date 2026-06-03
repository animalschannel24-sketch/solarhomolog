const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  if (!ACCESS_TOKEN) {
    return res.status(500).json({ error: 'Credenciais de pagamento não configuradas' });
  }

  // GET — consulta status de pagamento
  if (req.method === 'GET') {
    const id = (req.query.id || '').trim();
    if (!id) return res.status(400).json({ error: 'Parâmetro id obrigatório' });

    try {
      const r = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      });
      const d = await r.json();
      return res.status(200).json({
        id: d.id,
        status: d.status,
        status_detail: d.status_detail,
      });
    } catch {
      return res.status(500).json({ error: 'Erro ao consultar status do pagamento' });
    }
  }

  // POST — cria pagamento PIX
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Corpo da requisição inválido' });
  }

  const { total, km, email } = body || {};
  const amount = parseFloat(total);

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Valor inválido' });
  }

  const payerEmail = (typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    ? email
    : 'cliente@solarhomolog.com.br';

  const payload = {
    transaction_amount: Math.round(amount * 100) / 100,
    description: `Visita Técnica SolarHomolog${km ? ' — ' + km + ' km deslocamento' : ''}`,
    payment_method_id: 'pix',
    payer: { email: payerEmail },
  };

  try {
    const r = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'X-Idempotency-Key': `sh-vt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      },
      body: JSON.stringify(payload),
    });

    const d = await r.json();

    if (!r.ok) {
      return res.status(502).json({ error: d.message || 'Erro ao criar pagamento no Mercado Pago' });
    }

    const tx = d.point_of_interaction?.transaction_data;
    if (!tx?.qr_code) {
      return res.status(502).json({ error: 'QR Code PIX não disponível na resposta' });
    }

    return res.status(200).json({
      id: d.id,
      status: d.status,
      qr_code: tx.qr_code,
      qr_code_base64: tx.qr_code_base64 || null,
    });
  } catch {
    return res.status(500).json({ error: 'Erro interno ao processar pagamento' });
  }
};
