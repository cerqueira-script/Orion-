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
| **Dono (admin)** | `admin` | `admin123` | Tudo: estoque, clientes, vendas, permissões, funcionários e configurações |
| **Vendedor** | `vendedor` | `venda123` | Conforme as permissões que o dono liberar (estoque, clientes/CRM, registrar vendas) |

⚠️ Trocar essas senhas antes de colocar no ar.

## O que o painel faz

- **Estoque:** adicionar/editar/remover veículos, com busca, filtros (marca/tipo/situação/origem) e ordenação. Fotos com **capa escolhível** (arrastar ou ★), **máx. 3 destaques** (entra outro automático quando vende), situação disponível/negociando/vendido. Campos internos que não vão pro site: origem (próprio/consignado), consignante, **placa**, documentação e **observações internas**.
- **Clientes (CRM):** funil em **Kanban** (arrastar entre etapas) ou **Lista**, com busca e filtro por vendedor/etapa. Card abre num popup pra ver tudo e editar.
- **Vendas:** toda venda vincula **veículo + cliente** (com nº e status). Dá pra cadastrar o cliente na hora e **cancelar** uma venda (o veículo volta ao estoque).
- **Dashboard:** indicadores de estoque/vendas + bloco comercial (funil, conversão, ranking) + veículos parados.
- **Configurações:** dados da loja (WhatsApp, telefone, endereço, horário, Instagram, mapa — refletem no site), permissões do vendedor e funcionários.

## Estoque inicial (demo)

Já vem com os **3 veículos reais** (Polo, Nivus, Mobi — fonte NaPista, jun/2026, com foto) e vários
**exemplos** (HB20, Onix, Corolla, T-Cross, Kwid, Strada, Renegade + alguns já vendidos) só pra a demo
ficar cheia. Os exemplos aparecem marcados como "exemplo" — é só apagar no painel. Também já vem com
clientes em todas as etapas e algumas vendas registradas, pra testar os filtros e o dashboard.

## ⚠️ Antes de publicar de verdade

1. **Definir o número oficial de WhatsApp** (hoje há 3 circulando) e ajustar em *Painel → Configurações*.
2. **Trocar as senhas** do painel.
3. **Adicionar fotos reais** dos veículos.
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

> **Único ponto pendente do checklist:** fotos reais dos veículos (hoje há placeholders). É só subir pelo painel.

### Reaproveitar pra outro cliente
Trocar os **tokens de marca** no topo do `site.css` (`:root` — cores, fontes) + o `seed`/`config` em `store.js`
(nome, WhatsApp, endereço, veículos). O resto se adapta. É o modelo de site de revenda da Orion.

## Tecnologia

Site estático (HTML/CSS/JS puro) — leve, rápido e barato de hospedar (Netlify/Vercel grátis).

**Hoje (demo):** os dados (estoque, logins, configs) ficam no navegador (localStorage) — por isso funciona offline.
Toda leitura/escrita passa por **um único arquivo**: `assets/js/store.js`.

**Produção:** ver `PRODUCAO.md` — é só trocar os métodos do `store.js` por chamadas ao Supabase
(banco + login + storage de fotos, plano grátis). O resto do site não muda.

---
Feito por ✦ **Orion** — Presença Digital.
