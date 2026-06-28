# Análise Competitiva — Sistema de Revenda (Orion)

> Análise módulo a módulo do nosso **sistema-revenda** (painel de gestão + vitrine) contra os principais concorrentes do mercado brasileiro, com base em pesquisa de evidências (sites oficiais, blogs, Reclame Aqui, tendências de IA/UX do setor).
>
> **Data:** 24/06/2026 · **Produto analisado:** `produtos/sistema-revenda/` (v2) · 1ª instância: Dicar Veículos.

---

## 0. Resumo executivo (leia isto primeiro)

**O mercado já está maduro e saturado de ERPs completos.** Autoconf, Boom Sistemas (1.500+ lojas, 7.000 usuários), Revenda Mais, AutoCerto e BNDV oferecem praticamente o mesmo pacote: estoque + **integrador de anúncios** + CRM + **financeiro** + **NF-e** + **contratos** + consulta veicular. São robustos, porém **complexos, modulares (caros quando você soma tudo) e com suporte/onboarding reclamado** (ver Reclame Aqui da Autoconf: "falta de suporte", "tem que aprender por tutorial").

**Onde o nosso sistema joga diferente (e deve continuar jogando):**
- **Simplicidade radical** — feito sob medida, o dono atualiza tudo sozinho, sem curva de aprendizado. Esse é o nosso fosso, não a quantidade de features.
- **Site + gestão na mesma identidade**, bonito de verdade (a maioria dos sites dos concorrentes é template genérico).
- **Sem peso de ERP** (não tentamos ser financeiro/contábil).

**As 3 verdades incômodas desta análise:**
1. **Falta o integrador de anúncios.** É a feature *universal* dos concorrentes e o maior motivo de um lojista contratar sistema. Sem isso, o estoque vive preso ao nosso site. → **prioridade máxima de produto** (mesmo que via export/Fase 2).
2. **IA já é commodity no setor** (BNDV "SophIA" escreve anúncio, MegAImagens/Spyne tratam foto, Auto Avaliar/Indicata precificam). Dá pra entrar nisso barato e virar diferencial, porque os incumbentes fazem mal e caro.
3. **Nossa simplicidade é vantagem competitiva real** — não devemos copiar o ERP inteiro. A meta é **fechar 2-3 lacunas críticas** (anúncios, captação de lead automática, prova social) e **dobrar a aposta no que já é melhor** (UX, site, WhatsApp).

**Público-alvo** (lembrar sempre): revenda pequena/média de bairro (tipo Dicar) — dono que fatura no boca a boca, equipe enxuta, pouco letrado em tecnologia. Para esse público, **menos é mais**. Feature que o Carlos não entende em 5 segundos é "encheção de linguiça".

---

## 1. Metodologia e concorrentes

**Como pesquisei:** sites oficiais dos concorrentes, blogs técnicos do setor, Reclame Aqui, matérias de mercado e fontes de tendência (IA de precificação, IA de foto, chatbots). Busca web é US-region, então o lado de *reviews* brasileiros (Capterra/G2/Reddit) é raso para esse nicho — sinalizo onde a evidência é mais fraca. Não tomei o marketing dos concorrentes como verdade absoluta; cruzei com reclamações reais e padrões de mercado.

**Conjunto de concorrentes:**

| Apelido | Empresa | Posicionamento |
|---|---|---|
| **A** | **Autoconf** | ERP completo (site + portais + CRM + financeiro + contratos), nascido dentro de uma loja (BellosCar) |
| **B** | **Boom Sistemas** | ERP consolidado, 1.500+ lojas; forte em financeiro, NF-e, consulta veicular, contratos |
| **C** | **Revenda Mais** | 100% nuvem + app; CRM com leads automáticos, vistoria/checklist, NF-e e assinatura como add-ons |
| (apoio) | **AutoCerto, BNDV, Altimus, Syonet, Auto Adm, Simples Veículo, StockCarWeb, Loja Conectada** | Variações do mesmo pacote; BNDV tem IA (SophIA) e RENAVE; Syonet/Altimus são CRM-first |

---

## 2. Análise módulo a módulo

> Convenção: 🟢 = ponto forte nosso · 🔴 = lacuna nossa · ⚙️ automação · 🤖 IA. Prioridade = Alta/Média/Baixa. Esforço = P/M/G.

### Módulo 1 — Estoque

**Como funciona hoje:** cadastro com dados públicos (vão pro site) + internos (origem próprio/consignado, consignante, placa, doc OK/pendente, data de entrada, obs internas). Busca/filtros, situações (disponível/negociando/vendido), **fotos com capa escolhível** (arrastar/★), **máx. 3 destaques com promoção automática** do mais antigo. Limites de fotos/tamanho/caracteres.

**Como os concorrentes fazem:** todos têm gestão de estoque, mas o foco deles é **distribuição** (integrador) e **margem/giro**. Autoconf acompanha "entrada, saída, giro e margem em tempo real". BNDV cobre avaliações, compras, consignações, intermediações e financiamentos. AutoCerto não limita fotos e exibe **vídeo** no site.

**O que eles têm que não temos (🔴):**
- **Integrador de anúncios** (publica em 20-40+ portais e redes a partir de 1 cadastro, sincroniza preço/status em tempo real) — **universal nos concorrentes**.
- **Consulta de histórico veicular** (leilão, sinistro, débitos, multas, roubo/furto, bloqueio judicial) — Boom.
- **Vídeo** e **foto 360º** do veículo (AutoCerto, MegAImagens).
- Indicador de **giro/margem** e captação (avaliação/compra) estruturada.

**O que fazemos melhor (🟢):**
- **Capa de foto por arrastar/★ no mobile** e **destaque automático** (promove o mais antigo) — UX mais fina e "pensada" que a média.
- Separação limpa **público × interno** com **placa e obs internas** sem virar um formulário gigante de ERP.
- Vitrine direta e bonita (a foto vira hero, não miniatura).

**Funcionalidades a adicionar:**
- **Exportar estoque / integrador de anúncios** (começar com OLX + Webmotors via planilha/feed; evoluir pra API). 🔴 **Alta / G**
- **Indicador "tempo em estoque" já existe no dashboard** — adicionar **alerta de carro parado** (>X dias) com sugestão de ação. ⚙️ **Média / P**
- **Campo de vídeo (link YouTube/Reels)** no veículo → some no site. **Média / P**
- **Consulta de débitos/situação** (integração paga, ex.: API de placa) — **Baixa/G** (custo por consulta; talvez só pra instâncias maiores).

**UX/UI:** manter; só adicionar **badge de origem** (próprio/consignado) e **status do doc** mais visíveis na lista. **Performance:** lazy-load de fotos já ok; paginar quando o estoque passar de ~50. **Automação ⚙️:** auto-marcar "parado" e sugerir baixar preço. **IA 🤖:** **gerar descrição do anúncio** a partir de marca/modelo/versão/opcionais (ver Módulo Site).

**Impacto cliente:** Alto (vender em mais canais). **Impacto negócio:** Alto (integrador é o que faz lojista pagar mensalidade). **Prioridade geral: ALTA.**

---

### Módulo 2 — Permissões configuráveis

**Como funciona hoje:** o dono liga/desliga por vendedor: editar preço, ver consignante, registrar venda, gerenciar clientes. Vendedor vê só o que é dele.

**Como os concorrentes fazem:** ERPs têm perfis de acesso, mas costumam ser **mais burocráticos** (matriz de permissões extensa, pouco amigável). Poucos comunicam isso como diferencial.

**O que fazemos melhor (🟢):** **simplicidade** — 4 chaves que o dono entende na hora, em vez de uma matriz de 30 permissões. Para o nosso público, isso é **superior**.

**O que falta (🔴):** **log de auditoria** ("quem mudou o preço/marcou vendido") — relevante quando a loja tem 2-3 vendedores. ⚙️

**Adicionar:** **histórico de ações** simples por registro (quem/quando). **Média / M.** **IA:** nenhuma necessária (não inventar).
**Prioridade: BAIXA-MÉDIA** (cresce de importância com o tamanho da equipe).

---

### Módulo 3 — Clientes / mini-CRM

**Como funciona hoje:** cadastro manual de contatos (WhatsApp/loja/IG), funil Novo→Atendimento→Negociando→Fechado/Perdido, **Kanban (drag&drop) + Lista**, busca e filtro por vendedor/etapa, popup com tudo + ação rápida (WhatsApp/fechar venda), follow-up (próximo contato).

**Como os concorrentes fazem (este é o ponto mais forte deles):**
- **Revenda Mais:** **leads automáticos** (aniversário do cliente, aniversário de compra, término de financiamento) — cria a oportunidade sozinho.
- **Syonet/Altimus/Followize (CRM-first):** **captura automática de leads dos portais/site**, qualificação, **follow-up automático com gatilhos**, **200+ filtros** pré-configurados, integração com **WhatsApp** pra disparo/campanha, alertas de "não perca o lead".
- **BNDV:** centraliza leads do site + marketplaces num só lugar.

**O que eles fazem melhor (🔴):**
1. **Lead entra sozinho** (do site, dos portais, do WhatsApp) — no nosso, é **100% manual**. Maior lacuna do módulo.
2. **Follow-up automatizado** (lembrete/gatilho dispara sozinho) — no nosso, o "próximo contato" é só uma data que o vendedor tem que olhar.
3. **Leads de recompra** (fim de financiamento, aniversário) — geração de oportunidade recorrente.

**O que fazemos melhor (🟢):** **Kanban arrasta-e-solta + popup enxuto** é mais agradável que a maioria das telas de CRM "planilhão" dos ERPs. Cadastro rápido sem sair da tela. Para equipe pequena, é mais usável.

**Funcionalidades a adicionar:**
- **Captura automática de lead do nosso site** (formulário/clique no WhatsApp vira card "Novo" no CRM). 🔴⚙️ **Alta / M** — *é o nosso atalho natural: o site é nosso, dá pra plugar.*
- **Lembrete de follow-up** que avisa o vendedor (notificação/destaque no dashboard quando "próximo contato" chega/vence). ⚙️ **Alta / P**
- **Leads de recompra** (aniversário de compra, fim de financiamento) gerados do histórico de vendas. ⚙️ **Média / M**
- **Disparo de WhatsApp** com template a partir do card (mensagem pré-pronta por etapa). **Média / P**

**UX/UI:** ótima base; adicionar **contador por etapa** no topo do Kanban e **destaque visual de follow-up vencido**. **IA 🤖:** **sugerir a próxima mensagem** de follow-up pelo contexto do lead (modelo de interesse, etapa) — diferencial barato.

**Impacto cliente:** Alto (não perde cliente). **Impacto negócio:** Alto (CRM que captura sozinho aumenta retenção do sistema). **Prioridade: ALTA.**

---

### Módulo 4 e 5 — Venda + módulo Vendas

**Como funciona hoje:** toda venda vincula **veículo + cliente**, aberta por vários caminhos, gera **nº sequencial**, marca vendido, fecha o cliente, completa destaques. Módulo Vendas com tabela, filtro por mês, resumo (vendas/faturamento/ticket), **cancelar venda devolve o carro ao estoque**.

**Como os concorrentes fazem:** vinculam venda a **financeiro + NF-e + contrato + comissão**. Boom/Autoconf/BNDV emitem **NF-e**, geram **contrato/procuração** automáticos, calculam **comissão** do vendedor e lançam no **fluxo de caixa**. Revenda Mais vende NF-e (R$250) e **assinatura eletrônica** (R$50) como add-ons.

**O que eles fazem melhor (🔴):**
- **NF-e** e **contrato/procuração** automáticos a partir da venda (papelada).
- **Comissão** do vendedor calculada e a venda lançada no **financeiro**.
- **Assinatura digital** do contrato.

**O que fazemos melhor (🟢):** **fluxo de venda guiado e à prova de erro** (veículo só do estoque, cliente pesquisável ou cadastrado na hora, cancelamento que devolve ao estoque). É **mais simples e mais difícil de errar** que os ERPs.

**Funcionalidades a adicionar (com cautela — não virar ERP):**
- **Gerar contrato/recibo em PDF** a partir da venda (template simples preenchido) — entrega 80% do valor com 20% do esforço. **Média / M.**
- **Comissão** simples por venda (campo % ou valor, vai pro ranking). **Média / P.**
- **NF-e** — **deixar de fora** por enquanto (alta complexidade fiscal/custo; é add-on pago até nos concorrentes). Reavaliar só para instância que peça.

**UX/UI:** manter. **Automação ⚙️:** ao fechar venda, **oferecer gerar o contrato/recibo** e **disparar mensagem de pós-venda** (agradecimento + pedido de avaliação no Google — conecta com prova social). **IA:** baixa prioridade aqui.

**Impacto cliente:** Médio-Alto (menos papelada). **Impacto negócio:** Médio. **Prioridade: MÉDIA** (contrato/recibo = quick win; NF-e/financeiro = fora de escopo por ora).

---

### Módulo 6 — Dashboard

**Como funciona hoje:** cards (estoque, valor em estoque, próprios×consignados, vendas/faturamento/ticket do mês, docs pendentes), **comercial** (funil, conversão, ranking de vendedores), **5 carros mais parados**, **gráficos SVG** (faturamento/mês, estoque por tipo); visão do vendedor é a "minha".

**Como os concorrentes fazem:** **relatórios estratégicos** e **DRE** (Autoconf/Boom), análises de desempenho da equipe, relatórios financeiros. São mais **densos** (e mais complexos de ler).

**O que eles têm (🔴):** relatórios **comparativos** (mês a mês, ano a ano), **giro de estoque** como métrica, exportação (PDF/Excel).

**O que fazemos melhor (🟢):** **dashboard limpo e operacional** com a métrica que importa pro dono (o que está parado, quem está vendendo). Visão por papel (dono × vendedor) já implementada — isso muitos ERPs **não** fazem bem.

**Adicionar:** **comparativo mês anterior** (▲▼ ao lado de cada card), **giro médio de estoque** (dias até vender), **exportar PDF** do resumo do mês. **Média / M.** **IA 🤖:** **resumo em linguagem natural** ("Esse mês você vendeu 3, ticket subiu 8%, 2 carros passaram de 60 dias — sugiro baixar preço do Renegade"). Diferencial barato e com a nossa cara (simples).
**Prioridade: MÉDIA.**

---

### Módulo 7 — Configurações

**Como funciona hoje:** dados da loja, permissões, funcionários, ver site.

**Concorrentes:** mais configs (fiscal, financeiro, integrações, modelos de contrato) — porque têm mais módulos. Nada de especial em UX.

**O que falta (🔴):** **configurar os canais de anúncio** (quando entrar o integrador) e **modelos de mensagem/contrato**. **Backup/exportar dados** visível (confiança).

**Adicionar:** aba de **integrações** (marketplaces, Google/Meta) conforme features entrarem; **templates de WhatsApp**. **Baixa-Média.** **Prioridade: BAIXA** (acompanha as features novas).

---

### Módulo 8 — Site público (vitrine)

**Como funciona hoje:** vitrine com destaques + catálogo com busca/filtros (pílulas), página de veículo com galeria (carrossel/contador/tela cheia), páginas de **financiamento / vender meu carro / região** com FAQ, WhatsApp como botão central, identidade "Editorial Showroom" (bonita, autoral).

**Como os concorrentes fazem:** o site vem **junto** do sistema e é **integrado ao estoque** — mas quase sempre é **template genérico e sem graça**, igual entre lojas. O foco deles é estar integrado aos portais, não ser bonito. AutoCerto põe **vídeo** e WhatsApp 1 clique; todos têm **botão WhatsApp**.

**O que eles fazem melhor (🔴):**
- **Lead do site cai direto no CRM** (no nosso, ainda não — ver Módulo 3).
- **Vídeo / foto 360** no anúncio.
- **Selo de procedência/consulta** exibido no anúncio (Boom tem a consulta; alguns mostram "sem sinistro").
- **Analytics** (quais carros têm mais interesse) — já está na nossa Fase 2.

**O que fazemos MUITO melhor (🟢🟢):** **design autoral e moderno** — esse é o nosso maior diferencial visível pro cliente final. Site da Dicar tem hero editorial, galeria estilo marketplace, FAQ em acordeão, página de veículo polida. **A concorrência não chega perto na estética/UX.** Para uma compra de alto risco (carro), **confiança visual converte**.

**Funcionalidades a adicionar:**
- **Formulário/CTA do site → card no CRM** (captura de lead nativa). 🔴⚙️ **Alta / M.**
- **Vídeo do veículo** (link) + **selo de prova social** (5,0★ Google, "procedência verificada"). **Média / P.**
- **Simulador de financiamento** (já na Fase 2) — calcula parcela estimada e joga pro WhatsApp. **Média / M.**
- **Compartilhar veículo** (link/imagem pronta pra WhatsApp) e **botão "tenho interesse"** que pré-preenche a conversa. **Quick win / P.**
- **SEO local** + **dados estruturados** (já temos schema) — manter e ampliar (avaliações, FAQ rich result).

**Performance:** já enxuto (HTML/CSS/JS estático). Manter Lighthouse alto = vantagem de SEO/conversão sobre os sites pesados dos ERPs. **IA 🤖:** **descrição automática do anúncio** + **busca em linguagem natural** ("SUV automático até 90 mil") — diferencial.

**Impacto cliente:** Alto (mais lead, mais confiança). **Impacto negócio:** **Altíssimo** (é o nosso cartão de visitas e o motivo de fechar venda do *produto*). **Prioridade: ALTA.**

---

## 3. Matriz de funcionalidades

| Funcionalidade | Nosso sistema | A — Autoconf | B — Boom | C — Revenda Mais | Observações |
|---|---|---|---|---|---|
| Gestão de estoque | ✅ (enxuto, foto-capa, destaque auto) | ✅ | ✅ | ✅ | Nosso é mais simples/bonito; deles foca giro/margem |
| **Integrador de anúncios (OLX/Webmotors/iCarros/ML)** | ❌ | ✅ | ✅ | ✅ | **Maior lacuna. Universal no mercado** |
| Site próprio integrado ao estoque | ✅✅ (design autoral) | ✅ (template) | ✅ (template) | ✅ (template) | **Nosso é claramente superior em UX/estética** |
| Vídeo / foto 360 no anúncio | ❌ | parcial | parcial | parcial | AutoCerto/MegAImagens fortes em foto |
| CRM / funil | ✅ (Kanban + lista) | ✅ | ✅ | ✅ | UX nossa boa; falta automação |
| **Lead automático (site/portais → CRM)** | ❌ | ✅ | ✅ | ✅ | Nosso CRM é manual |
| **Follow-up automatizado / gatilhos** | ❌ (só data) | parcial | parcial | ✅ | Syonet/Altimus referência |
| Leads de recompra (aniversário, fim financ.) | ❌ | — | — | ✅ | Diferencial do Revenda Mais |
| Registro de venda guiado | ✅✅ | ✅ | ✅ | ✅ | Nosso fluxo é mais à prova de erro |
| **NF-e** | ❌ | ✅ | ✅ | ✅ (add-on R$250) | Complexo/caro; fora de escopo por ora |
| **Financeiro (caixa, contas, DRE, comissão)** | ❌ (proposital) | ✅ | ✅ | ✅ | Decisão de produto: não virar ERP |
| **Contrato/procuração automáticos** | ❌ | ✅ | ✅ | ✅ | Quick-ish win (PDF template) |
| Assinatura eletrônica | ❌ | parcial | parcial | ✅ (R$50) | Baixa prioridade |
| Consulta veicular (sinistro/débito/leilão) | ❌ | parcial | ✅ | parcial | Integração paga; instâncias maiores |
| Dashboard / indicadores | ✅ (limpo, por papel) | ✅ (denso) | ✅ | ✅ | Nosso mais legível |
| Relatórios comparativos / exportação | ❌ | ✅ | ✅ | ✅ | Adicionar comparativo + PDF |
| App mobile nativo | ❌ (web responsivo) | parcial | parcial | ✅ (app) | Nosso é PWA-able; app é fase futura |
| **IA (descrição de anúncio)** | ❌ | — | — | — | BNDV "SophIA" faz; oportunidade |
| **IA (foto: fundo/360/upscale)** | ❌ | — | — | — | Spyne/MegAImagens/Car Studio (3º) |
| IA (precificação/giro) | ❌ | — | — | — | Auto Avaliar/Indicata (especializados) |
| Permissões por usuário | ✅ (4 chaves simples) | ✅ (matriz) | ✅ | ✅ | Nosso mais amigável |
| Suporte / facilidade de uso | 🟢 simples | 🔴 reclamado | ~ | ~ | Autoconf: reclamações de suporte/onboarding |

---

## 4. Roadmap de melhorias

### ⚡ Quick wins (baixo esforço, valor imediato)
- **Captura de lead do nosso site → card "Novo" no CRM** (o site é nosso; é o atalho mais barato pra fechar a maior lacuna do CRM).
- **Lembrete de follow-up** (destaque no dashboard quando "próximo contato" vence).
- **Botão "tenho interesse" / compartilhar veículo** no site (pré-preenche WhatsApp).
- **Gerar recibo/contrato simples em PDF** a partir da venda.
- **Campo de vídeo (link)** no veículo → exibe no site.
- **Selo de prova social** (5,0★ Google) no anúncio + comparativo "▲ vs. mês anterior" no dashboard.

### 🛠️ Médio prazo
- **Leads de recompra** (aniversário de compra, fim de financiamento) a partir do histórico de vendas.
- **Templates de WhatsApp por etapa** do funil (disparo a partir do card).
- **Simulador de financiamento** no site (parcela estimada → WhatsApp).
- **Comissão por venda** + **giro médio de estoque** no dashboard.
- **Exportar estoque (feed/planilha) pra OLX + Webmotors** — primeira versão do integrador.

### 🎯 Estratégicas
- **Integrador de anúncios completo** (API, sincronização em tempo real, +portais) — *a feature que destrava cobrar mensalidade de qualquer lojista*.
- **Pós-venda automatizado** (agradecimento + pedido de avaliação no Google) ligado ao módulo de Vendas — alimenta a prova social que converte.
- **App/PWA instalável** do painel.

### 💡 Inovadoras (diferenciais competitivos)
- 🤖 **IA que escreve o anúncio** (descrição a partir de marca/modelo/versão/opcionais) — melhor e mais simples que a "SophIA" do BNDV.
- 🤖 **Resumo inteligente do dashboard** em linguagem natural ("vendeu 3, 2 carros parados >60d, sugiro baixar X").
- 🤖 **Busca por linguagem natural** no site ("SUV automático até 90 mil").
- 🤖 **Sugestão de próxima mensagem** de follow-up no CRM.
- 🤖 **Tratamento de foto com IA** (fundo limpo/estúdio) na hora do upload — eleva o padrão visual, que já é nosso forte.

### 🏆 O que pode virar diferencial defensável
1. **O site mais bonito do mercado** + **lead capturado automaticamente** = combinação que nenhum ERP genérico entrega.
2. **Simplicidade com IA embutida** (anúncio, foto, resumo) — "o sistema que pensa por você", sem o peso do ERP.
3. **Pós-venda → avaliação no Google** automatizado — vira máquina de prova social local.

---

## 5. Benchmark — quem é referência em cada módulo

| Módulo | Referência | Por quê |
|---|---|---|
| **Integrador de anúncios** | **BNDV / Loja Conectada / AutoCerto** | Publicam em 20-40+ portais e redes com sincronização em tempo real a partir de 1 cadastro |
| **CRM / lead automation** | **Syonet / Altimus / Followize** | Captura automática dos portais, 200+ filtros, follow-up por gatilho, integração WhatsApp; especialistas em lead |
| **Leads de recompra** | **Revenda Mais** | Gera oportunidade sozinho (aniversário, fim de financiamento) |
| **Financeiro/NF-e/contratos** | **Boom Sistemas / Autoconf** | Fluxo de caixa, DRE, NF-e, consulta veicular, contratos/procurações automáticos |
| **IA de anúncio** | **BNDV (SophIA)** | Escreve texto de anúncio adequado a cada portal |
| **IA de foto** | **Spyne / Car Studio AI / MegAImagens** | Remoção de fundo, estúdio virtual, foto 360, upscaling |
| **IA de precificação/giro** | **Auto Avaliar (Car Invest) / Indicata (Autorola)** | Analisam 600k+ anúncios/dia; classificam por rentabilidade e velocidade de giro |
| **Chatbot/WhatsApp** | **Huggy / SocialHub / Zappy / Globalbot** | Pré-qualificação de lead e 1ª resposta automática (WhatsApp converte ~27%) |
| **Site/UX** | **🟢 Nós (Orion)** | Design autoral; a concorrência usa template genérico |
| **Simplicidade/onboarding** | **🟢 Nós (Orion)** | Incumbentes são complexos e têm suporte reclamado (ex.: Autoconf no Reclame Aqui) |

---

## 6. Priorização — matriz Impacto × Esforço

```
 IMPACTO
  ALTO │  [FAÇA JÁ]                       │ [PROJETOS GRANDES]
       │  • Lead do site → CRM           │ • Integrador de anúncios (API)
       │  • Lembrete de follow-up        │ • Pós-venda → avaliação Google
       │  • Selo prova social no anúncio │ • IA escreve anúncio
       │  • "Tenho interesse"/compartilhar│ • Captura de lead dos portais
       │  • Recibo/contrato PDF          │
  ─────┼─────────────────────────────────┼──────────────────────────────
       │  [TALVEZ / ENCAIXE]             │ [REAVALIAR — alto custo]
  BAIXO│  • Vídeo no anúncio             │ • NF-e
       │  • Comparativo no dashboard     │ • Financeiro completo / DRE
       │  • Templates de WhatsApp        │ • Consulta veicular paga
       │  • Log de auditoria             │ • App nativo
       │  • Comissão por venda           │ • IA de precificação (especialista)
       └─────────────────────────────────┴──────────────────────────────
          BAIXO ESFORÇO                     ALTO ESFORÇO
```

### Ordem ideal de implementação
1. **Lead do site → CRM** + **lembrete de follow-up** (fecha a lacuna nº1 do CRM com esforço baixo, usando que o site é nosso).
2. **Quick wins de conversão no site:** "tenho interesse"/compartilhar, selo de prova social, vídeo.
3. **Recibo/contrato PDF** + **comissão** (entrega valor de "venda" sem virar ERP).
4. **IA do anúncio** (descrição) + **resumo inteligente do dashboard** — diferencial barato, alta percepção de valor.
5. **Export de estoque (feed) → OLX/Webmotors** (1ª versão do integrador) e, depois, **integrador completo** (projeto estratégico).
6. **Pós-venda automatizado → avaliação no Google** (máquina de prova social).
7. **Reavaliar** NF-e / financeiro / app **só sob demanda** de instância específica.

---

## 7. Recados finais (o que NÃO fazer)

- **Não virar ERP.** Financeiro completo, DRE e NF-e são onde os incumbentes são fortes — e onde eles ficam **complexos e reclamados**. Entrar nisso mata o nosso diferencial (simplicidade) e multiplica suporte. Só fazer sob demanda real e paga.
- **"Encheção de linguiça" a evitar:** matriz de 30 permissões, relatórios que ninguém lê, mil campos no cadastro do veículo, app nativo antes de PWA. Nada disso o Carlos (dono da revenda de bairro) usa.
- **Onde dobrar a aposta:** **site lindo + IA simples embutida + WhatsApp/lead automático.** É barato pra nós (o site é nosso), os concorrentes fazem mal, e é exatamente o que o nosso público sente como valor.

---

## Fontes

- [Autoconf — site oficial](https://autoconf.com.br/) · [blog: sistema de gestão](https://autoconf.com.br/blog/melhor-sistema-de-gestao-para-loja-de-carro/) · [Reclame Aqui — Autoconf](https://www.reclameaqui.com.br/empresa/autoconf/) · [reclamação: falta de suporte](https://www.reclameaqui.com.br/autoconf/falta-de-suporte-pos-venda-e-tecnico-da-autoconf-inviabiliza-uso-do-sistema_CG9IKlM8MSlFt4vj/)
- [Boom Sistemas — site oficial](https://boomsistemas.com.br/) · [CRM Boom](https://materiais.boomsistemas.com.br/crm)
- [Revenda Mais — sistema](https://revendamais.com.br/sistema-lojas-de-veiculos/) · [CRM Revenda Mais](https://revendamais.com.br/crm-para-loja-de-carros/) · [Planos e preços](https://revendamais.com.br/planos/) · [app iOS](https://apps.apple.com/br/app/revenda-mais/id1658629770)
- [AutoCerto — sistema](https://autocerto.com/Sistema) · [Integrador Web](https://autocerto.com/IntegradorWeb) · [Site completo](https://autocerto.com/WebSiteCompleto)
- [BNDV — gestão](https://bndv.com.br/sistema-de-gestao) · [IA SophIA](https://blog.bndv.com.br/inteligencia-artificial-do-bndv/) · [chatbot p/ lojas](https://blog.bndv.com.br/chatbot-de-atendimento-para-lojas-de-veiculos-como-vender-mais-e-atender-melhor-usando-tecnologia/) · [RENAVE](https://blog.bndv.com.br/renave-obrigatoriedade-integracao-com-bndv-e-beneficios-para-lojas-de-veiculos/)
- [Altimus — CRM p/ revenda](https://altimus.com.br/crm-para-revenda-de-veiculos/) · [funcionalidades](https://altimus.com.br/funcionalidades-sistema-loja-de-veiculos/) · [integrador](https://altimus.com.br/integrador-de-anuncios-gera-economia-de-tempo-dentro-das-revendas/)
- [Syonet — soluções CRM](https://syonet.com/pt-br/solucoes-crm) · [tratamento de leads](https://blog.syonet.com/como-o-crm-syonet-auxilia-no-tratamento-de-leads-de-sua-concessionaria) · [Followize CRM automotivo](https://followize.com.br/crm-automotivo/)
- Integradores: [Loja Conectada](https://www.lojaconectada.com.br/) · [Integrador de Anúncios (+40 portais)](https://www.integradordeanuncios.com.br/) · [StockCarWeb](https://stockcarweb.com.br/) · [ItCar](https://itcarsistemas.com.br/integrador-de-estoque-para-loja-de-veiculos/)
- IA de foto: [Spyne (fundo de carro)](https://www.spyne.ai/pt/features/car-backgrounding) · [Car Studio AI](https://carstudio.ai/pt/blog/ai-car-photo-editor-apps-cut-days-on-lot-boost-gross) · [MegAImagens (Megadealer)](https://megadealer.com.br/megaimagens-app-ia-estudio-virtual-para-fotos-de-veiculos-carros-motos-e-caminhoes/)
- IA de precificação: [Auto Avaliar — IA desbanca tabela](https://autoavaliar.com.br/release/inteligencia-artificial-desbanca-a-tradicional-tabela-de-precos-no-mercado-automotivo/) · [Motor Show — plataforma de IA p/ preços](https://motorshow.com.br/usados-ganham-plataforma-que-usa-ia-para-ajustar-precos)
- Automação WhatsApp/chatbot: [Huggy](https://blog.huggy.io/chatbot-para-concessionarias-venda-de-autos/) · [SocialHub](https://www.socialhub.pro/blog/chatbot-ia-whatsapp-concessionaria-veiculos/) · [OLX Autos — automação WhatsApp](https://autos.grupoolx.com.br/blog/vendas/automacao-vendas-whatsapp-concessionarias) · [Zappy](https://www.zappy.chat/zappy-automotivo-chatbot-e-inteligencia-artificial-no-whatsapp/)

> **Limitação de evidência:** reviews brasileiros aprofundados (Capterra/G2/Reddit) são escassos para esse nicho; a leitura de "o que o usuário reclama" se apoiou principalmente no Reclame Aqui (Autoconf) e em padrões de mercado. Para uma instância específica, vale validar com 2-3 lojistas reais antes de priorizar o integrador completo.
