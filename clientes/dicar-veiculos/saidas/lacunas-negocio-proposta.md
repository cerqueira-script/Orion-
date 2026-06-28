# Lacunas do negócio — Dicar Veículos (para a proposta)

> Pendências que **dependem do cliente** (dados reais, acessos e contas).
> A Orion executa a parte técnica; estes itens o **Vitor faz/confirma após fechar o negócio**.
> Levantadas na auditoria de presença online (21/06) + pesquisas de SEO (jun/2026).

## 🔴 Prioridade 1 — destravam o SEO local (maior impacto)

1. **Reivindicar o Perfil da Empresa no Google (Google Business Profile)**
   - Hoje está **não reivindicado** ("É proprietário desta empresa?").
   - Sem reivindicar, não dá pra controlar nome/categoria, responder avaliações, publicar posts nem cadastrar o site.
   - Exige conta/autenticação do dono → ação do cliente.

2. **Cadastrar o site oficial no Google Business**
   - O painel mostra "Adicionar website" vazio — **maior lacuna** apontada na busca.
   - Fazer assim que o domínio estiver definido e o site no ar.

3. **Definir UM número de WhatsApp/telefone oficial**
   - Circulam pelo menos 3–4: (91) 98847-5944 (principal, no Google/IG/Receita), (91) 99100-0045 (catálogo/fachada/NaPista) e (91) 98831-0462 (NaPista).
   - O site usa hoje **(91) 98847-5944** (em `assets/js/store.js`). Confirmar e padronizar em todos os canais.

### Google Business — otimização (depois de reivindicar)
Estado atual: categoria principal ok (Revendedora de carros usados), nota **5,0** — mas **5 avaliações antigas** (a mais nova é de jul/2022), **1 só resposta** do dono, **~5 fotos de 2022**, **zero posts**, **sem botão de mensagem**, **sem categorias secundárias**, **sem site**. Ações:
- Ativar **categorias secundárias** conforme os serviços reais — os CNAEs da empresa (locação, estacionamento, intermediação) sugerem "Serviço de financiamento", "Loja de veículos seminovos", "Concessionária".
- Ativar **atributos**: compra/venda/troca/consignação, financiamento disponível, estacionamento, idiomas, área de atendimento (Castanhal + região NE do PA).
- Ligar o **botão de Mensagem** (capta lead direto do perfil).
- **Renovar fotos** (as atuais são de 2022): fachada, interior, estoque atual, equipe, logo — 10+, atualizando sempre. Preencher a categoria "Do proprietário" (vazia).
- **Posts** regulares (ofertas, novidades de estoque) — hoje zero.
- **Avaliações**: pedir a clientes recentes (só há 5, antigas) e **responder todas**, inclusive as antigas. Volume e recência pesam muito no ranqueamento local.

## 🟡 Prioridade 2 — consistência de NAP (Nome-Endereço-Telefone)

> **NAP CANÔNICO recomendado** (baseado no registro oficial da Receita — *confirmar com o Dirceu antes de fixar*):
> - **Nome:** Dicar Veículos
> - **Endereço:** Av. Presidente Getúlio Vargas, 1852 – **Cristo Redentor**, Castanhal/PA
> - **CEP:** **68741-000**
> - **Telefone principal:** (91) 98847-5944 · **WhatsApp/vendas secundário:** (91) 99100-0045 (aposentar o (91) 98831-0462 se não usado)
>
> Padronizar **exatamente assim** em TODOS os canais.

4. **Corrigir bairro e CEP** (divergem entre fontes):
   - **Bairro:** Google diz "Centro"; Receita + NaPista dizem **"Cristo Redentor"** → o oficial é **Cristo Redentor**.
   - **CEP:** Google/site usam 68740-005; Receita usa **68741-000** → o oficial é **68741-000**.
   - 🔧 *No site, ao confirmar:* atualizar `assets/js/store.js` (config `cep`/`endereco`), o `postalCode` do schema `AutoDealer` (hoje 68740-005) e **adicionar o bairro** ao `streetAddress`. Hoje o site **não bate** com a Receita.

5. **Confirmar o horário de sábado** — Google mostra **Sáb 07:30–12:00**; nosso site/config tem **Sáb 08:00–13:00**.
   - Alinhar os dois ao horário real (ajustar `store.js` config `horario` + `openingHoursSpecification` do schema).

6. **Padronizar o nome da marca** — oscila "Dicar Veiculos" (sem acento, Google/IG) × "Dicar Veículos" (com acento, Facebook).
   - No **Google Business**, usar o nome legal **"Dicar Veículos"** (com acento). ⚠️ **Não** forçar "Castanhal" dentro do nome — o Google penaliza keyword stuffing; a cidade já vem do endereço. *(No site já usamos `alternateName: "Dicar Veículos Castanhal"` no schema, que é o jeito certo de ancorar a cidade.)*

7. **Confirmar a propriedade da página de Facebook** (`facebook.com/p/Dicar-Veículos-61555500411060`, perfil `dicar_veiculos_pa`)
   - A página marca localização em **"Salinas/PA"** (errado) e antes aparecia "Cidade Nova" → dúvida se é do cliente ou ligada à Dicar Manaus.
   - Se for do cliente: corrigir a localização pra **Castanhal** + endereço completo, reativar (último post ago/2024). **Só depois** adicionamos ao `sameAs` do site.

8. **Reclassificar no acheioprofissional** — a loja está listada como **"Mecânico"**; pedir mudança pra **"Revendedora de carros usados"**.

9. **NaPista** — padronizar os telefones pro conjunto canônico (hoje mostra (91) 99100-0045 e (91) 98831-0462) e adicionar CEP.

## 🟢 Prioridade 3 — presença e prova social

10. **Marketplaces — maior oportunidade de aquisição.** A loja **não está** em OLX, Webmotors, iCarros nem Mobiauto — só no NaPista (3 ofertas). Os concorrentes de Castanhal estão (ex.: **79–87 ofertas no Webmotors** na cidade). Cadastrar o estoque nos 4, com o NAP canônico **idêntico**.
11. **Instagram** inativo desde dez/2023 e **Facebook** desde ago/2024 — reativar com publicações citando Castanhal/bairro/região (dilui a Dicar Manaus no termo amplo).
12. **Depoimentos reais** — os 3 do site são fictícios; substituir por avaliações reais (e responder as 5 do Google).
13. **Fotos profissionais** — mais fotos da loja e dos veículos (qualidade atual é razoável; logo aparece em versões diferentes, sem manual de marca).
14. **Domínio próprio** — definir (o site usa `dicarveiculos.com.br` como **placeholder**; trocar ao publicar).

## 🔵 LGPD — confirmar com o cliente (o site já está em conformidade técnica)
- **E-mail oficial de privacidade** — a Política de Privacidade usa `contato@dicarveiculos.com.br` como placeholder. Definir o e-mail real pra titulares exercerem direitos.
- **Encarregado (DPO)** — indicar a pessoa responsável (pode ser o próprio Dirceu) e incluir o nome na política.
- **IDs de anúncio** — quando ativar campanhas, é só colar os IDs em **Configurações › Anúncios** no painel (GTM, GA4, Meta Pixel, Google Ads). O site passa a rastrear na hora, **sem novo deploy**, e só após o visitante aceitar os cookies.
- *(Já entregue pela Orion: banner de consentimento, Política de Privacidade, link no rodapé, campo de consentimento + data no cadastro de cliente, aba de Anúncios no painel e eventos de conversão no site — `ver_veiculo`, `contato_whatsapp`, `simular_financiamento`, `avaliar_veiculo` — prontos pro gestor mapear no GTM/Pixel/Ads.)*

## ⚠️ Risco de marca (monitorar)
- A **"Dicar Multimarcas / Dicar Manaus" (@dicarmanaus, DDD 92)** polui o termo puro "Dicar Veículos" e tem um **ReclameAqui** que aparece em "Dicar Veículos Pará".
- Defesa: NAP consistente + DDD 91 + "Castanhal" sempre junto ao nome + `sameAs` correto + conteúdo geolocalizado. (A boa notícia: o Google **já distingue** as duas geograficamente.)

---
*Observação: o site já entrega o que dá no nosso lado — schema completo, páginas de SEO, NAP no rodapé. Os itens acima são os que dependem do cliente pra fechar o ciclo.*
