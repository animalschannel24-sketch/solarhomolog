/* ============================================
   SOLARHOMOLOG — LEGISLACAO.JS
   ============================================ */

const laws = [
  {id:1,cat:'federal',badge:'lb-fed',label:'Federal',title:'Lei 14.300/2022 — Marco Legal da Micro e Minigeração Distribuída',sub:'Sancionada jan 2022 · Vigente',tags:['microgeração','minigeração','fio b','compensação','gd'],
   text:`<strong>O que é:</strong> Marco Legal da Micro e Minigeração Distribuída. Regula o Sistema de Compensação de Energia (SCEE).<br><br>
• <strong>Microgeração:</strong> até 75 kW instalados.<br>
• <strong>Minigeração:</strong> 75 kW a 5 MW (solar) ou até 3 MW (outras fontes).<br>
• <strong>GD I</strong> (antes de 7/1/2023): regras antigas até 2045.<br>
• <strong>GD II</strong> (após 7/1/2023): Fio B progressivo — 15% (2023) → 30% (2024) → 45% (2025) → 60% (2026) → 100% (2029).<br>
• Créditos não utilizados expiram em 60 meses.<br>
• Distribuidoras têm 30 dias para emitir orçamento de conexão.`,
   url:'https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/lei/l14300.htm',
   pills:['GD I e GD II','Fio B escalável','Crédito 60 meses','SCEE']},

  {id:2,cat:'federal',badge:'lb-fed',label:'Federal',title:'Lei 15.269/2025 — Reforma do Setor Elétrico',sub:'Sancionada nov 2025 · Vigente',tags:['reforma','setor elétrico','armazenamento','reidi'],
   text:`<strong>O que é:</strong> Ampla reforma do setor elétrico brasileiro com impactos na GD.<br><br>
• Alterações nas regras de tarifação de distribuidoras.<br>
• Incentivos ao armazenamento de energia (REIDI: R$ 1 bilhão/ano até 2030).<br>
• Respaldo legal para soluções híbridas e off-grid.<br>
• Revisão dos procedimentos de conexão à rede.`,
   url:'https://www.planalto.gov.br',pills:['Reforma 2025','REIDI armazenamento','Híbrido e off-grid']},

  {id:3,cat:'aneel',badge:'lb-aneel',label:'ANEEL',title:'REN ANEEL nº 1.000/2021 — Regras de Distribuição',sub:'7 dez 2021 · Atualizada pela REN 1.098/2024',tags:['distribuição','conexão','prazo','orçamento','formulários'],
   text:`<strong>O que é:</strong> Norma-mãe da distribuição elétrica no Brasil. Substituiu a REN 482/2012 e 687/2015.<br><br>
• <strong>Prazo microGD:</strong> 15 dias para emissão do orçamento (sem obras na rede).<br>
• <strong>Prazo miniGD:</strong> 30 dias para emissão do orçamento.<br>
• Art. 73: estudo de inversão de fluxo obrigatório com apresentação de alternativas.<br>
• Art. 83: regras de transição para processos já protocolados.<br>
• Define as 8 etapas do processo de homologação.`,
   url:'https://www2.aneel.gov.br/cedoc/ren20211000.html',
   pills:['15d microGD','30d miniGD','Art. 73 inversão de fluxo','Art. 83 transição']},

  {id:4,cat:'aneel',badge:'lb-aneel',label:'ANEEL',title:'REN ANEEL nº 1.098/2024 — Fast Track e Inversão de Fluxo',sub:'23 jul 2024 · D.O. 31 jul 2024',tags:['fast track','inversão de fluxo','7,5 kw','autoconsumo','mcmv'],
   text:`<strong>O que é:</strong> Altera a REN 1.000/2021 e simplifica a análise de inversão de fluxo.<br><br>
<strong>3 casos de dispensa da análise:</strong><br>
1. <strong>Grid zero:</strong> sistema não injeta energia na rede.<br>
2. <strong>Consumo compatível:</strong> potência gerada ≤ consumo médio no período de geração.<br>
3. <strong>Fast track:</strong> microgeração ≤ 7,5 kW em autoconsumo local — dispensa automática.`,
   url:'https://www2.aneel.gov.br/cedoc/ren20241098.html',
   pills:['Fast track ≤7,5kW','Grid zero','Autoconsumo local','MCMV solar']},

  {id:5,cat:'abnt',badge:'lb-abnt',label:'ABNT',title:'ABNT NBR 16690:2019 — Instalações de Arranjos Fotovoltaicos',sub:'2019 · Norma principal de projeto · Exigida pelas concessionárias',tags:['projeto','instalação','segurança','inversores','cabos','proteção'],
   text:`<strong>O que é:</strong> Principal norma técnica para projetos FV. Complementa a NBR 5410.<br><br>
• Requisitos do arranjo fotovoltaico (até os dispositivos de conversão).<br>
• Dimensionamento de cabos, proteções e fusíveis CC.<br>
• Dispositivos de seccionamento (SPDs).<br>
• Segurança contra choques, sobretensão e incêndio.<br>
• Exigida no memorial descritivo do projeto pelas concessionárias.`,
   url:'https://www.abnt.org.br',pills:['Projeto FV','Proteções CC','Memorial descritivo']},

  {id:6,cat:'abnt',badge:'lb-abnt',label:'ABNT',title:'ABNT NBR 17193:2025 — Segurança contra Incêndio em FV',sub:'2025 · Nova norma obrigatória',tags:['incêndio','fdr','segurança','edificações','2025'],
   text:`<strong>O que é:</strong> Nova norma (2025) com critérios obrigatórios de segurança contra incêndio em instalações FV.<br><br>
• <strong>FDR obrigatório:</strong> Fire Danger Reducer em todos os sistemas em edificações.<br>
• Análise de risco por tipo de uso (residencial, comercial, industrial).<br>
• Sinalização com placas reflexivas nos pontos de controle.<br>
• Materiais e layout não podem propagar incêndio.`,
   url:'https://www.abnt.org.br',pills:['FDR obrigatório','Nova 2025','Todos os tipos de edificação']},

  {id:7,cat:'abnt',badge:'lb-abnt',label:'ABNT / MTE',title:'NR-10 — Segurança em Instalações Elétricas',sub:'Ministério do Trabalho · Atualizada',tags:['segurança','instaladores','nr','habilitação','epi'],
   text:`<strong>O que é:</strong> Norma que regula a segurança dos profissionais em instalações elétricas, incluindo sistemas fotovoltaicos.<br><br>
• Habilitação e qualificação obrigatória dos instaladores solares.<br>
• EPI adequado em serviços elétricos.<br>
• Procedimentos de bloqueio e desenergização.`,
   url:'https://www.gov.br/trabalho-e-emprego',pills:['Habilitação instaladores','EPI','Bloqueio/desenergização']},

  {id:8,cat:'estadual',badge:'lb-est',label:'Estadual',title:'Legislação estadual de ICMS — todos os estados (Convênio ICMS 16/2015)',sub:'CONFAZ 2015 · Todos os estados e DF aderiram',tags:['icms','isenção','estados','confaz','convênio'],
   text:`<strong>Base:</strong> Convênio ICMS 16/2015 do CONFAZ possibilita isenção de ICMS sobre energia fornecida pelas distribuidoras a consumidores com sistemas solares.<br><br>
• <strong>SP:</strong> isenção TE+TUSD vigente até dez/2026 (Decreto 69.827/2024).<br>
• <strong>MG:</strong> isenção TE+TUSD vigente até 2032 (Decreto 48.506/2022 — Programa Sol de Minas).<br>
• Demais estados: maioria com isenção TE+TUSD ou apenas TE.`,
   isEstados:true,
   url:'https://www.confaz.fazenda.gov.br',pills:['Convênio ICMS 16/2015','Todos os estados','TE+TUSD ou só TE']},

  {id:9,cat:'municipal',badge:'lb-mun',label:'Municipal',title:'Descontos de IPTU para imóveis com sistema solar',sub:'Varia por município',tags:['iptu','desconto','prefeitura','município'],
   text:`Diversas prefeituras concedem descontos no IPTU para imóveis com sistemas FV:<br><br>
• <strong>São Paulo (SP):</strong> até 5% de desconto no IPTU.<br>
• <strong>Curitiba (PR):</strong> desconto progressivo por potência instalada.<br>
• <strong>Belo Horizonte (MG):</strong> isenção parcial do IPTU.<br>
• <strong>Porto Alegre (RS):</strong> redução via programa de energia renovável.<br><br>
<em>Consulte a Secretaria de Finanças do seu município.</em>`,
   url:'',pills:['Varia por cidade','Até 5% desconto','Secretaria de Finanças']},

  {id:10,cat:'concessionaria',badge:'lb-conc',label:'Concessionária',title:'Prazos legais de resposta das concessionárias',sub:'REN 1.000/2021 + REN 1.098/2024',tags:['prazo','resposta','orçamento','dias','vistoria'],
   text:`<strong>Prazos máximos legais:</strong><br><br>
• <strong>15 dias úteis:</strong> orçamento de conexão para microGD em BT sem obras na rede.<br>
• <strong>30 dias úteis:</strong> orçamento para miniGD ou quando necessário estudo de rede.<br>
• <strong>30 dias:</strong> após aceite do orçamento → vistoria e troca do medidor.<br>
• <strong>Descumprimento:</strong> registre reclamação na ANEEL (aneel.gov.br/ouvidoria).`,
   url:'https://www.aneel.gov.br/ouvidoria',pills:['15d BT sem obras','30d com estudo','30d vistoria/medidor']},

  {id:11,cat:'concessionaria',badge:'lb-conc',label:'Concessionária',title:'Portais de GD das principais concessionárias',sub:'Links oficiais para protocolamento',tags:['portal','enel','cemig','cpfl','copel','celesc','light','elektro'],
   isConcessionaria:true,
   text:'Selecione a concessionária para ver o link do portal:',
   url:'',pills:[]},
];

const estados = [
  {uf:'AC',nome:'Acre',isencao:'TE+TUSD',t:'si-full'},{uf:'AL',nome:'Alagoas',isencao:'TE+TUSD',t:'si-full'},
  {uf:'AM',nome:'Amazonas',isencao:'TE+TUSD',t:'si-full'},{uf:'BA',nome:'Bahia',isencao:'TE+TUSD',t:'si-full'},
  {uf:'CE',nome:'Ceará',isencao:'TE+TUSD',t:'si-full'},{uf:'DF',nome:'DF',isencao:'TE+TUSD',t:'si-full'},
  {uf:'ES',nome:'Espírito Santo',isencao:'TE+TUSD',t:'si-full'},{uf:'GO',nome:'Goiás',isencao:'TE+TUSD',t:'si-full'},
  {uf:'MA',nome:'Maranhão',isencao:'Só TE',t:'si-te'},{uf:'MG',nome:'Minas Gerais',isencao:'TE+TUSD/2032',t:'si-full'},
  {uf:'MS',nome:'Mato G. Sul',isencao:'TE+TUSD',t:'si-full'},{uf:'MT',nome:'Mato Grosso',isencao:'TE+TUSD',t:'si-full'},
  {uf:'PA',nome:'Pará',isencao:'TE+TUSD',t:'si-full'},{uf:'PB',nome:'Paraíba',isencao:'TE+TUSD',t:'si-full'},
  {uf:'PE',nome:'Pernambuco',isencao:'TE+TUSD',t:'si-full'},{uf:'PI',nome:'Piauí',isencao:'Só TE',t:'si-te'},
  {uf:'PR',nome:'Paraná',isencao:'TE+TUSD',t:'si-full'},{uf:'RJ',nome:'Rio de Janeiro',isencao:'TE+TUSD',t:'si-full'},
  {uf:'RN',nome:'Rio G. Norte',isencao:'TE+TUSD',t:'si-full'},{uf:'RO',nome:'Rondônia',isencao:'TE+TUSD',t:'si-full'},
  {uf:'RR',nome:'Roraima',isencao:'TE+TUSD',t:'si-full'},{uf:'RS',nome:'Rio G. Sul',isencao:'TE+TUSD',t:'si-full'},
  {uf:'SC',nome:'Santa Catarina',isencao:'TE+TUSD',t:'si-full'},{uf:'SE',nome:'Sergipe',isencao:'Só TE',t:'si-te'},
  {uf:'SP',nome:'São Paulo',isencao:'TE+TUSD/2026',t:'si-full'},{uf:'TO',nome:'Tocantins',isencao:'TE+TUSD',t:'si-full'},
];

const concs = [
  {n:'ENEL SP',url:'https://www.enel.com.br/pt-cesp/para_voce/GD_solar.html'},
  {n:'ENEL RJ',url:'https://www.enel.com.br/pt-rj/para_voce/GD_solar.html'},
  {n:'CEMIG (MG)',url:'https://www.cemig.com.br/mini-e-microgeracao-distribuida/'},
  {n:'COPEL (PR)',url:'https://www.copel.com/energia-solar'},
  {n:'CPFL Paulista',url:'https://www.cpfl.com.br/energia-solar'},
  {n:'Light (RJ)',url:'https://agencia.light.com.br'},
  {n:'Elektro (SP/MS)',url:'https://agencia.elektro.com.br'},
  {n:'CELESC (SC)',url:'https://www.celesc.com.br/geracao-distribuida'},
  {n:'COELBA (BA)',url:'https://www.coelba.com.br'},
];

let legOpenId = null;
let legCat = 'all';

window.renderLegislacao = function(container) {
  container.innerHTML = buildLegScreen();
  bindLeg();
};

function buildLegScreen() {
  return `
  <h2 class="app-h2" style="margin-bottom:.25rem">Base de Legislação</h2>
  <p class="app-sub">Federal · ANEEL · ABNT · Estadual · Municipal · Concessionárias</p>
  <div class="search-wrap">
    <i class="ti ti-search"></i>
    <input type="text" id="leg-search" placeholder="Buscar lei, resolução, norma..." oninput="legFilter()" />
  </div>
  <div class="cat-bar" id="leg-cats">
    <button class="catbtn active" onclick="legCatSet('all',this)">Todas</button>
    <button class="catbtn" onclick="legCatSet('federal',this)">Federal</button>
    <button class="catbtn" onclick="legCatSet('aneel',this)">ANEEL</button>
    <button class="catbtn" onclick="legCatSet('abnt',this)">ABNT/NBR</button>
    <button class="catbtn" onclick="legCatSet('estadual',this)">Estadual</button>
    <button class="catbtn" onclick="legCatSet('municipal',this)">Municipal</button>
    <button class="catbtn" onclick="legCatSet('concessionaria',this)">Concessionárias</button>
  </div>
  <div id="leg-list"></div>`;
}

function bindLeg() {
  legRender();
}

function legCatSet(cat, btn) {
  legCat = cat;
  document.querySelectorAll('.catbtn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('leg-search').value = '';
  legRender();
}

function legFilter() { legRender(); }

function legRender() {
  const q = (document.getElementById('leg-search')?.value || '').toLowerCase().trim();
  const filtered = laws.filter(l => {
    if (legCat !== 'all' && l.cat !== legCat) return false;
    if (!q) return true;
    return l.title.toLowerCase().includes(q) || (l.tags||[]).some(t=>t.includes(q)) || (l.text||'').toLowerCase().includes(q);
  });
  const list = document.getElementById('leg-list');
  if (!list) return;
  if (!filtered.length) { list.innerHTML = `<div style="text-align:center;padding:2rem;color:#6b7280;font-size:13px"><i class="ti ti-search-off" style="font-size:28px;display:block;margin-bottom:8px"></i>Nenhum resultado.</div>`; return; }
  list.innerHTML = filtered.map(l => legCard(l, q)).join('');
}

function legCard(l, q) {
  const open = legOpenId === l.id;
  let body = '';
  if (open) {
    body = `<div class="law-body"><div class="law-text">${hl(l.text, q)}`;
    if (l.isEstados) {
      body += `<div class="state-grid" style="margin-top:.6rem">`;
      estados.forEach(e => { body += `<div class="state-card"><div class="state-name">${e.uf} — ${e.nome}</div><div class="state-isencao ${e.t}">Isenção: ${e.isencao}</div></div>`; });
      body += `</div><div style="font-size:10px;color:#6b7280;margin-top:6px">🟢 TE+TUSD = total &nbsp;|&nbsp; 🔵 Só TE = parcial</div>`;
    }
    if (l.isConcessionaria) {
      body += `<select class="conc-select" onchange="showConc(this.value)"><option value="">— Selecione —</option>${concs.map(c=>`<option value="${c.url}">${c.n}</option>`).join('')}</select><div id="conc-link"></div>`;
    }
    body += `</div>`;
    if (l.pills?.length) { body += `<div class="law-pills">${l.pills.map(p=>`<span class="lpill"><i class="ti ti-tag" style="font-size:11px"></i>${p}</span>`).join('')}</div>`; }
    if (l.url) { body += `<a class="law-link-btn" href="${l.url}" target="_blank"><i class="ti ti-external-link"></i> Documento oficial</a>`; }
    body += `</div>`;
  }
  return `<div class="law-card${open?' open':''}" id="lc${l.id}">
    <div class="law-head" onclick="legToggle(${l.id})">
      <span class="law-badge ${l.badge}">${l.label}</span>
      <div class="law-info"><div class="law-title">${hl(l.title,q)}</div><div class="law-sub-txt">${l.sub}</div></div>
      <i class="ti ti-chevron-down law-arrow"></i>
    </div>${body}</div>`;
}

function legToggle(id) {
  legOpenId = legOpenId === id ? null : id;
  legRender();
  if (legOpenId) { setTimeout(() => { document.getElementById('lc'+id)?.scrollIntoView({behavior:'smooth',block:'nearest'}); }, 60); }
}

function showConc(url) {
  const div = document.getElementById('conc-link');
  if (!div || !url) return;
  div.innerHTML = `<a class="law-link-btn" href="${url}" target="_blank"><i class="ti ti-external-link"></i> Abrir portal da concessionária</a>`;
}

function hl(text, q) {
  if (!q || q.length < 2) return text;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
  return text.replace(re, '<mark>$1</mark>');
}
