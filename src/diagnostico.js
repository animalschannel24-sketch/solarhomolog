
/* ============================================
   SOLARHOMOLOG — DIAGNOSTICO.JS
   ============================================ */

window.renderDiagnostico = function(container) {
  container.innerHTML = buildDiagScreen();
};

function buildDiagScreen() {
  return `
  <div class="step-bar"><div class="sdot active"></div><div class="sdot"></div><div class="sdot"></div><span class="slbl">Verificar minha UC</span></div>
  <h2 class="app-h2">Diagnóstico de viabilidade</h2>
  <p class="app-sub">Envie os dados da sua UC para análise pela nossa equipe.</p>
  <div class="app-card">
    <div class="app-card-title"><i class="ti ti-file-invoice"></i>Envie a conta de luz</div>
    <div class="upload-area" id="diag-upload" onclick="document.getElementById('diag-file-inp').click()">
      <input type="file" id="diag-file-inp" style="display:none" accept=".pdf,.jpg,.jpeg,.png" onchange="diagFileSelected(this)" />
      <div class="upload-icon" id="du-icon"><i class="ti ti-cloud-upload"></i></div>
      <div class="upload-lbl" id="du-lbl">Toque para enviar a conta (PDF, foto ou imagem)</div>
    </div>
    <div id="du-prog" style="display:none"><div class="prog-bar"><div class="prog-fill" id="du-pf" style="width:0%"></div></div></div>
    <div id="conta-diag-msg" style="display:none;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:10px 14px;font-size:13px;color:#166534;margin-top:.75rem">
      <i class="ti ti-circle-check"></i> Conta de energia recebida com sucesso.
    </div>
  </div>
  <div class="app-card" id="diag-manual">
    <div class="app-card-title"><i class="ti ti-keyboard"></i>Ou preencha manualmente</div>
    <label class="app-label">Número da UC</label>
    <input type="text" id="d-uc" class="app-input" placeholder="Ex.: 7010482930" />
    <label class="app-label">Concessionária *</label>
    ${buildConcSelect('d-conc','— Selecione —')}
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
    <label class="app-label">Situação da UC</label>
    <select id="d-sit" class="app-select">
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
  <button class="btn btn-solar btn-block" onclick="enviarDadosDiag()">
    <i class="ti ti-send"></i> Enviar dados para análise
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
      lbl.textContent = file.name;
      pw.style.display = 'none';
      const msg = document.getElementById('conta-diag-msg');
      if (msg) msg.style.display = 'block';
    }
  }, 120);
}

function enviarDadosDiag() {
  const conc = document.getElementById('d-conc').value;
  if (!conc) { alert('Selecione a concessionária.'); return; }

  const body = document.getElementById('modal-body');
  body.innerHTML = `
    <div style="text-align:center;padding:3rem 1rem">
      <div style="font-size:52px;color:#1a3a2a;margin-bottom:1rem"><i class="ti ti-circle-check"></i></div>
      <h2 class="app-h2">Dados recebidos com sucesso!</h2>
      <p class="app-sub">Nossa equipe fará a análise de viabilidade da sua UC e entrará em contato em breve.</p>
      <button class="btn btn-block" style="margin-top:1.25rem" onclick="window.renderDiagnostico(document.getElementById('modal-body'))">
        <i class="ti ti-refresh"></i> Analisar outra UC
      </button>
      <button class="btn btn-primary btn-block" style="margin-top:.5rem" onclick="go('screen-login')">
        <i class="ti ti-arrow-right"></i> Iniciar homologação
      </button>
    </div>`;
}
