/* Dicar Veículos — painel admin */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var session = null;
  var fotosTmp = []; // fotos em edição (base64)

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
    $('#who-rl').textContent = session.role === 'admin' ? 'Administrador' : 'Funcionário';
    // gating por papel
    $$('[data-admin]').forEach(function (a) { a.style.display = session.role === 'admin' ? '' : 'none'; });
    go('dash');
  }

  /* navegação */
  $$('#menu a[data-view]').forEach(function (a) {
    a.addEventListener('click', function () { go(a.getAttribute('data-view')); });
  });
  function go(view) {
    if ((view === 'funcionarios' || view === 'config') && session.role !== 'admin') view = 'dash';
    $$('#menu a[data-view]').forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-view') === view); });
    if (view === 'dash') renderDash();
    else if (view === 'veiculos') renderVeiculos();
    else if (view === 'funcionarios') renderFuncionarios();
    else if (view === 'config') renderConfig();
  }

  /* ===================== DASHBOARD ===================== */
  function renderDash() {
    var all = Store.getVehicles();
    var disp = all.filter(function (v) { return v.status === 'disponivel'; });
    var sold = all.filter(function (v) { return v.status === 'vendido'; });
    var dest = all.filter(function (v) { return v.destaque; });
    $('#main').innerHTML =
      '<div class="admin-top"><h1>Olá, ' + session.nome.split(' ')[0] + ' 👋</h1>' +
        '<button class="btn btn-red" id="add-top">+ Adicionar veículo</button></div>' +
      '<div class="kpis">' +
        kpi(all.length, 'Total no estoque') +
        kpi(disp.length, 'Disponíveis', true) +
        kpi(sold.length, 'Vendidos') +
        kpi(dest.length, 'Em destaque') +
      '</div>' +
      '<div class="table-wrap"><table class="adm"><thead><tr>' +
        '<th></th><th>Veículo</th><th>Ano</th><th>Preço</th><th>Situação</th></tr></thead><tbody>' +
        all.slice(0, 6).map(function (v) {
          return '<tr><td><img class="thumb" src="' + Store.foto(v) + '"></td>' +
            '<td><b>' + v.marca + ' ' + v.modelo + '</b><br><span style="color:#6B7280;font-size:12px">' + v.versao + '</span></td>' +
            '<td>' + v.ano + '</td><td><b>' + Store.fmtPreco(v.preco) + '</b></td>' +
            '<td>' + statusBadge(v) + '</td></tr>';
        }).join('') +
      '</tbody></table></div>';
    $('#add-top').onclick = function () { openVeiculo(); };
  }
  function kpi(v, l, red) { return '<div class="kpi"><div class="v' + (red ? ' red' : '') + '">' + v + '</div><div class="l">' + l + '</div></div>'; }
  function statusBadge(v) {
    return v.status === 'vendido' ? '<span class="badge sold">Vendido</span>' : '<span class="badge ok">Disponível</span>';
  }

  /* ===================== VEÍCULOS ===================== */
  function renderVeiculos() {
    var all = Store.getVehicles();
    $('#main').innerHTML =
      '<div class="admin-top"><h1>Veículos <span style="color:#6B7280;font-weight:600;font-size:16px">(' + all.length + ')</span></h1>' +
        '<button class="btn btn-red" id="add-v">+ Adicionar veículo</button></div>' +
      '<div class="table-wrap"><table class="adm"><thead><tr>' +
        '<th></th><th>Veículo</th><th>Ano</th><th>KM</th><th>Preço</th><th>Situação</th><th>Ações</th>' +
        '</tr></thead><tbody>' +
        (all.length ? all.map(rowVeiculo).join('') : '<tr><td colspan="7" style="text-align:center;padding:40px;color:#6B7280">Nenhum veículo. Clique em "Adicionar veículo".</td></tr>') +
      '</tbody></table></div>';
    $('#add-v').onclick = function () { openVeiculo(); };
    $$('#main [data-edit]').forEach(function (b) { b.onclick = function () { openVeiculo(b.getAttribute('data-edit')); }; });
    $$('#main [data-del]').forEach(function (b) { b.onclick = function () { delVeiculo(b.getAttribute('data-del')); }; });
  }
  function rowVeiculo(v) {
    return '<tr><td><img class="thumb" src="' + Store.foto(v) + '"></td>' +
      '<td><b>' + v.marca + ' ' + v.modelo + '</b>' + (v.destaque ? ' <span class="badge role">★ destaque</span>' : '') +
        '<br><span style="color:#6B7280;font-size:12px">' + v.versao + (v.real === false ? ' · exemplo' : '') + '</span></td>' +
      '<td>' + v.ano + '</td><td>' + Store.fmtKm(v.km) + '</td><td><b>' + Store.fmtPreco(v.preco) + '</b></td>' +
      '<td>' + statusBadge(v) + '</td>' +
      '<td><div class="rowact">' +
        '<button class="iconbtn" data-edit="' + v.id + '">✏️ Editar</button>' +
        '<button class="iconbtn del" data-del="' + v.id + '">🗑️</button>' +
      '</div></td></tr>';
  }
  function delVeiculo(id) {
    var v = Store.getVehicle(id);
    if (confirm('Remover "' + v.marca + ' ' + v.modelo + '" do site? Essa ação não pode ser desfeita.')) {
      Store.deleteVehicle(id); renderVeiculos();
    }
  }

  /* ----- modal veículo ----- */
  var mv = $('#modal-veiculo');
  function openVeiculo(id) {
    fotosTmp = [];
    var v = id ? Store.getVehicle(id) : null;
    $('#mv-title').textContent = v ? 'Editar veículo' : 'Novo veículo';
    $('#ve-id').value = v ? v.id : '';
    $('#ve-marca').value = v ? v.marca : '';
    $('#ve-modelo').value = v ? v.modelo : '';
    $('#ve-versao').value = v ? v.versao : '';
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
    fotosTmp = v && v.fotos ? v.fotos.slice() : [];
    renderFotosPrev();
    mv.classList.add('open');
  }
  function closeVeiculo() { mv.classList.remove('open'); }
  $$('#modal-veiculo [data-close]').forEach(function (b) { b.onclick = closeVeiculo; });
  mv.addEventListener('click', function (e) { if (e.target === mv) closeVeiculo(); });

  $('#ve-fotos').addEventListener('change', function (e) {
    var files = Array.prototype.slice.call(e.target.files);
    files.forEach(function (file) {
      var reader = new FileReader();
      reader.onload = function () { fotosTmp.push(reader.result); renderFotosPrev(); };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  });
  function renderFotosPrev() {
    $('#ve-fotos-prev').innerHTML = fotosTmp.map(function (f, i) {
      return '<div class="pp"><img src="' + f + '"><button type="button" class="rm" data-rm="' + i + '">×</button></div>';
    }).join('');
    $$('#ve-fotos-prev [data-rm]').forEach(function (b) {
      b.onclick = function () { fotosTmp.splice(Number(b.getAttribute('data-rm')), 1); renderFotosPrev(); };
    });
  }
  $('#form-veiculo').addEventListener('submit', function (e) {
    e.preventDefault();
    var id = $('#ve-id').value;
    var existing = id ? Store.getVehicle(id) : null;
    var v = {
      id: id || '',
      real: existing ? existing.real : true,
      marca: $('#ve-marca').value.trim(),
      modelo: $('#ve-modelo').value.trim(),
      versao: $('#ve-versao').value.trim(),
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
      fotos: fotosTmp.slice()
    };
    Store.saveVehicle(v);
    closeVeiculo();
    go('veiculos');
  });

  /* ===================== FUNCIONÁRIOS (admin) ===================== */
  function renderFuncionarios() {
    var users = Store.getUsers();
    $('#main').innerHTML =
      '<div class="admin-top"><h1>Funcionários</h1>' +
        '<button class="btn btn-red" id="add-u">+ Adicionar funcionário</button></div>' +
      '<p style="color:#6B7280;margin:-10px 0 20px">Quem pode acessar o painel e o que cada um pode fazer.</p>' +
      '<div class="table-wrap"><table class="adm"><thead><tr>' +
        '<th>Nome</th><th>Usuário</th><th>Acesso</th><th>Ações</th></tr></thead><tbody>' +
        users.map(function (u) {
          var isMe = u.user === session.user;
          return '<tr><td><b>' + u.nome + '</b>' + (isMe ? ' <span style="color:#6B7280;font-size:12px">(você)</span>' : '') + '</td>' +
            '<td>' + u.user + '</td>' +
            '<td><span class="badge ' + (u.role === 'admin' ? 'role' : 'ok') + '">' + (u.role === 'admin' ? 'Administrador' : 'Funcionário') + '</span></td>' +
            '<td><div class="rowact">' +
              '<button class="iconbtn" data-eu="' + u.user + '">✏️ Editar</button>' +
              (isMe ? '' : '<button class="iconbtn del" data-du="' + u.user + '">🗑️</button>') +
            '</div></td></tr>';
        }).join('') +
      '</tbody></table></div>';
    $('#add-u').onclick = function () { openUser(); };
    $$('#main [data-eu]').forEach(function (b) { b.onclick = function () { openUser(b.getAttribute('data-eu')); }; });
    $$('#main [data-du]').forEach(function (b) { b.onclick = function () {
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

  /* ===================== CONFIGURAÇÕES (admin) ===================== */
  function renderConfig() {
    var c = Store.getConfig();
    $('#main').innerHTML =
      '<div class="admin-top"><h1>Configurações da loja</h1></div>' +
      '<p style="color:#6B7280;margin:-10px 0 20px">Esses dados aparecem no site (contato, WhatsApp, endereço).</p>' +
      '<div class="table-wrap" style="padding:24px;max-width:640px">' +
        '<form id="form-config">' +
          cfgField('whatsapp', 'WhatsApp (só números, com DDD e 55)', c.whatsapp) +
          cfgField('telefoneExibicao', 'Telefone exibido', c.telefoneExibicao) +
          cfgField('endereco', 'Endereço', c.endereco) +
          cfgField('horario', 'Horário de atendimento', c.horario) +
          cfgField('instagram', 'Instagram (sem @)', c.instagram) +
          cfgField('mapa', 'Link do Google Maps', c.mapa) +
          '<button class="btn btn-red" type="submit">Salvar configurações</button>' +
          '<span id="cfg-ok" style="color:#1a8f4a;font-weight:700;margin-left:14px;display:none">✓ Salvo!</span>' +
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
      var ok = $('#cfg-ok'); ok.style.display = 'inline'; setTimeout(function () { ok.style.display = 'none'; }, 2000);
    });
  }
  function cfgField(k, label, val) {
    return '<div class="field"><label>' + label + '</label><input id="cf-' + k + '" value="' + (val || '').replace(/"/g, '&quot;') + '"></div>';
  }

  /* ===================== INÍCIO ===================== */
  (function init() {
    session = Store.session();
    if (session) boot(); else showLogin();
  })();
})();
