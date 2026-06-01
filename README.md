# SolarHomolog ☀

**Plataforma de homologação de sistemas fotovoltaicos junto às concessionárias de energia elétrica do Brasil.**

## O que é

Aplicativo web completo para o processo de homologação de instalação de painéis solares, incluindo:

- **Diagnóstico gratuito da UC** — identifica impedimentos antes de instalar (inversão de fluxo, ramal particular, débito, etc.)
- **Análise gratuita de documentação** — verifica procuração, conta de luz, planta, ART, identidade
- **Base de legislação** — Lei 14.300/2022, REN ANEEL 1.000/2021, 1.098/2024, ABNT NBR 16690, 17193, legislação estadual (ICMS) e municipal
- **Calculadora de valor** — R$ 800 por 10 kW de consumo
- **Fluxo completo** — cadastro, documentos, proposta, pagamento (PIX/cartão/boleto), acompanhamento

## Tecnologias

- HTML5 + CSS3 + JavaScript puro (sem frameworks)
- [Tabler Icons](https://tabler.io/icons) para ícones
- Google Fonts (Inter)
- Deploy via Vercel

## Estrutura

```
solarhomolog/
├── index.html          # Página principal (landing + modal do app)
├── vercel.json         # Configuração de deploy
└── src/
    ├── style.css       # Estilos globais
    ├── app.js          # Fluxo principal (login, cadastro, docs, pagamento, tracking)
    ├── diagnostico.js  # Módulo de diagnóstico de UC
    └── legislacao.js   # Base de legislação completa
```

## Deploy local (para testar)

Abra o `index.html` diretamente no navegador, ou use um servidor local:

```bash
# Com Python (já instalado no Windows/Mac/Linux)
python -m http.server 3000
# Acesse: http://localhost:3000
```

## Deploy na Vercel

1. Faça push deste repositório para o GitHub
2. Acesse [vercel.com](https://vercel.com) → Import Project → selecione este repo
3. Clique em **Deploy** — pronto!

## Legislação coberta

| Tipo | Norma |
|------|-------|
| Federal | Lei 14.300/2022, Lei 15.269/2025 |
| ANEEL | REN 1.000/2021, REN 1.098/2024, REN 482/2012 |
| ABNT | NBR 16690:2019, NBR 16274:2014, NBR 17193:2025, NR-10 |
| Estadual | Convênio ICMS 16/2015 (todos os 26 estados + DF) |
| Municipal | IPTU solar, Código de Obras |
| Concessionárias | ENEL SP/RJ, CEMIG, CPFL, RGE, COPEL, CELESC, Light, Elektro, COELBA |

## Impedimentos de UC detectados automaticamente

- Ramal particular / rede privada
- UC submedida de outra instalação
- Condomínio sem medidor individual
- Imóvel rural sem UC formal
- Imóvel alugado (titular ≠ solicitante)
- UC com débito em aberto
- UC em situação irregular
- Risco de inversão de fluxo por concessionária/região (CPFL, RGE, CEMIG)

---

Desenvolvido com base nas normas ANEEL vigentes em 2025.
