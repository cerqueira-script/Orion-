# Checklist do site de R$ 10 mil

> Padrão de qualidade da Orion pra qualquer site/landing. As 8 coisas que separam um site
> de R$ 10 mil de um de R$ 200 (fonte: Metics Media — Field Guide nº 01, Claude Code Era).
> Antes de entregar um site, ele tem que passar nesses 8 pontos.

## 01 · Ponto de vista, não template
O site assume uma direção de design específica (brutalist, editorial, dark-luxury, retro-modern…) e executa sem hesitar. Site de R$ 200 é genérico. Site de R$ 10 mil tem **gosto**.

## 02 · Tipografia que trabalha
Par de fontes display + corpo — **nenhuma das duas Inter ou Roboto**. Escala e peso carregam a hierarquia. Os títulos parecem escolhidos, não default. *(Usar `ui-ux-pro-max` → `typography.csv` / `google-fonts.csv` pra escolher o par.)*

## 03 · Sistema de cor contido
Três a cinco cores, usadas com consistência. Sem paleta arco-íris. O premium vem da **contenção**, não da decoração. *(Usar `ui-ux-pro-max` → `colors.csv`.)*

## 04 · Hierarquia que respira
Whitespace, escala e contraste dizem pro olho onde olhar, sem esforço. A página tem primário, secundário, terciário claros — nada de parede plana de conteúdo.

## 05 · Imagem com intenção
Nada de Unsplash batido. Ou foto própria, ou assets gerados que combinam com a direção de arte, ou curadoria tão apertada que as imagens parecem encomendadas.

## 06 · Movimento que sussurra
Micro-interações e comportamento de scroll parecem feitos à mão — não "AOS fade-up" genérico. A régua: um designer aprovaria com a cabeça, não reviraria os olhos. *(Cuidado: animação demais dá cara de IA — ver `frontend-design`.)*

## 07 · Mobile desenhado, não espremido
As decisões de layout pro celular são **diferentes** do desktop, não o desktop comprimido. É aqui que 90% dos sites baratos desmoronam.

## 08 · O caro invisível
Carregamento sub-2s, contraste WCAG AA, navegação por teclado, HTML semântico, meta tags de verdade. O visitante não vê direto, mas **sente** que "esse site é rápido e funciona" — a diferença sentida entre caro e barato. *(Usar `ui-ux-pro-max` → `ux-guidelines.csv`.)*

---

**Como usar na prática:** `frontend-design` define a direção autoral (pontos 01, 04, 06) · `ui-ux-pro-max` fornece os dados concretos (02 fontes, 03 cores, 08 UX) · este checklist é a **conferência final** antes de entregar.
