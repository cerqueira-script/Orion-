# Estratégia

## Fase

Estruturação — transformar o que a Orion entrega em oferta clara e processo definido.

## Prioridade principal

Clareza de oferta: criar uma proposta que o dono do negócio entenda em segundos e enxergue direto os resultados (mais clientes, mais vendas). Sem essa clareza, cada conversa de venda começa do zero.

## Foco atual (jun/2026) — virada de posicionamento

A Orion é a **Plataforma de implantação de presença digital** (núcleo horizontal, serve qualquer segmento). Posicionamento completo em [`posicionamento.md`](posicionamento.md).

**O "Sistema de Revenda" é a 1ª adaptação desse núcleo, não o produto-fim.** A plataforma gerencia **presença digital** (conteúdo do site, **catálogo**, leads, integrações), não operação/ERP. O que muda de um negócio pro outro é **como o produto é cadastrado pra subir no catálogo do site** — carro tem marca/modelo/ano/km; sofá tem material/medidas/tecido. O "estoque" da revenda é, na prática, o **catálogo que alimenta o site**.

**Próximo movimento: remodelar o sistema** pra separar o **núcleo (Plataforma Orion)** do **cadastro do catálogo por segmento**, de forma que adaptar pra um novo modelo de negócio seja trocar/configurar o catálogo — não reescrever tudo. Funções de gestão pesada (financeiro, ERP) ficam fora; quando o cliente precisar, **integra** no que ele já usa.

Molde atual em `produtos/sistema-revenda/` (spec em `sistema-spec.md`); cada cliente = instância (cópia + Supabase próprio).

**Primeira instância: Dicar Veículos** (Castanhal/PA). Site e painel (v1) prontos, rodando em demo (localStorage). Falta instanciar no Supabase (banco + auth + storage) e publicar. A Dicar valida o modelo e vira a vitrine.

## O que pode esperar

Expansão de canais, novos serviços, escala — tudo que depende de ter a oferta e o processo de onboarding rodando primeiro.

## Contexto com prazo

**Pra tirar das costas:** Ter que explicar tudo do zero para cada novo cliente porque ainda não existe um processo claro de onboarding e uma oferta bem definida.
→ Candidato direto para skill via `/mapear-rotinas`.
