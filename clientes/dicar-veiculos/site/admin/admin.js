/* Dicar Veículos — Central de gestão (painel admin) */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var session = null;
  var fotosTmp = [];
  var L = Store.LIMITS;
  function can(key) { return Store.can(session, key); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function P(n) { return Store.fmtPreco(n); }

  /* Ícones SVG (linha Lucide) — nada de emoji como ícone */
  function svg(inner) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>'; }
  var ICONS = {
    plus: svg('<path d="M12 5v14"/><path d="M5 12h14"/>'),
    edit: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>'),
    trash: svg('<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6M14 11v6"/>'),
    sell: svg('<rect x="2" y="6" width="20" height="12" rx="1.5"/><circle cx="12" cy="12" r="2.3"/><path d="M5 12h.01M19 12h.01"/>'),
    wa: svg('<path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.5L3 21l2-5.7A8.4 8.4 0 1 1 21 11.5Z"/>'),
    car: svg('<path d="M5 12l1-3a1.6 1.6 0 0 1 1.5-1h7A1.6 1.6 0 0 1 17 9l1 3"/><path d="M4 12h16v4h-2"/><path d="M8 16H6"/><circle cx="7.5" cy="16.5" r="1.6"/><circle cx="16.5" cy="16.5" r="1.6"/>'),
    clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    alert: svg('<path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
    site: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.4 2.6 2.4 15.4 0 18M12 3c-2.4 2.6-2.4 15.4 0 18"/>'),
    arrowout: svg('<path d="M7 17 17 7"/><path d="M9 7h8v8"/>'),
    interest: svg('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>'),
    check: svg('<path d="M20 6 9 17l-5-5"/>'),
    grip: svg('<circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/>'),
    kanban: svg('<rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="10" rx="1"/><rect x="17" y="4" width="5" height="13" rx="1"/>'),
    listv: svg('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'),
    search: svg('<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>')
  };
  function ic(name) { return ICONS[name] || ''; }

  /* Toast — feedback quando uma ação respinga em outra seção */
  function toast(html) {
    var wrap = $('#toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.id = 'toast-wrap'; wrap.setAttribute('aria-live', 'polite'); document.body.appendChild(wrap); }
    var t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<span class="ti">' + ic('check') + '</span><div>' + html + '</div>';
    wrap.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('in'); });
    setTimeout(function () { t.classList.remove('in'); setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 250); }, 4200);
  }
  function clientesDoVeiculo(vid) {
    return Store.getClientes().filter(function (c) { return c.veiculoId === vid && c.etapa !== 'fechado' && c.etapa !== 'perdido'; });
  }
  function fotoTag(v, cls) {
    return '<img' + (cls ? ' class="' + cls + '"' : '') + ' alt="' + esc(v.marca + ' ' + v.modelo) + '" src="' + Store.foto(v) +
      '" onerror="this.onerror=null;this.src=\'' + Store.placeholder(v) + '\'">';
  }

  var ETAPAS = [
    { k: 'novo', l: 'Novo' }, { k: 'atendimento', l: 'Em atendimento' },
    { k: 'negociando', l: 'Negociando' }, { k: 'fechado', l: 'Fechado' }, { k: 'perdido', l: 'Perdido' }
  ];
  function etapaLabel(k) { for (var i = 0; i < ETAPAS.length; i++) if (ETAPAS[i].k === k) return ETAPAS[i].l; return k; }
  function etapaBadge(k) { return '<span class="badge et-' + k + '">' + etapaLabel(k) + '</span>'; }

  /* ===================== LOGIN ===================== */
  function showLogin() { $('#login-screen').classList.remove('hide'); $('#shell').classList.add('hide'); }
  function showShell() { $('#login-screen').classList.add('hide'); $('#shell').classList.remove('hide'); }

  $('#login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var s = Store.login($('#li-user').value.trim(), $('#li-pass').value);
    if (!s) { $('#login-err').style.display = 'block'; return; }
    session = s; boot();
  });
  $('#logout').addEventListener('click', function () { Store.logout(); session = null; showLogin(); });

  /* ===================== BOOT ===================== */
  function boot() {
    showShell();
    $('#who-nm').textContent = session.nome;
    $('#who-rl').textContent = session.role === 'admin' ? 'Administrador' : 'Vendedor';
    $$('.sidebar a[data-admin]').forEach(function (a) { a.style.display = session.role === 'admin' ? '' : 'none'; });
    $$('.sidebar a[data-perm]').forEach(function (a) { a.style.display = can(a.getAttribute('data-perm')) ? '' : 'none'; });
    var inicial = (location.hash || '').replace('#', '');
    go(['dash', 'veiculos', 'clientes', 'vendas', 'config'].indexOf(inicial) > -1 ? inicial : 'dash');
  }

  /* navegação */
  $$('.sidebar a[data-view]').forEach(function (a) {
    a.addEventListener('click', function () { go(a.getAttribute('data-view')); });
  });

  /* menu mobile (hambúrguer → gaveta), igual ao do site */
  (function mobileNav() {
    var burger = $('#admin-burger'), shell = $('#shell'), bd = $('#admin-backdrop');
    if (!burger || !shell) return;
    function fechar() { shell.classList.remove('nav-open'); burger.setAttribute('aria-expanded', 'false'); }
    burger.addEventListener('click', function () {
      var aberto = shell.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    });
    if (bd) bd.addEventListener('click', fechar);
    $$('.sidebar a').forEach(function (a) { a.addEventListener('click', fechar); });
  })();
  function go(view) {
    if ((view === 'config') && session.role !== 'admin') view = 'dash';
    if (view === 'clientes' && !can('gerenciarClientes')) view = 'dash';
    if (view === 'vendas' && !can('registrarVenda')) view = 'dash';
    try { if (location.hash !== '#' + view) history.replaceState(null, '', '#' + view); } catch (e) {}
    $$('.sidebar a[data-view]').forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-view') === view); });
    if (view === 'dash') renderDash();
    else if (view === 'veiculos') renderVeiculos();
    else if (view === 'clientes') renderClientes();
    else if (view === 'vendas') renderVendas();
    else if (view === 'config') renderConfig();
  }

  /* ===================== DASHBOARD ===================== */
  function renderDash() {
    if (session.role === 'funcionario') return renderDashVendedor();
    var d = Store.dashboard();
    var html =
      '<div class="admin-top"><h1>Olá, ' + esc(session.nome.split(' ')[0]) + '</h1>' +
        '<button class="btn btn-red" id="add-top">' + ic('plus') + ' Adicionar veículo</button></div>';

    html += '<div class="kpis">' +
      kpi(d.totalEstoque, 'Veículos em estoque') +
      kpi(P(d.valorEstoque), 'Valor em estoque', true) +
      kpi(d.proprios.qtd + ' · ' + P(d.proprios.valor), 'Próprios da loja') +
      kpi(d.consignados.qtd + ' · ' + P(d.consignados.valor), 'Consignados') +
    '</div>';
    html += '<div class="kpis">' +
      kpi(d.vendidosMes, 'Vendas no mês') +
      kpi(P(d.faturamentoMes), 'Faturamento do mês', true) +
      kpi(P(d.ticketMedio), 'Ticket médio') +
      kpi(d.docPendente.length, 'Docs pendentes') +
    '</div>';

    // Veículos parados em estoque (top 5)
    // ----- Comercial + Estoque lado a lado -----
    html += '<div class="dash-cols">';

    // Comercial: funil de clientes + conversão + ranking de vendedores
    html += '<div class="panel"><h3>Comercial</h3>' +
      '<div class="funil-mini">' +
        funilCell('Novos', d.funil.novo) + funilCell('Atendimento', d.funil.atendimento) +
        funilCell('Negociando', d.funil.negociando) + funilCell('Fechados', d.funil.fechado) +
      '</div>' +
      '<div class="conv">Clientes ativos: <b>' + d.clientesAtivos + '</b> · Conversão: <b>' + d.conversao + '%</b></div>' +
      '<h4 class="sub-h">Ranking de vendedores (mês)</h4>' +
      (d.ranking.length
        ? '<table class="adm slim"><tbody>' + d.ranking.map(function (r, i) {
            return '<tr><td>' + (i + 1) + 'º <b>' + esc(r.nome) + '</b></td><td>' + r.qtd + ' venda' + (r.qtd > 1 ? 's' : '') + '</td><td style="text-align:right"><b>' + P(r.valor) + '</b></td></tr>';
          }).join('') + '</tbody></table>'
        : '<p class="muted">Sem vendas neste mês ainda.</p>') +
    '</div>';

    // Estoque: veículos parados
    html += '<div class="panel"><h3>Veículos parados</h3>' +
      '<p class="muted" style="margin:-8px 0 14px;font-size:13px">Os 5 com mais tempo sem girar — hora de repensar preço ou anúncio.</p>' +
      (d.parados.length
        ? '<table class="adm slim"><tbody>' +
            d.parados.map(function (e) {
              return '<tr><td>' + fotoTag(e.v, 'thumb') + '</td>' +
                '<td><b>' + esc(e.v.marca + ' ' + e.v.modelo) + '</b><br><span class="muted" style="font-size:12px">' + esc(e.v.versao || '') + '</span></td>' +
                '<td style="text-align:right"><span class="badge ' + (e.dias > 60 ? 'warn' : 'sold') + '">' + e.dias + ' dias</span></td></tr>';
            }).join('') +
          '</table>'
        : '<p class="muted">Estoque vazio.</p>') +
    '</div>';

    html += '</div>';

    // ----- Gráficos: faturamento por mês (linha) + estoque por tipo (barra) -----
    var fatMeses = Store.faturamentoPorMes(6);
    var porTipo = Store.estoquePorTipo();
    html += '<div class="dash-cols">' +
      '<div class="panel"><h3>Faturamento por mês</h3>' +
        (fatMeses.some(function (m) { return m.valor > 0; })
          ? chartLine(fatMeses.map(function (m) { return { label: m.label, value: m.valor }; }), { fmt: fmtK })
          : '<p class="muted">Sem vendas registradas ainda.</p>') +
      '</div>' +
      '<div class="panel"><h3>Estoque por tipo</h3>' +
        (porTipo.length
          ? chartBar(porTipo.map(function (t) { return { label: t.tipo, value: t.qtd }; }))
          : '<p class="muted">Estoque vazio.</p>') +
      '</div>' +
    '</div>';

    $('#main').innerHTML = html;
    $('#add-top').onclick = function () { openVeiculo(); };
  }
  /* Dashboard do VENDEDOR — visão pessoal (o que é dele) */
  function renderDashVendedor() {
    var d = Store.dashboard(session.user);
    var html =
      '<div class="admin-top"><h1>Olá, ' + esc(session.nome.split(' ')[0]) + '</h1>' +
        (can('registrarVenda') ? '<button class="btn btn-red" id="add-top">' + ic('plus') + ' Nova venda</button>' : '') +
      '</div>';
    html += '<div class="kpis">' +
      kpi(d.vendidosMes, 'Minhas vendas no mês') +
      kpi(P(d.faturamentoMes), 'Meu faturamento', true) +
      kpi(d.clientesAtivos, 'Meus clientes ativos') +
      kpi(d.totalEstoque, 'Veículos disponíveis') +
    '</div>';
    html += '<div class="dash-cols">';
    // Meus retornos (follow-ups)
    html += '<div class="panel"><h3>Meus retornos</h3>' +
      '<p class="muted" style="margin:-8px 0 14px;font-size:13px">Clientes pra dar retorno hoje (ou atrasados). Clique pra abrir.</p>' +
      (d.retornos.length
        ? '<table class="adm slim"><tbody>' + d.retornos.map(function (c) {
            var v = c.veiculoId ? Store.getVehicle(c.veiculoId) : null;
            var alvo = v ? (v.marca + ' ' + v.modelo) : (c.interesse || '—');
            return '<tr data-open="' + c.id + '" style="cursor:pointer"><td><b>' + esc(c.nome) + '</b><br><span class="muted" style="font-size:12px">' + esc(alvo) + '</span></td>' +
              '<td style="text-align:right"><span class="badge warn">' + Store.fmtData(c.proximoContato) + '</span></td></tr>';
          }).join('') + '</tbody></table>'
        : '<p class="muted">Nenhum retorno pendente. Tudo em dia!</p>') +
    '</div>';
    // Meu funil
    html += '<div class="panel"><h3>Meu funil</h3>' +
      '<div class="funil-mini">' +
        funilCell('Novos', d.funil.novo) + funilCell('Atendimento', d.funil.atendimento) +
        funilCell('Negociando', d.funil.negociando) + funilCell('Fechados', d.funil.fechado) +
      '</div>' +
      '<div class="conv">Conversão: <b>' + d.conversao + '%</b> · Ticket médio: <b>' + P(d.ticketMedio) + '</b></div>' +
    '</div>';
    html += '</div>';
    // ----- Gráficos: minhas vendas por mês (linha) + estoque por tipo (barra) -----
    var fatMeses = Store.faturamentoPorMes(6, session.user);
    var porTipo = Store.estoquePorTipo();
    html += '<div class="dash-cols">' +
      '<div class="panel"><h3>Minhas vendas por mês</h3>' +
        (fatMeses.some(function (m) { return m.valor > 0; })
          ? chartLine(fatMeses.map(function (m) { return { label: m.label, value: m.valor }; }), { fmt: fmtK })
          : '<p class="muted">Você ainda não registrou vendas.</p>') +
      '</div>' +
      '<div class="panel"><h3>Estoque por tipo</h3>' +
        (porTipo.length
          ? chartBar(porTipo.map(function (t) { return { label: t.tipo, value: t.qtd }; }))
          : '<p class="muted">Estoque vazio.</p>') +
      '</div>' +
    '</div>';
    $('#main').innerHTML = html;
    var add = $('#add-top'); if (add) add.onclick = function () { openVenda({ origem: 'dash' }); };
    $$('#main [data-open]').forEach(function (r) { r.onclick = function () { openCliente(r.getAttribute('data-open')); }; });
  }
  function funilCell(l, n) { return '<div class="fc"><div class="n">' + n + '</div><div class="l">' + l + '</div></div>'; }
  function fmtK(v) { return v >= 1000 ? 'R$' + Math.round(v / 1000) + 'k' : 'R$' + (v || 0); }

  /* gráficos em SVG puro (sem dependência) */
  function chartLine(points, opts) {
    opts = opts || {};
    if (!points.length) return '<p class="muted">Sem dados.</p>';
    var W = 520, H = 210, padL = 30, padR = 30, padT = 24, padB = 30;
    var max = Math.max.apply(null, points.map(function (p) { return p.value; })) || 1;
    var n = points.length, stepX = (W - padL - padR) / (n > 1 ? n - 1 : 1);
    function X(i) { return padL + stepX * i; }
    function Y(v) { return (H - padB) - (H - padT - padB) * (v / max); }
    var inner = '<line x1="' + padL + '" y1="' + (H - padB) + '" x2="' + (W - padR) + '" y2="' + (H - padB) + '" stroke="#E2E4E8"/>';
    var area = 'M' + X(0) + ' ' + (H - padB) + ' ' + points.map(function (p, i) { return 'L' + X(i) + ' ' + Y(p.value); }).join(' ') + ' L' + X(n - 1) + ' ' + (H - padB) + ' Z';
    var line = points.map(function (p, i) { return (i ? 'L' : 'M') + X(i) + ' ' + Y(p.value); }).join(' ');
    inner += '<path d="' + area + '" fill="rgba(225,20,27,.08)"/>';
    inner += '<path d="' + line + '" fill="none" stroke="var(--red)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
    points.forEach(function (p, i) {
      var x = X(i), y = Y(p.value);
      inner += '<circle cx="' + x + '" cy="' + y + '" r="3.5" fill="#fff" stroke="var(--red)" stroke-width="2"/>';
      inner += '<text x="' + x + '" y="' + (H - padB + 16) + '" text-anchor="middle" class="ch-lab">' + esc(p.label) + '</text>';
      if (p.value > 0) inner += '<text x="' + x + '" y="' + (y - 9) + '" text-anchor="middle" class="ch-val">' + (opts.fmt ? opts.fmt(p.value) : p.value) + '</text>';
    });
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Gráfico de linha">' + inner + '</svg>';
  }
  function chartBar(items, opts) {
    opts = opts || {};
    if (!items.length) return '<p class="muted">Sem dados.</p>';
    var W = 520, H = 210, padL = 10, padR = 10, padT = 24, padB = 30;
    var max = Math.max.apply(null, items.map(function (i) { return i.value; })) || 1;
    var n = items.length, slot = (W - padL - padR) / n, barW = Math.min(48, slot * 0.6);
    var inner = '<line x1="' + padL + '" y1="' + (H - padB) + '" x2="' + (W - padR) + '" y2="' + (H - padB) + '" stroke="#E2E4E8"/>';
    items.forEach(function (it, i) {
      var cx = padL + slot * i + slot / 2;
      var h = Math.round((H - padT - padB) * it.value / max);
      var y = (H - padB) - h;
      inner += '<rect x="' + (cx - barW / 2) + '" y="' + y + '" width="' + barW + '" height="' + h + '" rx="2" fill="var(--red)"/>';
      inner += '<text x="' + cx + '" y="' + (y - 7) + '" text-anchor="middle" class="ch-val">' + (opts.fmt ? opts.fmt(it.value) : it.value) + '</text>';
      inner += '<text x="' + cx + '" y="' + (H - padB + 16) + '" text-anchor="middle" class="ch-lab">' + esc(it.label) + '</text>';
    });
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Gráfico de barras">' + inner + '</svg>';
  }
  function kpi(v, l, red) {
    var txt = (typeof v === 'string' && /\D/.test(v)) ? ' txt' : '';
    return '<div class="kpi"><div class="v' + (red ? ' red' : '') + txt + '">' + v + '</div><div class="l">' + l + '</div></div>';
  }

  /* ===================== ESTOQUE (veículos) ===================== */
  var veiBusca = '', veiMarca = '', veiTipo = '', veiStatus = '', veiOrigem = '', veiOrder = '';
  function veiculosFiltrados() {
    return Store.getVehicles({
      busca: veiBusca || undefined, marca: veiMarca || undefined, tipo: veiTipo || undefined,
      status: veiStatus || undefined, origem: veiOrigem || undefined, ordenar: veiOrder || undefined
    });
  }
  function veiTemFiltro() { return !!(veiBusca || veiMarca || veiTipo || veiStatus || veiOrigem || veiOrder); }
  function renderVeiculos() {
    var todos = Store.getVehicles();
    var tipos = {}; todos.forEach(function (v) { if (v.tipo) tipos[v.tipo] = 1; });
    tipos = Object.keys(tipos).sort();
    function opts(arr, sel, all) {
      return '<option value="">' + all + '</option>' + arr.map(function (o) {
        var val = o.v != null ? o.v : o, lab = o.l != null ? o.l : o;
        return '<option value="' + esc(val) + '"' + (sel === val ? ' selected' : '') + '>' + esc(lab) + '</option>';
      }).join('');
    }
    $('#main').innerHTML =
      '<div class="admin-top"><h1>Estoque <span class="count-pill" id="vei-count">' + todos.length + '</span></h1>' +
        '<button class="btn btn-red" id="add-v">' + ic('plus') + ' Adicionar veículo</button></div>' +
      '<div class="toolbar">' +
        '<div class="search-box">' + ic('search') + '<input id="vei-busca" placeholder="Buscar por marca, modelo ou versão" value="' + esc(veiBusca) + '"></div>' +
        '<select id="vei-marca">' + opts(Store.marcas(), veiMarca, 'Todas as marcas') + '</select>' +
        '<select id="vei-tipo">' + opts(tipos, veiTipo, 'Todos os tipos') + '</select>' +
        '<select id="vei-status">' + opts([{ v: 'disponivel', l: 'Disponível' }, { v: 'negociando', l: 'Negociando' }, { v: 'vendido', l: 'Vendido' }], veiStatus, 'Todas as situações') + '</select>' +
        '<select id="vei-origem">' + opts([{ v: 'proprio', l: 'Próprio' }, { v: 'consignado', l: 'Consignado' }], veiOrigem, 'Toda origem') + '</select>' +
        '<select id="vei-order">' + opts([{ v: 'preco-asc', l: 'Menor preço' }, { v: 'preco-desc', l: 'Maior preço' }, { v: 'km-asc', l: 'Menor KM' }, { v: 'ano-desc', l: 'Mais novo' }], veiOrder, 'Ordenar') + '</select>' +
        (veiTemFiltro() ? '<button class="btn btn-outline btn-sm" id="vei-clear">Limpar</button>' : '') +
      '</div>' +
      '<div id="vei-body"></div>';
    $('#add-v').onclick = function () { openVeiculo(); };
    var bs = $('#vei-busca');
    bs.oninput = function () { veiBusca = bs.value; var p = bs.selectionStart; renderVeiculosTabela(); var nb = $('#vei-busca'); nb.focus(); try { nb.setSelectionRange(p, p); } catch (e) {} };
    $('#vei-marca').onchange = function () { veiMarca = this.value; renderVeiculos(); };
    $('#vei-tipo').onchange = function () { veiTipo = this.value; renderVeiculos(); };
    $('#vei-status').onchange = function () { veiStatus = this.value; renderVeiculos(); };
    $('#vei-origem').onchange = function () { veiOrigem = this.value; renderVeiculos(); };
    $('#vei-order').onchange = function () { veiOrder = this.value; renderVeiculosTabela(); };
    if (veiTemFiltro()) $('#vei-clear').onclick = function () { veiBusca = veiMarca = veiTipo = veiStatus = veiOrigem = veiOrder = ''; renderVeiculos(); };
    renderVeiculosTabela();
  }
  function renderVeiculosTabela() {
    var list = veiculosFiltrados();
    // sem filtro ativo: destaques fixados no topo
    if (!veiTemFiltro()) list = list.slice().sort(function (a, b) { return (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0); });
    var total = Store.getVehicles().length;
    if ($('#vei-count')) $('#vei-count').textContent = veiTemFiltro() ? (list.length + ' de ' + total) : total;
    $('#vei-body').innerHTML =
      '<div class="table-wrap"><table class="adm"><thead><tr>' +
        '<th></th><th>Veículo</th><th>Ano</th><th>Preço</th><th>Origem</th><th>Situação</th><th>Ações</th>' +
        '</tr></thead><tbody>' +
        (list.length ? list.map(rowVeiculo).join('')
          : '<tr><td colspan="7" style="text-align:center;padding:40px;color:#6B7280">' +
            (veiTemFiltro() ? 'Nenhum veículo com esses filtros.' : 'Nenhum veículo. Clique em "Adicionar veículo".') + '</td></tr>') +
      '</tbody></table></div>';
    $$('#vei-body [data-edit]').forEach(function (b) { b.onclick = function () { openVeiculo(b.getAttribute('data-edit')); }; });
    $$('#vei-body [data-del]').forEach(function (b) { b.onclick = function () { delVeiculo(b.getAttribute('data-del')); }; });
    $$('#vei-body [data-sell]').forEach(function (b) { b.onclick = function () { openVenda({ veiculoId: b.getAttribute('data-sell'), origem: 'veiculos' }); }; });
    $$('#vei-body [data-interesse]').forEach(function (b) { b.onclick = function () { openCliente(null, b.getAttribute('data-interesse')); }; });
    $$('#vei-body [data-clientes-de]').forEach(function (b) { b.onclick = function () { clientesFiltroVeiculo = b.getAttribute('data-clientes-de'); clientesView = 'lista'; go('clientes'); }; });
  }
  function rowVeiculo(v) {
    var ativo = v.status !== 'vendido';
    var nInt = clientesDoVeiculo(v.id).length;
    var selo = (nInt && can('gerenciarClientes'))
      ? ' <button class="int-pill" data-clientes-de="' + v.id + '" title="Ver interessados">' + ic('interest') + nInt + '</button>' : '';
    var docFlag = v.docStatus === 'pendente' ? ' <span class="badge warn" title="Documentação pendente">doc</span>' : '';
    return '<tr><td>' + fotoTag(v, 'thumb') + '</td>' +
      '<td><b>' + esc(v.marca + ' ' + v.modelo) + '</b>' + (v.destaque ? ' <span class="badge role">★</span>' : '') + selo +
        '<br><span style="color:#6B7280;font-size:12px">' + esc(v.versao || '') + (v.real === false ? ' · exemplo' : '') + '</span></td>' +
      '<td>' + v.ano + '</td><td><b>' + P(v.preco) + '</b></td>' +
      '<td><span class="badge ' + (v.origem === 'consignado' ? 'role' : 'ok') + '">' + (v.origem === 'consignado' ? 'Consignado' : 'Próprio') + '</span>' + docFlag + '</td>' +
      '<td>' + statusBadge(v) + '</td>' +
      '<td><div class="rowact">' +
        '<button class="iconbtn" data-edit="' + v.id + '" title="Editar veículo">' + ic('edit') + ' Editar</button>' +
        (ativo && can('gerenciarClientes') ? '<button class="iconbtn" data-interesse="' + v.id + '" title="Registrar interesse (novo cliente)" aria-label="Registrar interesse">' + ic('interest') + '</button>' : '') +
        (ativo && can('registrarVenda') ? '<button class="iconbtn" data-sell="' + v.id + '" title="Venda de balcão (sem cliente cadastrado)" aria-label="Venda de balcão">' + ic('sell') + '</button>' : '') +
        '<button class="iconbtn del" data-del="' + v.id + '" title="Remover" aria-label="Remover">' + ic('trash') + '</button>' +
      '</div></td></tr>';
  }
  function statusBadge(v) {
    if (v.status === 'vendido') return '<span class="badge sold">Vendido</span>';
    if (v.status === 'negociando') return '<span class="badge warn">Negociando</span>';
    return '<span class="badge ok">Disponível</span>';
  }
  function delVeiculo(id) {
    var v = Store.getVehicle(id);
    if (confirm('Remover "' + v.marca + ' ' + v.modelo + '" do estoque? Essa ação não pode ser desfeita.')) {
      Store.deleteVehicle(id); renderVeiculos();
    }
  }

  /* ----- modal veículo ----- */
  var mv = $('#modal-veiculo');
  function applyPermFields() {
    $$('#ve-internal [data-perm-field]').forEach(function (el) {
      el.removeAttribute('data-hidden-perm');
      if (!can(el.getAttribute('data-perm-field'))) el.setAttribute('data-hidden-perm', '1');
    });
    var precoEditavel = can('editarPreco');
    $('#ve-preco').readOnly = !precoEditavel;
    $('#ve-preco').style.background = precoEditavel ? '' : '#f4f4f5';
  }
  function toggleOrigem() {
    var consig = $('#ve-origem').value === 'consignado';
    var bloco = $('#ve-consignado-fields');
    var podeVer = can('verConsignante');
    bloco.classList.toggle('hide', !(consig && podeVer));
  }
  function openVeiculo(id) {
    fotosTmp = [];
    applyPermFields();
    var v = id ? Store.getVehicle(id) : null;
    $('#mv-title').textContent = v ? 'Editar veículo' : 'Novo veículo';
    $('#ve-id').value = v ? v.id : '';
    $('#ve-marca').value = v ? v.marca : '';
    $('#ve-modelo').value = v ? v.modelo : '';
    $('#ve-versao').value = v ? v.versao : '';
    $('#ve-tipo').value = v ? (v.tipo || 'Hatch') : 'Hatch';
    $('#ve-ano').value = v ? v.ano : new Date().getFullYear();
    $('#ve-km').value = v ? v.km : '';
    $('#ve-preco').value = v ? v.preco : '';
    $('#ve-cambio').value = v ? v.cambio : 'Manual';
    $('#ve-combustivel').value = v ? v.combustivel : 'Flex';
    $('#ve-cor').value = v ? v.cor : '';
    $('#ve-portas').value = v ? String(v.portas) : '4';
    $('#ve-status').value = v ? v.status : 'disponivel';
    $('#ve-descricao').value = v ? v.descricao : '';
    $('#ve-destaque').checked = v ? !!v.destaque : false;
    $('#ve-origem').value = v ? (v.origem || 'proprio') : 'proprio';
    $('#ve-consignante-nome').value = v ? (v.consignanteNome || '') : '';
    $('#ve-consignante-tel').value = v ? (v.consignanteTel || '') : '';
    $('#ve-placa').value = v ? (v.placa || '') : '';
    $('#ve-doc').value = v ? (v.docStatus || 'ok') : 'ok';
    $('#ve-data-entrada').value = v ? (v.dataEntrada || '') : new Date().toISOString().slice(0, 10);
    $('#ve-obs-internas').value = v ? (v.obsInternas || '') : '';
    fotosTmp = v && v.fotos ? v.fotos.slice() : [];
    renderFotosPrev();
    countChars('#ve-descricao', '#cc-descricao', L.descricao);
    countChars('#ve-obs-internas', '#cc-ve-obs', L.obs);
    toggleOrigem();
    mv.classList.add('open');
  }
  function closeVeiculo() { mv.classList.remove('open'); }
  $$('#modal-veiculo [data-close]').forEach(function (b) { b.onclick = closeVeiculo; });
  mv.addEventListener('click', function (e) { if (e.target === mv) closeVeiculo(); });
  $('#ve-origem').addEventListener('change', toggleOrigem);
  $('#ve-descricao').addEventListener('input', function () { countChars('#ve-descricao', '#cc-descricao', L.descricao); });
  $('#ve-obs-internas').addEventListener('input', function () { countChars('#ve-obs-internas', '#cc-ve-obs', L.obs); });

  $('#ve-fotos').addEventListener('change', function (e) {
    var files = Array.prototype.slice.call(e.target.files);
    files.forEach(function (file) {
      if (fotosTmp.length >= L.fotos) { toast('Limite de ' + L.fotos + ' fotos por veículo atingido.'); return; }
      if (L.tiposFoto.indexOf(file.type) === -1) { toast('Formato não permitido em "' + esc(file.name) + '". Use JPG, PNG ou WEBP.'); return; }
      if (file.size > L.fotoMB * 1024 * 1024) { toast('"' + esc(file.name) + '" passa de ' + L.fotoMB + ' MB e foi ignorada.'); return; }
      var reader = new FileReader();
      reader.onload = function () { if (fotosTmp.length < L.fotos) { fotosTmp.push(reader.result); renderFotosPrev(); } };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  });
  function renderFotosPrev() {
    $('#ve-fotos-prev').innerHTML = fotosTmp.map(function (f, i) {
      return '<div class="pp' + (i === 0 ? ' cover' : '') + '" draggable="true" data-i="' + i + '">' +
        '<img src="' + f + '" alt="">' +
        (i === 0 ? '<span class="pp-cap">Capa</span>'
                 : '<button type="button" class="pp-set" data-set="' + i + '" title="Tornar capa" aria-label="Tornar foto de capa">★</button>') +
        '<button type="button" class="rm" data-rm="' + i + '" aria-label="Remover foto">×</button>' +
      '</div>';
    }).join('');
    $$('#ve-fotos-prev [data-rm]').forEach(function (b) {
      b.onclick = function () { fotosTmp.splice(Number(b.getAttribute('data-rm')), 1); renderFotosPrev(); };
    });
    $$('#ve-fotos-prev [data-set]').forEach(function (b) {
      b.onclick = function () { var i = Number(b.getAttribute('data-set')); fotosTmp.unshift(fotosTmp.splice(i, 1)[0]); renderFotosPrev(); };
    });
    enableFotoDnD();
    $('#cc-fotos').textContent = fotosTmp.length + '/' + L.fotos + (fotosTmp.length ? ' · 1ª = capa' : '');
  }
  // arrastar pra reordenar as fotos (a 1ª é a capa)
  function enableFotoDnD() {
    var from = null;
    $$('#ve-fotos-prev .pp').forEach(function (pp) {
      pp.addEventListener('dragstart', function (e) { from = Number(pp.getAttribute('data-i')); pp.classList.add('dragging'); try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(from)); } catch (x) {} });
      pp.addEventListener('dragend', function () { pp.classList.remove('dragging'); $$('#ve-fotos-prev .pp').forEach(function (p) { p.classList.remove('over'); }); });
      pp.addEventListener('dragover', function (e) { e.preventDefault(); pp.classList.add('over'); });
      pp.addEventListener('dragleave', function () { pp.classList.remove('over'); });
      pp.addEventListener('drop', function (e) {
        e.preventDefault();
        var to = Number(pp.getAttribute('data-i'));
        var f = (from != null) ? from : Number(e.dataTransfer.getData('text/plain'));
        if (isNaN(f) || f === to) { renderFotosPrev(); return; }
        fotosTmp.splice(to, 0, fotosTmp.splice(f, 1)[0]);
        renderFotosPrev();
      });
    });
  }
  $('#form-veiculo').addEventListener('submit', function (e) {
    e.preventDefault();
    var id = $('#ve-id').value;
    var existing = id ? Store.getVehicle(id) : null;
    var origem = $('#ve-origem').value;
    var v = {
      id: id || '',
      real: existing ? existing.real : true,
      marca: $('#ve-marca').value.trim(),
      modelo: $('#ve-modelo').value.trim(),
      versao: $('#ve-versao').value.trim(),
      tipo: $('#ve-tipo').value,
      ano: Number($('#ve-ano').value),
      km: Number($('#ve-km').value),
      preco: Number($('#ve-preco').value),
      cambio: $('#ve-cambio').value,
      combustivel: $('#ve-combustivel').value,
      cor: $('#ve-cor').value.trim(),
      portas: Number($('#ve-portas').value),
      status: $('#ve-status').value,
      descricao: $('#ve-descricao').value.trim(),
      destaque: $('#ve-destaque').checked,
      fotos: fotosTmp.slice(),
      origem: origem,
      consignanteNome: origem === 'consignado' ? $('#ve-consignante-nome').value.trim() : '',
      consignanteTel: origem === 'consignado' ? $('#ve-consignante-tel').value.trim() : '',
      placa: $('#ve-placa').value.trim().toUpperCase(),
      docStatus: $('#ve-doc').value,
      dataEntrada: $('#ve-data-entrada').value || new Date().toISOString().slice(0, 10),
      obsInternas: $('#ve-obs-internas').value.trim()
    };
    if (existing && !can('editarPreco')) v.preco = existing.preco;
    // marcar "Vendido" aqui não vende direto: abre a venda pra registrar o cliente
    // (toda venda precisa vincular veículo + cliente). Só vira vendido ao confirmar.
    var virouVendido = v.status === 'vendido' && (!existing || existing.status !== 'vendido');
    if (virouVendido) v.status = existing ? existing.status : 'disponivel';
    // no máximo 3 veículos em destaque
    if (v.destaque) {
      var outrosDestaque = Store.getVehicles({ destaque: true }).filter(function (x) { return x.id !== v.id; }).length;
      if (outrosDestaque >= 3) { toast('Você já tem 3 veículos em destaque. Tire um do destaque antes de marcar outro.'); return; }
    }
    var salvo = Store.saveVehicle(v);
    closeVeiculo();
    go('veiculos');
    if (virouVendido) openVenda({ veiculoId: salvo.id, origem: 'veiculos' });
  });

  function countChars(inputSel, countSel, max) {
    var el = $(countSel); if (!el) return;
    var n = ($(inputSel).value || '').length;
    el.textContent = n + '/' + max;
    el.classList.toggle('over', n >= max);
  }

  /* =================================================================
     LISTAS PESQUISÁVEIS (datalists)
     ================================================================= */
  function veiculoLabel(v) { return (v.marca + ' ' + v.modelo + ' ' + (v.versao || '') + ' ' + (v.ano || '')).replace(/\s+/g, ' ').trim(); }
  function fillVeiculoDatalists() {
    var todos = Store.getVehicles();
    $('#dl-veiculos').innerHTML = todos.map(function (v) { return '<option value="' + esc(veiculoLabel(v)) + '">'; }).join('');
  }
  function resolveVeiculo(label) {
    label = (label || '').trim().toLowerCase();
    if (!label) return null;
    var f = Store.getVehicles().filter(function (v) { return veiculoLabel(v).toLowerCase() === label; });
    return f.length ? f[0] : null;
  }
  function resolveCliente(nome) {
    nome = (nome || '').trim().toLowerCase();
    if (!nome) return null;
    var f = Store.getClientes().filter(function (c) { return c.nome.toLowerCase() === nome; });
    return f.length ? f[0] : null;
  }

  /* ===================== VENDA ===================== */
  var msv = $('#modal-venda');
  var vendaOrigem = 'vendas';
  function openVenda(opts) {
    opts = opts || {};
    vendaOrigem = opts.origem || 'vendas';
    // veículo — combobox pesquisável (só aceita item do estoque)
    comboFill();
    var v = opts.veiculoId ? Store.getVehicle(opts.veiculoId) : null;
    if (v && v.status === 'vendido') v = null;
    $('#sv-veiculo-id').value = v ? v.id : '';
    $('#sv-veiculo-busca').value = comboSelLabel();
    comboClose();
    // cliente — combobox pesquisável (existentes) + cadastro rápido
    cliComboFill();
    var c = opts.clienteId ? Store.getCliente(opts.clienteId) : null;
    $('#sv-cliente-id').value = c ? c.id : '';
    $('#sv-cliente-busca').value = c ? c.nome : '';
    $('#sv-tel').value = c ? (c.telefone || '') : '';
    $('#sv-cidade').value = c ? (c.cidade || '') : '';
    $('#sv-cliente-hint').textContent = c ? 'Cliente selecionado.' : 'Pesquise um cliente. Se não achar, dá pra cadastrar na hora.';
    cliComboClose();
    // vendedor
    var vendedorSel = session.role === 'funcionario' ? session.user : (c && c.vendedor ? c.vendedor : session.user);
    $('#sv-vendedor').innerHTML = Store.getUsers().map(function (u) {
      return '<option value="' + esc(u.user) + '"' + (u.user === vendedorSel ? ' selected' : '') + '>' + esc(u.nome) + '</option>';
    }).join('');
    $('#sv-vendedor').disabled = (session.role === 'funcionario');  // vendedor registra em seu próprio nome
    $('#sv-data').value = new Date().toISOString().slice(0, 10);
    $('#sv-status').value = 'Concluída';
    $('#sv-valor').removeAttribute('data-auto');
    syncVendaVeiculo();
    msv.classList.add('open');
  }
  function syncVendaVeiculo() {
    var v = Store.getVehicle($('#sv-veiculo-id').value);
    if (!v) { $('#sv-car').style.display = 'none'; return; }
    $('#sv-car').style.display = '';
    $('#sv-car').innerHTML = fotoTag(v) + '<div><b>' + esc(v.marca + ' ' + v.modelo) + '</b><br>' +
      '<span class="muted">' + esc(v.versao || '') + ' · ' + v.ano + '</span><br>Anunciado: <b>' + P(v.preco) + '</b></div>';
    if (!$('#sv-valor').value || $('#sv-valor').getAttribute('data-auto') !== 'no') $('#sv-valor').value = v.preco;
  }
  /* combobox de veículo (venda): pesquisa, mas só seleciona item do estoque */
  var comboItens = [], comboAtivo = -1;
  function comboFill() { comboItens = Store.getVehicles().filter(function (x) { return x.status !== 'vendido'; }); }
  function comboSelLabel() { var v = Store.getVehicle($('#sv-veiculo-id').value); return v ? (veiculoLabel(v) + ' · ' + P(v.preco)) : ''; }
  function comboRender(q) {
    q = (q || '').trim().toLowerCase();
    var list = comboItens.filter(function (v) { return !q || veiculoLabel(v).toLowerCase().indexOf(q) > -1; });
    comboAtivo = -1;
    $('#sv-veiculo-list').innerHTML = list.length
      ? list.map(function (v) { return '<div class="combo-opt" role="option" data-id="' + v.id + '">' + esc(veiculoLabel(v)) + '<span class="combo-pr">' + P(v.preco) + '</span></div>'; }).join('')
      : '<div class="combo-empty">Nenhum veículo no estoque com esse termo</div>';
    $$('#sv-veiculo-list .combo-opt').forEach(function (o) {
      o.addEventListener('mousedown', function (e) { e.preventDefault(); comboPick(o.getAttribute('data-id')); });
    });
  }
  function comboOpen() {
    var inp = $('#sv-veiculo-busca');
    comboRender(inp.value === comboSelLabel() ? '' : inp.value);
    $('#sv-veiculo-list').classList.add('open'); inp.setAttribute('aria-expanded', 'true');
  }
  function comboClose() {
    var l = $('#sv-veiculo-list'); if (l) l.classList.remove('open');
    var b = $('#sv-veiculo-busca'); if (b) b.setAttribute('aria-expanded', 'false');
  }
  function comboPick(id) {
    $('#sv-veiculo-id').value = id;
    $('#sv-veiculo-busca').value = comboSelLabel();
    $('#sv-valor').removeAttribute('data-auto');
    comboClose(); syncVendaVeiculo();
  }
  function comboMove(d) {
    var opts = $$('#sv-veiculo-list .combo-opt'); if (!opts.length) return;
    comboAtivo = (comboAtivo + d + opts.length) % opts.length;
    opts.forEach(function (o, i) { o.classList.toggle('active', i === comboAtivo); });
    opts[comboAtivo].scrollIntoView({ block: 'nearest' });
  }
  $('#sv-veiculo-busca').addEventListener('focus', comboOpen);
  $('#sv-veiculo-busca').addEventListener('input', function () { comboRender(this.value); $('#sv-veiculo-list').classList.add('open'); this.setAttribute('aria-expanded', 'true'); });
  $('#sv-veiculo-busca').addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!$('#sv-veiculo-list').classList.contains('open')) comboOpen(); comboMove(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); comboMove(-1); }
    else if (e.key === 'Enter') { var opts = $$('#sv-veiculo-list .combo-opt'); if (comboAtivo > -1 && opts[comboAtivo]) { e.preventDefault(); comboPick(opts[comboAtivo].getAttribute('data-id')); } }
    else if (e.key === 'Escape') { comboClose(); }
  });
  // ao sair, descarta qualquer texto que não seja um item escolhido (volta pro selecionado)
  $('#sv-veiculo-busca').addEventListener('blur', function () { var b = this; setTimeout(function () { comboClose(); b.value = comboSelLabel(); }, 150); });
  /* combobox de cliente (venda): pesquisa existentes; se não achar, botão de cadastro rápido */
  var cliItens = [], cliAtivo = -1;
  function cliComboFill() { cliItens = Store.getClientes(); }
  function cliComboSelLabel() { var c = Store.getCliente($('#sv-cliente-id').value); return c ? c.nome : ''; }
  function cliMatchExato(q) {
    q = (q || '').trim().toLowerCase(); if (!q) return null;
    var f = cliItens.filter(function (c) { return c.nome.toLowerCase() === q; }); return f.length ? f[0] : null;
  }
  function cliComboRender(q) {
    var raw = (q || '').trim(), ql = raw.toLowerCase();
    var list = cliItens.filter(function (c) { return !ql || (c.nome + ' ' + (c.telefone || '') + ' ' + (c.cidade || '')).toLowerCase().indexOf(ql) > -1; });
    cliAtivo = -1;
    var html = list.map(function (c) {
      return '<div class="combo-opt" role="option" data-id="' + c.id + '">' + esc(c.nome) +
        '<span class="combo-pr">' + esc(c.cidade || c.telefone || '') + '</span></div>';
    }).join('');
    if (raw && !cliMatchExato(raw)) {
      html += '<div class="combo-new" data-new="1">' + ic('plus') + ' Cadastrar novo cliente: <b>' + esc(raw) + '</b></div>';
    }
    if (!html) html = '<div class="combo-empty">Comece a digitar o nome do cliente</div>';
    $('#sv-cliente-list').innerHTML = html;
    $$('#sv-cliente-list .combo-opt').forEach(function (o) {
      o.addEventListener('mousedown', function (e) { e.preventDefault(); cliComboPick(o.getAttribute('data-id')); });
    });
    var nb = $('#sv-cliente-list .combo-new');
    if (nb) nb.addEventListener('mousedown', function (e) { e.preventDefault(); cliComboNovo(raw); });
  }
  function cliComboOpen() { var i = $('#sv-cliente-busca'); cliComboRender(i.value === cliComboSelLabel() ? '' : i.value); $('#sv-cliente-list').classList.add('open'); i.setAttribute('aria-expanded', 'true'); }
  function cliComboClose() { var l = $('#sv-cliente-list'); if (l) l.classList.remove('open'); var b = $('#sv-cliente-busca'); if (b) b.setAttribute('aria-expanded', 'false'); }
  function cliComboPick(id) {
    var c = Store.getCliente(id); if (!c) return;
    $('#sv-cliente-id').value = id;
    $('#sv-cliente-busca').value = c.nome;
    $('#sv-tel').value = c.telefone || '';
    $('#sv-cidade').value = c.cidade || '';
    $('#sv-cliente-hint').textContent = 'Cliente selecionado.';
    cliComboClose();
  }
  function cliComboNovo(nome) {
    $('#sv-cliente-id').value = '';
    $('#sv-cliente-busca').value = nome;
    $('#sv-cliente-hint').innerHTML = '<b class="pos">Novo cliente</b> — preencha telefone e cidade e confirme a venda.';
    cliComboClose();
    $('#sv-tel').focus();
  }
  function cliMove(d) { var opts = $$('#sv-cliente-list .combo-opt'); if (!opts.length) return; cliAtivo = (cliAtivo + d + opts.length) % opts.length; opts.forEach(function (o, i) { o.classList.toggle('active', i === cliAtivo); }); opts[cliAtivo].scrollIntoView({ block: 'nearest' }); }
  $('#sv-cliente-busca').addEventListener('focus', cliComboOpen);
  $('#sv-cliente-busca').addEventListener('input', function () { $('#sv-cliente-id').value = ''; $('#sv-cliente-hint').textContent = 'Pesquise um cliente. Se não achar, dá pra cadastrar na hora.'; cliComboRender(this.value); $('#sv-cliente-list').classList.add('open'); this.setAttribute('aria-expanded', 'true'); });
  $('#sv-cliente-busca').addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!$('#sv-cliente-list').classList.contains('open')) cliComboOpen(); cliMove(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); cliMove(-1); }
    else if (e.key === 'Enter') { var opts = $$('#sv-cliente-list .combo-opt'); if (cliAtivo > -1 && opts[cliAtivo]) { e.preventDefault(); cliComboPick(opts[cliAtivo].getAttribute('data-id')); } }
    else if (e.key === 'Escape') { cliComboClose(); }
  });
  $('#sv-cliente-busca').addEventListener('blur', function () { setTimeout(cliComboClose, 150); });
  $('#sv-valor').addEventListener('input', function () { $('#sv-valor').setAttribute('data-auto', 'no'); });
  function closeVenda() { msv.classList.remove('open'); }
  $$('#modal-venda [data-close-s]').forEach(function (b) { b.onclick = closeVenda; });
  msv.addEventListener('click', function (e) { if (e.target === msv) closeVenda(); });
  $('#form-venda').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = Store.getVehicle($('#sv-veiculo-id').value);
    if (!v || v.status === 'vendido') { toast('Escolha um veículo do estoque para a venda.'); return; }
    var nome = $('#sv-cliente-busca').value.trim();
    if (!nome) { toast('Informe o cliente.'); return; }
    // resolve / cria cliente
    var clienteId = $('#sv-cliente-id').value;
    var existente = resolveCliente(nome);
    var clienteNovo = false;
    if (existente) { clienteId = existente.id; }
    else {
      var novo = Store.saveCliente({
        nome: nome, telefone: $('#sv-tel').value.trim(), cidade: $('#sv-cidade').value.trim(),
        veiculoId: v.id, interesse: '', origem: 'Venda', vendedor: $('#sv-vendedor').value,
        etapa: 'fechado', proximoContato: '', obs: ''
      });
      clienteId = novo.id; clienteNovo = true;
    }
    var venda = Store.registrarVenda({
      veiculoId: v.id, clienteId: clienteId,
      compradorNome: nome, compradorTel: $('#sv-tel').value.trim(), cidade: $('#sv-cidade').value.trim(),
      vendedor: $('#sv-vendedor').value, valorFinal: Number($('#sv-valor').value),
      dataVenda: $('#sv-data').value, status: $('#sv-status').value
    });
    closeVenda();
    if (venda) {
      var msg = '<b>Venda ' + Store.fmtNumeroVenda(venda.numero) + ' registrada</b> · ' + esc(venda.veiculoNome) + ' marcado como vendido';
      if (clienteNovo) msg += ' · cliente ' + esc(nome) + ' cadastrado';
      else msg += ' · cliente ' + esc(nome) + ' fechado';
      toast(msg);
    }
    go(vendaOrigem === 'clientes' ? 'clientes' : (vendaOrigem === 'veiculos' ? 'veiculos' : 'vendas'));
  });

  /* ===================== CLIENTES (CRM) ===================== */
  var clientesView = 'kanban';     // 'kanban' | 'lista'
  var clientesBusca = '';
  var clientesEtapaFiltro = '';
  var clientesFiltroVeiculo = '';
  var clientesVendedorFiltro = '';
  var cliArrastou = false;

  function clientesFiltrados() {
    var list = Store.getClientes();
    if (clientesFiltroVeiculo) list = list.filter(function (c) { return c.veiculoId === clientesFiltroVeiculo; });
    if (clientesVendedorFiltro) list = list.filter(function (c) { return c.vendedor === clientesVendedorFiltro; });
    if (clientesEtapaFiltro) list = list.filter(function (c) { return c.etapa === clientesEtapaFiltro; });
    if (clientesBusca) {
      var q = clientesBusca.toLowerCase();
      list = list.filter(function (c) {
        return (c.nome + ' ' + (c.telefone || '') + ' ' + (c.cidade || '')).toLowerCase().indexOf(q) > -1;
      });
    }
    return list;
  }
  function renderClientes() {
    var ehVend = session.role === 'funcionario';
    if (ehVend) clientesVendedorFiltro = session.user;   // vendedor só vê os dele
    var temLimpar = clientesBusca || clientesEtapaFiltro || (!ehVend && clientesVendedorFiltro);
    var carro = clientesFiltroVeiculo ? Store.getVehicle(clientesFiltroVeiculo) : null;
    var total = clientesFiltrados().length;
    var chip = carro
      ? '<div class="filter-chip">Interessados em <b>' + esc(carro.marca + ' ' + carro.modelo) + '</b><button id="clear-filtro" aria-label="Limpar filtro">×</button></div>'
      : '';
    $('#main').innerHTML =
      '<div class="admin-top"><h1>' + (ehVend ? 'Meus clientes' : 'Clientes') + ' <span class="count-pill">' + total + '</span></h1>' +
        '<div class="top-actions">' +
          '<div class="segmented">' +
            '<button class="seg' + (clientesView === 'kanban' ? ' active' : '') + '" data-cv="kanban">' + ic('kanban') + ' Kanban</button>' +
            '<button class="seg' + (clientesView === 'lista' ? ' active' : '') + '" data-cv="lista">' + ic('listv') + ' Lista</button>' +
          '</div>' +
          '<button class="btn btn-red" id="add-c">' + ic('plus') + ' Novo cliente</button>' +
        '</div></div>' +
      chip +
      '<div class="toolbar">' +
        '<div class="search-box">' + ic('search') + '<input id="cli-busca" placeholder="Buscar por nome, telefone ou cidade" value="' + esc(clientesBusca) + '"></div>' +
        (ehVend ? '' :
          '<select id="cli-vendedor-f"><option value="">Todos os vendedores</option>' +
            Store.getUsers().map(function (u) { return '<option value="' + esc(u.user) + '"' + (clientesVendedorFiltro === u.user ? ' selected' : '') + '>' + esc(u.nome) + '</option>'; }).join('') +
          '</select>') +
        '<select id="cli-etapa-f"><option value="">Todas as etapas</option>' +
          ETAPAS.map(function (e) { return '<option value="' + e.k + '"' + (clientesEtapaFiltro === e.k ? ' selected' : '') + '>' + e.l + '</option>'; }).join('') +
        '</select>' +
        (temLimpar ? '<button class="btn btn-outline btn-sm" id="cli-clear">Limpar</button>' : '') +
      '</div>' +
      '<div id="cli-body"></div>';
    $('#add-c').onclick = function () { openCliente(); };
    if (carro) $('#clear-filtro').onclick = function () { clientesFiltroVeiculo = ''; renderClientes(); };
    $$('#main [data-cv]').forEach(function (b) { b.onclick = function () { clientesView = b.getAttribute('data-cv'); renderClientes(); }; });
    var bs = $('#cli-busca');
    bs.oninput = function () { clientesBusca = bs.value; renderCliBody(); };
    var vf = $('#cli-vendedor-f'); if (vf) vf.onchange = function () { clientesVendedorFiltro = this.value; renderClientes(); };
    $('#cli-etapa-f').onchange = function () { clientesEtapaFiltro = this.value; renderClientes(); };
    if (temLimpar) $('#cli-clear').onclick = function () {
      clientesBusca = ''; clientesEtapaFiltro = '';
      if (!ehVend) clientesVendedorFiltro = '';   // vendedor mantém o próprio filtro
      renderClientes();
    };
    renderCliBody();
  }
  function renderCliBody() {
    if (clientesView === 'kanban') renderKanban(); else renderListaClientes();
  }

  function bindClienteCardActions(scope) {
    $$(scope + ' [data-ec]').forEach(function (b) { b.onclick = function () { openCliente(b.getAttribute('data-ec')); }; });
    $$(scope + ' [data-dc]').forEach(function (b) { b.onclick = function () {
      if (confirm('Remover este cliente?')) { Store.deleteCliente(b.getAttribute('data-dc')); renderClientes(); }
    }; });
    $$(scope + ' [data-sell-cli]').forEach(function (b) { b.onclick = function () {
      var c = Store.getCliente(b.getAttribute('data-sell-cli'));
      openVenda({ veiculoId: c.veiculoId, clienteId: c.id, origem: 'clientes' });
    }; });
  }

  /* ----- Kanban com arrastar e soltar ----- */
  function renderKanban() {
    var leads = clientesFiltrados();
    var cols = ETAPAS.map(function (et) {
      var doStage = leads.filter(function (l) { return l.etapa === et.k; });
      return '<div class="kanban-col" data-stage="' + et.k + '">' +
        '<div class="kc-head ' + et.k + '">' + et.l + ' <span>' + doStage.length + '</span></div>' +
        '<div class="kc-body" data-drop="' + et.k + '">' +
          (doStage.length ? doStage.map(clienteCard).join('') : '<p class="kc-empty">Arraste pra cá</p>') +
        '</div></div>';
    }).join('');
    $('#cli-body').innerHTML = '<p class="muted" style="margin:0 0 14px">Arraste os cards entre as colunas pra mudar a etapa. Clique num card pra ver tudo e editar.</p>' +
      '<div class="kanban">' + cols + '</div>';
    $$('#cli-body [data-open]').forEach(function (card) {
      card.addEventListener('click', function () { if (!cliArrastou) openCliente(card.getAttribute('data-open')); });
    });
    enableDnD();
  }
  function clienteCard(c) {
    var v = c.veiculoId ? Store.getVehicle(c.veiculoId) : null;
    var interesse = v ? (v.marca + ' ' + v.modelo) : (c.interesse || 'Sem definição');
    var alerta = '';
    if (c.proximoContato) {
      var hoje = new Date().toISOString().slice(0, 10);
      if (c.proximoContato <= hoje && c.etapa !== 'fechado' && c.etapa !== 'perdido') alerta = '<span class="lc-due">' + ic('clock') + ' retornar</span>';
    }
    // só o essencial — o resto abre no popup ao clicar
    return '<div class="lead-card" draggable="true" data-card="' + c.id + '" data-open="' + c.id + '">' +
      '<div class="lc-grip">' + ic('grip') + '</div>' +
      '<div class="lc-top"><b>' + esc(c.nome) + '</b>' + alerta + '</div>' +
      '<div class="lc-int">' + ic('car') + ' ' + esc(interesse) + '</div>' +
    '</div>';
  }
  function enableDnD() {
    var dragId = null;
    $$('#cli-body .lead-card').forEach(function (card) {
      card.addEventListener('dragstart', function (e) { dragId = card.getAttribute('data-card'); cliArrastou = true; card.classList.add('dragging'); try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragId); } catch (x) {} });
      card.addEventListener('dragend', function () { dragId = null; card.classList.remove('dragging'); $$('#cli-body .kanban-col').forEach(function (c) { c.classList.remove('drag-over'); }); setTimeout(function () { cliArrastou = false; }, 60); });
    });
    $$('#cli-body .kc-body').forEach(function (zone) {
      var col = zone.parentNode;
      zone.addEventListener('dragover', function (e) { e.preventDefault(); col.classList.add('drag-over'); });
      zone.addEventListener('dragleave', function () { col.classList.remove('drag-over'); });
      zone.addEventListener('drop', function (e) {
        e.preventDefault();
        var id = dragId || (e.dataTransfer && e.dataTransfer.getData('text/plain'));
        var etapa = zone.getAttribute('data-drop');
        if (id && etapa) { Store.setClienteEtapa(id, etapa); renderClientes(); }
      });
    });
  }

  /* ----- Lista de clientes (busca / ordenação / filtro) ----- */
  function renderListaClientes() {
    var list = clientesFiltrados().slice().sort(function (a, b) { return a.nome.localeCompare(b.nome); });
    $('#cli-body').innerHTML =
      '<div class="table-wrap"><table class="adm"><thead><tr>' +
        '<th>Cliente</th><th>Telefone</th><th>Cidade</th><th>Interesse</th><th>Etapa</th><th>Vendedor</th><th>Ações</th>' +
        '</tr></thead><tbody>' +
        (list.length ? list.map(function (c) {
          var v = c.veiculoId ? Store.getVehicle(c.veiculoId) : null;
          var fechavel = can('registrarVenda') && c.etapa !== 'fechado' && c.etapa !== 'perdido';
          return '<tr><td><b>' + esc(c.nome) + '</b></td>' +
            '<td>' + esc(c.telefone || '—') + '</td>' +
            '<td>' + esc(c.cidade || '—') + '</td>' +
            '<td>' + esc(v ? (v.marca + ' ' + v.modelo) : (c.interesse || '—')) + '</td>' +
            '<td>' + etapaBadge(c.etapa) + '</td>' +
            '<td>' + esc(Store.userName(c.vendedor)) + '</td>' +
            '<td><div class="rowact">' +
              (fechavel ? '<button class="iconbtn sell" data-sell-cli="' + c.id + '" title="Fechar venda">' + ic('sell') + '</button>' : '') +
              '<button class="iconbtn" data-ec="' + c.id + '" title="Editar" aria-label="Editar">' + ic('edit') + '</button>' +
              '<button class="iconbtn del" data-dc="' + c.id + '" title="Remover" aria-label="Remover">' + ic('trash') + '</button>' +
            '</div></td></tr>';
        }).join('') : '<tr><td colspan="7" style="text-align:center;padding:40px;color:#6B7280">Nenhum cliente encontrado.</td></tr>') +
      '</tbody></table></div>';
    bindClienteCardActions('#cli-body');
  }

  /* ----- modal cliente ----- */
  var mc = $('#modal-cliente');
  function fillVendedorSelect(sel, selected) {
    sel.innerHTML = Store.getUsers().map(function (u) {
      return '<option value="' + esc(u.user) + '"' + (u.user === selected ? ' selected' : '') + '>' + esc(u.nome) + '</option>';
    }).join('');
  }
  function openCliente(id, presetVeiculo) {
    fillVeiculoDatalists();
    var c = id ? Store.getCliente(id) : null;
    $('#mc-title').textContent = c ? 'Editar cliente' : 'Novo cliente';
    $('#cl-id').value = c ? c.id : '';
    $('#cl-nome').value = c ? c.nome : '';
    $('#cl-tel').value = c ? (c.telefone || '') : '';
    $('#cl-cidade').value = c ? (c.cidade || '') : '';
    $('#cl-origem').value = c ? (c.origem || 'WhatsApp') : 'WhatsApp';
    // campo de veículo pesquisável (estoque) ou texto livre
    var vbusca = '';
    if (c && c.veiculoId) { var vv = Store.getVehicle(c.veiculoId); vbusca = vv ? veiculoLabel(vv) : (c.interesse || ''); }
    else if (c) vbusca = c.interesse || '';
    else if (presetVeiculo) { var pv = Store.getVehicle(presetVeiculo); vbusca = pv ? veiculoLabel(pv) : ''; }
    $('#cl-veiculo-busca').value = vbusca;
    fillVendedorSelect($('#cl-vendedor'), c ? c.vendedor : session.user);
    // vendedor não reatribui cliente pra outro: trava no próprio nome
    $('#cl-vendedor').disabled = (session.role === 'funcionario');
    $('#cl-etapa').value = c ? c.etapa : 'novo';
    $('#cl-proximo').value = c ? (c.proximoContato || '') : '';
    $('#cl-obs').value = c ? (c.obs || '') : '';
    countChars('#cl-obs', '#cc-obs', L.obs);
    // ações rápidas + remover (só ao editar um cliente existente)
    var actions = '';
    if (c) {
      if (c.telefone) actions += '<a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="https://wa.me/55' + c.telefone.replace(/\D/g, '') + '">' + ic('wa') + ' WhatsApp</a>';
      if (can('registrarVenda') && c.etapa !== 'fechado' && c.etapa !== 'perdido') actions += '<button type="button" class="btn btn-sm cl-fechar-btn" id="cl-fechar">' + ic('sell') + ' Fechar venda</button>';
    }
    $('#cl-actions').innerHTML = actions;
    $('#cl-del').style.display = c ? '' : 'none';
    if (c) {
      var fc = $('#cl-fechar');
      if (fc) fc.onclick = function () { closeCliente(); openVenda({ veiculoId: c.veiculoId, clienteId: c.id, origem: 'clientes' }); };
      $('#cl-del').onclick = function () { if (confirm('Remover este cliente?')) { Store.deleteCliente(c.id); closeCliente(); renderClientes(); } };
    }
    mc.classList.add('open');
  }
  function closeCliente() { mc.classList.remove('open'); }
  $$('#modal-cliente [data-close-c]').forEach(function (b) { b.onclick = closeCliente; });
  mc.addEventListener('click', function (e) { if (e.target === mc) closeCliente(); });
  $('#cl-obs').addEventListener('input', function () { countChars('#cl-obs', '#cc-obs', L.obs); });
  $('#form-cliente').addEventListener('submit', function (e) {
    e.preventDefault();
    var vbusca = $('#cl-veiculo-busca').value.trim();
    var v = resolveVeiculo(vbusca);
    Store.saveCliente({
      id: $('#cl-id').value,
      nome: $('#cl-nome').value.trim(),
      telefone: $('#cl-tel').value.trim(),
      cidade: $('#cl-cidade').value.trim(),
      veiculoId: v ? v.id : '',
      interesse: v ? '' : vbusca,
      origem: $('#cl-origem').value,
      vendedor: $('#cl-vendedor').value,
      etapa: $('#cl-etapa').value,
      proximoContato: $('#cl-proximo').value,
      obs: $('#cl-obs').value.trim()
    });
    closeCliente(); renderClientes();
  });

  /* ===================== VENDAS ===================== */
  function renderVendas() {
    var meses = Store.mesesComVenda();
    var sel = '';
    $('#main').innerHTML =
      '<div class="admin-top"><h1>' + (session.role === 'funcionario' ? 'Minhas vendas' : 'Vendas') + '</h1>' +
        '<div class="top-actions">' +
          '<select id="vn-mes" class="rel-select"><option value="">Todo o período</option>' +
            meses.map(function (m) { return '<option value="' + m + '"' + (m === sel ? ' selected' : '') + '>' + Store.fmtMes(m) + '</option>'; }).join('') +
          '</select>' +
          '<button class="btn btn-red" id="nova-venda">' + ic('plus') + ' Nova venda</button>' +
        '</div></div>' +
      '<div id="vn-body"></div>';
    $('#nova-venda').onclick = function () { openVenda({ origem: 'vendas' }); };
    $('#vn-mes').onchange = function () { renderVendasBody($('#vn-mes').value); };
    renderVendasBody('');
  }
  function renderVendasBody(mes) {
    var vend = session.role === 'funcionario' ? session.user : null;   // vendedor vê só as dele
    var vendas = Store.relatorio(mes, vend).filter(function (s) { return s.status !== 'Cancelada'; });
    var todas = Store.relatorio(mes, vend);
    var fat = vendas.reduce(function (a, s) { return a + s.valorFinal; }, 0);
    var ticket = vendas.length ? Math.round(fat / vendas.length) : 0;
    var html = '<div class="kpis">' +
      kpi(vendas.length, 'Vendas no período') +
      kpi(P(fat), 'Faturamento', true) +
      kpi(P(ticket), 'Ticket médio') +
    '</div>';
    var podeCancelar = can('registrarVenda');
    html += '<div class="table-wrap"><table class="adm"><thead><tr>' +
      '<th>Nº</th><th>Cliente</th><th>Veículo</th><th>Valor</th><th>Data</th><th>Vendedor</th><th>Status</th><th>Ações</th>' +
      '</tr></thead><tbody>' +
      (todas.length ? todas.map(function (s) {
        var cancelada = s.status === 'Cancelada';
        return '<tr' + (cancelada ? ' class="row-off"' : '') + '><td><b>' + Store.fmtNumeroVenda(s.numero) + '</b></td>' +
          '<td>' + esc(s.compradorNome || Store.nomeCliente(s.clienteId)) + (s.cidade ? '<br><span class="muted" style="font-size:12px">' + esc(s.cidade) + '</span>' : '') + '</td>' +
          '<td>' + esc(s.veiculoNome) + '</td>' +
          '<td><b>' + P(s.valorFinal) + '</b></td>' +
          '<td>' + Store.fmtData(s.dataVenda) + '</td>' +
          '<td>' + esc(Store.userName(s.vendedor)) + '</td>' +
          '<td><span class="badge ' + (cancelada ? 'sold' : 'ok') + '">' + esc(s.status) + '</span></td>' +
          '<td><div class="rowact">' + (!cancelada && podeCancelar
            ? '<button class="iconbtn del" data-cancel="' + s.id + '">Cancelar</button>'
            : '<span class="muted" style="font-size:12px">—</span>') + '</div></td></tr>';
      }).join('') : '<tr><td colspan="8" style="text-align:center;padding:40px;color:#6B7280">Nenhuma venda registrada neste período. Clique em "Nova venda".</td></tr>') +
    '</tbody></table></div>';
    $('#vn-body').innerHTML = html;
    $$('#vn-body [data-cancel]').forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute('data-cancel');
        var s = Store.getVendas().filter(function (x) { return x.id === id; })[0];
        if (!s) return;
        if (confirm('Cancelar a venda ' + Store.fmtNumeroVenda(s.numero) + '? O veículo volta pro estoque como disponível.')) {
          var venda = Store.cancelarVenda(id);
          renderVendasBody(mes);
          if (venda) toast('<b>Venda ' + Store.fmtNumeroVenda(venda.numero) + ' cancelada</b> · ' + esc(venda.veiculoNome) + ' voltou ao estoque');
        }
      };
    });
  }

  /* ===================== CONFIGURAÇÕES ===================== */
  var PERMS = [
    { k: 'editarPreco', l: 'Editar preço anunciado', d: 'Alterar o preço que vai pro site.' },
    { k: 'verConsignante', l: 'Ver dados do consignante', d: 'Nome e telefone de quem deixou o veículo.' },
    { k: 'registrarVenda', l: 'Registrar venda', d: 'Marcar veículo como vendido e lançar a venda.' },
    { k: 'gerenciarClientes', l: 'Gerenciar clientes (CRM)', d: 'Cadastrar e acompanhar contatos.' }
  ];
  var configTabAtual = 'loja';
  function renderConfig() {
    $('#main').innerHTML =
      '<div class="admin-top"><h1>Configurações</h1></div>' +
      '<div class="tabs">' +
        '<button class="tab' + (configTabAtual === 'loja' ? ' active' : '') + '" data-tab="loja">Dados da loja</button>' +
        '<button class="tab' + (configTabAtual === 'permissoes' ? ' active' : '') + '" data-tab="permissoes">Permissões do vendedor</button>' +
        '<button class="tab' + (configTabAtual === 'funcionarios' ? ' active' : '') + '" data-tab="funcionarios">Funcionários</button>' +
        '<a class="tablink" href="../index.html" target="_blank" rel="noopener">' + ic('site') + ' Ver site' + ic('arrowout') + '</a>' +
      '</div>' +
      '<div id="cfg-tab"></div>';
    $$('#main button.tab').forEach(function (b) { b.onclick = function () { configTabAtual = b.getAttribute('data-tab'); renderConfig(); }; });
    if (configTabAtual === 'permissoes') { $('#cfg-tab').innerHTML = permissoesSection(); bindPermissoes(); }
    else if (configTabAtual === 'funcionarios') renderFuncionarios();
    else renderConfigLoja();
  }
  function permissoesSection() {
    var p = Store.getPerms();
    return '<p class="muted" style="margin:0 0 18px">Você (dono) decide o que cada vendedor pode ver e fazer. O administrador sempre tem acesso total.</p>' +
      '<div class="table-wrap" style="padding:8px 0;max-width:680px">' +
        PERMS.map(function (perm) {
          return '<div class="perm-row"><div><b>' + perm.l + '</b><br><span class="muted">' + perm.d + '</span></div>' +
            '<label class="toggle"><input type="checkbox" data-perm="' + perm.k + '"' + (p[perm.k] ? ' checked' : '') + '><span class="track"></span></label></div>';
        }).join('') +
      '</div>' +
      '<span id="perm-ok" class="save-ok">✓ Salvo automaticamente</span>';
  }
  function bindPermissoes() {
    $$('#main [data-perm]').forEach(function (cb) {
      cb.onchange = function () {
        var patch = {}; patch[cb.getAttribute('data-perm')] = cb.checked;
        Store.savePerms(patch);
        var ok = $('#perm-ok'); ok.style.opacity = '1'; setTimeout(function () { ok.style.opacity = '0'; }, 1500);
      };
    });
  }
  function renderConfigLoja() {
    var c = Store.getConfig();
    $('#cfg-tab').innerHTML =
      '<p class="muted" style="margin:0 0 20px">Esses dados aparecem no site (contato, WhatsApp, endereço).</p>' +
      '<div class="table-wrap" style="padding:24px;max-width:640px">' +
        '<form id="form-config">' +
          cfgField('whatsapp', 'WhatsApp (só números, com DDD e 55)', c.whatsapp) +
          cfgField('telefoneExibicao', 'Telefone exibido', c.telefoneExibicao) +
          cfgField('endereco', 'Endereço', c.endereco) +
          cfgField('horario', 'Horário de atendimento', c.horario) +
          cfgField('instagram', 'Instagram (sem @)', c.instagram) +
          cfgField('mapa', 'Link do Google Maps', c.mapa) +
          '<button class="btn btn-red" type="submit">Salvar configurações</button>' +
          '<span id="cfg-ok" class="save-ok" style="margin-left:14px">✓ Salvo!</span>' +
        '</form>' +
      '</div>';
    $('#form-config').addEventListener('submit', function (e) {
      e.preventDefault();
      Store.saveConfig({
        whatsapp: $('#cf-whatsapp').value.trim(),
        telefoneExibicao: $('#cf-telefoneExibicao').value.trim(),
        endereco: $('#cf-endereco').value.trim(),
        horario: $('#cf-horario').value.trim(),
        instagram: $('#cf-instagram').value.trim().replace('@', ''),
        mapa: $('#cf-mapa').value.trim()
      });
      var ok = $('#cfg-ok'); ok.style.opacity = '1'; setTimeout(function () { ok.style.opacity = '0'; }, 2000);
    });
  }
  function cfgField(k, label, val) {
    return '<div class="field"><label>' + label + '</label><input id="cf-' + k + '" value="' + esc(val) + '"></div>';
  }
  function renderFuncionarios() {
    var users = Store.getUsers();
    $('#cfg-tab').innerHTML =
      '<div class="admin-top" style="margin-bottom:8px"><p class="muted" style="margin:0">Quem pode acessar o painel. O que cada vendedor vê é definido na aba <b>Permissões</b>.</p>' +
        '<button class="btn btn-red" id="add-u">' + ic('plus') + ' Adicionar funcionário</button></div>' +
      '<div class="table-wrap" style="margin-top:14px"><table class="adm"><thead><tr>' +
        '<th>Nome</th><th>Usuário</th><th>Acesso</th><th>Ações</th></tr></thead><tbody>' +
        users.map(function (u) {
          var isMe = u.user === session.user;
          return '<tr><td><b>' + esc(u.nome) + '</b>' + (isMe ? ' <span style="color:#6B7280;font-size:12px">(você)</span>' : '') + '</td>' +
            '<td>' + esc(u.user) + '</td>' +
            '<td><span class="badge ' + (u.role === 'admin' ? 'role' : 'ok') + '">' + (u.role === 'admin' ? 'Administrador' : 'Vendedor') + '</span></td>' +
            '<td><div class="rowact">' +
              '<button class="iconbtn" data-eu="' + esc(u.user) + '">' + ic('edit') + ' Editar</button>' +
              (isMe ? '' : '<button class="iconbtn del" data-du="' + esc(u.user) + '" aria-label="Remover">' + ic('trash') + '</button>') +
            '</div></td></tr>';
        }).join('') +
      '</tbody></table></div>';
    $('#add-u').onclick = function () { openUser(); };
    $$('#cfg-tab [data-eu]').forEach(function (b) { b.onclick = function () { openUser(b.getAttribute('data-eu')); }; });
    $$('#cfg-tab [data-du]').forEach(function (b) { b.onclick = function () {
      var user = b.getAttribute('data-du');
      if (confirm('Remover o acesso de "' + user + '"?')) { Store.deleteUser(user); renderFuncionarios(); }
    }; });
  }
  var mu = $('#modal-user');
  function openUser(user) {
    var u = user ? Store.getUsers().filter(function (x) { return x.user === user; })[0] : null;
    $('#mu-title').textContent = u ? 'Editar funcionário' : 'Novo funcionário';
    $('#us-orig').value = u ? u.user : '';
    $('#us-nome').value = u ? u.nome : '';
    $('#us-user').value = u ? u.user : '';
    $('#us-senha').value = u ? u.senha : '';
    $('#us-role').value = u ? u.role : 'funcionario';
    mu.classList.add('open');
  }
  function closeUser() { mu.classList.remove('open'); }
  $$('#modal-user [data-close-u]').forEach(function (b) { b.onclick = closeUser; });
  mu.addEventListener('click', function (e) { if (e.target === mu) closeUser(); });
  $('#form-user').addEventListener('submit', function (e) {
    e.preventDefault();
    var u = {
      nome: $('#us-nome').value.trim(),
      user: $('#us-user').value.trim(),
      senha: $('#us-senha').value,
      role: $('#us-role').value
    };
    Store.saveUser(u, $('#us-orig').value || null);
    closeUser(); renderFuncionarios();
  });

  /* ===================== INÍCIO ===================== */
  (function init() {
    session = Store.session();
    if (session) boot(); else showLogin();
  })();
})();
