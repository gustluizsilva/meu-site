# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O projeto em uma linha

Site pessoal + portfólio do Gustavo Luiz (PM em transição pra AI Product Builder) hospedado no HostGator em `https://www.gustluiz.com.br`. Estático (HTML/CSS/JS) com um único endpoint PHP pra contadores. Comentários e nomes de classe sempre em **português**.

## Sem build, sem deps locais

- Não há `npm install`, build step, lint ou test suite. Edita arquivo → push → o site atualiza.
- Pra testar local, abre o arquivo no navegador (`open index.html`). O contador só funciona ao vivo (precisa do PHP no servidor).
- Pra validar rapidamente ao vivo após push:
  - `curl -s -o /dev/null -w "%{http_code}\n" https://www.gustluiz.com.br/<arquivo>` — checa se subiu
  - `curl -s https://www.gustluiz.com.br/counter.php` — JSON com todas contagens atuais
- Verificação visual end-to-end: usar Playwright MCP (`mcp__playwright__browser_navigate` + screenshot).

## Deploy automático

`.github/workflows/deploy.yml` dispara em `push` na `main` (ou manual via `gh workflow run deploy.yml`). Faz FTP-sync do repo pra `/home2/engen736/public_html/gustluiz.com.br/` no HostGator.

**Acompanhar:** `gh run watch <run-id> --repo gustluizsilva/meu-site --exit-status`

### Arquivos NUNCA enviados pelo deploy (exclude no workflow)

Estes são gerados/gerenciados no servidor — sobrescrever quebraria o site:

- `**/.htaccess` — config do Apache pra esse domínio, inclui o handler PHP. **Foi editado manualmente uma vez** pra remover diretivas que desabilitavam PHP (`RemoveHandler .php`, `Options -ExecCGI`). Não tentar re-adicionar.
- `**/counters.json` — dados de contagens persistentes
- `**/.well-known/**` — verificação SSL Let's Encrypt
- `**/CLAUDE.md`, `.github/`, `.claude/`, `Substack/` — arquivos internos do repo

### Setup HostGator (uma vez, já feito)

Pra futuras dúvidas / debug:

- FTP user `github-deploy@gustluiz.com.br` jailed em `public_html/gustluiz.com.br/` (NÃO em `/home2/engen736/gustluiz.com.br/`, que existe mas não serve URL nenhuma — engano comum)
- `FTP_SERVER_DIR` no GitHub Secrets = `/` (relativo à jail)
- MultiPHP Manager: `gustluiz.com.br` setado explicitamente em **PHP 8.3** (não "Inherited"). Inherited não escreve o handler no Apache config.

## Sistema de contadores

Conta cópias de prompts e downloads de PDFs.

```
counter.php          ← endpoint GET (lê) e POST (incrementa) com flock pra atomicidade
counters.json        ← persistência { "id-1": N, "id-2": M, ... }
counter-client.js    ← cliente JS: auto-load no DOMContentLoaded + window.incrementCounter(id)
prompts.js           ← chama window.incrementCounter ao copiar prompt
downloads.js         ← chama window.incrementCounter ao clicar em qualquer <a>/<button data-counter-id>
```

**Pra adicionar contador em algo novo:**

1. No HTML, no display: `<span class="counter-value" data-counter-id="meu-id">0</span>`
2. No gatilho (link ou botão): `data-counter-id="meu-id"`
3. Garantir que a página carrega `counter-client.js` (e `downloads.js` se for um gatilho de download)
4. `id` aceito pelo PHP: regex `^[a-zA-Z0-9_-]+$`, máx 80 chars

A animação "bump" no número vem da classe `.counter-value.bump` (definida em `prompts.css` e `downloads.css`).

## Padrões de conteúdo

Três tipos de conteúdo, cada um com seu padrão:

### Projetos (`projeto-*.html` + `projeto-detalhe.css`)
5 páginas hoje. Cada projeto = 1 HTML com hero + métricas + blocos de "Desafio/Solução/Como funcionou/Aprendizados" + stack + CTAs. Cards do `index.html` na seção IA linkam pra elas.

### Materiais / Downloads (`downloads.html` + `download-<slug>.html` + `downloads.css` + `downloads.js`)
- `downloads.html` = galeria; cards usam ícone PDF (não imagem) + badge categoria + contador no rodapé
- `download-<slug>.html` = página de detalhe com botão grande de download + contador "N pessoas já baixaram" + CTA Substack
- PDFs ficam em `downloads/<arquivo>.pdf`
- `data-counter-id` no `<a download>` dispara o increment

### Prompts (`prompts.html` + `prompts.css` + `prompts.js`)
Galeria única com filtro por categoria (chips). Cada prompt = um `<article class="prompt-card">` com:
- Header (categoria + modelo + título + descrição)
- Bloco "Como usar" (lista `<ol>` de 3-6 passos)
- Pills com variáveis a preencher
- `<pre><code id="prompt-X">` com o prompt
- Footer com contador + botão Copiar

**Adicionar prompt novo:** duplicar `<article>`, ajustar `data-category`, id do `<code>`, `data-target` do botão, `data-counter-id` em dois lugares (counter display e botão). Se categoria inédita, descomentar o chip correspondente em `.prompts-filters` (5 categorias já listadas: discovery, escrita, analise, codigo, produtividade).

## Navegação global

Todas as páginas têm a mesma navbar com 9 itens fixos: `Sobre · IA · Newsletter · Downloads · Prompts · Experiência · Formação · Canais · Contato`. **Ao adicionar uma página nova que precisa do menu**, copiar a `<nav class="navbar">` de uma página existente — não esquecer de marcar `class="active"` no link da página corrente (estilo definido em `prompts.css` e `downloads.css`).

## Identidade visual (tokens em `:root` de `style.css`)

- Fundo: `#0A0A0A` (primary), `#111111`/`#1A1A1A` (cards)
- Accent: `#6366F1` (índigo) — usado pra CTA, badges, bordas ativas
- Texto: `#F5F5F5` (primary), `#A3A3A3` (secondary), `#525252` (muted)
- Bordas: `#2A2A2A`
- Fontes: **Plus Jakarta Sans** (headings) + **Inter** (body), via Google Fonts
- Ícones: **Font Awesome 6.5.1** via CDN
- Componentes: glass-card (borda sutil + leve transparência), gradient-accent (CTA), gradient-hero (radial roxo no topo de cada hero)

Não inventar cor nova nem trocar fonte sem pedido explícito.

## Tom de voz pra conteúdo do site

- Direto e confiante, **sem ser arrogante**
- Números concretos em destaque ("R$100B+", "85%", "–7 min", "100 prompts")
- Linguagem acessível — não muito técnica, não muito corporativa
- Transmite: **credibilidade + curiosidade + inovação**
- Posicionamento: Product Manager → AI Product Builder (12+ anos em produtos financeiros, agora aprendendo IA aplicada a produto)

## Contato do Gustavo (pra referência em conteúdo)

- LinkedIn: https://www.linkedin.com/in/gustavoluizsilva/
- Newsletter Substack: https://gustluiz.substack.com/
- Email: gu.ufabc@gmail.com
