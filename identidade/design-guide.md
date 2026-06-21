# Identidade visual — Orion

> Como a marca aparece em tudo que o MazyOS gera.
> As skills de conteúdo, carrossel, post e propostas leem esse arquivo antes de criar qualquer visual.
> Edite quando a marca evoluir.

**Conceito:** Órion é a constelação que guia. A marca é **clara, editorial e serena** — autoridade pela sobriedade, não pelo exagero. Muito respiro, tipografia grande, um detalhe dourado de estrela como assinatura.

---

## Cores

- **Fundo principal:** `#FAF8F4` (off-white quente)
- **Cor de destaque / CTA:** `#1D3A6E` (azul profundo) — hover/escuro: `#142A52`
- **Texto principal:** `#1A2332` (grafite azulado)
- **Texto secundário:** `#5A6572` (cinza)
- **Fundo alternativo / cards:** `#FFFFFF`
- **Estrela / assinatura (uso mínimo):** `#C99A2E` (dourado/âmbar) — só em detalhes: ✦, pontos de constelação, fios finos
- **Linhas / bordas:** `#E6E1D7`
- **Cor proibida:** vermelho saturado, neon, gradientes berrantes. Nada que tire a calma editorial.

---

## Tipografia

- **Títulos e destaques:** `Fraunces` (serif editorial). Fallback: `Georgia, serif`
- **Corpo, subtítulos e botões:** `Inter`. Fallback: `system-ui, -apple-system, sans-serif`
- **Peso do título:** forte (600–700), tamanhos grandes, entrelinha curta

```
@import: Fraunces (wght 400..700, opsz) + Inter (wght 400..700) via Google Fonts
```

---

## Estilo geral

Editorial e espaçado. Whitespace generoso, seções separadas por fios finos (`#E6E1D7`), títulos serifados grandes contrastando com corpo Inter limpo. Calmo, profissional, confiante. O dourado aparece em doses mínimas (uma estrela, um número de seção) — nunca em bloco.

---

## Elementos-chave

- **Bordas:** 1px `#E6E1D7`
- **Border-radius dos cards:** 14–16px
- **Botões:** fundo azul profundo, texto branco, radius 8px, padding generoso (14px 28px), peso 600, sem sombra pesada
- **Sombras:** muito sutis — `0 1px 3px rgba(26,35,50,.06)`, `0 8px 30px rgba(26,35,50,.08)` em cards de destaque

---

## O que NUNCA fazer

- Fundo escuro como base (a marca é clara)
- Mais de um tom de destaque competindo com o azul
- Dourado em área grande (só detalhe)
- Tipografia condensada ou pesada demais; emojis no lugar de ícones em material formal
- Promessa exagerada ou visual "de guru"

---

## Logo

- **Wordmark:** `✦ ORION` — "ORION" em Fraunces, caixa alta, letterspacing largo; estrela ✦ dourada antes do nome.
- **Arquivo:** *(ainda não vetorizado — por ora o wordmark em CSS é a marca)*
- **Versão pra fundo escuro:** texto off-white + estrela dourada
- **Onde usar:** header de propostas e sites, slide de capa e CTA de apresentações, último slide do carrossel
- **Tamanho sugerido:** largura entre 120–200px nos HTMLs

---

## Observações adicionais

Assinatura visual recorrente: a **estrela de 4 pontas (✦)** e, quando couber, três pontos ligados por fio fino (alusão ao cinturão de Órion) como divisor de seção.
