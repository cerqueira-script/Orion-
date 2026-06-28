/* DICAR VEÍCULOS — site "Editorial Showroom" */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Ícones SVG (silhuetas por tipo) — substituem emojis */
  var ICON = {
    hatch: '<svg viewBox="0 0 64 36" fill="currentColor" aria-hidden="true"><path d="M5 27v-9a3 3 0 0 1 3-3h7l6-7h10l13 12h4a3 3 0 0 1 3 3v4h-4a7 7 0 0 0-14 0H25a7 7 0 0 0-14 0H5z"/><circle cx="18" cy="28" r="4.6"/><circle cx="46" cy="28" r="4.6"/></svg>',
    suv: '<svg viewBox="0 0 64 36" fill="currentColor" aria-hidden="true"><path d="M4 27V15a3 3 0 0 1 3-3h7l4-5h18l4 5h7a3 3 0 0 1 3 3v12h-4a7 7 0 0 0-14 0H25a7 7 0 0 0-14 0H4z"/><circle cx="18" cy="28" r="4.6"/><circle cx="46" cy="28" r="4.6"/></svg>',
    sedan: '<svg viewBox="0 0 64 36" fill="currentColor" aria-hidden="true"><path d="M5 27v-9a3 3 0 0 1 3-3h7l6-7h14l9 12h4a3 3 0 0 1 3 3v4h-4a7 7 0 0 0-14 0H25a7 7 0 0 0-14 0H5z"/><circle cx="18" cy="28" r="4.6"/><circle cx="46" cy="28" r="4.6"/></svg>',
    picape: '<svg viewBox="0 0 64 36" fill="currentColor" aria-hidden="true"><path d="M4 27V15a3 3 0 0 1 3-3h7l4-5h18l4 5h7a3 3 0 0 1 3 3v12h-4a7 7 0 0 0-14 0H25a7 7 0 0 0-14 0H4z"/><circle cx="18" cy="28" r="4.6"/><circle cx="46" cy="28" r="4.6"/></svg>',
    auto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    todos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>'
  };

  /* Ícones das specs do card (ano, km, câmbio, combustível) */
  var SPEC = {
    ano: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></svg>',
    km: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 19a8 8 0 1 1 15 0"/><path d="M12 19l3.5-4.5"/></svg>',
    cambio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 5.5v13M18 5.5v6a3.5 3.5 0 0 1-3.5 3.5H6M12 5.5v6"/><circle cx="6" cy="5.5" r="1.7"/><circle cx="18" cy="5.5" r="1.7"/><circle cx="6" cy="18.5" r="1.7"/></svg>',
    fuel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3s5 5.5 5 9a5 5 0 0 1-10 0c0-3.5 5-9 5-9z"/></svg>'
  };

  /* Logo do WhatsApp (dimensionado em em -> escala com a fonte de cada botão) */
  var WA_ICO = '<svg class="wa-ico" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16 3C9 3 3.5 8.5 3.5 15.5c0 2.3.6 4.5 1.8 6.4L3 29l7.3-2.2c1.8 1 3.9 1.5 5.7 1.5 7 0 12.5-5.5 12.5-12.5S23 3 16 3zm0 22.8c-1.7 0-3.4-.5-4.9-1.3l-.4-.2-4.3 1.3 1.3-4.2-.3-.4a10 10 0 0 1-1.6-5.4C5.5 9.6 10.2 5 16 5s10.5 4.6 10.5 10.3S21.8 25.8 16 25.8zm5.8-7.7c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-1.7-.9-2.9-1.6-4-3.5-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5 0-.2-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6 2 .8 2.7.9 3.7.8.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.2-.6-.4z"/></svg>';

  /* ---------- dados estruturados do veículo (schema.org) p/ Google ---------- */
  function injectVehicleLD(v) {
    var ld = {
      '@context': 'https://schema.org', '@type': 'Car',
      name: v.marca + ' ' + v.modelo + ' ' + v.versao,
      brand: { '@type': 'Brand', name: v.marca },
      model: v.modelo, vehicleModelDate: String(v.ano),
      mileageFromOdometer: { '@type': 'QuantitativeValue', value: v.km, unitCode: 'KMT' },
      vehicleTransmission: v.cambio, fuelType: v.combustivel, color: v.cor, numberOfDoors: v.portas,
      offers: {
        '@type': 'Offer', price: v.preco, priceCurrency: 'BRL',
        availability: v.status === 'vendido' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
        seller: { '@type': 'AutoDealer', name: 'Dicar Veículos' }
      }
    };
    if (v.fotos && v.fotos.length && v.fotos[0].indexOf('data:') !== 0) {
      ld.image = (location.protocol === 'file:') ? v.fotos[0] : location.origin + '/' + v.fotos[0];
    }
    var old = document.getElementById('veh-ld');
    if (old) old.remove();
    var s = document.createElement('script');
    s.type = 'application/ld+json'; s.id = 'veh-ld';
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
  }

  /* ---------- SEO dinâmico da página de veículo ----------
     title/description/OG/canonical + breadcrumb por veículo (a página é a mesma
     veiculo.html?id=…; quem renderiza JS — inclusive o Google — vê o conteúdo certo).
     Pra prévia em redes que NÃO rodam JS (WhatsApp/Facebook) só com SSR/prerender. */
  function seoBase() {
    if (location.protocol === 'http:' || location.protocol === 'https:') return location.origin;
    var c = document.getElementById('canonical');
    try { return new URL(c.getAttribute('href')).origin; } catch (e) { return 'https://dicarveiculos.com.br'; }
  }
  function setMeta(id, attr, val) { var el = document.getElementById(id); if (el) el.setAttribute(attr, val); }
  function setVeiculoSEO(v) {
    var nome = (v.marca + ' ' + v.modelo + ' ' + (v.versao || '')).replace(/\s+/g, ' ').trim();
    var url = seoBase() + '/veiculo.html?id=' + v.id;
    var titulo = nome + ' ' + v.ano + ' em Castanhal/PA · Dicar Veículos';
    var desc = nome + ' ' + v.ano + ' · ' + Store.fmtKm(v.km) + ' · ' + v.cambio + ' · ' + Store.fmtPreco(v.preco) +
      '. Seminovo com procedência e garantia na Dicar, Castanhal/PA. Financiamento e troca.';
    document.title = titulo;
    setMeta('meta-desc', 'content', desc);
    setMeta('og-title', 'content', nome + ' ' + v.ano + ' em Castanhal/PA — Dicar Veículos');
    setMeta('og-desc', 'content', desc);
    setMeta('og-url', 'content', url);
    setMeta('canonical', 'href', url);
    // imagem social: 1ª foto real do veículo (não placeholder/base64); senão mantém a da loja
    if (v.fotos && v.fotos.length && v.fotos[0].indexOf('data:') !== 0) {
      setMeta('og-image', 'content', seoBase() + '/' + v.fotos[0]);
    }
    var bc = document.getElementById('bc-veiculo'); if (bc) bc.textContent = v.marca + ' ' + v.modelo;
    // breadcrumb estruturado (Início › Veículos › modelo)
    var bcLd = {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: seoBase() + '/' },
        { '@type': 'ListItem', position: 2, name: 'Veículos', item: seoBase() + '/estoque.html' },
        { '@type': 'ListItem', position: 3, name: nome, item: url }
      ]
    };
    var old = document.getElementById('veh-bc-ld'); if (old) old.remove();
    var s = document.createElement('script');
    s.type = 'application/ld+json'; s.id = 'veh-bc-ld';
    s.textContent = JSON.stringify(bcLd);
    document.head.appendChild(s);
  }

  /* ---------- dados estruturados do negócio (AutoDealer) ----------
     Gerado a partir do config (fonte única) e injetado no <head>. Antes ficava
     chumbado no index.html — agora muda num lugar só (Store config → Supabase).
     Mesmo padrão dos schemas de veículo/breadcrumb: o Google renderiza JS e lê. */
  function injectDealerLD() {
    var cfg = Store.getConfig();
    var n = cfg && cfg.negocio;
    if (!n) return;
    var base = seoBase();
    var ld = {
      '@context': 'https://schema.org',
      '@type': (Store.PERFIL && Store.PERFIL.schemaType) || 'AutoDealer',
      name: cfg.nomeLoja,
      alternateName: n.alternateName,
      description: n.descricao,
      image: base + '/' + n.imagem,
      logo: base + '/' + n.logo,
      url: base + '/',
      telephone: '+' + cfg.whatsapp,
      priceRange: n.priceRange,
      address: {
        '@type': 'PostalAddress',
        streetAddress: n.streetAddress, addressLocality: n.addressLocality,
        addressRegion: n.addressRegion, postalCode: n.postalCode, addressCountry: n.addressCountry
      },
      openingHoursSpecification: (n.horarios || []).map(function (h) {
        return { '@type': 'OpeningHoursSpecification', dayOfWeek: h.dias, opens: h.abre, closes: h.fecha };
      }),
      areaServed: (n.areaServed || []).map(function (c) { return { '@type': 'City', name: c }; }),
      aggregateRating: { '@type': 'AggregateRating', ratingValue: n.ratingValue, reviewCount: n.reviewCount },
      sameAs: (Store.redesSameAs ? Store.redesSameAs() : ['https://instagram.com/' + cfg.instagram])
    };
    var old = document.getElementById('dealer-ld'); if (old) old.remove();
    var s = document.createElement('script');
    s.type = 'application/ld+json'; s.id = 'dealer-ld';
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
  }

  /* ---------- config (contatos) ---------- */
  function bindConfig() {
    var cfg = Store.getConfig();
    $$('[data-wa]').forEach(function (a) {
      a.href = Store.waLink(a.getAttribute('data-wa') || '');
      // botões que levam pro WhatsApp ganham o logo (pula a já-iconada e o botão flutuante)
      if (a.classList.contains('btn') && !a.querySelector('svg')) a.insertAdjacentHTML('afterbegin', WA_ICO);
    });
    $$('[data-cfg]').forEach(function (el) { var k = el.getAttribute('data-cfg'); if (cfg[k]) el.textContent = cfg[k]; });
    $$('[data-cfg-href]').forEach(function (el) { var k = el.getAttribute('data-cfg-href'); if (cfg[k]) el.href = cfg[k]; });
    $$('[data-ig]').forEach(function (a) { a.href = 'https://instagram.com/' + cfg.instagram; });
    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ---------- header scroll + menu mobile ---------- */
  function initChrome() {
    var hdr = $('#hdr');
    function onScroll() { if (hdr) hdr.classList.toggle('scrolled', window.scrollY > 40); }
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    var burger = $('#burger'), nav = $('#nav');
    if (burger && nav) {
      burger.addEventListener('click', function () { nav.classList.toggle('open'); });
      $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); }); });
    }
  }

  /* ---------- scroll reveal ---------- */
  function initReveal() {
    var els = $$('.reveal');
    if (!('IntersectionObserver' in window) || !els.length) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- card ---------- */
  function card(v) {
    var sold = v.status === 'vendido';
    var neg = v.status === 'negociando';
    var msg = 'Olá! Tenho interesse no ' + v.marca + ' ' + v.modelo + ' ' + v.versao + ' (' + v.ano + '). Está disponível?';
    return '' +
    '<article class="card reveal">' +
      '<a class="ph" href="veiculo.html?id=' + v.id + '" aria-label="' + v.marca + ' ' + v.modelo + '">' +
        '<span class="tag' + (sold ? ' sold' : (neg ? ' neg' : '')) + '">' + (sold ? 'Vendido' : (neg ? 'Negociando' : 'Disponível')) + '</span>' +
        '<img src="' + Store.foto(v) + '" alt="' + v.marca + ' ' + v.modelo + ' ' + v.ano + '" loading="lazy" decoding="async">' +
      '</a>' +
      '<div class="bd">' +
        '<span class="mk">' + v.marca + '</span>' +
        '<a class="nm" href="veiculo.html?id=' + v.id + '">' + v.modelo + '</a>' +
        '<div class="vs">' + v.versao + '</div>' +
        '<div class="specs">' +
          '<span class="sp-ano">' + SPEC.ano + '<b>' + v.ano + '</b></span>' +
          '<span class="sp-km">' + SPEC.km + '<b>' + Store.fmtKm(v.km) + '</b></span>' +
          '<span class="sp-cam">' + SPEC.cambio + '<b>' + v.cambio + '</b></span>' +
          '<span class="sp-fuel">' + SPEC.fuel + '<b>' + v.combustivel + '</b></span>' +
        '</div>' +
        '<div class="price">' + Store.fmtPreco(v.preco) + '<small>à vista ou financiado</small></div>' +
        (sold ? '<span class="btn btn-ink btn-sm">Vendido</span>'
              : '<a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="' + Store.waLink(msg) + '">' + WA_ICO + 'WhatsApp</a>') +
      '</div>' +
    '</article>';
  }

  /* ---------- HOME ---------- */
  function initHome() {
    var heroBox = $('#hero-dyn'); if (!heroBox) return;
    injectDealerLD();          // schema do negócio (home) a partir do config
    var feats = Store.getPublicVehicles({ destaque: true });
    if (!feats.length) feats = Store.getPublicVehicles({});
    var idx = 0;

    function renderHero(i) {
      var v = feats[i]; if (!v) return;
      var msg = 'Olá! Tenho interesse no ' + v.marca + ' ' + v.modelo + ' (' + v.ano + ').';
      heroBox.innerHTML =
        '<div class="hero-copy">' +
          '<span class="kicker">Em destaque</span>' +
          '<h2 class="hero-model">' + v.modelo + ' <span class="yr">' + v.ano + '</span></h2>' +
          '<p class="hero-sub">' + v.marca + ' ' + v.versao + '.</p>' +
          '<div class="hero-price"><span class="v">' + Store.fmtPreco(v.preco) + '</span><span class="lbl">à vista ou financiado</span></div>' +
          '<div class="hero-actions">' +
            '<a class="btn btn-red" href="veiculo.html?id=' + v.id + '">Ver este veículo</a>' +
            '<a class="btn btn-line on-dark" target="_blank" rel="noopener" href="' + Store.waLink(msg) + '">' + WA_ICO + 'Falar no WhatsApp</a>' +
          '</div>' +
          '<div class="hero-specs">' +
            specHero(v.ano, 'Ano') + specHero(Store.fmtKm(v.km).replace(' km', ''), 'KM') +
            specHero(v.cambio, 'Câmbio') + specHero(v.combustivel, 'Combustível') +
          '</div>' +
        '</div>' +
        '<div class="hero-visual">' +
          '<div class="hero-car"><img src="' + Store.foto(v) + '" alt="' + v.marca + ' ' + v.modelo + '"></div>' +
          '<div class="hero-index">' + pad(i + 1) + '<small> / ' + pad(feats.length) + '</small></div>' +
          '<div class="hero-thumbs">' + feats.map(function (f, j) {
            return '<button class="' + (j === i ? 'active' : '') + '" data-h="' + j + '" aria-label="Ver ' + f.modelo + '"><img src="' + Store.foto(f) + '" alt=""></button>';
          }).join('') + '</div>' +
        '</div>';
      $$('.hero-thumbs button').forEach(function (b) {
        b.addEventListener('click', function () { idx = Number(b.getAttribute('data-h')); renderHero(idx); resetAuto(); });
      });
    }
    function specHero(n, l) { return '<div class="sp"><div class="n">' + n + '</div><div class="l">' + l + '</div></div>'; }
    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    var auto;
    function resetAuto() { clearInterval(auto); if (feats.length > 1) auto = setInterval(function () { idx = (idx + 1) % feats.length; renderHero(idx); }, 6000); }
    renderHero(0); resetAuto();

    // vitrine
    var vit = $('#vitrine');
    if (vit) {
      var list = Store.getPublicVehicles({}).slice(0, 6);
      vit.innerHTML = list.map(card).join('');
    }
    // categorias
    var catsBox = $('#cats');
    if (catsBox) {
      var defs = [
        { nm: 'Hatch', ic: ICON.hatch, q: 'tipo=Hatch' },
        { nm: 'SUV', ic: ICON.suv, q: 'tipo=SUV' },
        { nm: 'Picape', ic: ICON.picape, q: 'tipo=Picape' },
        { nm: 'Sedã', ic: ICON.sedan, q: 'tipo=Sedã' },
        { nm: 'Automáticos', ic: ICON.auto, q: 'cambio=Automático' },
        { nm: 'Ver todos', ic: ICON.todos, q: '' }
      ];
      var all = Store.getPublicVehicles({});
      catsBox.innerHTML = defs.map(function (d) {
        var n = d.q.indexOf('tipo=') === 0 ? all.filter(function (v) { return v.tipo === d.q.split('=')[1]; }).length
              : d.q.indexOf('cambio=') === 0 ? all.filter(function (v) { return v.cambio === d.q.split('=')[1]; }).length
              : all.length;
        return { d: d, n: n };
      }).filter(function (o) { return o.d.q === '' || o.n > 0; }) // esconde categoria vazia (mantém "Ver todos")
        .map(function (o) {
          return '<a class="cat reveal" href="estoque.html' + (o.d.q ? '?' + o.d.q : '') + '">' +
            '<div class="ic">' + o.d.ic + '</div><div class="nm">' + o.d.nm + '</div>' +
            '<div class="ct">' + o.n + ' disponíve' + (o.n === 1 ? 'l' : 'is') + '</div></a>';
        }).join('');
    }
  }

  /* ---------- ESTOQUE ---------- */
  var PAGINA = 12;            // veículos mostrados por vez (clica "Carregar mais" pro resto)
  function initEstoque() {
    var grid = $('#grid'); if (!grid) return;
    var q = new URLSearchParams(location.search);
    var fBusca = $('#f-busca'), fMarca = $('#f-marca'), fTipo = $('#f-tipo'),
        fCambio = $('#f-cambio'), fPreco = $('#f-preco'), fOrd = $('#f-ord'),
        countEl = $('#count'), clearEl = $('#f-clear');

    var resultado = [];        // lista filtrada/ordenada inteira
    var visiveis = 0;          // quantos cards estão na tela agora

    Store.marcas().forEach(function (m) { fMarca.add(new Option(m, m)); });
    Store.tipos().forEach(function (t) { fTipo.add(new Option(t, t)); });

    // pré-aplica filtros da URL
    if (q.get('marca')) fMarca.value = q.get('marca');
    if (q.get('tipo')) fTipo.value = q.get('tipo');
    if (q.get('cambio')) fCambio.value = q.get('cambio');

    // recalcula a lista (ao mudar filtro/busca) e volta pra 1ª página
    function apply() {
      resultado = Store.getPublicVehicles({
        busca: fBusca.value || null, marca: fMarca.value || null, tipo: fTipo.value || null,
        cambio: fCambio.value || null, precoMax: fPreco.value ? Number(fPreco.value) : null,
        ordenar: fOrd.value || null
      });
      // sem filtro/ordenação ativos: destaques primeiro
      var semFiltro = !fBusca.value && !fMarca.value && !fTipo.value && !fCambio.value && !fOrd.value && !fPreco.value;
      if (semFiltro) resultado = resultado.slice().sort(function (a, b) { return (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0); });
      visiveis = Math.min(PAGINA, resultado.length);
      render();
      markActive();
    }

    // desenha só os "visiveis" primeiros + botão "Carregar mais" (carrega o resto sob demanda)
    function render() {
      if (!resultado.length) {
        grid.innerHTML =
          '<div class="empty">' +
            '<h3>Não achou o que procura?</h3>' +
            '<p>Toda semana entra carro novo. Diz pra gente o que você quer — a gente acha pra você.</p>' +
            '<div class="empty-acts">' +
              '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + Store.waLink('Olá! Não achei o carro que procuro no site da Dicar. Podem me ajudar?') + '">' + WA_ICO + 'Falar no WhatsApp</a>' +
              '<a href="#" id="clr" class="empty-clr">Limpar filtros</a>' +
            '</div>' +
          '</div>' + sugsHTML();
      } else {
        var html = resultado.slice(0, visiveis).map(card).join('');
        var restantes = resultado.length - visiveis;
        if (restantes > 0) {
          var lote = Math.min(PAGINA, restantes);
          html += '<div class="load-more-wrap">' +
            '<button type="button" class="btn btn-line on-light load-more" id="load-more">Carregar mais ' +
              '<span class="lm-n">+' + lote + '</span></button>' +
            '<div class="load-more-info">Mostrando ' + visiveis + ' de ' + resultado.length + '</div>' +
          '</div>';
        }
        grid.innerHTML = html;
      }
      // esconde a faixa de CTA do rodapé quando mostramos a mensagem de "não achou"
      var band = document.querySelector('.cta-band');
      if (band) band.style.display = resultado.length ? '' : 'none';
      countEl.innerHTML = '<b>' + resultado.length + '</b> veículo' + (resultado.length === 1 ? '' : 's');
      $$('.reveal', grid).forEach(function (e) { e.classList.add('in'); });
      var lm = $('#load-more');
      if (lm) lm.onclick = function () { visiveis = Math.min(visiveis + PAGINA, resultado.length); render(); };
      var c = $('#clr'); if (c) c.onclick = function (e) { e.preventDefault(); reset(); };
      $$('.sug-btn', grid).forEach(function (b) {
        b.addEventListener('click', function () {
          fBusca.value = ''; fMarca.value = ''; fCambio.value = ''; fPreco.value = ''; fOrd.value = '';
          fTipo.value = b.getAttribute('data-tipo'); apply();
        });
      });
    }
    // 3 carros de categorias diferentes pra sugerir quando o filtro não acha nada
    function sugsHTML() {
      var all = Store.getPublicVehicles({});
      var seen = {}, picks = [];
      all.forEach(function (v) { if (!seen[v.tipo]) { seen[v.tipo] = 1; picks.push(v); } });
      if (picks.length < 3) all.forEach(function (v) { if (picks.length < 3 && picks.indexOf(v) === -1) picks.push(v); });
      picks = picks.slice(0, 3);
      if (!picks.length) return '';
      return '<div class="sugs-wrap">' +
          '<div class="sugs-head">Que tal um destes?</div>' +
          '<div class="sugs">' + picks.map(function (v) {
            return '<article class="sug">' +
              '<a class="sug-ph" href="veiculo.html?id=' + v.id + '" aria-label="' + v.marca + ' ' + v.modelo + '"><img src="' + Store.foto(v) + '" alt="' + v.marca + ' ' + v.modelo + '" loading="lazy" decoding="async"></a>' +
              '<div class="sug-bd">' +
                '<span class="sug-mk">' + v.marca + ' · ' + v.tipo + '</span>' +
                '<a class="sug-nm" href="veiculo.html?id=' + v.id + '">' + v.modelo + '</a>' +
                '<div class="sug-price">' + Store.fmtPreco(v.preco) + '</div>' +
                '<button type="button" class="btn btn-red btn-sm sug-btn" data-tipo="' + v.tipo + '">Ver semelhantes</button>' +
              '</div>' +
            '</article>';
          }).join('') + '</div>' +
        '</div>';
    }
    // destaca as pílulas com filtro ativo e mostra o botão "Limpar"
    function markActive() {
      [fMarca, fTipo, fCambio, fPreco, fOrd].forEach(function (s) { s.classList.toggle('on', !!s.value); });
      var algum = !!(fMarca.value || fTipo.value || fCambio.value || fPreco.value || fOrd.value || fBusca.value);
      if (clearEl) { if (algum) clearEl.removeAttribute('hidden'); else clearEl.setAttribute('hidden', ''); }
    }
    function reset() { fBusca.value = ''; fMarca.value = ''; fTipo.value = ''; fCambio.value = ''; fPreco.value = ''; fOrd.value = ''; apply(); }
    [fMarca, fTipo, fCambio, fPreco, fOrd].forEach(function (el) { el.addEventListener('change', apply); });
    fBusca.addEventListener('input', apply);
    apply();

    if (clearEl) clearEl.addEventListener('click', function () { reset(); });

    // veio de um filtro (clicou numa categoria na home)? rola direto pros carros
    if (q.get('tipo') || q.get('cambio') || q.get('marca')) {
      var shop = $('.shop');
      if (shop) setTimeout(function () {
        window.scrollTo({ top: shop.offsetTop - 64, behavior: 'smooth' });
      }, 250);
    }
  }

  /* ---------- galeria do veículo (carrossel + tela cheia) ---------- */
  function curIndex(track) { return track.clientWidth ? Math.round(track.scrollLeft / track.clientWidth) : 0; }

  function initGallery(box, fotos, nome) {
    var slider = $('#gslider', box); if (!slider) return;
    var slides = $$('.slide', slider);
    var dots = $$('#gdots button', box);
    var countB = $('#gcount b', box);
    var raf;
    function sync() {
      var i = curIndex(slider);
      if (countB) countB.textContent = i + 1;
      dots.forEach(function (d, j) { d.classList.toggle('on', j === i); });
    }
    slider.addEventListener('scroll', function () {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    }, { passive: true });
    function go(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      slider.scrollTo({ left: i * slider.clientWidth, behavior: 'smooth' });
    }
    dots.forEach(function (d) { d.addEventListener('click', function () { go(Number(d.getAttribute('data-i'))); }); });
    var prev = $('#gprev', box), next = $('#gnext', box);
    if (prev) prev.addEventListener('click', function () { go(curIndex(slider) - 1); });
    if (next) next.addEventListener('click', function () { go(curIndex(slider) + 1); });
    slides.forEach(function (s) {
      s.addEventListener('click', function () { openLightbox(fotos, Number(s.getAttribute('data-i')), nome); });
    });
    var full = $('#gfull', box);
    if (full) full.addEventListener('click', function () { openLightbox(fotos, curIndex(slider), nome); });
  }

  // visualizador em tela cheia (overlay deslizável)
  function openLightbox(fotos, start, nome) {
    var lb = document.createElement('div');
    lb.className = 'lightbox';
    var multi = fotos.length > 1;
    lb.innerHTML =
      '<button type="button" class="lb-close" aria-label="Fechar">&times;</button>' +
      (multi ? '<span class="lb-count"><b>' + (start + 1) + '</b> / ' + fotos.length + '</span>' : '') +
      '<div class="lb-track">' + fotos.map(function (f, i) {
        return '<div class="lb-slide"><img src="' + f + '" alt="' + nome + ' — foto ' + (i + 1) + '" decoding="async"' + (i === start ? '' : ' loading="lazy"') + '></div>';
      }).join('') + '</div>';
    document.body.appendChild(lb);
    document.body.classList.add('lb-open');
    var track = lb.querySelector('.lb-track');
    var cb = lb.querySelector('.lb-count b');
    requestAnimationFrame(function () { track.scrollLeft = start * track.clientWidth; });
    track.addEventListener('scroll', function () { if (cb) cb.textContent = curIndex(track) + 1; }, { passive: true });
    function close() { document.body.classList.remove('lb-open'); lb.remove(); document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target === track || (e.target.classList && e.target.classList.contains('lb-slide'))) close();
    });
  }

  /* ---------- DETALHE ---------- */
  function initVeiculo() {
    var box = $('#detalhe'); if (!box) return;
    var id = new URLSearchParams(location.search).get('id');
    var v = id && Store.getVehicle(id);
    if (!v || v.status === 'vendido') { box.innerHTML = '<div class="empty">Este veículo não está mais disponível. <a href="estoque.html">Ver os veículos à venda</a></div>'; return; }
    injectVehicleLD(v);
    setVeiculoSEO(v);
    dicarTrack('ver_veiculo', { id: v.id, nome: Store.nomeVeiculo(v), value: v.preco, currency: 'BRL' });
    var fotos = (v.fotos && v.fotos.length) ? v.fotos : [Store.placeholder(v)];
    var sold = v.status === 'vendido';
    var neg = v.status === 'negociando';
    var msg = 'Olá! Tenho interesse no ' + v.marca + ' ' + v.modelo + ' ' + v.versao + ' (' + v.ano + '), ' + Store.fmtPreco(v.preco) + '. Está disponível?';
    var msgF = 'Olá! Quero simular o financiamento do ' + v.marca + ' ' + v.modelo + ' (' + v.ano + ').';

    var multi = fotos.length > 1;
    box.innerHTML =
      '<div class="gal">' +
        '<div class="gal-stage">' +
          '<div class="slider" id="gslider">' +
            fotos.map(function (f, i) {
              return '<button type="button" class="slide" data-i="' + i + '" aria-label="Ampliar foto ' + (i + 1) + '">' +
                '<img src="' + f + '" alt="' + v.modelo + ' — foto ' + (i + 1) + '" decoding="async"' + (i ? ' loading="lazy"' : ' fetchpriority="high"') + '>' +
              '</button>';
            }).join('') +
          '</div>' +
          (multi ? '<span class="gcount" id="gcount"><b>1</b> / ' + fotos.length + '</span>' +
                   '<button type="button" class="gnav prev" id="gprev" aria-label="Foto anterior">‹</button>' +
                   '<button type="button" class="gnav next" id="gnext" aria-label="Próxima foto">›</button>' : '') +
          '<button type="button" class="gfull" id="gfull" aria-label="Ver em tela cheia"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button>' +
        '</div>' +
        (multi ? '<div class="dots" id="gdots">' + fotos.map(function (_f, i) {
                   return '<button type="button" class="' + (i ? '' : 'on') + '" data-i="' + i + '" aria-label="Ver foto ' + (i + 1) + '"></button>';
                 }).join('') + '</div>' : '') +
      '</div>' +
      '<div class="dt">' +
        '<div class="mk">' + v.marca + (neg ? ' · Em negociação' : '') + '</div>' +
        '<h1>' + v.modelo + '</h1><div class="vs">' + v.versao + ' · ' + v.ano + '</div>' +
        '<div class="price">' + Store.fmtPreco(v.preco) + '</div>' +
        '<div class="pnote">Procedência e garantia · aceitamos seu usado na troca</div>' +
        '<div class="grid">' + g('Ano', v.ano) + g('KM', Store.fmtKm(v.km)) + g('Câmbio', v.cambio) + g('Combustível', v.combustivel) + g('Cor', v.cor) + g('Portas', v.portas) + '</div>' +
        (v.descricao ? '<div class="desc">' + v.descricao + '</div>' : '') +
        '<div class="acts">' +
          (sold ? '<span class="btn btn-ink">Este veículo já foi vendido</span>'
                : '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + Store.waLink(msg) + '">' + WA_ICO + 'Falar no WhatsApp</a>' +
                  '<a class="btn btn-red" data-wa-action="simular_financiamento" target="_blank" rel="noopener" href="' + Store.waLink(msgF) + '">Simular financiamento</a>') +
          '<a class="acts-back" href="estoque.html">← Ver todos os veículos</a>' +
        '</div>' +
      '</div>';
    initGallery(box, fotos, v.modelo);
    function g(k, val) { return '<div><div class="k">' + k + '</div><div class="v">' + val + '</div></div>'; }
  }

  /* ---------- LGPD: consentimento de cookies + rastreamento ----------
     Nenhum cookie de análise/marketing carrega sem aceite (art. 7 da LGPD).
     Quando o cliente ativar campanhas, preencher os IDs em TRACKING — o código
     só dispara GA4/Meta Pixel se o consentimento estiver "granted". */
  var CONSENT_KEY = 'dicar_consent_v1';

  function consentStatus() { try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; } }
  function injectScript(src) { var s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); }
  // IDs vêm do painel (Store.getAds) — ativar/trocar anúncio NÃO exige novo deploy.
  function getAds() { try { return (window.Store && Store.getAds) ? Store.getAds() : {}; } catch (e) { return {}; } }
  function loadTracking() {
    if (consentStatus() !== 'granted') return;
    var ads = getAds();
    window.dataLayer = window.dataLayer || [];

    // Google Tag Manager — recomendado: o gestor mapeia pixels/conversões/eventos
    // dentro do painel do GTM, usando os eventos que o site empurra (sem mexer no código).
    if (ads.gtmId && !window.__gtm) {
      window.__gtm = true;
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      injectScript('https://www.googletagmanager.com/gtm.js?id=' + ads.gtmId);
    }

    // gtag.js (Google Analytics 4 e/ou Google Ads) — direto, quando não for via GTM
    var gtagId = ads.ga4Id || ads.googleAdsId;
    if (gtagId && !window.__gtag) {
      window.__gtag = true;
      injectScript('https://www.googletagmanager.com/gtag/js?id=' + gtagId);
      window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      if (ads.ga4Id) window.gtag('config', ads.ga4Id);
      if (ads.googleAdsId) window.gtag('config', ads.googleAdsId);
    }

    // Meta (Facebook/Instagram) Pixel — direto
    if (ads.metaPixelId && !window.__fb) {
      window.__fb = true;
      !function (f, b, e, v, n, t, s) {
        if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
        t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', ads.metaPixelId); window.fbq('track', 'PageView');
    }
  }

  /* ---------- Eventos de conversão (pro gestor de anúncio mapear) ----------
     Dispara só com consentimento. Empurra pro dataLayer (GTM mapeia lá) e,
     quando os pixels estão diretos, chama fbq/gtag com os eventos padrão. */
  function dicarTrack(action, data) {
    data = data || {};
    // [first-party] registra o evento p/ o painel (contagem agregada, sem dado pessoal).
    // Roda SEMPRE — é métrica própria da loja, não cookie de terceiro (LGPD ok).
    try { if (window.Store && Store.logEvent) Store.logEvent(action, data); } catch (e) {}
    // [terceiros] GA4 / Meta / GTM só com consentimento de cookies.
    if (consentStatus() !== 'granted') return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: 'dicar_' + action }, data));
    if (window.fbq) {
      var fbMap = { contato_whatsapp: 'Contact', simular_financiamento: 'Lead', avaliar_veiculo: 'Lead', ver_veiculo: 'ViewContent' };
      if (fbMap[action]) window.fbq('track', fbMap[action], data); else window.fbq('trackCustom', action, data);
    }
    if (window.gtag) window.gtag('event', action, data);
  }
  window.dicarTrack = dicarTrack;
  // todo clique em CTA de WhatsApp vira evento (ação conforme a página)
  function initAdEvents() {
    document.addEventListener('click', function (e) {
      // pega tanto os botões com data-wa quanto os links dinâmicos (cards, detalhe,
      // hero) que montam o wa.me direto no href — todo clique pro WhatsApp conta
      var a = e.target.closest ? e.target.closest('[data-wa], a[href*="wa.me"]') : null;
      if (!a) return;
      var p = location.pathname;
      // botão pode declarar a ação (ex.: "Simular financiamento" na página do veículo);
      // senão, classifica pela página onde o clique aconteceu
      var action = a.getAttribute('data-wa-action')
                 || (/financiamento/.test(p) ? 'simular_financiamento'
                    : /vender-meu-carro/.test(p) ? 'avaliar_veiculo'
                    : 'contato_whatsapp');
      dicarTrack(action, { pagina: p });
    });
  }
  function setConsent(v) { try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {} if (v === 'granted') loadTracking(); }
  function showCookieBar() {
    if ($('#cookie-bar')) return;
    var bar = document.createElement('div');
    bar.className = 'cookie-bar'; bar.id = 'cookie-bar';
    bar.setAttribute('role', 'dialog'); bar.setAttribute('aria-label', 'Aviso de cookies');
    bar.innerHTML =
      '<p>A gente usa cookies pra melhorar sua experiência e, com sua autorização, medir o desempenho do site e exibir anúncios. Veja a <a href="privacidade.html">Política de Privacidade</a>.</p>' +
      '<div class="cookie-acts">' +
        '<button type="button" class="btn btn-line on-dark" id="ck-no">Só essenciais</button>' +
        '<button type="button" class="btn btn-red" id="ck-yes">Aceitar</button>' +
      '</div>';
    document.body.appendChild(bar);
    $('#ck-yes').onclick = function () { setConsent('granted'); bar.remove(); };
    $('#ck-no').onclick = function () { setConsent('denied'); bar.remove(); };
  }
  function initConsent() {
    loadTracking();                       // respeita escolha de visita anterior
    if (!consentStatus()) showCookieBar();
  }
  // link de privacidade + reabrir preferências de cookies no rodapé de toda página
  function addLegalLinks() {
    $$('.ft-bottom').forEach(function (ft) {
      var first = ft.querySelector('span');
      if (!first || ft.querySelector('.ft-legal')) return;
      var extra = document.createElement('span'); extra.className = 'ft-legal';
      extra.innerHTML = ' · <a href="privacidade.html">Privacidade</a> · <a href="#" data-cookie-prefs>Preferências de cookies</a>';
      first.appendChild(extra);
    });
    $$('[data-cookie-prefs]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); showCookieBar(); });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    // não dependem de dados — rodam já
    initChrome(); initReveal(); initConsent(); addLegalLinks(); initAdEvents();
    // dependem do banco (config + veículos): rodam após o init() hidratar o cache.
    function boot() { bindConfig(); initHome(); initEstoque(); initVeiculo(); }
    if (window.Store && Store.init) {
      Store.init().then(boot).catch(function (e) { console.error('[site] init', e); boot(); });
    } else { boot(); }
  });
})();
