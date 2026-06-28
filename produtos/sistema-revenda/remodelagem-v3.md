# Remodelagem v3 — Plataforma Orion (decisões + roadmap)

> Decisões tomadas em 27/06/2026 a partir da análise crítica da arquitetura
> (`Arquitetura da Plataforma Orion v1`) aplicada à 1ª instância (Dicar Veículos).
> Posicionamento que rege isto: [`_memoria/posicionamento.md`](../../_memoria/posicionamento.md).
>
> **Princípio que ficou decidido:** a remodelagem **não é uma reescrita**. O editor de
> site e o SEO (os dois módulos grandes) ficaram **de fora**. O foco é **alto valor pro
> cliente com baixo esforço**: reorganizar/enxugar o que já existe + 2 peças novas
> (captura de lead, dashboard de desempenho digital).

---

## 1. Escopo — o que entra e o que NÃO entra

| Módulo (doc v1) | Decisão | Como fica |
|---|---|---|
| 1. Dashboard | **Entra (v1)** | Só **KPIs de conversão first-party** (cliques WhatsApp, leads, veículo mais visto, formulários). Audiência (visitantes/origem) fica pra depois (depende de GA4/backend). |
| 2. Site editável (CMS) | **FORA** | O site segue **artesanal e personalizado pela Orion** — é o diferencial. Se o cliente não gosta, a Orion altera. Banners/destaques mudam **por cliente** (ex.: NK = veículo em destaque), feito pela Orion, não no painel. |
| 3. Catálogo | **Entra (refator leve)** | **Mantém específico de carro** (marca/modelo/ano/km/FIPE). Só **separar no código** núcleo × perfil-carro. Generalizar de verdade só quando surgir o 2º nicho (evitar generalização prematura). |
| 4. Leads | **Entra** | Enxugar o CRM atual ("Clientes" → "Leads"), tirar o vínculo com Vendas, **+ captura automática do site**. |
| 5. SEO (editor) | **FORA (definitivo)** | Orion entrega o site **já configurado**. O cliente não edita SEO. |
| 6. Google Business | **FORA como módulo/API** | Só os **dados (NAP: telefone/endereço/horário)** que alimentam o site, editáveis num ponto único. |
| 7+8. Redes Sociais + Marketing | **Entra (fundido)** | **Um módulo só** ("Conexões & Medição"): ads/pixels/GTM/GA4 (já existe) + links de redes sociais. |
| 9. Configurações | **Mínimo** | Só o que já existe (dados da loja, usuários, permissões). Sem domínio/SSL/backups (é infra da Orion, não UI). |
| 10. Integrações | **Adiar** | Shell "em breve" honesto. Integração real exige backend. |
| — Vendas/comissão/faturamento | **FORA do núcleo** | Gestão operacional sai. **Exceção:** "marcar vendido" continua — mas como **status do item no catálogo** (faz o carro sumir do site), não como módulo de vendas. |

---

## 2. Mapa de esforço (o que é novo vs. reaproveitado)

- **Novo de verdade:** (a) captura automática de lead (site → card "Novo"); (b) Dashboard v1 de desempenho digital.
- **Refator de coisa pronta:** Leads (enxugar CRM), Catálogo (separar núcleo×carro, status como fonte do site), Marketing+Redes (fundir), de-dup dos dados da empresa.
- **Cortar do painel:** módulo Vendas (faturamento, ticket, comissão, ranking) e o dashboard operacional/financeiro atual.

---

## 3. Dependência dura

**Captura de lead do site só funciona com o Supabase ligado.** No demo (localStorage), site público e painel só se falam no mesmo navegador. Por isso a captura de lead é a **última etapa** (pós-migração). O mesmo vale pro Dashboard ter **números reais cross-device** (eventos `dicarTrack` persistidos no banco) — no demo, o dashboard é construído com contagem local como prévia.

---

## 4. Roadmap faseado (ordem decidida: demo primeiro)

### Fase 0 — Limpeza e separação (no demo)
- **De-duplicar os dados da empresa (NAP):** uma fonte só (`config`); o site (incl. o JSON-LD do schema) passa a **ler de `config`** em vez de ter endereço/telefone/horário chumbados no HTML.
- **Separar no código** o que é **núcleo** (catálogo, leads, conexões, dashboard, config) do que é **perfil carro** (campos do veículo, FIPE) — sem mudar o dado, só organizar pra generalizar barato depois.

### Fase 1 — Núcleo enxuto (no demo)
- **Leads:** renomear "Clientes" → "Leads"; manter kanban + follow-up + cadastro; **remover o acoplamento com Vendas**; criar o método de entrada (`criarLeadDoSite`) já pronto pra ser chamado na Fase 3.
- **Catálogo:** status (disponível/negociando/vendido) como **única fonte do que aparece no site**; remover dependências do módulo Vendas; manter FIPE.
- **Cortar módulo Vendas** do painel (faturamento/comissão/ranking/ticket) e o dashboard financeiro atual.
- **Dashboard v1 (desempenho digital):** UI dos KPIs de conversão, lendo os eventos `dicarTrack` (no demo: contagem local como prévia).
- **Conexões & Medição:** fundir Marketing + Redes Sociais num módulo só (reaproveita `ads` do `store.js` + campos de redes/links).

### Fase 2 — Instanciar no Supabase
- Criar projeto, rodar `db/schema.sql`, ligar Auth + Storage; **trocar `store.js` por chamadas reais** (única camada que muda).
- **Paginação no servidor** (catálogo) e **fotos no Storage/CDN** (não base64 no banco) — pendências já registradas.
- Site público passa a **ler `config` (NAP + ads) do banco** ao carregar.

### Fase 3 — Captura de lead + dashboard real (pós-Supabase)
- **Formulário/CTA/WhatsApp do site → grava lead no banco → card "Novo"** no painel (chama `criarLeadDoSite`).
- **Eventos `dicarTrack` persistidos** → Dashboard v1 com números reais (cross-device).

---

## 4.1. Progresso de execução

**Fase 0 — Parte 1 (de-dup NAP): ✅ feita e verificada (no demo).**
- `store.js`: novo `config.negocio` = fonte única dos dados estruturados do negócio (endereço, CEP, telefone, horários, 16 cidades, rating).
- `site.js`: `injectDealerLD()` gera o schema `AutoDealer` a partir do config (mesmo padrão do schema de veículo).
- `index.html`: bloco JSON-LD chumbado removido. Verificado ao vivo no navegador.

**Fase 0 — Parte 2 (separar núcleo × perfil-carro): ✅ feita e verificada (no demo).**
- Não foi generalização — foi **isolamento**. Comportamento idêntico (testado: facetas, busca, marcas/tipos, nome, placeholder).
- `store.js`: criado o descritor **`PERFIL`** (`Store.PERFIL`) = lar único do que é "carro": `entidade`, `schemaType`, `facetas`, `nome()`, `placeholder()`. O núcleo passou a referenciá-lo (filtros de faceta via `PERFIL.facetas`; busca via `PERFIL.nome`; novo helper `valoresFaceta()` de que `marcas()`/`tipos()` derivam). Marcadores `[NÚCLEO]` / `[PERFIL]` no código.
- `site.js`: `@type` do schema vem de `PERFIL.schemaType`.

**Fase 1 — feita e verificada (no demo).** Três sub-steps:
- **A — Conexões & Medição:** módulo "Marketing" virou "Conexões & Medição" (sidebar + título); novo painel "Redes sociais" gerencia Instagram + Facebook/YouTube/TikTok/LinkedIn (`config.redes`); `sameAs` do schema inclui todas as redes. `Store.getRedes/saveRedes/redesSameAs`.
- **B — Leads:** "Clientes" → "Leads" em toda a UI do CRM (mantido "Cliente" no fluxo de venda — pipeline=Leads · venda=Cliente). Modelo de dados interno intacto. Novo `Store.criarLeadDoSite()` (gancho da captura automática da Fase 3: etapa "novo", origem "Site").
- **C — Dashboard v1 (desempenho digital):** `dicarTrack` agora **persiste eventos first-party** (`Store.logEvent`, stream separado `dicar_eventos_v1`, sem PII; pixels de terceiro seguem só com consentimento). Novo dashboard do dono = KPIs digitais (cliques WhatsApp, leads recebidos, veículos vistos, simulações) + funil + veículo mais visto + gráfico "WhatsApp 7 dias". O **financeiro (ranking + gráfico de faturamento) foi pro módulo Vendas**, que ficou marcado como **add-on operacional** (não removido). `Store.eventStats/eventosPorDia`.

**Fase 2 — em preparo (depende do projeto Supabase do cliente).** Feito sem credenciais:
- **`schema.sql` atualizado pra v3:** config com `ads`/`redes`/`negocio` (jsonb), veículo com FIPE (`codigo_fipe`/`valor_fipe`), nova tabela `eventos` (+RLS), `perfis.usuario` (mapeia vendedor↔auth), `clientes.consent`/`consent_em` (LGPD), `vendas.veiculo_nome` (snapshot), política de captura de lead pelo site (anon) preparada.
- **`store.supabase.js` escrito** (cache-facade): `init()` hidrata o cache do Supabase; API pública **síncrona** lendo do cache (painel/site quase não mudam); escritas atualizam cache + persistem em 2º plano; auth (Supabase Auth, login async por e-mail), Storage (`uploadFoto`). **API conferida = drop-in** (mesma superfície do demo, 59 métodos + init/ready/onError/uploadFoto). Demo (`store.js`) intacto até testar.
- **Falta (precisa do cliente):** criar o projeto Supabase, rodar o schema, criar admin + bucket `fotos`, passar URL+anon key → então plugar (`store.js`→`store.supabase.js`), ajustar bootstrap assíncrono + login por e-mail + upload de fotos, e **testar de ponta a ponta**. Roteiro em `clientes/dicar-veiculos/site/PRODUCAO.md`.

### Mapa de seams — o que é `[PERFIL: carro]` (trocar p/ novo nicho) × `[NÚCLEO]`

| Arquivo | `[PERFIL: carro]` (específico do nicho) | `[NÚCLEO]` (reaproveitável) |
|---|---|---|
| `store.js` | descritor `PERFIL`; campos do item no `SEED.veiculos`; `LIMITS` marca/modelo/titulo; ordenações km/ano; `config.negocio.schemaType`/`areaServed`/`priceRange` | persistência/cache, auth, permissões, usuários, config loja/contato/ads, CRUD do catálogo, `valoresFaceta`, destaques, `diasParado`, `foto`, `waLink`, formatadores |
| `painel.js` | **formulário do veículo** (marca/modelo/ano/km/câmbio/combustível/cor/portas/placa/consignante), **FIPE**, colunas da tabela de estoque — *não refatorado de propósito; a UI do item é naturalmente por-perfil* | navegação, login, permissões, conexões/medição, estrutura do painel |
| `site.js` | `card()` (specs ano/km/câmbio), ícones de categoria (hatch/suv/sedã/picape), grid do detalhe, `injectVehicleLD` (schema `Car`) | chrome/menu, consentimento/tracking, paginação, galeria/lightbox, `injectDealerLD` |

> Regra: pra um 2º nicho, mexe-se no **`PERFIL` + formulário do item + rótulos/ícones de apresentação**. O núcleo não se reescreve. A generalização "de verdade" (campos tipados) só quando o 2º caso real aparecer.

## 5. O que ficou explicitamente adiado/cortado (pra não reabrir sem querer)
Editor de site/CMS · editor de SEO · Google Business como módulo/API · Integrações reais · Configurações de infra (domínio/SSL/backups) · módulo Vendas/financeiro · Dashboard de audiência (visitantes/origem) na v1 · generalização do catálogo por campos tipados (espera o 2º nicho).
