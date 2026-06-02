/* ============================================================
   DOWNLOADS.JS — Incrementa contador ao clicar em "Baixar PDF"
   ----
   Depende de counter-client.js (carregado antes deste arquivo),
   que expõe window.incrementCounter.

   Como funciona:
   - Procura por elementos com data-counter-id em links/botões
   - No clique, dispara o increment em background; o download
     continua normalmente (sem preventDefault).
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-counter-id]').forEach(el => {
    // Pula elementos que só mostram o número (não disparam ação)
    if (el.classList.contains('counter-value')) return;

    // Só ativa o increment em <a> ou <button> (gatilhos de download)
    const tag = el.tagName.toLowerCase();
    if (tag !== 'a' && tag !== 'button') return;

    el.addEventListener('click', () => {
      const id = el.dataset.counterId;
      if (id && typeof window.incrementCounter === 'function') {
        window.incrementCounter(id);
      }
    });
  });
});
