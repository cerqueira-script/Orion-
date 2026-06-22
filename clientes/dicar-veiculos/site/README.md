# Site Dicar Veículos — guia

Site institucional + vitrine de estoque + painel de gestão. Construído pela Orion.
Marca da Dicar (vermelho/preto/branco). **Sem mensalidade de licença** — feito sob medida.

## Como abrir (demo)

Abra o arquivo **`index.html`** no navegador (duplo clique). Funciona offline.

- **Site público:** `index.html` (início), `estoque.html`, `veiculo.html`
- **Painel de gestão:** `admin/index.html`

> Dica pra apresentar: o mapa de "Como chegar" só carrega com internet — o resto roda offline.

## Acessos do painel (demonstração)

| Acesso | Usuário | Senha | Pode fazer |
|---|---|---|---|
| **Dono (admin)** | `admin` | `admin123` | Tudo: veículos, funcionários e configurações |
| **Funcionário** | `vendedor` | `venda123` | Só gerenciar veículos (adicionar/editar/remover) |

⚠️ Trocar essas senhas antes de colocar no ar.

## O que o painel faz

- **Adicionar / editar / remover veículos** (marca, modelo, versão, ano, km, preço, câmbio, combustível, cor, portas, descrição)
- **Upload de fotos** de cada carro
- Marcar carro como **destaque** (aparece na home) ou **vendido**
- **Funcionários:** o dono cria logins e define o nível (admin ou funcionário)
- **Configurações:** WhatsApp oficial, telefone, endereço, horário, Instagram e link do mapa — tudo reflete no site

## Estoque inicial

Já vem com os **3 carros reais** (Polo, Nivus, Mobi — fonte NaPista, jun/2026) e **3 exemplos**
(Gol, Strada, Onix) só pra vitrine ficar cheia na demo. Os exemplos têm "[EXEMPLO]" na descrição —
é só apagar no painel.

## ⚠️ Antes de publicar de verdade

1. **Definir o número oficial de WhatsApp** (hoje há 3 circulando) e ajustar em *Painel → Configurações*.
2. **Trocar as senhas** do painel.
3. **Adicionar fotos reais** dos carros.
4. **Ligar o banco de dados** (ver abaixo) pra estoque e logins ficarem na nuvem, acessíveis de qualquer lugar.

## Design

Tema **"Editorial Showroom"** — direção autoral premium (inspirada em referências de revendas top),
mantendo a marca da Dicar (vermelho/preto/branco). Construído com as 3 ferramentas de design da Orion:
`frontend-design` (direção), `ui-ux-pro-max` (fontes/cores) e o checklist de qualidade `checklist-site-10k.md`.

- **Tipografia:** Bebas Neue (títulos, ar de showroom) + Manrope (corpo) — nada de Inter/Roboto.
- **Assinatura:** geometria diagonal + nome do modelo em tipografia gigante no herói.
- **Mobile:** layout repensado pra celular (não é o desktop espremido).
- **Qualidade:** HTML semântico, meta/OG tags, foco visível, lazy-load, `prefers-reduced-motion`, contraste.
- Arquivos do tema: `assets/css/site.css` + `assets/js/site.js`. (O painel usa `assets/css/styles.css` + `admin/admin.js`.)

> **Único ponto pendente do checklist:** fotos reais dos carros (hoje há placeholders). É só subir pelo painel.

### Reaproveitar pra outro cliente
Trocar os **tokens de marca** no topo do `site.css` (`:root` — cores, fontes) + o `seed`/`config` em `store.js`
(nome, WhatsApp, endereço, carros). O resto se adapta. É o modelo de site de revenda da Orion.

## Tecnologia

Site estático (HTML/CSS/JS puro) — leve, rápido e barato de hospedar (Netlify/Vercel grátis).

**Hoje (demo):** os dados (estoque, logins, configs) ficam no navegador (localStorage) — por isso funciona offline.
Toda leitura/escrita passa por **um único arquivo**: `assets/js/store.js`.

**Produção:** ver `PRODUCAO.md` — é só trocar os métodos do `store.js` por chamadas ao Supabase
(banco + login + storage de fotos, plano grátis). O resto do site não muda.

---
Feito por ✦ **Orion** — Presença Digital.
