async function sb(path, opts = {}) {
  const url = process.env.SUPABASE_URL + path;
  const r = await fetch(url, {
    ...opts,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_KEY,
      Authorization: 'Bearer ' + process.env.SUPABASE_SERVICE_KEY,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  return r;
}

function gerarProtocolo() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(1000 + Math.random() * 9000));
  return `SH-${date}-${seq}`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Supabase não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_KEY.' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Corpo da requisição inválido' });
  }

  const {
    tipo_pessoa, nome_cliente, cpf_cnpj, email_cliente, telefone,
    uc, concessionaria, cep, logradouro, numero, cidade, estado, observacoes,
  } = body || {};

  if (!nome_cliente || !email_cliente || !uc || !concessionaria) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes: nome, email, UC, concessionária' });
  }

  const endereco = [logradouro, numero].filter(Boolean).join(', ') || null;

  async function inserir(protocolo) {
    const r = await sb('/rest/v1/processos', {
      method: 'POST',
      body: JSON.stringify({
        tipo_pessoa: tipo_pessoa || 'pf',
        nome_cliente,
        cpf_cnpj: cpf_cnpj || null,
        email_cliente,
        telefone: telefone || null,
        uc,
        concessionaria,
        cep: cep || null,
        endereco,
        cidade: cidade || null,
        estado: estado || null,
        protocolo,
        status: 'aguardando_docs',
        observacoes: observacoes || null,
      }),
      headers: { Prefer: 'return=representation' },
    });
    const data = await r.json();
    return { ok: r.ok, status: r.status, data };
  }

  try {
    let { ok, status, data } = await inserir(gerarProtocolo());

    // Retry on unique constraint violation for protocolo
    if (!ok && (status === 409 || data?.code === '23505')) {
      ({ ok, status, data } = await inserir(gerarProtocolo()));
    }

    if (!ok) {
      return res.status(status).json({ error: data?.message || 'Erro ao criar processo no Supabase' });
    }

    const row = Array.isArray(data) ? data[0] : data;
    return res.status(200).json({ protocolo: row.protocolo, id: row.id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
