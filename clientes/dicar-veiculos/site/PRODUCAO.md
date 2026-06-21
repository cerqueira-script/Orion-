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
2. Criar tabela `veiculos` com as mesmas colunas do seed em `assets/js/store.js`
   (id, marca, modelo, versao, ano, km, preco, cambio, combustivel, cor, portas, destaque, status, descricao, fotos).
3. Criar tabela `config` (1 linha) e usar o **Supabase Auth** para os logins (admin/funcionário),
   com uma coluna `role` no perfil pra separar os dois níveis.
4. Usar o **Supabase Storage** pra guardar as fotos dos carros.

### 3. Trocar o store.js
O site inteiro lê/escreve por `assets/js/store.js`. Só esse arquivo muda:
- `getVehicles / getVehicle / saveVehicle / deleteVehicle` → consultas na tabela `veiculos`
- `getConfig / saveConfig` → tabela `config`
- `login / logout / session` → Supabase Auth
- `getUsers / saveUser / deleteUser` → gestão de usuários (admin)
- fotos → upload no Storage; salvar as URLs no campo `fotos`

As páginas (`index.html`, `estoque.html`, `veiculo.html`, `admin/`) **não mudam**.

### 4. Publicar
Subir a pasta `site/` no Netlify/Vercel (arrastar e soltar ou conectar o GitHub) e apontar o domínio.

### 5. Proteger o painel
- Trocar senhas, ativar RLS no Supabase (cada papel só faz o que pode).
- `admin/` protegido por login real (Supabase Auth).

## Reaproveitar pra outros clientes
Esta estrutura é o **modelo de site de revenda da Orion**. Pro próximo cliente:
copiar a pasta `site/`, trocar cores/logo/textos e o seed — e repetir os passos acima.
