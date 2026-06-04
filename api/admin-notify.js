const crypto = require('crypto');

function verifyToken(token) {
  if (!token || !process.env.ADMIN_PASSWORD) return false;
  const expected = crypto
    .createHmac('sha256', process.env.ADMIN_SECRET || 'sh-admin-salt-2025')
    .update(process.env.ADMIN_PASSWORD)
    .digest('hex');
  return token === expected;
}

const STATUS_LABELS = {
  aguardando_docs: 'Aguardando documentos',
  em_analise: 'Em análise',
  protocolado: 'Protocolado na concessionária',
  aprovado: 'Aprovado ✓',
  reprovado: 'Reprovado',
};

const STATUS_MSGS = {
  aguardando_docs: 'Precisamos dos documentos para dar continuidade ao seu processo. Por favor, acesse a plataforma e faça o envio.',
  em_analise: 'Nossa equipe está analisando a documentação enviada. Em breve você receberá um retorno.',
  protocolado: 'Seu processo foi protocolado junto à concessionária de energia elétrica. O prazo de análise é de até 30 dias úteis.',
  aprovado: 'Parabéns! Seu processo de homologação foi aprovado pela concessionária. Em breve você receberá o Parecer de Acesso.',
  reprovado: 'Seu processo foi reprovado pela concessionária. Entre em contato conosco pelo WhatsApp (11) 99207-1648 para verificar os próximos passos.',
};

function buildHtml(nome, status, mensagem) {
  const statusLabel = STATUS_LABELS[status] || status;
  const body = mensagem || STATUS_MSGS[status] || '';
  const corStatus = status === 'aprovado' ? '#065f46' : status === 'reprovado' ? '#991b1b' : '#1e40af';
  const bgStatus = status === 'aprovado' ? '#d1fae5' : status === 'reprovado' ? '#fee2e2' : '#dbeafe';

  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Atualização do seu processo — SolarHomolog</title></head>
<body style="margin:0;padding:0;background:#f4f6f4;font-family:Inter,Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f4;padding:32px 16px">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08)">
  <tr><td style="background:#1a3a2a;padding:24px 32px;display:flex;align-items:center;gap:12px">
    <span style="display:inline-block;background:#f5a623;border-radius:8px;padding:6px 10px;font-size:20px">☀</span>
    <span style="color:#fff;font-size:18px;font-weight:600;margin-left:12px">SolarHomolog</span>
  </td></tr>
  <tr><td style="padding:32px">
    <p style="color:#6b7280;font-size:14px;margin:0 0 8px">Olá, <strong style="color:#1a1a1a">${nome}</strong></p>
    <h2 style="font-size:20px;color:#1a3a2a;margin:0 0 16px">Atualização do seu processo</h2>
    <div style="background:${bgStatus};border-radius:8px;padding:12px 16px;margin-bottom:20px;display:inline-block">
      <span style="color:${corStatus};font-weight:600;font-size:14px">Status: ${statusLabel}</span>
    </div>
    <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 24px">${body}</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
    <p style="color:#6b7280;font-size:12px;margin:0">Dúvidas? Fale conosco:<br>
    <a href="https://wa.me/5511992071648" style="color:#1a3a2a">WhatsApp (11) 99207-1648</a> ·
    <a href="mailto:suporte@jccassessorialtda.com.br" style="color:#1a3a2a">suporte@jccassessorialtda.com.br</a></p>
  </td></tr>
  <tr><td style="background:#f8faf8;padding:16px 32px;border-top:1px solid #e5e7eb">
    <p style="color:#9ca3af;font-size:11px;margin:0">João Carlos Chaves Assessoria Ltda · CNPJ 48.979.472/0001-64<br>Rua Taipu, 417, Santana de Parnaíba/SP</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

async function sbGet(path) {
  const r = await fetch(process.env.SUPABASE_URL + path, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_KEY,
      Authorization: 'Bearer ' + process.env.SUPABASE_SERVICE_KEY,
    },
  });
  return r.json();
}

async function sbPatch(path, body) {
  return fetch(process.env.SUPABASE_URL + path, {
    method: 'PATCH',
    headers: {
      apikey: process.env.SUPABASE_SERVICE_KEY,
      Authorization: 'Bearer ' + process.env.SUPABASE_SERVICE_KEY,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!verifyToken(token)) return res.status(401).json({ error: 'Unauthorized' });

  const { processo_id, status, mensagem } = req.body || {};
  if (!processo_id || !status) return res.status(400).json({ error: 'processo_id e status são obrigatórios.' });

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Supabase não configurado.' });
  }
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY não configurado. Adicione esta variável de ambiente para envio de e-mails.' });
  }

  try {
    // Fetch processo
    const processos = await sbGet(`/rest/v1/processos?id=eq.${processo_id}&select=nome_cliente,email_cliente,status`);
    const processo = Array.isArray(processos) ? processos[0] : null;
    if (!processo) return res.status(404).json({ error: 'Processo não encontrado.' });
    if (!processo.email_cliente) return res.status(400).json({ error: 'Processo não possui e-mail de cliente.' });

    // Send email via Resend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SolarHomolog <noreply@solarhomolog.com.br>',
        to: [processo.email_cliente],
        subject: `Atualização do seu processo — ${STATUS_LABELS[status] || status}`,
        html: buildHtml(processo.nome_cliente, status, mensagem),
      }),
    });
    const emailData = await emailRes.json();
    if (!emailRes.ok) return res.status(emailRes.status).json({ error: emailData?.message || 'Erro ao enviar e-mail.' });

    // Update status in Supabase
    await sbPatch(`/rest/v1/processos?id=eq.${processo_id}`, { status });

    res.json({ ok: true, email_id: emailData.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
