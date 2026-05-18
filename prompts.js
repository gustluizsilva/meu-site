/* ============================================================
   PROMPTS.JS — Copy-to-clipboard + Filtro + Contador de cópias
   ============================================================ */

const COUNTER_ENDPOINT = 'counter.php';

document.addEventListener('DOMContentLoaded', () => {

  // ---------- Carregar contagens iniciais ----------
  carregarContagens();

  // ---------- Copiar prompt ----------
  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetId = btn.dataset.target;
      const codeEl = document.getElementById(targetId);
      if (!codeEl) return;

      const codeText = codeEl.innerText;

      const sucesso = await copiarParaClipboard(codeText, codeEl);
      if (sucesso) {
        mostrarFeedbackCopia(btn);
        // Incrementa contador no servidor (e atualiza UI)
        const counterId = btn.dataset.counterId;
        if (counterId) incrementarContador(counterId);
      }
    });
  });

  // ---------- Filtro por categoria ----------
  const chips = document.querySelectorAll('.filter-chip');
  const cards = document.querySelectorAll('.prompt-card');
  const emptyState = document.querySelector('.prompts-empty');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const category = chip.dataset.category;
      let visibleCount = 0;

      cards.forEach(card => {
        const matches = category === 'all' || card.dataset.category === category;
        card.style.display = matches ? '' : 'none';
        if (matches) visibleCount++;
      });

      if (emptyState) {
        emptyState.classList.toggle('show', visibleCount === 0);
      }
    });
  });

});

// ============================================================
// Funções auxiliares
// ============================================================

async function copiarParaClipboard(texto, codeEl) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch (err) {
    // Fallback pra navegadores antigos
    try {
      const range = document.createRange();
      range.selectNode(codeEl);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      const ok = document.execCommand('copy');
      sel.removeAllRanges();
      return ok;
    } catch (err2) {
      console.error('Não foi possível copiar:', err2);
      return false;
    }
  }
}

function mostrarFeedbackCopia(btn) {
  const icon = btn.querySelector('i');
  const label = btn.querySelector('span');
  if (!icon || !label) return;

  const originalIconClass = icon.className;
  const originalLabel = label.textContent;

  icon.className = 'fa-solid fa-check';
  label.textContent = 'Copiado!';
  btn.classList.add('copied');

  setTimeout(() => {
    icon.className = originalIconClass;
    label.textContent = originalLabel;
    btn.classList.remove('copied');
  }, 2000);
}

async function carregarContagens() {
  try {
    const res = await fetch(COUNTER_ENDPOINT, { method: 'GET' });
    if (!res.ok) return;
    const data = await res.json();
    if (data && typeof data === 'object') {
      Object.keys(data).forEach(id => {
        atualizarDisplayContador(id, data[id], false);
      });
    }
  } catch (err) {
    // Falha silenciosa — contador é não-crítico, página segue funcionando
  }
}

async function incrementarContador(id) {
  try {
    const res = await fetch(COUNTER_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data && typeof data.count === 'number') {
      atualizarDisplayContador(id, data.count, true);
    }
  } catch (err) {
    // Falha silenciosa
  }
}

function atualizarDisplayContador(id, valor, animar) {
  const el = document.querySelector(`.counter-value[data-counter-id="${id}"]`);
  if (!el) return;
  el.textContent = valor;
  if (animar) {
    el.classList.remove('bump');
    // Força reflow pra reiniciar a animação
    void el.offsetWidth;
    el.classList.add('bump');
  }
}
