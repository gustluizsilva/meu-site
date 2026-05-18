/* ============================================================
   PROMPTS.JS — Copy-to-clipboard + Filtro por categoria
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---------- Copiar prompt ----------
  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetId = btn.dataset.target;
      const codeEl = document.getElementById(targetId);
      if (!codeEl) return;

      const codeText = codeEl.innerText;

      try {
        await navigator.clipboard.writeText(codeText);
        showCopyFeedback(btn);
      } catch (err) {
        // Fallback pra navegadores antigos que não suportam Clipboard API
        const range = document.createRange();
        range.selectNode(codeEl);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        try {
          document.execCommand('copy');
          showCopyFeedback(btn);
        } catch (err2) {
          console.error('Não foi possível copiar:', err2);
        }
        sel.removeAllRanges();
      }
    });
  });

  function showCopyFeedback(btn) {
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
