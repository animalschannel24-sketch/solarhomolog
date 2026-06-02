export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { tipo, documentos, uc, concessionaria, potencia, consumo, situacao } = body;

    let prompt = '';

    if (tipo === 'diagnostico') {
      prompt = `Você é um especialista em homologação de sistemas fotovoltaicos no Brasil, com profundo conhecimento da REN ANEEL nº 1.000/2021, REN 1.098/2024 e Lei 14.300/2022.

Analise a viabilidade de homologação da seguinte Unidade Consumidora (UC):

- Número da UC: ${uc || 'não informado'}
- Concessionária: ${concessionaria || 'não informada'}
- Consumo médio mensal: ${consumo || 0} kWh/mês
- Potência do sistema solar: ${potencia || 0} kWp
- Situação da UC: ${situacao || 'não informada'}

Com base nessas informações, forneça:
1. VEREDICTO: se a UC está APTA, tem RESTRIÇÕES ou está BLOQUEADA para homologação direta
2. MOTIVOS: explique de forma clara e objetiva os impedimentos encontrados (se houver)
3. ALTERNATIVAS: liste as alternativas viáveis para o caso específico desta UC
4. PRÓXIMOS PASSOS: o que o cliente deve fazer agora

Seja direto, claro e use linguagem simples para um leigo entender. Responda em português brasileiro.`;
    }

    if (tipo === 'documentos') {
      prompt = `Você é um especialista em homologação de sistemas fotovoltaicos no Brasil.

Analise os seguintes documentos enviados para o processo de homologação junto à concessionária:

Documentos enviados: ${documentos ? documentos.join(', ') : 'nenhum'}
Concessionária: ${concessionaria || 'não informada'}

Para cada documento, verifique:
1. Se está de acordo com o exigido pela REN ANEEL 1.000/2021
2. Se há alguma pendência ou problema provável
3. Se a documentação está completa para prosseguir

Ao final, dê um PARECER GERAL: APROVADO, APROVADO COM RESSALVAS ou PENDENTE.

Seja objetivo e use linguagem simples. Responda em português brasileiro.`;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: 'Erro na API: ' + err }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    const texto = data.content?.[0]?.text || 'Sem resposta';

    return new Response(JSON.stringify({ resultado: texto }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro interno: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
