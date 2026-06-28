-- =====================================================================
-- Sistema de Revenda — Orion
-- Schema do banco (Postgres / Supabase) — v3
-- ---------------------------------------------------------------------
-- Um banco POR CLIENTE (dados isolados). Rode este arquivo inteiro
-- no SQL Editor do projeto Supabase do cliente. A camada de dados do
-- painel (assets/js/store.js) espelha exatamente estas tabelas.
--
-- v2 (jun/2026): sem módulo financeiro de lucro/margem. Foco em estoque,
-- clientes (CRM) e vendas. "leads" virou "clientes" (+cidade). Vendas com
-- número sequencial e status. Veículo ganhou placa e observações internas.
--
-- v3 (jun/2026 — remodelagem Plataforma Orion): config ganhou jsonb p/ ads
-- (medição), redes (sociais) e negocio (NAP estruturado p/ schema). Veículo
-- ganhou FIPE (codigo/valor). Nova tabela `eventos` (desempenho digital
-- first-party, gravada pelo site). Políticas de captura de lead pelo site
-- (anon) preparadas p/ a Fase 3.
--
-- Convenções:
--   * preços em REAIS (numeric, 2 casas).
--   * dados internos (consignante, placa, obs) ficam em colunas próprias
--     e protegidos por RLS — o site público nunca os lê.
-- =====================================================================

-- Extensão p/ uuid
create extension if not exists "pgcrypto";

-- =====================================================================
-- 1. PERFIS / ACESSO
-- Auth real = Supabase Auth (auth.users). Esta tabela estende com o
-- papel e o nome de exibição. id referencia auth.users(id).
-- =====================================================================
create table if not exists perfis (
  id          uuid primary key references auth.users(id) on delete cascade,
  usuario     text unique,                  -- "nome de usuário" do app (cliente.vendedor = usuario)
  nome        text not null,
  papel       text not null default 'funcionario'
                check (papel in ('admin','funcionario')),
  ativo       boolean not null default true,
  criado_em   timestamptz not null default now()
);

-- =====================================================================
-- 2. CONFIG DA LOJA  (linha única — marca, contatos)
-- =====================================================================
create table if not exists config_loja (
  id                int primary key default 1 check (id = 1),
  nome_loja         text,
  slogan            text,
  whatsapp          text,         -- só números, com 55 + DDD
  telefone_exibicao text,
  endereco          text,
  cep               text,
  horario           text,
  instagram         text,
  mapa              text,
  ads               jsonb not null default '{}'::jsonb,   -- GTM/GA4/Meta Pixel/Google Ads (painel › Conexões)
  redes             jsonb not null default '{}'::jsonb,   -- facebook/youtube/tiktok/linkedin
  negocio           jsonb not null default '{}'::jsonb,   -- NAP estruturado p/ schema (endereço, horários, areaServed, rating)
  atualizado_em     timestamptz not null default now()
);

-- =====================================================================
-- 3. PERMISSÕES  (o que o papel "funcionario" pode ver/fazer)
-- Linha única; o dono liga/desliga pelo painel. Admin ignora tudo isto.
-- =====================================================================
create table if not exists permissoes (
  id                  int primary key default 1 check (id = 1),
  editar_preco        boolean not null default false,
  ver_consignante     boolean not null default false,
  registrar_venda     boolean not null default true,
  gerenciar_clientes  boolean not null default true,
  atualizado_em       timestamptz not null default now()
);

-- =====================================================================
-- 4. VEÍCULOS  (públicos + internos na mesma linha)
-- =====================================================================
create table if not exists veiculos (
  id            uuid primary key default gen_random_uuid(),

  -- ----- públicos (vão pro site) -----
  tipo          text,                       -- Hatch, SUV, Sedã, Picape...
  marca         text not null,
  modelo        text not null,
  versao        text,
  ano           int,
  km            int default 0,
  preco         numeric(12,2) not null,     -- preço anunciado
  cambio        text,
  combustivel   text,
  cor           text,
  portas        int,
  codigo_fipe   text,                        -- referência FIPE (padroniza dados / feed de marketplaces)
  valor_fipe    numeric(12,2),               -- valor de referência FIPE
  descricao     text,
  fotos         jsonb not null default '[]', -- urls (Storage) ou data-uri na demo
  destaque      boolean not null default false,  -- no máx. 3 (regra na app)
  status        text not null default 'disponivel'
                  check (status in ('disponivel','negociando','vendido')),

  -- ----- internos (NUNCA vão pro site) -----
  origem            text not null default 'proprio'
                      check (origem in ('proprio','consignado')),
  consignante_nome  text,                   -- se consignado
  consignante_tel   text,
  placa             text,
  doc_status        text not null default 'ok'
                      check (doc_status in ('ok','pendente')),
  data_entrada      date not null default current_date,  -- alimenta "parados"
  obs_internas      text,                   -- anotações só do painel

  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists idx_veiculos_status on veiculos(status);
create index if not exists idx_veiculos_destaque on veiculos(destaque);

-- =====================================================================
-- 5. CLIENTES  (mini-CRM, registro manual)
-- =====================================================================
create table if not exists clientes (
  id              uuid primary key default gen_random_uuid(),
  nome            text not null,
  telefone        text,
  cidade          text,
  veiculo_id      uuid references veiculos(id) on delete set null,
  interesse       text,                     -- texto livre se não for veículo do estoque
  origem          text,                     -- WhatsApp, telefone, loja, instagram, site...
  vendedor_id     uuid references perfis(id) on delete set null,
  observacoes     text,
  consent         boolean not null default false,   -- LGPD: consentimento de contato
  consent_em      timestamptz,                       -- data do consentimento
  proximo_contato date,
  etapa           text not null default 'novo'
                    check (etapa in ('novo','atendimento','negociando','fechado','perdido')),
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now()
);

create index if not exists idx_clientes_etapa on clientes(etapa);
create index if not exists idx_clientes_vendedor on clientes(vendedor_id);

-- =====================================================================
-- 6. VENDAS  (gerada ao confirmar a venda — sempre vincula veículo + cliente)
-- =====================================================================
create sequence if not exists vendas_numero_seq;

create table if not exists vendas (
  id              uuid primary key default gen_random_uuid(),
  numero          int not null default nextval('vendas_numero_seq'),  -- #0001, #0002...
  veiculo_id      uuid not null references veiculos(id) on delete cascade,
  veiculo_nome    text,                                 -- snapshot do nome no momento da venda
  cliente_id      uuid references clientes(id) on delete set null,
  comprador_nome  text,
  comprador_tel   text,
  cidade          text,
  vendedor_id     uuid references perfis(id) on delete set null,
  valor_final     numeric(12,2) not null,
  status          text not null default 'Concluída'
                    check (status in ('Concluída','Cancelada')),
  data_venda      date not null default current_date,
  criado_em       timestamptz not null default now()
);

create index if not exists idx_vendas_data on vendas(data_venda);
create index if not exists idx_vendas_numero on vendas(numero);

-- =====================================================================
-- 6.1 EVENTOS  (desempenho digital — first-party, sem PII)
-- Gravados pelo SITE público (ver veículo, clique no WhatsApp, simular).
-- Alimentam o dashboard "desempenho digital". Stream append-only.
-- =====================================================================
create table if not exists eventos (
  id          uuid primary key default gen_random_uuid(),
  acao        text not null
                check (acao in ('ver_veiculo','contato_whatsapp','simular_financiamento','avaliar_veiculo')),
  veiculo_id  uuid references veiculos(id) on delete set null,
  pagina      text,
  criado_em   timestamptz not null default now()
);
create index if not exists idx_eventos_acao on eventos(acao);
create index if not exists idx_eventos_data on eventos(criado_em);

-- =====================================================================
-- 7. RLS (Row Level Security)
-- ---------------------------------------------------------------------
-- Princípio: o site PÚBLICO usa a chave anon e só pode LER veículos
-- disponíveis/negociando e a config — e só as colunas públicas (a app
-- seleciona colunas públicas; nunca consignante/placa/obs).
-- O painel usa usuário autenticado; admin x funcionario filtrado na app
-- conforme a tabela `permissoes`.
-- =====================================================================
alter table perfis      enable row level security;
alter table config_loja enable row level security;
alter table permissoes  enable row level security;
alter table veiculos    enable row level security;
alter table clientes    enable row level security;
alter table vendas      enable row level security;
alter table eventos     enable row level security;

-- helper: usuário logado é admin?
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfis where id = auth.uid() and papel = 'admin' and ativo);
$$;

-- helper: está autenticado e ativo (qualquer papel)?
create or replace function is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfis where id = auth.uid() and ativo);
$$;

-- ---- PERFIS ----
create policy perfis_self_read   on perfis for select using (auth.uid() = id or is_admin());
create policy perfis_admin_write on perfis for all    using (is_admin()) with check (is_admin());

-- ---- CONFIG ---- (todos leem; só admin grava)
create policy config_read        on config_loja for select using (true);
create policy config_admin_write on config_loja for all   using (is_admin()) with check (is_admin());

-- ---- PERMISSÕES ---- (staff lê p/ saber o que pode; só admin grava)
create policy perm_staff_read   on permissoes for select using (is_staff());
create policy perm_admin_write  on permissoes for all    using (is_admin()) with check (is_admin());

-- ---- VEÍCULOS ----
-- público: só linhas visíveis no site (a app seleciona colunas públicas)
create policy veiculos_public_read on veiculos for select
  using (status in ('disponivel','negociando') or is_staff());
-- staff cria/edita; admin sempre; funcionário conforme app (preço travado na UI)
create policy veiculos_staff_write on veiculos for all
  using (is_staff()) with check (is_staff());

-- ---- CLIENTES ---- (staff)
create policy clientes_staff_all on clientes for all using (is_staff()) with check (is_staff());

-- ---- VENDAS ---- (staff)
create policy vendas_staff_all on vendas for all using (is_staff()) with check (is_staff());

-- ---- EVENTOS ---- (site público insere; staff lê p/ o dashboard)
-- o check restringe às ações conhecidas (limita abuso da chave anon)
create policy eventos_public_insert on eventos for insert
  with check (acao in ('ver_veiculo','contato_whatsapp','simular_financiamento','avaliar_veiculo'));
create policy eventos_staff_read on eventos for select using (is_staff());

-- =====================================================================
-- 7.1 FASE 3 — captura de lead pelo site público (chave anon)
-- ---------------------------------------------------------------------
-- Permite ao site CRIAR um lead "novo" (origem 'Site', sem vendedor) sem
-- poder LER nem editar a base de clientes. Descomente ao ligar a captura.
-- =====================================================================
-- create policy clientes_site_insert on clientes for insert
--   with check ( etapa = 'novo' and origem = 'Site' and vendedor_id is null );

-- =====================================================================
-- 8. SEED — linhas únicas de config/permissões
-- (rode uma vez; ajuste a marca pelo painel depois)
-- =====================================================================
insert into config_loja (id, nome_loja, slogan)
  values (1, 'Minha Revenda', 'Compra · Venda · Troca · Financia')
  on conflict (id) do nothing;

insert into permissoes (id) values (1) on conflict (id) do nothing;

-- =====================================================================
-- FIM. Próximo: criar o 1º usuário admin no Supabase Auth e inserir o
-- perfil correspondente:
--   insert into perfis (id, nome, papel) values ('<auth-uid>', 'Dono', 'admin');
-- =====================================================================
