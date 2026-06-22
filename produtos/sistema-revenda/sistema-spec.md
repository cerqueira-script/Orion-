# Sistema de Revenda — Produto Orion

> **Especificação v1.** Sistema de gestão + site para revendas de veículos.
> Produto **reutilizável** da Orion: um molde, uma instância por cliente.
> Primeira instância: **Dicar Veículos** (`clientes/dicar-veiculos/`).

---

## Visão

Um sistema que faz duas coisas:
1. **Gerencia** o estoque e o site (o cliente atualiza tudo sozinho).
2. **Ajuda a vender** (CRM de leads, controle financeiro, dashboard de gestão).

Não é só um "CMS de site" — é a **central de controle da revenda**.

---

## Arquitetura (modelo reutilizável)

- **Frontend (site público)** + **Painel (sistema)** — HTML/CSS/JS, sem build pesado.
- **Backend:** Supabase (Postgres + Auth + Storage) — **uma instância por cliente** (dados isolados).
- **Hospedagem:** Netlify/Vercel (grátis) + domínio próprio do cliente.
- **Marca via config** (cores, logo, nome, contatos) — trocar = novo cliente.
- **Molde** em `produtos/sistema-revenda/`; cada cliente = cópia + Supabase próprio.

### Como instanciar para um cliente novo
1. Copiar `produtos/sistema-revenda/` → `clientes/<cliente>/site/`
2. Criar projeto Supabase + rodar o schema do banco
3. Preencher a config (marca, cores, logo, WhatsApp, endereço)
4. Deploy no Netlify + apontar o domínio

---

## Acessos

- **Dono (admin):** acesso total, define permissões, vê financeiro.
- **Vendedor (funcionário):** acesso conforme as permissões que o dono liberar.

---

## Módulos (v1)

### 1. Estoque
**Dados públicos** (vão pro site): marca, modelo, versão, ano, km, **preço anunciado**, câmbio, combustível, cor, portas, tipo, fotos (galeria), descrição, destaque, status.

**Status:** disponível · reservado · vendido.

**Dados internos** (nunca aparecem no site):
- **Origem:** próprio da loja **ou** consignado
- Se consignado: **nome + telefone do consignante** + **valor de repasse**
- **Custo** (quanto a loja pagou, se próprio)
- **Valor mínimo de venda** (piso de negociação)
- **Margem** (calculada: preço − custo/repasse)
- **Data de entrada** (alimenta "tempo em estoque" / encalhados)
- **Status do documento:** OK · pendente (alimenta alerta)

### 2. Permissões configuráveis (dono no controle)
Tela onde o dono liga/desliga o que cada vendedor pode ver/fazer:

| Permissão | Padrão p/ vendedor |
|---|---|
| Ver **valor mínimo** de venda | ✅ ligado |
| Ver **custo / margem (lucro)** | ❌ desligado |
| Ver **dados do consignante** | ❌ desligado |
| **Editar preço** anunciado | ❌ desligado |
| **Registrar venda** | ✅ ligado |
| **Gerenciar leads** | ✅ ligado |

### 3. Leads / mini-CRM (registro manual)
O vendedor cadastra os contatos que chegam (WhatsApp, telefone, loja).
- **Campos:** nome, telefone, carro de interesse, origem, vendedor responsável, observações, próximo contato (follow-up).
- **Funil:** Novo → Em atendimento → Negociando → **Fechado** / **Perdido**.

### 4. Venda (ao marcar "Vendido")
Mini-formulário: **valor final**, **comprador** (puxa de um lead), **vendedor**, data.
→ Calcula a **margem real** e alimenta o dashboard/relatório.

### 5. Dashboard inicial (painel de controle)
**Visão geral:**
- Veículos em estoque (qtd) + **valor total do estoque** (patrimônio)
- **Próprios × consignados** (quantidade e valor de cada)
- **Vendidos no mês** + **faturamento do mês**
- **Ticket médio**
- **Lucro/margem do mês** *(restrito a quem tem permissão)*

**Comercial:**
- **Ranking de vendedores** (quantidade + valor vendido)
- **Propostas em andamento** + **taxa de conversão**

**Estoque:**
- **Encalhados** (mais tempo parados) · **tempo médio** em estoque · por marca

**Alertas:**
- 🔴 Veículos **abaixo da margem mínima**
- 🟠 Veículos com **documentação pendente**

### 6. Relatórios (área restrita)
- **Vendas por período** (filtra mês), com quebra **por vendedor** e **lucro por veículo**.

### 7. Configurações da loja
WhatsApp oficial, endereço, horário, redes, marca (nome/cores/logo).

---

## Fase 2 (depois — dependem de integração)

- Visualizações/interesse por carro (analytics no site)
- Alerta de anúncios vencendo (integração com marketplaces)
- Exportar estoque pra marketplaces (OLX, Webmotors, iCarros)
- Auto-post no Instagram quando entra carro novo
- Relatórios avançados (comparativos mensais, histórico longo, giro de estoque)
- Simulador de financiamento no site

---

## Status

- [x] Especificação fechada
- [ ] Modelagem do banco (Supabase)
- [ ] Painel: estoque + financeiro + origem/consignado
- [ ] Painel: permissões configuráveis
- [ ] Painel: leads / CRM
- [ ] Painel: venda + dashboard + relatório
- [ ] Instanciar para a Dicar (conectar Supabase + deploy)
