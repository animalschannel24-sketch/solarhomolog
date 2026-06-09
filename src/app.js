
/* ============================================
   SOLARHOMOLOG — APP.JS
   Fluxo principal: login → cadastro → docs → proposta → pagamento → tracking
   ============================================ */

// ── Supabase Auth ────────────────────────────────────────────────────────────
let _supabaseClient = null;

async function initSupabase() {
  if (_supabaseClient) return _supabaseClient;
  try {
    const resp = await fetch('/api/config');
    if (!resp.ok) throw new Error('Config indisponível (HTTP ' + resp.status + ')');
    const cfg = await resp.json();
    if (cfg.error) throw new Error(cfg.error);
    if (!cfg.url || !cfg.anon_key) throw new Error('Credenciais Supabase não configuradas no servidor');
    _supabaseClient = window.supabase.createClient(
      cfg.url.replace(/\/$/, ''),
      cfg.anon_key,
      {
        auth: {
          flowType: 'implicit',
          detectSessionInUrl: true,
          autoRefreshToken: true,
          persistSession: true,
        },
      }
    );
    return _supabaseClient;
  } catch (e) {
    console.error('[Supabase] init error:', e);
    return null;
  }
}

async function loginWithGoogle() {
  const btn = document.querySelector('.soc-btn');
  if (btn) btn.disabled = true;

  const client = await initSupabase();
  if (!client) {
    if (btn) btn.disabled = false;
    alert('Serviço de autenticação indisponível. Verifique sua conexão e tente novamente.');
    return;
  }

  try {
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname,
        queryParams: { prompt: 'select_account' },
      },
    });

    if (error) throw error;
    // SDK faz o redirect automaticamente (window.location.assign internamente)
  } catch (err) {
    if (btn) btn.disabled = false;
    console.error('[Google OAuth]', err);
    alert('Erro ao iniciar login com Google: ' + err.message);
  }
}

// ── Abertura / fechamento do modal ──────────────────────────────────────────
function openApp(screen) {
  try {
    const overlay = document.getElementById('modal-overlay');
    const modal = document.getElementById('modal-app');
    
    if (!overlay || !modal) {
      console.error('Modal elements not found', {overlay, modal});
      return false;
    }
    
    overlay.classList.add('open');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderScreen(screen || 'screen-welcome');
    return false;
  } catch(e) {
    console.error('Error in openApp:', e);
    return false;
  }
}

function closeApp() {
  try {
    const overlay = document.getElementById('modal-overlay');
    const modal = document.getElementById('modal-app');
    
    if (!overlay || !modal) {
      console.error('Modal elements not found', {overlay, modal});
      return false;
    }
    
    overlay.classList.remove('open');
    modal.classList.remove('open');
    document.body.style.overflow = '';
    return false;
  } catch(e) {
    console.error('Error in closeApp:', e);
    return false;
  }
}

function renderScreen(id) {
  const body = document.getElementById('modal-body');
  const screens = {
    'screen-welcome': screenWelcome,
    'screen-login': screenLogin,
    'screen-login-email': screenLoginEmail,
    'screen-company': screenCompany,
    'screen-docs': screenDocs,
    'screen-quote': screenQuote,
    'screen-payment': screenPayment,
    'screen-tracking': screenTracking,
    'screen-diagnostico': () => window.renderDiagnostico(body),
    'screen-legislacao': () => window.renderLegislacao(body),
  };
  if (screens[id]) {
    if (id === 'screen-diagnostico' || id === 'screen-legislacao') {
      body.innerHTML = '';
      screens[id]();
    } else {
      body.innerHTML = screens[id]();
      bindScreen(id);
    }
  }
}

function go(id) {
  renderScreen(id);
  const body = document.getElementById('modal-body');
  if (body) body.scrollTop = 0;
}

// ── TELA: Boas-vindas ────────────────────────────────────────────────────────
function screenWelcome() {
  return `
  <h2 class="app-h2">Homologação solar simplificada</h2>
  <p class="app-sub">Documentação revisada por especialistas. Você só paga se quiser prosseguir.</p>
  <div class="app-card" style="border-color:#f5a623;background:#fffbf0">
    <div class="app-card-title"><i class="ti ti-file-check"></i> Análise de documentos</div>
    <p style="font-size:13px;color:#6b7280;line-height:1.6">Verificamos todos os documentos exigidos pela concessionária antes de qualquer cobrança. Você só paga se quiser prosseguir.</p>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:1.25rem">
    <div class="app-card" style="margin-bottom:0">
      <div style="font-size:22px;color:#1a3a2a;font-weight:600">R$ 800</div>
      <div style="font-size:12px;color:#6b7280">por 10 kW de consumo</div>
    </div>
    <div class="app-card" style="margin-bottom:0">
      <div style="font-size:22px;color:#1a3a2a;font-weight:600">72h</div>
      <div style="font-size:12px;color:#6b7280">prazo médio de análise</div>
    </div>
  </div>
  <button class="btn btn-primary btn-block" style="margin-bottom:10px" onclick="go('screen-login')">
    <i class="ti ti-solar-panel"></i> Processo de Homologação
  </button>
  <button class="btn btn-block" style="margin-bottom:10px" onclick="go('screen-diagnostico')">
    <i class="ti ti-bolt"></i> Verificar minha UC antes de começar
  </button>
  <button class="btn btn-block" onclick="go('screen-tracking')">
    <i class="ti ti-search"></i> Acompanhar processo existente
  </button>`;
}

// ── TELA: Login ──────────────────────────────────────────────────────────────
function screenLogin() {
  return `
  <div class="step-bar"><div class="sdot active"></div><div class="sdot"></div><div class="sdot"></div><div class="sdot"></div><span class="slbl">Acesso à conta</span></div>
  <h2 class="app-h2">Criar conta ou entrar</h2>
  <p class="app-sub">Suas informações ficam seguras para acompanhar o processo.</p>
  <button class="soc-btn" onclick="loginWithGoogle()">
    <div class="soc-icon si-g">G</div><span>Continuar com Google</span>
  </button>
  <button class="soc-btn" onclick="go('screen-login-email')">
    <div class="soc-icon si-e">@</div><span>Continuar com e-mail</span>
  </button>
  <p style="text-align:center;font-size:11px;color:#6b7280;margin-top:1rem;line-height:1.6">
    Ao continuar, você concorda com os <a href="termos.html" style="color:#1a3a2a">Termos de Uso</a> e <a href="privacidade.html" style="color:#1a3a2a">Política de Privacidade</a>.
  </p>`;
}

function screenLoginEmail() {
  return `
  <div class="step-bar"><div class="sdot active"></div><div class="sdot"></div><div class="sdot"></div><div class="sdot"></div><span class="slbl">Acesso por e-mail</span></div>
  <h2 class="app-h2">Entrar com e-mail</h2>
  <p class="app-sub">Informe seu e-mail para receber um link de acesso seguro.</p>
  <label class="app-label">E-mail</label>
  <input type="email" id="email-inp" class="app-input" placeholder="seu@email.com.br" />
  <button class="btn btn-primary btn-block" style="margin-bottom:10px" onclick="sendEmailLink()">
    <i class="ti ti-send"></i> Enviar link de acesso
  </button>
  <button class="btn btn-block" onclick="go('screen-login')">Voltar</button>`;
}

async function sendEmailLink() {
  const e = document.getElementById('email-inp')?.value?.trim() || '';
  if (!e || !e.includes('@')) { alert('Informe um e-mail válido.'); return; }

  const btn = document.querySelector('#modal-body button.btn-primary');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="ti ti-loader spin"></i> Enviando...'; }

  const client = await initSupabase();
  if (!client) {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="ti ti-send"></i> Enviar link de acesso'; }
    alert('Serviço de autenticação indisponível. Tente novamente.');
    return;
  }

  const { error } = await client.auth.signInWithOtp({
    email: e,
    options: { emailRedirectTo: window.location.origin + window.location.pathname },
  });

  if (error) {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="ti ti-send"></i> Enviar link de acesso'; }
    alert('Erro ao enviar e-mail: ' + error.message);
    return;
  }

  const body = document.getElementById('modal-body');
  if (body) {
    body.innerHTML = `
      <div style="text-align:center;padding:1.5rem 0">
        <div style="font-size:52px;margin-bottom:1rem">📧</div>
        <h2 class="app-h2">Verifique seu e-mail</h2>
        <p class="app-sub">Enviamos um link de acesso para <strong>${e}</strong>.<br>Clique no link para entrar — ele expira em 1 hora.</p>
        <p style="font-size:11px;color:#6b7280;margin-top:.75rem">Não recebeu? Verifique a pasta de spam.</p>
        <button class="btn btn-block" style="margin-top:1.25rem" onclick="go('screen-login')">Voltar</button>
      </div>`;
  }
}

// ── TELA: Cadastro ───────────────────────────────────────────────────────────
function screenCompany() {
  return `
  <div class="step-bar"><div class="sdot done"></div><div class="sdot active"></div><div class="sdot"></div><div class="sdot"></div><span class="slbl">Cadastro</span></div>
  <h2 class="app-h2">Cadastro</h2>
  <p class="app-sub">Preencha os dados exigidos pela concessionária.</p>
  <div class="tabs">
    <button class="tab active" id="tab-pj" onclick="switchTab('pj')">Pessoa Jurídica</button>
    <button class="tab" id="tab-pf" onclick="switchTab('pf')">Pessoa Física</button>
  </div>
  <div id="tabpanel-pj" class="tab-panel active">
    <div class="app-card">
      <div class="app-card-title"><i class="ti ti-building"></i>Dados da empresa</div>
      <label class="app-label">Razão Social *</label>
      <input type="text" id="pj-razao" class="app-input" placeholder="Conforme CNPJ" />
      <label class="app-label">CNPJ *</label>
      <input type="text" class="app-input" id="cnpj-inp" placeholder="00.000.000/0000-00" oninput="maskCNPJ(this)" />
      <label class="app-label">Nome do Representante Legal *</label>
      <input type="text" id="pj-rep-nome" class="app-input" placeholder="Conforme procuração" />
      <label class="app-label">CPF do Representante *</label>
      <input type="text" id="pj-rep-cpf" class="app-input" placeholder="000.000.000-00" oninput="maskCPF(this)" />
    </div>
  </div>
  <div id="tabpanel-pf" class="tab-panel">
    <div class="app-card">
      <div class="app-card-title"><i class="ti ti-user"></i>Dados pessoais</div>
      <label class="app-label">Nome completo *</label>
      <input type="text" id="pf-nome" class="app-input" placeholder="Conforme documento" />
      <div class="app-row2">
        <div><label class="app-label">CPF *</label><input type="text" id="pf-cpf" class="app-input" placeholder="000.000.000-00" oninput="maskCPF(this)" /></div>
        <div><label class="app-label">RG *</label><input type="text" id="pf-rg" class="app-input" placeholder="00.000.000-0" /></div>
      </div>
      <label class="app-label">Data de nascimento *</label>
      <input type="date" id="pf-nasc" class="app-input" />
    </div>
  </div>
  <div class="app-card">
    <div class="app-card-title"><i class="ti ti-map-pin"></i>Endereço de instalação</div>
    <label class="app-label">CEP *</label>
    <input type="text" class="app-input" id="cep-inp" placeholder="00000-000" oninput="maskCEP(this)" />
    <div class="app-row2">
      <div><label class="app-label">Logradouro *</label><input type="text" id="addr-logr" class="app-input" placeholder="Rua, Av..." /></div>
      <div><label class="app-label">Número *</label><input type="text" id="addr-num" class="app-input" placeholder="123" /></div>
    </div>
    <div class="app-row2">
      <div><label class="app-label">Cidade *</label><input type="text" id="addr-cidade" class="app-input" /></div>
      <div><label class="app-label">Estado *</label>
        <select id="addr-estado" class="app-select">
          <option value="">UF</option>
          ${['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'].map(u=>`<option>${u}</option>`).join('')}
        </select>
      </div>
    </div>
  </div>
  <div class="app-card">
    <div class="app-card-title"><i class="ti ti-bolt"></i>Dados da concessionária</div>
    <label class="app-label">Concessionária *</label>
    <select id="conc-sel" class="app-select">
      <option value="">Selecione</option>
      ${['ENEL SP','ENEL RJ','CEMIG','COPEL','CELESC','CPFL Paulista','CPFL Piratininga','Light','Elektro','COELBA','CELPE','ENERGISA','Outra'].map(c=>`<option>${c}</option>`).join('')}
    </select>
    <label class="app-label">Número da instalação (UC) *</label>
    <input type="text" id="uc-inp" class="app-input" placeholder="Conforme conta de energia" />
    <label class="app-label">Número do medidor</label>
    <input type="text" class="app-input" placeholder="Opcional" />
  </div>
  <div class="app-card">
    <div class="app-card-title"><i class="ti ti-phone"></i>Contato</div>
    <div class="app-row2">
      <div><label class="app-label">WhatsApp *</label><input type="text" id="cont-whats" class="app-input" placeholder="(11) 99999-9999" /></div>
      <div><label class="app-label">E-mail *</label><input type="text" id="cont-email" class="app-input" placeholder="email@empresa.com" /></div>
    </div>
  </div>
  <button class="btn btn-primary btn-block" onclick="validateAndGoToDocs()">
    <i class="ti ti-arrow-right"></i> Avançar para documentos
  </button>`;
}

async function validateAndGoToDocs() {
  const isPJ = document.getElementById('tab-pj').classList.contains('active');
  const fields = [];

  if (isPJ) {
    fields.push(['pj-razao', 'Razão Social']);
    fields.push(['cnpj-inp', 'CNPJ']);
    fields.push(['pj-rep-nome', 'Nome do Representante Legal']);
    fields.push(['pj-rep-cpf', 'CPF do Representante']);
  } else {
    fields.push(['pf-nome', 'Nome completo']);
    fields.push(['pf-cpf', 'CPF']);
    fields.push(['pf-rg', 'RG']);
    fields.push(['pf-nasc', 'Data de nascimento']);
  }

  fields.push(
    ['cep-inp',      'CEP'],
    ['addr-logr',    'Logradouro'],
    ['addr-num',     'Número'],
    ['addr-cidade',  'Cidade'],
    ['addr-estado',  'Estado'],
    ['conc-sel',     'Concessionária'],
    ['uc-inp',       'Número da instalação (UC)'],
    ['cont-whats',   'WhatsApp'],
    ['cont-email',   'E-mail'],
  );

  for (const [id, label] of fields) {
    const el = document.getElementById(id);
    if (!el || !el.value.trim()) {
      el?.focus();
      alert(`Preencha o campo obrigatório: ${label}`);
      return;
    }
  }

  const email = document.getElementById('cont-email').value;
  if (!email.includes('@')) {
    document.getElementById('cont-email').focus();
    alert('Informe um e-mail válido.');
    return;
  }

  const btn = document.querySelector('#modal-body button.btn-primary');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="ti ti-loader spin"></i> Salvando...'; }

  const observacoes = isPJ
    ? `Rep: ${document.getElementById('pj-rep-nome').value} | CPF Rep: ${document.getElementById('pj-rep-cpf').value}`
    : `RG: ${document.getElementById('pf-rg').value} | Nasc: ${document.getElementById('pf-nasc').value}`;

  const payload = {
    tipo_pessoa: isPJ ? 'pj' : 'pf',
    nome_cliente: isPJ ? document.getElementById('pj-razao').value.trim() : document.getElementById('pf-nome').value.trim(),
    cpf_cnpj: isPJ ? document.getElementById('cnpj-inp').value.trim() : document.getElementById('pf-cpf').value.trim(),
    email_cliente: document.getElementById('cont-email').value.trim(),
    telefone: document.getElementById('cont-whats').value.trim(),
    uc: document.getElementById('uc-inp').value.trim(),
    concessionaria: document.getElementById('conc-sel').value.trim(),
    cep: document.getElementById('cep-inp').value.trim(),
    logradouro: document.getElementById('addr-logr').value.trim(),
    numero: document.getElementById('addr-num').value.trim(),
    cidade: document.getElementById('addr-cidade').value.trim(),
    estado: document.getElementById('addr-estado').value.trim(),
    observacoes,
  };

  try {
    const resp = await fetch('/api/processos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Erro ao salvar cadastro');
    sessionProtocolo = data.protocolo;
    sessionProcessoId = data.id;
  } catch (err) {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="ti ti-arrow-right"></i> Avançar para documentos'; }
    alert('Não foi possível salvar o cadastro: ' + err.message);
    return;
  }

  go('screen-docs');
}

// ── TELA: Documentos ─────────────────────────────────────────────────────────
let uploadedDocs = {};
let totalUploaded = 0;
let sessionProtocolo = '';
let sessionProcessoId = '';

function screenDocs() {
  uploadedDocs = {}; totalUploaded = 0;
  return `
  <div class="step-bar"><div class="sdot done"></div><div class="sdot done"></div><div class="sdot active"></div><div class="sdot"></div><span class="slbl">Documentação</span></div>
  <h2 class="app-h2">Documentos do Processo</h2>
  <p class="app-sub">Reúna os documentos abaixo para iniciar a homologação.</p>

  <!-- QUADRO PADRÃO -->
  <div style="background:#fff3cd;border:2px solid #ffc107;border-radius:10px;padding:1rem 1.1rem;margin-bottom:1rem">
    <div style="font-size:13px;font-weight:700;color:#856404;margin-bottom:.6rem;display:flex;align-items:flex-start;gap:8px">
      <span style="font-size:18px;flex-shrink:0">⚠️</span>
      <span>Requisitos do Quadro Padrão — <strong>Responsabilidade Exclusiva do Proprietário</strong></span>
    </div>
    <p style="font-size:12px;color:#664d03;margin-bottom:.75rem;line-height:1.6">Antes da visita técnica, o proprietário do imóvel deve verificar e adequar o quadro padrão nos seguintes itens:</p>
    <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:.75rem">
      <div style="background:rgba(255,255,255,.6);border-radius:7px;padding:.55rem .8rem;font-size:12px;color:#3d2d00;line-height:1.55">
        <strong>DPS — Dispositivo de Proteção contra Surtos:</strong> proteção obrigatória contra raios e variações da rede elétrica.
      </div>
      <div style="background:rgba(255,255,255,.6);border-radius:7px;padding:.55rem .8rem;font-size:12px;color:#3d2d00;line-height:1.55">
        <strong>Bitola do Cabeamento:</strong> deve estar adequada à potência do sistema solar instalado.
      </div>
      <div style="background:rgba(255,255,255,.6);border-radius:7px;padding:.55rem .8rem;font-size:12px;color:#3d2d00;line-height:1.55">
        <strong>Dispositivo de Proteção:</strong> disjuntor ou fusível do ramal devidamente dimensionado para o sistema.
      </div>
      <div style="background:rgba(255,255,255,.6);border-radius:7px;padding:.55rem .8rem;font-size:12px;color:#3d2d00;line-height:1.55">
        <strong>Tipo de Ramal:</strong> informar à SolarHomolog se o ramal é aéreo ou subterrâneo.
      </div>
    </div>
    <div style="font-size:12px;font-weight:700;color:#842029;background:#f8d7da;border-radius:6px;padding:.5rem .75rem;line-height:1.55">
      ⚠️ Estes itens são de <strong>RESPONSABILIDADE EXCLUSIVA DO PROPRIETÁRIO DO IMÓVEL</strong>. A SolarHomolog não se responsabiliza por inadequações no quadro padrão que impeçam ou atrasem a homologação.
    </div>
  </div>

  <!-- 1. PROCURAÇÃO -->
  <div class="app-card">
    <div class="app-card-title"><i class="ti ti-file-text"></i> 1. Procuração</div>
    <p style="font-size:12px;color:#6b7280;margin-bottom:.75rem;line-height:1.6">Procuração autorizando a SolarHomolog (João Carlos Chaves Assessoria Ltda, CNPJ 48.979.472/0001-64) a realizar todos os atos necessários junto à concessionária para homologação do sistema fotovoltaico.</p>
    <a href="procuracao-modelo.html" target="_blank" class="btn btn-outline btn-sm" style="margin-bottom:.75rem;display:inline-flex">
      <i class="ti ti-download"></i> Baixar modelo
    </a>
    <label class="app-label" style="margin-top:.5rem">Procuração assinada (upload)</label>
    <div class="upload-area" id="ua-procuracao" onclick="document.getElementById('file-procuracao-doc').click()">
      <div class="upload-icon"><i class="ti ti-file-text"></i></div>
      <div class="upload-lbl">Clique para enviar a procuração assinada<br><span style="font-size:11px">PDF, JPG, PNG, DOC ou DOCX</span></div>
    </div>
    <input type="file" id="file-procuracao-doc" style="display:none" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onchange="doUploadNew('procuracao', this, 'ua-procuracao', 'st-procuracao')" />
    <div id="st-procuracao" style="display:none;font-size:12px;color:#2e7d32;margin-top:2px"><i class="ti ti-circle-check"></i> Arquivo enviado com sucesso</div>
  </div>

  <!-- 2. MEMORIAL DESCRITIVO -->
  <div class="app-card">
    <div class="app-card-title"><i class="ti ti-blueprint"></i> 2. Memorial Descritivo</div>
    <p style="font-size:12px;color:#6b7280;margin-bottom:.75rem;line-height:1.6">Baixe o modelo, preencha com os dados do sistema fotovoltaico e faça o upload do documento preenchido.</p>
    <a href="memorial-modelo.html" target="_blank" class="btn btn-outline btn-sm" style="margin-bottom:.75rem;display:inline-flex">
      <i class="ti ti-download"></i> Baixar modelo
    </a>
    <label class="app-label" style="margin-top:.5rem">Memorial descritivo preenchido (upload)</label>
    <div class="upload-area" id="ua-memorial" onclick="document.getElementById('file-memorial-doc').click()">
      <div class="upload-icon"><i class="ti ti-blueprint"></i></div>
      <div class="upload-lbl">Clique para enviar o memorial descritivo<br><span style="font-size:11px">PDF, JPG, PNG, DOC ou DOCX</span></div>
    </div>
    <input type="file" id="file-memorial-doc" style="display:none" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onchange="doUploadNew('memorial', this, 'ua-memorial', 'st-memorial')" />
    <div id="st-memorial" style="display:none;font-size:12px;color:#2e7d32;margin-top:2px"><i class="ti ti-circle-check"></i> Arquivo enviado com sucesso</div>
  </div>

  <!-- 3. DIAGRAMA UNIFILAR -->
  <div class="app-card" style="border-color:#c8e6c9;background:#f1f8e9">
    <div class="app-card-title" style="color:#2e7d32"><i class="ti ti-circuit-diode"></i> 3. Diagrama Unifilar</div>
    <div style="display:flex;align-items:flex-start;gap:10px;padding:.65rem .85rem;background:rgba(46,125,50,.08);border-radius:8px;font-size:13px;color:#1b5e20;line-height:1.6">
      <i class="ti ti-circle-check" style="font-size:20px;color:#2e7d32;flex-shrink:0;margin-top:1px"></i>
      <span>Este documento será providenciado pela SolarHomolog. <strong>Nenhuma ação necessária.</strong></span>
    </div>
  </div>

  <button class="btn btn-primary btn-block" style="margin-top:.25rem" onclick="go('screen-quote')">
    <i class="ti ti-arrow-right"></i> Avançar para proposta
  </button>`;
}

async function doUploadNew(id, input, areaId, statusId) {
  const file = input.files[0];
  if (!file) return;

  const area = document.getElementById(areaId);
  const st   = document.getElementById(statusId);

  if (area) area.style.opacity = '.6';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('protocolo', sessionProtocolo);
  formData.append('tipo_doc', id);

  try {
    const resp = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await resp.json();
    if (!resp.ok || !data.ok) throw new Error(data.error || 'Erro no servidor');

    if (!uploadedDocs[id]) { uploadedDocs[id] = true; totalUploaded++; }
    if (area) {
      area.style.opacity = '';
      area.classList.add('uploaded');
      const icon = area.querySelector('.upload-icon i');
      const lbl  = area.querySelector('.upload-lbl');
      if (icon) icon.className = 'ti ti-circle-check';
      if (lbl)  lbl.innerHTML = '<strong>' + file.name + '</strong>';
    }
    if (st) st.style.display = 'block';
  } catch (err) {
    if (area) area.style.opacity = '';
    alert('Falha no upload: ' + err.message);
  } finally {
    input.value = '';
  }
}


// ── TELA: Proposta ───────────────────────────────────────────────────────────
function screenQuote() {
  return `
  <div class="step-bar"><div class="sdot done"></div><div class="sdot done"></div><div class="sdot done"></div><div class="sdot active"></div><span class="slbl">Proposta</span></div>
  <h2 class="app-h2">Proposta de serviço</h2>
  <p class="app-sub">Calculamos o valor com base na conta de energia.</p>
  <div class="app-card">
    <div class="app-card-title"><i class="ti ti-calculator"></i>Calculadora</div>
    <label class="app-label">Consumo médio mensal (kWh)</label>
    <input type="number" id="cons-inp" class="app-input" value="450" min="0" step="10" oninput="calcPrice()" />
    <label class="app-label">ou potência do sistema (kW)</label>
    <input type="number" id="kw-inp" class="app-input" value="8.2" min="0" step="0.1" oninput="calcPriceKw()" />
  </div>
  <div class="price-display">
    <div class="pd-label">Valor total do serviço</div>
    <div class="pd-value" id="price-disp">R$ 656,00</div>
    <div class="pd-detail" id="price-det">8,2 kW × R$ 80,00/kW (base: R$ 800/10kW)</div>
  </div>
  <div class="app-card">
    <div class="app-card-title"><i class="ti ti-list-check"></i>O que está incluído</div>
    ${['Protocolo junto à concessionária','Acompanhamento até aprovação','Revisão completa de documentação','Comunicação com a concessionária','Notificações WhatsApp + e-mail'].map(i=>`<div class="info-row"><span class="info-key">${i}</span><span class="badge badge-green">Incluso</span></div>`).join('')}
  </div>
  <button class="btn btn-solar btn-block" style="margin-bottom:10px" onclick="go('screen-payment')">
    <i class="ti ti-credit-card"></i> Aceitar proposta e pagar
  </button>
  <button class="btn btn-block" onclick="go('screen-docs')"><i class="ti ti-arrow-left"></i> Voltar</button>`;
}

function calcPrice() {
  const c = parseFloat(document.getElementById('cons-inp').value)||0;
  const kw = c/100;
  document.getElementById('kw-inp').value = kw.toFixed(1);
  updatePrice(kw);
}
function calcPriceKw() {
  const kw = parseFloat(document.getElementById('kw-inp').value)||0;
  document.getElementById('cons-inp').value = (kw*100).toFixed(0);
  updatePrice(kw);
}
function updatePrice(kw) {
  const total = kw * 80;
  document.getElementById('price-disp').textContent = 'R$ ' + total.toLocaleString('pt-BR',{minimumFractionDigits:2});
  document.getElementById('price-det').textContent = kw.toFixed(1)+' kW × R$ 80,00/kW (base: R$ 800/10kW)';
}

// ── TELA: Pagamento ──────────────────────────────────────────────────────────
function screenPayment() {
  return `
  <h2 class="app-h2">Pagamento</h2>
  <p class="app-sub">Escolha a forma de pagamento para iniciar a homologação.</p>
  <div class="app-card" style="border-color:#f5a623">
    <div class="app-card-title">Resumo</div>
    <div class="info-row"><span class="info-key">Serviço</span><span>Homologação solar</span></div>
    <div class="info-row"><span class="info-key"><strong>Total</strong></span><span style="color:#1a3a2a;font-size:16px;font-weight:600">R$ 656,00</span></div>
  </div>
  <div class="tabs">
    <button class="tab active" id="ptab-pix" onclick="switchPayTab('pix')">PIX</button>
    <button class="tab" id="ptab-card" onclick="switchPayTab('card')">Cartão</button>
    <button class="tab" id="ptab-boleto" onclick="switchPayTab('boleto')">Boleto</button>
  </div>
  <div id="ppanel-pix" class="tab-panel active">
    <div class="app-card" style="text-align:center">
      <div style="width:140px;height:140px;background:#f3f4f6;border-radius:8px;margin:0 auto 1rem;display:flex;align-items:center;justify-content:center">
        <i class="ti ti-qrcode" style="font-size:72px;color:#9ca3af"></i>
      </div>
      <p style="font-size:12px;color:#6b7280">QR Code gerado no pagamento real</p>
      <button class="btn btn-sm" style="margin-top:10px"><i class="ti ti-copy"></i> Copiar chave PIX</button>
    </div>
  </div>
  <div id="ppanel-card" class="tab-panel">
    <div class="app-card">
      <label class="app-label">Número do cartão</label>
      <input type="text" class="app-input" placeholder="0000 0000 0000 0000" />
      <div class="app-row2">
        <div><label class="app-label">Validade</label><input type="text" class="app-input" placeholder="MM/AA" /></div>
        <div><label class="app-label">CVV</label><input type="text" class="app-input" placeholder="000" /></div>
      </div>
      <label class="app-label">Nome no cartão</label>
      <input type="text" class="app-input" />
      <label class="app-label">Parcelamento</label>
      <select class="app-select"><option>À vista</option><option>2x sem juros</option><option>3x sem juros</option></select>
    </div>
  </div>
  <div id="ppanel-boleto" class="tab-panel">
    <div class="app-card" style="text-align:center">
      <i class="ti ti-barcode" style="font-size:48px;color:#9ca3af"></i>
      <p style="font-size:12px;color:#6b7280;margin-top:10px">Vence em 3 dias úteis. Processo inicia após confirmação.</p>
      <button class="btn btn-sm" style="margin-top:10px"><i class="ti ti-download"></i> Gerar boleto</button>
    </div>
  </div>
  <button class="btn btn-primary btn-block" style="margin-top:1rem" onclick="go('screen-tracking')">
    <i class="ti ti-check"></i> Confirmar pagamento
  </button>`;
}

// ── TELA: Acompanhamento ─────────────────────────────────────────────────────
function screenTracking() {
  return `
  <h2 class="app-h2">Acompanhar processo</h2>
  <p class="app-sub">Protocolo <strong>#SH-2025-0842</strong> · <span class="badge badge-amber">Em andamento</span></p>
  <div class="app-card">
    <div class="app-card-title"><i class="ti ti-progress"></i>Etapas do processo</div>
    <div class="progress-steps">
      ${[
        {done:true, title:'Documentação recebida', sub:'12/06/2025 — 6 documentos aprovados'},
        {done:true, title:'Pagamento confirmado', sub:'12/06/2025 — R$ 656,00 via PIX'},
        {done:true, title:'Processo protocolado', sub:'13/06/2025 — Protocolo ENEL: 2025061300482'},
        {active:true, title:'Análise pela concessionária', sub:'Em análise — prazo: 18/06/2025'},
        {title:'Aprovação e parecer', sub:'Aguardando'},
        {title:'Vistoria (se necessária)', sub:'Aguardando'},
        {title:'Homologação concluída', sub:'Aguardando'},
      ].map(s=>`<div class="ps-item${s.done?' done':s.active?' active':''}">
        <div class="ps-circle">${s.done?'<i class="ti ti-check" style="font-size:8px"></i>':s.active?'•':''}</div>
        <div class="ps-title">${s.title}</div>
        <div class="ps-sub">${s.sub}</div>
      </div>`).join('')}
    </div>
  </div>
  <div class="app-card">
    <div class="app-card-title"><i class="ti ti-bell"></i>Notificações</div>
    <div class="info-row"><span class="info-key">WhatsApp</span><span class="badge badge-green">Ativo</span></div>
    <div class="info-row"><span class="info-key">E-mail</span><span class="badge badge-green">Ativo</span></div>
  </div>
  <button class="btn btn-primary btn-block" onclick="go('screen-welcome')"><i class="ti ti-home"></i> Voltar ao início</button>`;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function switchTab(t) {
  ['pj','pf'].forEach(x => {
    document.getElementById('tab-'+x)?.classList.toggle('active', x===t);
    document.getElementById('tabpanel-'+x)?.classList.toggle('active', x===t);
  });
}
function switchPayTab(t) {
  ['pix','card','boleto'].forEach(x => {
    document.getElementById('ptab-'+x)?.classList.toggle('active', x===t);
    document.getElementById('ppanel-'+x)?.classList.toggle('active', x===t);
  });
}
function maskCNPJ(el) {
  let v = el.value.replace(/\D/g,'').slice(0,14);
  v = v.replace(/^(\d{2})(\d)/,'$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3')
       .replace(/\.(\d{3})(\d)/,'.$1/$2').replace(/(\d{4})(\d)/,'$1-$2');
  el.value = v;
}
function maskCPF(el) {
  let v = el.value.replace(/\D/g,'').slice(0, 11);
  v = v.replace(/^(\d{3})(\d)/, '$1.$2')
       .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
       .replace(/\.(\d{3})(\d)/, '.$1-$2');
  el.value = v;
}
function maskUC(el) {
  el.value = el.value.replace(/\D/g, '').slice(0, 15);
}
function maskCEP(el) {
  let v = el.value.replace(/\D/g, '').slice(0, 8);
  if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
  el.value = v;
  if (v.replace('-', '').length === 8) buscarCEP(v.replace('-', ''));
}
async function buscarCEP(cep) {
  try {
    const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!r.ok) return;
    const d = await r.json();
    if (d.erro) return;
    const logr = document.getElementById('addr-logr');
    const cidade = document.getElementById('addr-cidade');
    const estado = document.getElementById('addr-estado');
    if (logr && d.logradouro) logr.value = d.logradouro;
    if (cidade && d.localidade) cidade.value = d.localidade;
    if (estado && d.uf) estado.value = d.uf;
    document.getElementById('addr-num')?.focus();
  } catch { /* ignora erro de rede */ }
}
function bindScreen(id) {
  // re-bind de eventos dinâmicos se necessário
}

// ── Teclado: ESC fecha o modal ───────────────────────────────────────────────
document.addEventListener('keydown', e => { 
  if (e.key === 'Escape') closeApp(); 
});

// ── Inicialização e Event Listeners ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  console.log('SolarHomolog app initialized');

  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeApp(); });
  }

  // Detecta callback de OAuth (Google, implicit flow) ou magic link (e-mail)
  const hash = window.location.hash;
  const params = new URLSearchParams(window.location.search);

  // Verifica erro OAuth retornado pela Supabase/provider no hash
  if (hash.includes('error=') || hash.includes('error_code=')) {
    const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
    const errDesc = hashParams.get('error_description') || hashParams.get('error') || 'Erro no login';
    history.replaceState(null, '', window.location.pathname);
    console.error('[Auth callback error]', errDesc);
    alert('Erro ao fazer login: ' + decodeURIComponent(errDesc.replace(/\+/g, ' ')));
  } else {
    const isAuthCallback = hash.includes('access_token') || params.has('code');

    if (isAuthCallback) {
      try {
        const client = await initSupabase();
        if (client) {
          const { data: { session } } = await client.auth.getSession();
          if (session) {
            history.replaceState(null, '', window.location.pathname);
            openApp('screen-company');
          }
        }
      } catch (e) {
        console.error('Auth callback error:', e);
      }
    }
  }
});

  