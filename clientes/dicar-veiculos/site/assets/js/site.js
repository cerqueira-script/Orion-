/* DICAR VEÍCULOS — site "Editorial Showroom" */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- config (contatos) ---------- */
  function bindConfig() {
    var cfg = Store.getConfig();
    $$('[data-wa]').forEach(function (a) { a.href = Store.waLink(a.getAttribute('data-wa') || ''); });
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
    var msg = 'Olá! Tenho interesse no ' + v.marca + ' ' + v.modelo + ' ' + v.versao + ' (' + v.ano + '). Está disponível?';
    return '' +
    '<article class="card reveal">' +
      '<a class="ph" href="veiculo.html?id=' + v.id + '" aria-label="' + v.marca + ' ' + v.modelo + '">' +
        '<span class="tag' + (sold ? ' sold' : '') + '">' + (sold ? 'Vendido' : 'Disponível') + '</span>' +
        '<span class="yrtag">' + v.ano + '</span>' +
        '<img src="' + Store.foto(v) + '" alt="' + v.marca + ' ' + v.modelo + ' ' + v.ano + '" loading="lazy">' +
      '</a>' +
      '<div class="bd">' +
        '<span class="mk">' + v.marca + '</span>' +
        '<a class="nm" href="veiculo.html?id=' + v.id + '">' + v.modelo + '</a>' +
        '<div class="vs">' + v.versao + '</div>' +
        '<div class="specs"><span><b>' + Store.fmtKm(v.km) + '</b></span><span><b>' + v.cambio + '</b></span><span><b>' + v.combustivel + '</b></span></div>' +
        '<div class="ft">' +
          '<div class="price">' + Store.fmtPreco(v.preco) + '<small>à vista ou financiado</small></div>' +
          (sold ? '<span class="btn btn-ink btn-sm">Vendido</span>'
                : '<a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="' + Store.waLink(msg) + '">WhatsApp</a>') +
        '</div>' +
      '</div>' +
    '</article>';
  }

  /* ---------- HOME ---------- */
  function initHome() {
    var heroBox = $('#hero-dyn'); if (!heroBox) return;
    var feats = Store.getVehicles({ destaque: true, status: 'disponivel' });
    if (!feats.length) feats = Store.getVehicles({ status: 'disponivel' });
    var idx = 0;

    function renderHero(i) {
      var v = feats[i]; if (!v) return;
      var msg = 'Olá! Tenho interesse no ' + v.marca + ' ' + v.modelo + ' (' + v.ano + ').';
      heroBox.innerHTML =
        '<div class="hero-copy">' +
          '<span class="kicker">Em destaque</span>' +
          '<h1 class="hero-model">' + v.modelo + ' <span class="yr">' + v.ano + '</span></h1>' +
          '<p class="hero-sub">' + v.marca + ' ' + v.versao + ' — procedência e garantia Dicar.</p>' +
          '<div class="hero-price"><span class="v">' + Store.fmtPreco(v.preco) + '</span><span class="lbl">à vista ou financiado</span></div>' +
          '<div class="hero-actions">' +
            '<a class="btn btn-red" href="veiculo.html?id=' + v.id + '">Ver este carro</a>' +
            '<a class="btn btn-line on-dark" target="_blank" rel="noopener" href="' + Store.waLink(msg) + '">Falar no WhatsApp</a>' +
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
      var list = Store.getVehicles({ status: 'disponivel' }).slice(0, 6);
      vit.innerHTML = list.map(card).join('');
    }
    // categorias
    var catsBox = $('#cats');
    if (catsBox) {
      var defs = [
        { nm: 'Hatch', ic: '🚗', q: 'tipo=Hatch' },
        { nm: 'SUV', ic: '🚙', q: 'tipo=SUV' },
        { nm: 'Picape', ic: '🛻', q: 'tipo=Picape' },
        { nm: 'Sedã', ic: '🚘', q: 'tipo=Sedã' },
        { nm: 'Automáticos', ic: '⚙️', q: 'cambio=Automático' },
        { nm: 'Ver todos', ic: '◆', q: '' }
      ];
      var all = Store.getVehicles({ status: 'disponivel' });
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
  function initEstoque() {
    var grid = $('#grid'); if (!grid) return;
    var q = new URLSearchParams(location.search);
    var fBusca = $('#f-busca'), fMarca = $('#f-marca'), fTipo = $('#f-tipo'),
        fCambio = $('#f-cambio'), fPreco = $('#f-preco'), fPrecoV = $('#f-preco-v'),
        fOrd = $('#f-ord'), countEl = $('#count');

    Store.marcas().forEach(function (m) { fMarca.add(new Option(m, m)); });
    ['Hatch', 'SUV', 'Sedã', 'Picape'].forEach(function (t) { fTipo.add(new Option(t, t)); });
    var max = Math.ceil(Math.max.apply(null, Store.getVehicles().map(function (v) { return v.preco; }).concat([100000])) / 10000) * 10000;
    fPreco.max = max; fPreco.value = max;

    // pré-aplica filtros da URL
    if (q.get('marca')) fMarca.value = q.get('marca');
    if (q.get('tipo')) fTipo.value = q.get('tipo');
    if (q.get('cambio')) fCambio.value = q.get('cambio');

    function lbl() { fPrecoV.textContent = 'Até ' + Store.fmtPreco(fPreco.value); }
    function apply() {
      lbl();
      var list = Store.getVehicles({
        busca: fBusca.value || null, marca: fMarca.value || null, tipo: fTipo.value || null,
        cambio: fCambio.value || null, precoMax: Number(fPreco.value) >= max ? null : Number(fPreco.value),
        ordenar: fOrd.value || null
      });
      grid.innerHTML = list.length ? list.map(card).join('')
        : '<div class="empty">Nenhum carro com esses filtros. <a href="#" id="clr">Limpar filtros</a></div>';
      countEl.innerHTML = '<b>' + list.length + '</b> veículo' + (list.length === 1 ? '' : 's');
      $$('.reveal', grid).forEach(function (e) { e.classList.add('in'); });
      var c = $('#clr'); if (c) c.onclick = function (e) { e.preventDefault(); reset(); };
    }
    function reset() { fBusca.value = ''; fMarca.value = ''; fTipo.value = ''; fCambio.value = ''; fPreco.value = max; fOrd.value = ''; apply(); }
    [fMarca, fTipo, fCambio, fOrd].forEach(function (el) { el.addEventListener('change', apply); });
    fBusca.addEventListener('input', apply);
    fPreco.addEventListener('input', apply);
    apply();
  }

  /* ---------- DETALHE ---------- */
  function initVeiculo() {
    var box = $('#detalhe'); if (!box) return;
    var id = new URLSearchParams(location.search).get('id');
    var v = id && Store.getVehicle(id);
    if (!v) { box.innerHTML = '<div class="empty">Veículo não encontrado. <a href="estoque.html">Ver os carros</a></div>'; return; }
    document.title = v.marca + ' ' + v.modelo + ' ' + v.versao + ' · Dicar Veículos';
    var fotos = (v.fotos && v.fotos.length) ? v.fotos : [Store.placeholder(v)];
    var sold = v.status === 'vendido';
    var msg = 'Olá! Tenho interesse no ' + v.marca + ' ' + v.modelo + ' ' + v.versao + ' (' + v.ano + '), ' + Store.fmtPreco(v.preco) + '. Está disponível?';
    var msgF = 'Olá! Quero simular o financiamento do ' + v.marca + ' ' + v.modelo + ' (' + v.ano + ').';

    box.innerHTML =
      '<div class="gal">' +
        '<div class="main"><img id="mimg" src="' + fotos[0] + '" alt="' + v.modelo + '"></div>' +
        (fotos.length > 1 ? '<div class="thumbs">' + fotos.map(function (f, i) { return '<img class="' + (i ? '' : 'active') + '" data-i="' + i + '" src="' + f + '" alt="">'; }).join('') + '</div>' : '') +
      '</div>' +
      '<div class="dt">' +
        '<div class="mk">' + v.marca + (sold ? ' · Vendido' : '') + '</div>' +
        '<h1>' + v.modelo + '</h1><div class="vs">' + v.versao + ' · ' + v.ano + '</div>' +
        '<div class="price">' + Store.fmtPreco(v.preco) + '</div>' +
        '<div class="pnote">Procedência e garantia · aceitamos seu usado na troca</div>' +
        '<div class="grid">' + g('Ano', v.ano) + g('KM', Store.fmtKm(v.km)) + g('Câmbio', v.cambio) + g('Combustível', v.combustivel) + g('Cor', v.cor) + g('Portas', v.portas) + '</div>' +
        (v.descricao ? '<div class="desc">' + v.descricao + '</div>' : '') +
        '<div class="acts">' +
          (sold ? '<span class="btn btn-ink">Este veículo já foi vendido</span>'
                : '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + Store.waLink(msg) + '">Falar no WhatsApp</a>' +
                  '<a class="btn btn-red" target="_blank" rel="noopener" href="' + Store.waLink(msgF) + '">Simular financiamento</a>') +
          '<a class="btn btn-line on-light" href="estoque.html">Ver os carros</a>' +
        '</div>' +
      '</div>';
    var m = $('#mimg');
    $$('.thumbs img', box).forEach(function (t) {
      t.addEventListener('click', function () { m.src = t.src; $$('.thumbs img', box).forEach(function (x) { x.classList.remove('active'); }); t.classList.add('active'); });
    });
    function g(k, val) { return '<div><div class="k">' + k + '</div><div class="v">' + val + '</div></div>'; }
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindConfig(); initChrome(); initHome(); initEstoque(); initVeiculo(); initReveal();
  });
})();
