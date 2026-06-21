# Clientes

Cada cliente da Orion tem a própria pasta aqui dentro, com contexto isolado.

Quando o trabalho é para um cliente específico, o Claude usa **só o contexto daquele cliente** (o negócio dele, o público dele, o tom de voz da marca dele) — não a estratégia interna da Orion.

## Estrutura de cada cliente

```
clientes/<nome-do-cliente>/
  CLAUDE.md      → faz o Claude entrar no "modo" desse cliente
  contexto.md    → tudo sobre o negócio do cliente (fonte de verdade)
  marketing/     → conteúdo, posts, carrosséis, SEO
  saidas/        → propostas, emails, relatórios
  dados/         → arquivos do cliente
  identidade/    → identidade visual própria (se tiver)
```

## Criar um cliente novo

Copiar a pasta `_template/` e renomear para o nome do cliente (kebab-case, ex.: `clinica-sorriso`). Depois preencher o `contexto.md`.

## Como falar com o Claude

Basta dizer que é para um cliente:

> "Isso é pro cliente Clínica Sorriso"
> "Faz um carrossel pra padaria do João"

O Claude busca a pasta do cliente, carrega o contexto dele e trabalha dentro da pasta dele.
