
/* ============================================
   SOLARHOMOLOG — DIAGNOSTICO.JS
   ============================================ */

const concRisks = {
  cpfl:{name:'CPFL Paulista / Piratininga',risk:'alto',regioes:'Interior de SP (Campinas, Ribeirão, Sorocaba)',nota:'CPFL lidera rejeições por inversão de fluxo desde out/2024, inclusive em sistemas ≤7,5 kW.'},
  rge:{name:'RGE (RS)',risk:'alto',regioes:'Caxias do Sul, Novo Hamburgo, Santa Maria',nota:'RGE tem os maiores índices de reprovação por inversão de fluxo do país.'},
  cemig:{name:'CEMIG (MG)',risk:'medio',regioes:'Sul de Minas, Triângulo Mineiro',nota:'Casos crescentes de negativa sem apresentação do estudo completo.'},
  enel_sp:{name:'ENEL SP',risk:'baixo',regioes:'Grande São Paulo',nota:'Taxas menores de reprovação. Processo ágil pelo portal.'},
  enel_rj:{name:'ENEL RJ',risk:'baixo',regioes:'Região metropolitana RJ',nota:'Processo regular, poucos registros de negativas.'},
  copel:{name:'COPEL (PR)',risk:'medio',regioes:'Interior do Paraná',nota:'Casos pontuais de inversão de fluxo.'},
  celesc:{name:'CELESC (SC)',risk:'baixo',regioes:'Santa Catarina em geral',nota:'Processo relativamente tranquilo.'},
  light:{name:'Light (RJ)',risk:'baixo',regioes:'Capital e região metropolitana RJ',nota:'Processo regular via Agência Light online.'},
  elektro:{name:'Elektro (SP/MS)',risk:'medio',regioes:'Interior de SP e MS',nota:'Casos isolados em regiões de alta penetração.'},
  coelba:{name:'COELBA (BA)',risk:'baixo',regioes:'Bahia em geral',nota:'Poucas negativas registradas.'},
  energisa:{name:'Energisa',risk:'medio',regioes:'Diversas regiões',nota:'Varia por área de concessão.'},
  outro:{name:'Concessionária',risk:'indefinido',regioes:'—',nota:'Verifique o histórico específico desta concessionária.'},
};

const sitObs = {
  normal:{ok:true,bloq:false,msg:''},
  ramal_part:{ok:false,bloq:true,msg:'<strong>UC com ramal particular / rede privada:</strong> a concessionária não acessa o ponto de medição diretamente, impedindo a troca do medidor bidirecional, etapa obrigatória da homologação.'},
  submedida:{ok:false,bloq:true,msg:'<strong>UC submedida de outra UC principal:</strong> o medidor é derivado de outra instalação. A concessionária exige medição própria com ramal individual para homologar GD.'},
  compartilhada:{ok:false,bloq:false,msg:'<strong>UC em condomínio sem medidor individual:</strong> o processo padrão é bloqueado, mas há alternativa via EMUC (Empreendimento com Múltiplas UCs).'},
  rural_sem_uc:{ok:false,bloq:false,msg:'<strong>Imóvel rural sem UC formal:</strong> necessário regularizar o ponto de fornecimento junto à distribuidora antes de homologar.'},
  aluguel:{ok:false,bloq:false,msg:'<strong>Imóvel alugado — titular diferente do solicitante:</strong> a homologação exige autorização formal do proprietário (procuração pública + aditivo de locação).'},
  debito:{ok:false,bloq:true,msg:'<strong>UC com débito em aberto:</strong> a distribuidora não processa pedidos de GD enquanto houver pendência financeira no cadastro.'},
  irregular:{ok:false,bloq:true,msg:'<strong>UC em situação irregular:</strong> regularização obrigatória antes de qualquer solicitação junto à concessionária.'},
};

window.renderDiagnostico = function(container) {
  container.innerHTML = buildDiagScreen1();
};

function buildDiagScreen1() {
  return `
  <div class="step-bar"><div class="sdot active"></div><div class="sdot"></div><div class="sdot"></div><span class="slbl">Verificar minha UC</span></div>
  <h2 class="app-h2">Diagnóstico de viabilidade</h2>
  <p class="app-sub">Identifique impedimentos antes de instalar o sistema solar.</p>
  <div class="app-card">
    <div class="app-card-title"><i class="ti ti-file-invoice"></i>Envie a conta de luz</div>
    <div class="upload-area" id="diag-upload" onclick="document.getElementById('diag-file-inp').click()">
      <input type="file" id="diag-file-inp" style="display:none" accept=".pdf,.jpg,.jpeg,.png" onchange="diagFileSelected(this)" />
      <div class="upload-icon" id="du-icon"><i class="ti ti-cloud-upload"></i></div>
      <div class="upload-lbl" id="du-lbl">Toque para enviar a conta (PDF, foto ou imagem)</div>
      <div style="font-size:11px;color:#6b7280;margin-top:4px">A IA extrai os dados automaticamente</div>
    </div>
    <div id="du-prog" style="display:none"><div class="prog-bar"><div class="prog-fill" id="du-pf" style="width:0%"></div></div></div>
  </div>
  <div class="app-card" id="diag-manual">
    <div class="app-card-title"><i class="ti ti-keyboard"></i>Ou preencha manualmente</div>
    <label class="app-label">Número da UC *</label>
    <input type="text" id="d-uc" class="app-input" placeholder="Ex.: 7010482930" />
    <label class="app-label">Concessionária *</label>
    <select id="d-conc" class="app-select" onchange="this.dataset.touched='1'">
      <option value="">— Selecione —</option>
      <option value="enel_sp">ENEL SP</option>
      <option value="enel_rj">ENEL RJ</option>
      <option value="cemig">CEMIG (MG)</option>
      <option value="cpfl">CPFL Paulista / Piratininga</option>
      <option value="rge">RGE (RS)</option>
      <option value="copel">COPEL (PR)</option>
      <option value="celesc">CELESC (SC)</option>
      <option value="light">Light (RJ)</option>
      <option value="elektro">Elektro (SP/MS)</option>
      <option value="coelba">COELBA (BA)</option>
      <option value="energisa">Energisa</option>
      <option value="outro">Outra</option>
    </select>
    <div class="app-row2">
      <div>
        <label class="app-label">Consumo médio (kWh/mês)</label>
        <input type="number" id="d-cons" class="app-input" placeholder="Ex.: 450" />
      </div>
      <div>
        <label class="app-label">Potência a instalar (kWp)</label>
        <input type="number" id="d-kw" class="app-input" placeholder="Ex.: 8.2" step="0.1" />
      </div>
    </div>
    <label class="app-label">Situação da UC *</label>
    <select id="d-sit" class="app-select" onchange="this.dataset.touched='1'">
      <option value="">Selecione</option>
      <option value="normal">Regular — em nome do titular</option>
      <option value="ramal_part">Ramal particular / rede privada</option>
      <option value="submedida">Submedida de outra UC</option>
      <option value="compartilhada">Condomínio sem medidor individual</option>
      <option value="rural_sem_uc">Imóvel rural sem UC formal</option>
      <option value="aluguel">Imóvel alugado (titular ≠ solicitante)</option>
      <option value="debito">UC com débito em aberto</option>
      <option value="irregular">UC em situação irregular</option>
    </select>
  </div>
  <button class="btn btn-solar btn-block" onclick="runDiag()">
    <i class="ti ti-sparkles"></i> Analisar viabilidade com IA
  </button>`;
}

function diagFileSelected(input) {
  const file = input.files[0];
  if (!file) return;

  const box = document.getElementById('diag-upload');
  const icon = document.getElementById('du-icon');
  const lbl = document.getElementById('du-lbl');
  const pw = document.getElementById('du-prog');
  const pf = document.getElementById('du-pf');
  if (!box || box.classList.contains('uploaded')) return;
  pw.style.display = 'block';
  let p = 0;
  const iv = setInterval(() => {
    p += Math.random() * 20 + 8;
    if (p > 100) p = 100;
    pf.style.width = p + '%';
    if (p >= 100) {
      clearInterval(iv);
      box.classList.add('uploaded');
      icon.innerHTML = '<i class="ti ti-circle-check"></i>';
      lbl.textContent = file.name + ' — dados extraídos';
      pw.style.display = 'none';
      // Preenche apenas campos vazios — não sobrescreve o que o usuário já digitou
      const setIfEmpty = (id, val) => { const el = document.getElementById(id); if (el && !el.value && !el.dataset.touched) el.value = val; };
      setIfEmpty('d-uc', '7010482930');
      setIfEmpty('d-conc', 'cpfl');
      setIfEmpty('d-cons', '620');
      setIfEmpty('d-kw', '12.4');
      setIfEmpty('d-sit', 'normal');
    }
  }, 120);
}

function runDiag() {
  const conc = document.getElementById('d-conc').value;
  const sit  = document.getElementById('d-sit').value;
  const kwStr = document.getElementById('d-kw').value.trim();
  const cons = parseFloat(document.getElementById('d-cons').value) || 400;
  const uc   = document.getElementById('d-uc').value || '—';
  if (!conc || !sit) { alert('Preencha ao menos a concessionária e a situação da UC.'); return; }
  if (!kwStr) { alert('Informe a potência do sistema solar a instalar (kWp) — campo obrigatório.'); document.getElementById('d-kw').focus(); return; }
  const kw = parseFloat(kwStr);
  if (!kw || kw <= 0) { alert('Informe uma potência válida (ex: 8.2 kWp).'); document.getElementById('d-kw').focus(); return; }

  const body = document.getElementById('modal-body');
  body.innerHTML = buildDiagLoading();
  let p = 0;
  const steps = ['Lendo UC...','Verificando concessionária...','Consultando restrições da região...','Analisando inversão de fluxo...','Gerando diagnóstico...'];
  let i = 0;
  const iv = setInterval(() => {
    p += 20; if (p > 100) p = 100;
    const pf = document.getElementById('dl-pf');
    const st = document.getElementById('dl-st');
    if (pf) pf.style.width = p + '%';
    if (st) st.textContent = steps[Math.min(i, steps.length-1)];
    i++;
    if (p >= 100) { clearInterval(iv); setTimeout(() => body.innerHTML = buildDiagResult(conc, sit, kw, cons, uc), 400); }
  }, 500);
}

function buildDiagLoading() {
  return `<div style="text-align:center;padding:3rem 1rem">
    <div style="font-size:48px;color:#f5a623;margin-bottom:1rem"><i class="ti ti-loader spin"></i></div>
    <div style="font-size:16px;font-weight:600;margin-bottom:.4rem">Analisando sua UC...</div>
    <div style="font-size:13px;color:#6b7280">Verificando concessionária e restrições</div>
    <div class="prog-bar" style="margin:1.5rem auto;max-width:280px">
      <div class="prog-fill" id="dl-pf" style="width:0%"></div>
    </div>
    <div style="font-size:12px;color:#6b7280" id="dl-st">Lendo UC...</div>
  </div>`;
}

function buildDiagResult(conc, sit, kw, cons, uc) {
  const cr  = concRisks[conc] || concRisks['outro'];
  const sob = sitObs[sit] || {ok:true,bloq:false,msg:''};
  const ratio = cons > 0 ? (kw * 100) / cons : 1;
  const ft = kw <= 7.5;
  let status = 'ok';
  let motivos = [];

  if (!sob.ok) {
    if (sob.bloq) { status = 'block'; motivos.push({t:'block', m: sob.msg}); }
    else { if (status!=='block') status='warn'; motivos.push({t:'warn', m: sob.msg}); }
  }
  if (cr.risk === 'alto' && !ft) {
    if (status!=='block') status='block';
    motivos.push({t:'block', m:`<strong>Alto risco — inversão de fluxo (${cr.name}):</strong> regiões afetadas: ${cr.regioes}. ${cr.nota}`});
  } else if (cr.risk === 'alto' && ft) {
    if (status!=='block') status='warn';
    motivos.push({t:'warn', m:`<strong>Atenção — Fast Track (${kw} kWp ≤ 7,5 kW):</strong> deveria dispensar análise de inversão de fluxo (REN 1.098/2024), mas ${cr.name} ainda reprova projetos nessa faixa ilegalmente.`});
  } else if (cr.risk === 'medio') {
    if (status==='ok') status='warn';
    motivos.push({t:'warn', m:`<strong>Risco moderado (${cr.name}):</strong> ${cr.nota}`});
  }
  if (ratio > 1.2) {
    if (status==='ok') status='warn';
    motivos.push({t:'warn', m:`<strong>Sistema superdimensionado (${ratio.toFixed(0)}% do consumo):</strong> potência muito acima do consumo aumenta risco de reprovação. Recomenda-se ajustar para ≤110%.`});
  }

  const titles = {ok:'✓ UC viável para homologação direta', warn:'⚠ Atenção — homologação possível com condições', block:'✗ Homologação direta bloqueada — veja alternativas'};
  const texts = {
    ok:`A UC <strong>${uc}</strong> não apresenta impedimentos. ${cr.name} tem histórico favorável.`,
    warn:`A UC apresenta pontos de atenção que podem gerar atrasos ou exigir adaptações técnicas.`,
    block:`A UC apresenta impedimentos para o processo padrão. Veja os caminhos alternativos abaixo.`,
  };

  let html = `<div class="step-bar"><div class="sdot done"></div><div class="sdot done"></div><div class="sdot active"></div><span class="slbl">Diagnóstico</span></div>`;

  html += `<div class="app-card">
    <div class="app-card-title"><i class="ti ti-bolt"></i>UC identificada</div>
    <div class="info-row"><span class="info-key">Número da UC</span><span style="font-weight:500">${uc}</span></div>
    <div class="info-row"><span class="info-key">Concessionária</span><span style="font-weight:500">${cr.name}</span></div>
    <div class="info-row"><span class="info-key">Consumo médio</span><span style="font-weight:500">${cons} kWh/mês</span></div>
    <div class="info-row"><span class="info-key">Sistema solar</span><span style="font-weight:500">${kw} kWp</span></div>
  </div>`;

  html += `<div class="result-${status}"><div class="rt">${titles[status]}</div><div class="rtxt">${texts[status]}</div></div>`;

  if (motivos.length) {
    html += `<div class="sec-lbl">Motivos identificados</div>`;
    motivos.forEach(m => { html += `<div class="result-${m.t}" style="margin-bottom:7px"><div class="rtxt">${m.m}</div></div>`; });
  }

  html += `<div class="sec-lbl">Alternativas disponíveis</div>`;

  if (sit === 'submedida' || sit === 'ramal_part')
    html += altC('Regularizar ponto de entrega junto à concessionária','Solicitar individualização da UC com ramal e medidor próprio. Após regularização, o processo padrão é viável.','Pré-requisito','ab-amber','ti-plug-connected');
  if (sit === 'compartilhada')
    html += altC('EMUC — área comum do condomínio','Sistema instalado em área comum com medidor exclusivo. Créditos rateados entre condôminos. Exige aprovação em assembleia.','Viável','ab-green','ti-building-community');
  if (sit === 'aluguel')
    html += altC('Procuração do proprietário + aditivo contratual','Locatário pode homologar com autorização formal do proprietário (procuração pública + aditivo de locação).','Documentação adicional','ab-amber','ti-writing');
  if (sit === 'debito' || sit === 'irregular')
    html += altC('Regularizar a UC antes de tudo','Quitar débitos e regularizar o cadastro. Após isso o processo padrão é viável.','Obrigatório','ab-amber','ti-file-check');
  if (sit === 'rural_sem_uc') {
    html += altC('Solicitar ligação rural','Distribuidoras são obrigadas a conectar imóveis rurais com carga < 50 kW sem custo (RN 1.000/2021 + Dec. 7.520/2011).','Por lei','ab-green','ti-home');
    html += altC('Sistema off-grid com baterias','Solução independente da rede. Sem homologação necessária, sem créditos de energia.','Sem compensação','ab-blue','ti-battery-charging');
  }
  if (cr.risk === 'alto' || cr.risk === 'medio') {
    html += altC('Grid Zero — inversor com controle de exportação (EPM)','Configurar inversor para não injetar na rede. Dispensa inversão de fluxo (REN 1.098/2024). Sem créditos futuros.','Aprovação mais rápida','ab-green','ti-solar-panel');
    html += altC('Sistema híbrido com baterias','Armazenar excedente em vez de injetar. Incentivado pelo REIDI (Lei 15.269/2025 — R$ 1bi/ano até 2030).','Custo maior / incentivo fiscal','ab-blue','ti-battery-4');
    html += altC('Recurso administrativo na ANEEL','Negativa sem estudo de inversão de fluxo é ilegal (RN 1.000/2021 art.73). Contestar pela Ouvidoria ANEEL ou Procon.','Direito do consumidor','ab-purple','ti-scale');
    if (kw > 7.5) html += altC('Redimensionar para fast track (≤ 7,5 kW)','Sistemas ≤ 7,5 kW em autoconsumo local têm direito ao fast track, dispensando análise de inversão de fluxo.','Se potência > 7,5 kW','ab-amber','ti-arrows-minimize');
  }
  html += altC('Geração compartilhada — consórcio','Unir-se a outros consumidores em cooperativa para instalar em área sem restrição. Créditos distribuídos proporcionalmente.','Para qualquer caso','ab-green','ti-users-group');

  html += `<div class="ai-bubble"><strong>Recomendação da IA:</strong> ${
    status==='ok' ? 'Sua UC está apta. Você pode iniciar o processo de homologação agora.' :
    status==='warn' ? 'Nossa equipe pode preparar o processo considerando as adaptações necessárias para maximizar as chances de aprovação.' :
    'A homologação direta está bloqueada, mas há caminhos viáveis. Nossa equipe orienta qual é o melhor para o seu caso, sem custo adicional.'
  }</div>`;

  if (status === 'ok') {
    html += `<button class="btn btn-solar btn-block" style="margin-bottom:8px" onclick="go('screen-login')"><i class="ti ti-arrow-right"></i> Iniciar homologação agora</button>`;
  } else {
    html += `<button class="btn btn-solar btn-block" style="margin-bottom:8px" onclick="window.open('https://wa.me/5511992071648?text=' + encodeURIComponent('Olá! Preciso de ajuda com a homologação da minha UC. Gostaria de falar com um especialista.'), '_blank')"><i class="ti ti-brand-whatsapp"></i> Falar com especialista</button>`;
  }
  html += `<button class="btn btn-block" onclick="window.renderDiagnostico(document.getElementById('modal-body'))"><i class="ti ti-refresh"></i> Analisar outra UC</button>`;

  return html;
}

function altC(title, desc, badge, bc, icon) {
  return `<div class="alt-card">
    <div class="alt-title"><i class="ti ${icon}" style="font-size:15px;color:#1a3a2a"></i>${title}<span class="alt-badge ${bc}">${badge}</span></div>
    <div class="alt-desc">${desc}</div>
  </div>`;
}

  