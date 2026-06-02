/* ============================================================
   SCRIPT.JS — Site Pessoal Gustavo Luiz
   Animações, interações e comportamentos do site
   ============================================================ */

/* ============================================================
   1. NAVEGAÇÃO — scroll + hamburguer
   ============================================================ */

const navbar   = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');

/* Adiciona classe 'scrolled' ao rolar a página */
function handleNavbarScroll() {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavbarScroll, { passive: true });

/* Menu mobile — abre/fecha */
function toggleMenu(open) {
  const isOpen = open !== undefined ? open : !navLinks.classList.contains('open');
  navLinks.classList.toggle('open', isOpen);
  navToggle.classList.toggle('active', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  /* Bloqueia scroll do body quando menu está aberto */
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

navToggle.addEventListener('click', () => toggleMenu());

/* Fecha o menu ao clicar em um link */
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    toggleMenu(false);
  });
});

/* Fecha o menu ao clicar fora */
document.addEventListener('click', (e) => {
  if (
    navLinks.classList.contains('open') &&
    !navLinks.contains(e.target) &&
    !navToggle.contains(e.target)
  ) {
    toggleMenu(false);
  }
});

/* Link ativo na navegação conforme seção visível */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

function updateActiveLink() {
  let currentSection = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) {
      currentSection = section.getAttribute('id');
    }
  });

  navAnchors.forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === `#${currentSection}`) {
      a.classList.add('active');
    }
  });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });

/* ============================================================
   2. INTERSECTION OBSERVER — animações de entrada
   ============================================================ */

/* Ativa a classe 'visible' quando o elemento entra na viewport */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        /* Para de observar após a primeira vez (animação apenas na entrada) */
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  }
);

/* Observa todos os elementos com a classe 'reveal' */
document.querySelectorAll('.reveal').forEach(el => {
  revealObserver.observe(el);
});

/* ============================================================
   3. PARTÍCULAS DECORATIVAS NO HERO
   ============================================================ */

function criarParticulas() {
  const container = document.querySelector('.hero-particles');
  if (!container) return;

  /* Verifica preferência por movimento reduzido */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const qtd = 18;

  for (let i = 0; i < qtd; i++) {
    const p = document.createElement('div');
    p.classList.add('hero-particle');

    /* Posição aleatória */
    p.style.left   = `${Math.random() * 100}%`;
    p.style.top    = `${Math.random() * 100}%`;

    /* Tamanho variado */
    const tamanho = Math.random() * 3 + 1;
    p.style.width  = `${tamanho}px`;
    p.style.height = `${tamanho}px`;

    /* Atraso e duração aleatórios */
    p.style.animationDelay    = `${Math.random() * 4}s`;
    p.style.animationDuration = `${Math.random() * 3 + 3}s`;

    /* Opacidade variada */
    p.style.opacity = String(Math.random() * 0.4 + 0.1);

    container.appendChild(p);
  }
}

criarParticulas();

/* ============================================================
   4. CONTADORES ANIMADOS (números de impacto)
   ============================================================ */

/* Anima um número de 0 até o valor final */
function animarContador(elemento, valorFinal, duracao = 1400, prefixo = '', sufixo = '') {
  const inicio = performance.now();
  const ehDecimal = valorFinal % 1 !== 0;

  function atualizar(agora) {
    const progresso = Math.min((agora - inicio) / duracao, 1);

    /* Easing easeOutExpo */
    const eased = progresso === 1
      ? 1
      : 1 - Math.pow(2, -10 * progresso);

    const valor = eased * valorFinal;

    elemento.textContent = prefixo + (ehDecimal
      ? valor.toFixed(1)
      : Math.floor(valor).toLocaleString('pt-BR')) + sufixo;

    if (progresso < 1) {
      requestAnimationFrame(atualizar);
    }
  }

  requestAnimationFrame(atualizar);
}

/* Configura os contadores da seção "Sobre" */
function configurarContadores() {
  const contadores = [
    { seletor: '.metrica-valor',  valores: ['R$100B+', '15 mil+', '12+'] }
  ];

  /* Usa o observer para disparar quando entrar na viewport */
  const metricaItems = document.querySelectorAll('.metrica-item');
  const valores = [100, 15, 12];
  const prefixos = ['R$', '', ''];
  const sufixos = ['B+', ' mil+', '+'];

  const contadorObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          const valorEl = entry.target.querySelector('.metrica-valor');
          if (!valorEl) return;

          /* Pega o index dentro de todos os itens */
          const index = Array.from(metricaItems).indexOf(entry.target);
          if (index < 0) return;

          animarContador(valorEl, valores[index], 1400, prefixos[index], sufixos[index]);
          contadorObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  metricaItems.forEach(item => contadorObserver.observe(item));
}

configurarContadores();

/* ============================================================
   5. FORMULÁRIO DE CONTATO — Formspree
   ============================================================ */

const form       = document.getElementById('contato-form');
const formCampos = document.getElementById('form-campos');
const formSucesso = document.getElementById('form-sucesso');
const btnNovo    = document.getElementById('form-novo');

/* Regras de validação por campo */
const regras = {
  nome:     { min: 2,  msg: 'Por favor, informe seu nome (mínimo 2 caracteres).' },
  email:    { regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, msg: 'Informe um email válido.' },
  assunto:  { min: 3,  msg: 'Por favor, informe o assunto.' },
  mensagem: { min: 10, msg: 'A mensagem precisa ter pelo menos 10 caracteres.' }
};

/* Valida um único campo e exibe/limpa a mensagem de erro inline */
function validarCampo(campo) {
  const id    = campo.id;
  const valor = campo.value.trim();
  const regra = regras[id];
  const erroEl = document.getElementById(`erro-${id}`);

  if (!regra) return true;

  let mensagemErro = '';

  if (!valor) {
    mensagemErro = 'Este campo é obrigatório.';
  } else if (regra.min && valor.length < regra.min) {
    mensagemErro = regra.msg;
  } else if (regra.regex && !regra.regex.test(valor)) {
    mensagemErro = regra.msg;
  }

  campo.classList.toggle('error', !!mensagemErro);
  if (erroEl) erroEl.textContent = mensagemErro;

  return !mensagemErro;
}

if (form) {
  /* Validação em tempo real ao sair de cada campo */
  form.querySelectorAll('input[required], textarea[required]').forEach(campo => {
    campo.addEventListener('blur', () => validarCampo(campo));
    campo.addEventListener('input', () => {
      /* Limpa o erro imediatamente ao digitar após erro */
      if (campo.classList.contains('error')) validarCampo(campo);
    });
  });

  /* Envio do formulário via fetch para o Formspree */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    /* Valida todos os campos antes de enviar */
    const campos = form.querySelectorAll('input[required], textarea[required]');
    let valido = true;

    campos.forEach(campo => {
      if (!validarCampo(campo)) valido = false;
    });

    if (!valido) {
      /* Foca o primeiro campo com erro para acessibilidade */
      const primeiroErro = form.querySelector('.error');
      if (primeiroErro) primeiroErro.focus();
      return;
    }

    /* Estado de carregamento no botão */
    const btnEnviar = document.getElementById('btn-enviar');
    const textoOriginal = btnEnviar.innerHTML;
    btnEnviar.disabled = true;
    btnEnviar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

    try {
      /* Envia os dados para o Formspree via fetch (sem redirecionamento) */
      const resposta = await fetch(form.action, {
        method:  'POST',
        headers: { 'Accept': 'application/json' },
        body:    new FormData(form)
      });

      if (resposta.ok) {
        /* Sucesso — exibe tela de confirmação e oculta os campos */
        formCampos.hidden = true;
        formSucesso.hidden = false;
        form.reset();
      } else {
        /* Erro da API — tenta extrair mensagem do Formspree */
        const dados = await resposta.json().catch(() => ({}));
        const msg = (dados.errors || []).map(err => err.message).join(', ') ||
                    'Erro ao enviar. Tente novamente ou envie direto para gu.ufabc@gmail.com';
        alert(msg);
        btnEnviar.disabled = false;
        btnEnviar.innerHTML = textoOriginal;
      }
    } catch (_) {
      /* Erro de rede */
      alert('Sem conexão. Verifique sua internet e tente novamente.');
      btnEnviar.disabled = false;
      btnEnviar.innerHTML = textoOriginal;
    }
  });

  /* Botão "Enviar outra mensagem" — reseta a tela de sucesso */
  if (btnNovo) {
    btnNovo.addEventListener('click', () => {
      formSucesso.hidden = true;
      formCampos.hidden  = false;
      /* Foca o primeiro campo para UX */
      const primeiro = form.querySelector('input');
      if (primeiro) primeiro.focus();
    });
  }
}

/* ============================================================
   6. SCROLL SUAVE para links âncora
   ============================================================ */

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href === '#') return;

    const alvo = document.querySelector(href);
    if (!alvo) return;

    e.preventDefault();

    /* Offset para compensar a navbar fixa */
    const offsetNavbar = 72;
    const posicao = alvo.getBoundingClientRect().top + window.scrollY - offsetNavbar;

    window.scrollTo({
      top: posicao,
      behavior: 'smooth'
    });
  });
});

/* ============================================================
   7. NEWSLETTER — formulário de email rápido
   ============================================================ */

const nlForm  = document.getElementById('newsletter-form');
const nlErro  = document.getElementById('nl-erro');
const nlInput = document.getElementById('nl-email');

if (nlForm && nlInput) {
  nlForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = nlInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    /* Limpa estado de erro anterior */
    nlInput.classList.remove('error');
    nlErro.textContent = '';

    /* Valida email */
    if (!email) {
      nlInput.classList.add('error');
      nlErro.textContent = 'Por favor, informe seu email.';
      nlInput.focus();
      return;
    }

    if (!emailRegex.test(email)) {
      nlInput.classList.add('error');
      nlErro.textContent = 'Informe um email válido.';
      nlInput.focus();
      return;
    }

    /* Redireciona para o Substack com o email pré-preenchido */
    const urlSubstack = `https://gustluiz.substack.com/?email=${encodeURIComponent(email)}`;
    window.open(urlSubstack, '_blank', 'noopener,noreferrer');
  });

  /* Remove erro ao digitar */
  nlInput.addEventListener('input', () => {
    nlInput.classList.remove('error');
    nlErro.textContent = '';
  });
}

/* ============================================================
   8. TOOLTIP — hover nos cards de IA (resultado numérico)
   ============================================================ */

/* Destaca o resultado ao passar o mouse no card */
document.querySelectorAll('.ia-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    const resultados = card.querySelectorAll('.resultado-depois');
    resultados.forEach(r => {
      r.style.transform = 'scale(1.05)';
      r.style.transition = 'transform 0.2s ease';
    });
  });

  card.addEventListener('mouseleave', () => {
    const resultados = card.querySelectorAll('.resultado-depois');
    resultados.forEach(r => {
      r.style.transform = 'scale(1)';
    });
  });
});

/* ============================================================
   8. CURSOR TRAIL SUTIL no hero (efeito visual opcional)
   ============================================================ */

const hero = document.querySelector('.hero');

if (hero) {
  hero.addEventListener('mousemove', (e) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    /* Move o gradiente de fundo sutilmente conforme o cursor */
    const rect   = hero.getBoundingClientRect();
    const x      = ((e.clientX - rect.left) / rect.width)  * 100;
    const y      = ((e.clientY - rect.top)  / rect.height) * 100;

    const bgGradient = hero.querySelector('.hero-bg-gradient');
    if (bgGradient) {
      bgGradient.style.background =
        `radial-gradient(ellipse 80% 60% at ${x}% ${y - 20}%,
          rgba(99, 102, 241, 0.18) 0%,
          rgba(10, 10, 10, 0) 70%)`;
    }
  });
}

/* ============================================================
   9. INICIALIZAÇÃO
   ============================================================ */

/* Chama verificações iniciais ao carregar */
document.addEventListener('DOMContentLoaded', () => {
  handleNavbarScroll();
  updateActiveLink();
});
