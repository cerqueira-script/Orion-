# Sistema de Revenda — Produto Orion

> **Especificação v2.** Sistema de gestão + site para revendas de veículos.
> Produto **reutilizável** da Orion: um molde, uma instância por cliente.
> Primeira instância: **Dicar Veículos** (`clientes/dicar-veiculos/`).
>
> **v2 (jun/2026):** sem módulo financeiro de lucro/margem — foco em estoque,
> clientes (CRM) e vendas. "Leads" virou "Clientes". Entrou módulo de Vendas.

---

## Visão

Um sistema que faz duas coisas:
1. **Gerencia** o estoque e o site (o cliente atualiza tudo sozinho).
2. **Ajuda a vender** (CRM de clientes, registro de vendas, dashboard de gestão).

Não é só um "CMS de site" — é a **central de controle da revenda**. Não faz controle
financeiro de lucro/margem (varia muito entre lojas e agrega complexidade sem foco);
cuida de **estoque, clientes, vendas e operação comercial**.

---

## Arquitetura (modelo reutilizável)

- **Frontend (site público)** + **Painel (sistema)** — HTML/CSS/JS, sem build pesado.
- **Camada de dados única:** `assets/js/store.js`. Hoje roda em **localStorage (demo)**;
  pra produção, só esse arquivo troca por chamadas ao Supabase.
- **Backend (produção):** Supabase (Postgres + Auth + Storage) — **uma instância por cliente** (dados isolados).
- **Hospedagem:** Netlify/Vercel (grátis) + domínio próprio do cliente.
- **Marca via config** (cores, logo, nome, contatos) — trocar = novo cliente.
- **Identidade visual:** tema "Editorial Showroom" (Bebas Neue + Manrope, acento único, cantos retos, ícones SVG). Site e painel compartilham a mesma linguagem.
- **App-like:** zoom travado + seleção de texto desabilitada (inputs liberados).
- **Mobile (painel):** menu **hambúrguer + gaveta** (igual ao site), tabelas com scroll horizontal, modais full-width. O site público já é responsivo.
- **Molde** em `produtos/sistema-revenda/`; cada cliente = cópia + Supabase próprio.

### Como instanciar para um cliente novo
1. Copiar a base → `clientes/<cliente>/site/`
2. Criar projeto Supabase + rodar `db/schema.sql`
3. Trocar `store.js` por chamadas reais (Auth + DB + Storage)
4. Preencher a config (marca, cores, logo, WhatsApp, endereço)
5. Deploy no Netlify + apontar o domínio

---

## Acessos

- **Dono (admin):** acesso total, define permissões, **vê o negócio inteiro**.
- **Vendedor (funcionário):** acesso conforme as permissões; **vê só o que é dele** — dashboard pessoal (minhas vendas/clientes/retornos/funil), Clientes e Vendas já filtrados nele, e o "vendedor responsável" travado no próprio nome. O dono vê tudo e pode filtrar por vendedor.

---

## Módulos

### 1. Estoque
**Dados públicos** (vão pro site): marca, modelo, versão/título, ano, km, **preço anunciado**, câmbio, combustível, cor, portas, tipo, fotos (galeria), descrição, destaque, situação.

**Situação:** disponível · **negociando** · vendido.

**Dados internos** (nunca aparecem no site):
- **Origem:** próprio da loja **ou** consignado
- Se consignado: **nome + telefone do consignante** (visível conforme permissão)
- **Placa**
- **Status do documento:** OK · pendente (alimenta indicador)
- **Data de entrada** (alimenta "tempo em estoque" / parados)
- **Observações internas** (anotações que ficam só no painel)

**Busca e filtros:** por marca, modelo/versão, tipo, situação, origem + ordenação (preço, km, ano). **Destaques fixados no topo** quando não há filtro ativo.

**Fotos:** galeria com **capa escolhível** — arrastar pra reordenar (a 1ª é a capa) ou tocar na **★** (mobile). Limites (segurança): até **10 fotos/veículo**, **5 MB/foto**, formatos JPG/PNG/WEBP; limites de caracteres com contador (título 100, descrição 2.000, marca/modelo 50, obs 500).

**Destaque:** no máximo **3 veículos** em destaque. Ao vender/remover um destacado, **entra automaticamente o que está há mais tempo em estoque** — sem tirar a troca manual.

### 2. Permissões configuráveis (dono no controle)
Tela (em Configurações) onde o dono liga/desliga o que cada vendedor pode ver/fazer:

| Permissão | Padrão p/ vendedor |
|---|---|
| **Editar preço** anunciado | ❌ desligado |
| Ver **dados do consignante** | ❌ desligado |
| **Registrar venda** | ✅ ligado |
| **Gerenciar clientes** (CRM) | ✅ ligado |

### 3. Clientes / mini-CRM (registro manual)
O vendedor cadastra os contatos que chegam (WhatsApp, telefone, loja, Instagram…).
- **Campos:** nome, telefone, **cidade**, veículo de interesse (pesquisável no estoque **ou** texto livre pra algo fora do estoque), origem, vendedor responsável, observações, próximo contato (follow-up).
- **Funil:** Novo → Em atendimento → Negociando → **Fechado** / **Perdido**.
- **Duas visões:** **Kanban** (arrastar e soltar entre etapas) e **Lista** (tabela). Busca (nome/telefone/cidade) + filtro por **vendedor** e por **etapa** em ambas.
- **Card do kanban** mostra só o essencial; clicar abre o **popup** com tudo + editar + ações rápidas (WhatsApp, Fechar venda).
- **Cadastro rápido** por modal sem sair da tela.

### 4. Venda
**Toda venda vincula veículo + cliente.** Aberta por qualquer caminho: botão "Vender" no estoque, "Fechar venda" no cliente, "Nova venda" na aba Vendas, ou ao marcar um veículo como "Vendido" na edição (abre o popup de venda).
- **Veículo:** seletor **pesquisável e fechado** (só estoque, não aceita texto livre).
- **Cliente:** **pesquisável**; se não existir, **cadastra na hora** (botão no próprio campo).
- **Campos:** veículo, cliente (+tel/cidade), vendedor, valor final, data, status.
- Ao confirmar: gera **nº sequencial** (#0001…), marca o veículo como **vendido**, fecha o cliente vinculado e completa os destaques.

### 5. Vendas (módulo próprio)
Tabela com **nº, cliente (+cidade), veículo, valor, data, vendedor, status**. Filtro por mês + resumo (vendas, faturamento, ticket médio). **Cancelar venda** → status "Cancelada" e o **veículo volta ao estoque** (recalcula o mês).

### 6. Dashboard
**Indicadores (cards):** veículos em estoque · **valor em estoque** · próprios × consignados (qtd e valor) · vendas no mês · faturamento do mês · ticket médio · docs pendentes.
**Comercial:** funil de clientes · clientes ativos · taxa de conversão · ranking de vendedores do mês.
**Estoque:** **5 veículos mais tempo parados** (foto, nome, dias em estoque).
**Gráficos (SVG):** faturamento por mês (linha) + estoque por tipo (barra). No painel do **vendedor**, viram "minhas vendas por mês" + estoque por tipo.

### 7. Configurações da loja
WhatsApp oficial, endereço, horário, redes, marca. Abas: **Dados da loja · Permissões do vendedor · Funcionários · Ver site**.

---

## Site público
- Vitrine com **destaques** (máx. 3) + catálogo com busca/filtros.
- **Vendidos somem do site**; **negociando aparece** (selo "Negociando", ainda à venda).
- Destaques primeiro quando não há filtro ativo.

---

## Fase 2 (depois — dependem de integração)

- Visualizações/interesse por veículo (analytics no site)
- Alerta de anúncios vencendo (integração com marketplaces)
- Exportar estoque pra marketplaces (OLX, Webmotors, iCarros)
- Auto-post no Instagram quando entra veículo novo
- Relatórios avançados (comparativos mensais, giro de estoque)
- Simulador de financiamento no site

---

## Status

- [x] Especificação v2
- [x] Painel: estoque (financeiro removido) + origem/consignado + placa + obs internas
- [x] Painel: busca/filtros + destaques fixados + destaque automático (máx. 3)
- [x] Painel: permissões configuráveis (em Configurações)
- [x] Painel: clientes / CRM (Kanban com drag&drop + Lista, busca/filtros/vendedor, popup)
- [x] Painel: venda (vincula veículo+cliente sempre) + módulo Vendas (nº/status/cancelar) + dashboard comercial
- [x] Site: vendidos fora, negociando com selo, destaques primeiro, zoom/seleção travados
- [x] Fotos com capa escolhível (arrastar/★) + painel responsivo (menu hambúrguer/gaveta)
- [x] **Modelagem do banco atualizada** — `db/schema.sql` reescrito pra v2 (sem financeiro, leads→clientes+cidade, vendas com numero/status, placa, obs_internas)
- [ ] Instanciar para a Dicar (criar projeto Supabase + trocar store.js por chamadas reais + deploy)

> **Build v2 entregue na demo** (localStorage) em `clientes/dicar-veiculos/site/admin/`.
> Toda leitura/escrita passa por `assets/js/store.js` — a única camada a trocar pra ligar o Supabase.
> Acessos demo: admin/admin123 (dono) · vendedor/venda123.
