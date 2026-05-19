/* ============================================================
   COUNTER-CLIENT.JS — Cliente compartilhado de contadores
   ============================================================
   Usado pela pagina de prompts (cópias) e de downloads.

   Como usar no HTML:
   - Adicione no elemento que mostra o número:
     <span class="counter-value" data-counter-id="meu-id">0</span>
   - Pra incrementar via JS:
     window.incrementCounter('meu-id');
   - O endpoint counter.php precisa estar acessível no mesmo
     diretório.
   ============================================================ */

(function () {
  const ENDPOINT = 'counter.php';

  async function loadCounters() {
    try {
      const res = await fetch(ENDPOINT, { method: 'GET' });
      if (!res.ok) return;
      const data = await res.json();
      if (data && typeof data === 'object') {
        Object.keys(data).forEach(id => updateDisplay(id, data[id], false));
      }
    } catch (err) {
      // Falha silenciosa — contador é não-crítico
    }
  }

  async function incrementCounter(id) {
    if (!id) return;
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data && typeof data.count === 'number') {
        updateDisplay(id, data.count, true);
      }
    } catch (err) {
      // Falha silenciosa
    }
  }

  function updateDisplay(id, valor, animar) {
    document.querySelectorAll(`.counter-value[data-counter-id="${id}"]`).forEach(el => {
      el.textContent = valor;
      if (animar) {
        el.classList.remove('bump');
        // Força reflow pra reiniciar a animação
        void el.offsetWidth;
        el.classList.add('bump');
      }
    });
  }

  // Expõe globalmente pra outros scripts chamarem
  window.incrementCounter = incrementCounter;
  window.loadCounters = loadCounters;

  // Carrega contagens automaticamente ao abrir a página
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCounters);
  } else {
    loadCounters();
  }
})();
