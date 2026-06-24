# Colocar no ar (produção) — Dicar Veículos

Roteiro pra quando o cliente fechar. Tudo em camada gratuita.

## Visão geral

| Peça | Ferramenta | Custo |
|---|---|---|
| Banco de dados + login + fotos | **Supabase** | Grátis (plano free) |
| Hospedagem do site | **Netlify** ou **Vercel** | Grátis |
| Domínio | Registro.br (ex.: `dicarveiculos.com.br`) | ~R$ 40/ano |

## Passo a passo

### 1. Domínio
Registrar `dicarveiculos.com.br` no Registro.br.

### 2. Supabase (banco)
1. Criar projeto grátis em supabase.com.
2. No SQL Editor, rodar o schema pronto: **`produtos/sistema-revenda/db/schema.sql`**.
   Ele cria tudo: `perfis`, `config_loja`, `permissoes`, `veiculos`, `clientes`, `vendas` + RLS + seed.
3. Criar o 1º usuário admin no **Supabase Auth** e inserir o perfil correspondente
   (`insert into perfis (id, nome, papel) values ('<auth-uid>', 'Dono', 'admin');`).
4. Usar o **Supabase Storage** pra guardar as fotos dos veículos (salvar as URLs no campo `fotos`,
   na ordem escolhida — a 1ª é a capa).

### 3. Trocar o store.js
O site e o painel inteiros leem/escrevem por `assets/js/store.js`. **Só esse arquivo muda** — as páginas
(`index.html`, `estoque.html`, `veiculo.html`, `admin/`) não mudam. Mapear cada método pras tabelas:
- `getVehicles / getPublicVehicles / getVehicle / saveVehicle / deleteVehicle` → tabela `veiculos`
- `getClientes / getCliente / saveCliente / deleteCliente / setClienteEtapa` → tabela `clientes`
- `registrarVenda / getVendas / cancelarVenda / relatorio` → tabela `vendas`
- `getConfig / saveConfig` → `config_loja`
- `getPerms / savePerms` → `permissoes`
- `login / logout / session` + `getUsers / saveUser / deleteUser` → **Supabase Auth** + `perfis`
- fotos → upload no Storage; salvar as URLs (na ordem) no campo `fotos`
- a regra de **destaque automático/máx. 3** e **toda venda vincula veículo+cliente** pode virar
  função/trigger no banco ou continuar na app (hoje vive no `store.js`).

### 4. Publicar
Subir a pasta `site/` no Netlify/Vercel (arrastar e soltar ou conectar o GitHub) e apontar o domínio.

### 5. Proteger o painel
- Trocar as senhas demo, ativar **RLS** (já vem no `schema.sql` — cada papel só faz o que pode).
- `admin/` protegido por login real (Supabase Auth).

## Reaproveitar pra outros clientes
Esta estrutura é o **modelo de sistema de revenda da Orion** (`produtos/sistema-revenda/`). Pro próximo cliente:
copiar a pasta, trocar cores/logo/textos e o seed, rodar o `schema.sql` num Supabase novo — e repetir os passos.
