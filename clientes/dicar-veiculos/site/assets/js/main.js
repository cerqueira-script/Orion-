/* Dicar Veículos — site público */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- contatos / config no header e footer ---- */
  function bindConfig() {
    var cfg = Store.getConfig();
    $$('[data-wa]').forEach(function (a) {
      a.href = Store.waLink(a.getAttribute('data-wa') || '');
    });
    $$('[data-cfg]').forEach(function (el) {
      var k = el.getAttribute('data-cfg');
      if (cfg[k]) el.textContent = cfg[k];
    });
    $$('[data-cfg-href]').forEach(function (el) {
      var k = el.getAttribute('data-cfg-href');
      if (cfg[k]) el.href = cfg[k];
    });
    var ig = $('[data-ig]');
    if (ig) ig.href = 'https://instagram.com/' + cfg.instagram;
    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ---- card de veículo ---- */
  function carCard(v) {
    var sold = v.status === 'vendido';
    var msg = 'Olá! Tenho interesse no ' + v.marca + ' ' + v.modelo + ' ' + v.versao + ' (' + v.ano + '). Está disponível?';
    return '' +
      '<article class="car">' +
        '<a class="ph" href="veiculo.html?id=' + v.id + '">' +
          (sold ? '<span class="flag sold">Vendido</span>' : '<span class="flag">Disponível</span>') +
          '<img src="' + Store.foto(v) + '" alt="' + v.marca + ' ' + v.modelo + '" loading="lazy">' +
        '</a>' +
        '<div class="body">' +
          '<div class="mk">' + v.marca + '</div>' +
          '<a class="nm" href="veiculo.html?id=' + v.id + '">' + v.modelo + '</a>' +
          '<div class="vs">' + v.versao + '</div>' +
          '<div class="specs">' +
            '<span>📅 ' + v.ano + '</span>' +
            '<span>🛣️ ' + Store.fmtKm(v.km) + '</span>' +
            '<span>⚙️ ' + v.cambio + '</span>' +
            '<span>⛽ ' + v.combustivel + '</span>' +
          '</div>' +
          '<div class="pr"><div class="v">' + Store.fmtPreco(v.preco) + '</div></div>' +
          '<div class="actions">' +
            '<a class="btn btn-outline btn-sm" href="veiculo.html?id=' + v.id + '">Ver detalhes</a>' +
            (sold ? '' : '<a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="' + Store.waLink(msg) + '">WhatsApp</a>') +
          '</div>' +
        '</div>' +
      '</article>';
  }

  /* ---- HOME: vitrine de destaques ---- */
  function initHome() {
    var box = $('#vitrine'); if (!box) return;
    var list = Store.getVehicles({ destaque: true, status: 'disponivel' });
    if (!list.length) list = Store.getVehicles({ status: 'disponivel' }).slice(0, 6);
    box.innerHTML = list.slice(0, 6).map(carCard).join('') || '<p class="empty">Em breve novos veículos.</p>';
  }

  /* ---- ESTOQUE: filtros + grade ---- */
  function initEstoque() {
    var grid = $('#grid-estoque'); if (!grid) return;
    var fMarca = $('#f-marca'), fCambio = $('#f-cambio'), fPreco = $('#f-preco'),
        fPrecoVal = $('#f-preco-val'), fBusca = $('#f-busca'), fOrd = $('#f-ordenar'),
        countEl = $('#count');

    // popular marcas
    Store.marcas().forEach(function (m) {
      var o = document.createElement('option'); o.value = m; o.textContent = m; fMarca.appendChild(o);
    });
    // teto de preço dinâmico
    var max = Math.max.apply(null, Store.getVehicles().map(function (v) { return v.preco; }).concat([100000]));
    max = Math.ceil(max / 10000) * 10000;
    fPreco.max = max; fPreco.value = max;
    function precoLabel() { fPrecoVal.textContent = 'Até ' + Store.fmtPreco(fPreco.value); }
    precoLabel();

    function apply() {
      var filters = {
        status: null,
        marca: fMarca.value || null,
        cambio: fCambio.value || null,
        precoMax: Number(fPreco.value) >= max ? null : Number(fPreco.value),
        busca: fBusca.value || null,
        ordenar: fOrd.value || null
      };
      var list = Store.getVehicles(filters);
      grid.innerHTML = list.length ? list.map(carCard).join('')
        : '<div class="empty">Nenhum carro com esses filtros. <a href="#" id="clr" style="color:var(--red);font-weight:700">Limpar filtros</a></div>';
      countEl.innerHTML = '<b>' + list.length + '</b> veículo' + (list.length === 1 ? '' : 's');
      var clr = $('#clr'); if (clr) clr.onclick = function (e) { e.preventDefault(); reset(); };
    }
    function reset() {
      fMarca.value = ''; fCambio.value = ''; fPreco.value = max; fBusca.value = ''; fOrd.value = '';
      precoLabel(); apply();
    }
    [fMarca, fCambio, fOrd].forEach(function (el) { el.addEventListener('change', apply); });
    fBusca.addEventListener('input', apply);
    fPreco.addEventListener('input', function () { precoLabel(); apply(); });
    apply();
  }

  /* ---- DETALHE do veículo ---- */
  function initVeiculo() {
    var box = $('#detalhe'); if (!box) return;
    var id = new URLSearchParams(location.search).get('id');
    var v = id && Store.getVehicle(id);
    if (!v) { box.innerHTML = '<div class="empty" style="margin:40px 0">Veículo não encontrado. <a href="estoque.html" style="color:var(--red);font-weight:700">Ver estoque</a></div>'; return; }
    document.title = v.marca + ' ' + v.modelo + ' ' + v.versao + ' · Dicar Veículos';

    var fotos = (v.fotos && v.fotos.length) ? v.fotos : [Store.placeholder(v)];
    var msg = 'Olá! Tenho interesse no ' + v.marca + ' ' + v.modelo + ' ' + v.versao + ' (' + v.ano + '), ' + Store.fmtPreco(v.preco) + '. Está disponível?';
    var msgFin = 'Olá! Quero simular o financiamento do ' + v.marca + ' ' + v.modelo + ' ' + v.versao + ' (' + v.ano + ').';
    var sold = v.status === 'vendido';

    box.innerHTML =
      '<div class="gallery">' +
        '<div class="main"><img id="main-img" src="' + fotos[0] + '" alt="' + v.modelo + '"></div>' +
        (fotos.length > 1 ? '<div class="thumbs">' + fotos.map(function (f, i) {
          return '<img class="' + (i === 0 ? 'active' : '') + '" src="' + f + '" data-i="' + i + '">';
        }).join('') + '</div>' : '') +
      '</div>' +
      '<div class="dinfo">' +
        '<div class="mk">' + v.marca + (sold ? ' · VENDIDO' : '') + '</div>' +
        '<h1>' + v.modelo + '</h1>' +
        '<div class="vs">' + v.versao + '</div>' +
        '<div class="price">' + Store.fmtPreco(v.preco) + '</div>' +
        '<div class="price-note">Procedência e garantia Dicar · aceitamos seu usado na troca</div>' +
        '<div class="spec-grid">' +
          spec('Ano', v.ano) + spec('Quilometragem', Store.fmtKm(v.km)) +
          spec('Câmbio', v.cambio) + spec('Combustível', v.combustivel) +
          spec('Cor', v.cor) + spec('Portas', v.portas) +
        '</div>' +
        (v.descricao ? '<div class="desc">' + v.descricao + '</div>' : '') +
        '<div class="cta-row">' +
          (sold
            ? '<span class="btn btn-dark">Este veículo já foi vendido</span>'
            : '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + Store.waLink(msg) + '">💬 Falar no WhatsApp</a>' +
              '<a class="btn btn-red" target="_blank" rel="noopener" href="' + Store.waLink(msgFin) + '">Simular financiamento</a>') +
          '<a class="btn btn-outline" href="estoque.html">← Ver estoque</a>' +
        '</div>' +
      '</div>';

    var main = $('#main-img');
    $$('.thumbs img').forEach(function (t) {
      t.addEventListener('click', function () {
        main.src = t.src;
        $$('.thumbs img').forEach(function (x) { x.classList.remove('active'); });
        t.classList.add('active');
      });
    });
    function spec(k, val) { return '<div><div class="k">' + k + '</div><div class="v">' + val + '</div></div>'; }
  }

  /* ---- menu mobile ---- */
  function initMenu() {
    var b = $('#menu-btn'), n = $('#nav-links');
    if (b && n) b.addEventListener('click', function () { n.classList.toggle('show'); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindConfig(); initMenu(); initHome(); initEstoque(); initVeiculo();
  });
})();
