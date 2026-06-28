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
2. No SQL Editor, rodar o schema pronto (**v3**): **`produtos/sistema-revenda/db/schema.sql`**.
   Cria `perfis`, `config_loja`, `permissoes`, `veiculos`, `clientes`, `vendas`, `eventos` + RLS + seed.
3. Criar o 1º usuário admin no **Supabase Auth** (e-mail + senha) e inserir o perfil correspondente,
   **com o `usuario`** (é o "login" que o app usa internamente p/ vendedor):
   `insert into perfis (id, usuario, nome, papel) values ('<auth-uid>', 'dirceu', 'Dono', 'admin');`
4. Criar um **bucket público `fotos`** no Storage (o `store.supabase.js` sobe as fotos lá e salva a URL).

### 3. Trocar o store.js  →  store.supabase.js (cache-facade)
A versão de produção **já está escrita**: `assets/js/store.supabase.js`. Ela é um **cache-facade**:
no boot, `Store.init()` busca tudo do Supabase pra um cache em memória; a API pública segue
**síncrona** (lendo do cache), então `painel.js`/`site.js` quase não mudam; as escritas atualizam
o cache na hora e persistem no banco em 2º plano. A API foi conferida: **mesma superfície do demo**
(59 métodos) + `init/ready/onError/uploadFoto`.

Pra ligar:
1. Incluir o supabase-js **antes** do store nas páginas:
   `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`
2. Preencher `SUPABASE_URL` e `SUPABASE_ANON_KEY` no topo do `store.supabase.js`.
3. Trocar o `<script>` das páginas: `store.js` → `store.supabase.js`.
4. **Bootstrap assíncrono** (pequena mudança no site.js/painel.js): renderizar **dentro** de
   `Store.init().then(...)`.
5. **Login vira assíncrono e por e-mail** (Supabase Auth): `Store.login(email, senha).then(sess => ...)`
   — ajustar o form do painel ("Usuário" → "E-mail") e o handler de submit.
6. **Fotos** → o modal de veículo passa a usar `Store.uploadFoto(file)` (async) e salvar a URL.

A regra de **destaque automático/máx. 3** e **toda venda vincula veículo+cliente** continua na app
(dentro do `store.supabase.js`), persistindo os registros afetados.

> ⚠️ O `store.supabase.js` foi escrito mas **ainda não foi testado** com um banco real. No 1º teste,
> conferir: mapeamento vendedor(usuario)↔perfil(uuid), numeração de vendas, e nomes de campos internos.

### 4. Publicar
Subir a pasta `site/` no Netlify/Vercel (arrastar e soltar ou conectar o GitHub) e apontar o domínio.

### 5. Proteger o painel
- Trocar as senhas demo, ativar **RLS** (já vem no `schema.sql` — cada papel só faz o que pode).
- `painel/` protegido por login real (Supabase Auth).

## Reaproveitar pra outros clientes
Esta estrutura é o **modelo de sistema de revenda da Orion** (`produtos/sistema-revenda/`). Pro próximo cliente:
copiar a pasta, trocar cores/logo/textos e o seed, rodar o `schema.sql` num Supabase novo — e repetir os passos.
