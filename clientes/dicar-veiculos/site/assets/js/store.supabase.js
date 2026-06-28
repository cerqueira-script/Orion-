/* =====================================================================
   Dicar Veículos — Camada de dados (PRODUÇÃO / Supabase)
   ---------------------------------------------------------------------
   ⚠️ ARQUIVO DE PREPARO (Fase 2). Substitui o store.js (localStorage demo)
   quando o projeto Supabase existir. ENQUANTO NÃO TESTADO com um banco
   real, NÃO troque o <script> das páginas — o demo segue no store.js.

   Arquitetura (cache-facade): no boot, Store.init() busca TUDO do Supabase
   pra um cache em memória (_db); a API pública continua SÍNCRONA lendo do
   cache (painel.js/site.js quase não mudam); as ESCRITAS atualizam o cache
   na hora e persistem no Supabase em segundo plano.

   PRA LIGAR (quando o projeto existir):
     1. Incluir o supabase-js antes deste arquivo:
        <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     2. Preencher SUPABASE_URL e SUPABASE_ANON_KEY abaixo.
     3. Trocar nas páginas: store.js  →  store.supabase.js
     4. Bootstrap assíncrono:
        - site.js / painel.js: ANTES de renderizar, fazer `Store.init().then(...)`.
        - Login do painel vira ASSÍNCRONO e por E-MAIL (Supabase Auth):
          `Store.login(email, senha).then(sess => ...)` (hoje é síncrono/usuário).
     5. Fotos: o modal de veículo passa a usar `Store.uploadFoto(file)` (async)
        e salvar a URL — não mais base64.

   PONTOS A VERIFICAR no 1º teste (marcados com VERIFICAR):
     - mapeamento vendedor(usuario) ↔ perfis.id (uuid)
     - números de venda (sequência) sob concorrência
     - nomes exatos de campos internos do veículo (obsInternas)
   O schema correspondente: produtos/sistema-revenda/db/schema.sql (v3).
   ===================================================================== */

(function (global) {
  'use strict';

  /* ---------- Config do projeto ----------
     anon key: pública por design (protegida por RLS). NÃO colocar a service_role aqui.
     ⚠️ Projeto "orion" compartilhado por ora — separar em projeto próprio da Dicar depois. */
  var SUPABASE_URL = 'https://isooscbenyskulsdxpwz.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlzb29zY2Jlbnlza3Vsc2R4cHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MDQ1NTIsImV4cCI6MjA5ODE4MDU1Mn0.GKwMAgAtSZwluHMRe8x6PMR2oWQFC7_SMJE5mYSWwqA';
  var BUCKET_FOTOS = 'fotos';

  var sb = (global.supabase && SUPABASE_URL.indexOf('__') !== 0)
    ? global.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

  /* ---------- Limites (iguais ao demo) ---------- */
  var LIMITS = {
    fotos: 10, fotoMB: 5,
    tiposFoto: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    titulo: 100, descricao: 2000, marca: 50, modelo: 50, obs: 500
  };

  /* ---------- [PERFIL: carro] (igual ao demo) ---------- */
  var PERFIL = {
    id: 'carro', entidade: 'veículo', entidadePlural: 'veículos', schemaType: 'AutoDealer',
    facetas: ['marca', 'tipo', 'cambio', 'origem'],
    nome: function (item) {
      if (!item) return '—';
      return (item.marca + ' ' + item.modelo + ' ' + (item.versao || '')).trim();
    },
    placeholder: function (item) {
      var txt = (item.marca + ' ' + item.modelo).toUpperCase();
      var svg =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
        '<rect width="400" height="300" fill="#1a1a1a"/>' +
        '<path d="M70 195 l20-45 a25 25 0 0 1 22-14 h96 a25 25 0 0 1 20 10 l28 38 32 8 a12 12 0 0 1 10 12 v18 h-30 a22 22 0 0 0-44 0 h-70 a22 22 0 0 0-44 0 h-26 a10 10 0 0 1-10-10 v-13 a12 12 0 0 1 8-12z" fill="#2b2b2b"/>' +
        '<circle cx="128" cy="208" r="16" fill="#0d0d0d" stroke="#CE181E" stroke-width="4"/>' +
        '<circle cx="242" cy="208" r="16" fill="#0d0d0d" stroke="#CE181E" stroke-width="4"/>' +
        '<text x="200" y="266" fill="#8a8a8a" font-family="Arial" font-size="15" font-weight="bold" text-anchor="middle">' + txt + '</text>' +
        '</svg>';
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    }
  };

  /* ---------- Cache em memória (forma do app, igual ao demo) ---------- */
  var _db = {
    config: {}, permissoes: {}, usuarios: [],
    veiculos: [], clientes: [], vendas: [], eventos: []
  };
  var _session = null;
  var _perfisByUuid = {};   // uuid -> usuario
  var _perfisByUser = {};   // usuario -> uuid
  var _ready = false;

  function uid() { return (global.crypto && global.crypto.randomUUID) ? global.crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.floor(Math.random() * 1e6); }
  function nowISODate() { return new Date().toISOString().slice(0, 10); }
  function onError(ctx) { return function (e) { if (e) { try { console.error('[Store/Supabase] ' + ctx, e.message || e); } catch (x) {} if (Store.onError) Store.onError(ctx, e); } }; }

  /* ---------- Mapeamento DB(snake) ↔ App(camel) ---------- */
  function uuidToUser(u) { return _perfisByUuid[u] || ''; }
  function userToUuid(u) { return _perfisByUser[u] || null; }

  function vToApp(r) {
    return {
      id: r.id, real: true, tipo: r.tipo, marca: r.marca, modelo: r.modelo, versao: r.versao,
      ano: r.ano, km: r.km, preco: Number(r.preco), cambio: r.cambio, combustivel: r.combustivel,
      cor: r.cor, portas: r.portas, descricao: r.descricao, fotos: r.fotos || [],
      destaque: !!r.destaque, status: r.status,
      origem: r.origem, consignanteNome: r.consignante_nome, consignanteTel: r.consignante_tel,
      placa: r.placa, docStatus: r.doc_status, dataEntrada: r.data_entrada, obsInternas: r.obs_internas,
      codigoFipe: r.codigo_fipe, valorFipe: r.valor_fipe == null ? null : Number(r.valor_fipe)
    };
  }
  function vToRow(v) {
    return {
      id: v.id, tipo: v.tipo, marca: v.marca, modelo: v.modelo, versao: v.versao,
      ano: v.ano, km: v.km, preco: v.preco, cambio: v.cambio, combustivel: v.combustivel,
      cor: v.cor, portas: v.portas, descricao: v.descricao, fotos: v.fotos || [],
      destaque: !!v.destaque, status: v.status,
      origem: v.origem, consignante_nome: v.consignanteNome, consignante_tel: v.consignanteTel,
      placa: v.placa, doc_status: v.docStatus, data_entrada: v.dataEntrada, obs_internas: v.obsInternas,
      codigo_fipe: v.codigoFipe, valor_fipe: v.valorFipe
    };
  }
  function cToApp(r) {
    return {
      id: r.id, nome: r.nome, telefone: r.telefone, cidade: r.cidade, veiculoId: r.veiculo_id || '',
      interesse: r.interesse, origem: r.origem, vendedor: uuidToUser(r.vendedor_id), obs: r.observacoes,
      consent: !!r.consent, consentEm: r.consent_em, proximoContato: r.proximo_contato,
      etapa: r.etapa, criadoEm: (r.criado_em || '').slice(0, 10)
    };
  }
  function cToRow(c) {
    return {
      id: c.id, nome: c.nome, telefone: c.telefone, cidade: c.cidade, veiculo_id: c.veiculoId || null,
      interesse: c.interesse, origem: c.origem, vendedor_id: userToUuid(c.vendedor), observacoes: c.obs,
      consent: !!c.consent, consent_em: c.consentEm || null, proximo_contato: c.proximoContato || null,
      etapa: c.etapa
    };
  }
  function vendaToApp(r) {
    return {
      id: r.id, numero: r.numero, veiculoId: r.veiculo_id, veiculoNome: r.veiculo_nome,
      clienteId: r.cliente_id || '', compradorNome: r.comprador_nome, compradorTel: r.comprador_tel,
      cidade: r.cidade, vendedor: uuidToUser(r.vendedor_id), valorFinal: Number(r.valor_final),
      status: r.status, dataVenda: r.data_venda
    };
  }
  function vendaToRow(s) {
    return {
      id: s.id, numero: s.numero, veiculo_id: s.veiculoId, veiculo_nome: s.veiculoNome,
      cliente_id: s.clienteId || null, comprador_nome: s.compradorNome, comprador_tel: s.compradorTel,
      cidade: s.cidade, vendedor_id: userToUuid(s.vendedor), valor_final: s.valorFinal,
      status: s.status, data_venda: s.dataVenda
    };
  }
  function configToApp(r) {
    r = r || {};
    return {
      nomeLoja: r.nome_loja, slogan: r.slogan, whatsapp: r.whatsapp, telefoneExibicao: r.telefone_exibicao,
      endereco: r.endereco, cep: r.cep, horario: r.horario, instagram: r.instagram, mapa: r.mapa,
      ads: r.ads || {}, redes: r.redes || {}, negocio: r.negocio || {}
    };
  }
  function permToApp(r) {
    r = r || {};
    return {
      editarPreco: !!r.editar_preco, verConsignante: !!r.ver_consignante,
      registrarVenda: !!r.registrar_venda, gerenciarClientes: !!r.gerenciar_clientes
    };
  }

  /* ---------- Persistência (background; cache já foi atualizado) ---------- */
  function persist(table, row) { if (sb) sb.from(table).upsert(row).then(function (r) { if (r && r.error) onError('upsert ' + table)(r.error); }); }
  function remove(table, id) { if (sb) sb.from(table).delete().eq('id', id).then(function (r) { if (r && r.error) onError('delete ' + table)(r.error); }); }

  /* destaque automático (igual ao demo) — retorna os veículos alterados p/ persistir */
  var MAX_DESTAQUE = 3;
  function topUpDestaques(db) {
    var changed = [];
    var ativos = db.veiculos.filter(function (v) { return v.status !== 'vendido'; });
    var qtd = ativos.filter(function (v) { return v.destaque; }).length;
    if (qtd >= MAX_DESTAQUE) return changed;
    var candidatos = ativos.filter(function (v) { return !v.destaque; })
      .sort(function (a, b) { return (a.dataEntrada || '9999').localeCompare(b.dataEntrada || '9999'); });
    for (var i = 0; i < candidatos.length && qtd < MAX_DESTAQUE; i++) { candidatos[i].destaque = true; changed.push(candidatos[i]); qtd++; }
    return changed;
  }

  function load() { return _db; }

  /* =====================================================================
     INIT — hidrata o cache do Supabase (chamar antes de renderizar)
     ===================================================================== */
  function init() {
    if (!sb) return Promise.reject(new Error('Supabase não configurado (URL/anon key)'));
    // 1ª fase: resolver a sessão p/ saber se busca colunas internas do veículo
    return sb.auth.getSession().then(function (sessRes) {
      var u = sessRes.data && sessRes.data.session && sessRes.data.session.user;
      var staff = !!u;
      // público (anon): só colunas públicas — o RLS libera a LINHA, mas dados
      // internos (consignante/placa/obs) NUNCA vão pro site.
      var pubCols = 'id,tipo,marca,modelo,versao,ano,km,preco,cambio,combustivel,cor,portas,codigo_fipe,valor_fipe,descricao,fotos,destaque,status';
      return Promise.all([
        sb.from('config_loja').select('*').eq('id', 1).maybeSingle(),
        sb.from('permissoes').select('*').eq('id', 1).maybeSingle(),
        sb.from('perfis').select('*'),
        sb.from('veiculos').select(staff ? '*' : pubCols).order('data_entrada', { ascending: false }),
        sb.from('clientes').select('*').order('criado_em', { ascending: false }),
        sb.from('vendas').select('*').order('numero', { ascending: false }),
        sb.from('eventos').select('*').order('criado_em', { ascending: false }).limit(1000)
      ]).then(function (res) {
        var cfg = res[0], perm = res[1], perfis = res[2], veic = res[3], cli = res[4], vnd = res[5], evt = res[6];

        _perfisByUuid = {}; _perfisByUser = {};
        (perfis.data || []).forEach(function (p) { _perfisByUuid[p.id] = p.usuario; _perfisByUser[p.usuario] = p.id; });
        _db.usuarios = (perfis.data || []).map(function (p) { return { user: p.usuario, nome: p.nome, role: p.papel, ativo: p.ativo }; });

        _db.config = configToApp(cfg.data);
        _db.permissoes = permToApp(perm.data);
        _db.veiculos = (veic.data || []).map(vToApp);
        _db.clientes = (cli.data || []).map(cToApp);
        _db.vendas = (vnd.data || []).map(vendaToApp);
        _db.eventos = (evt.data || []).map(function (e) {
          return { a: e.acao, t: new Date(e.criado_em).getTime(), id: e.veiculo_id || '', nome: '' };
        });

        var p = (perfis.data || []).filter(function (x) { return x.id === (u && u.id); })[0];
        _session = u ? { uid: u.id, user: (p && p.usuario) || u.email, nome: (p && p.nome) || u.email, role: (p && p.papel) || 'funcionario' } : null;
        _ready = true;
        return _db;
      });
    });
  }

  /* =====================================================================
     API pública — leitura/cálculo SÍNCRONOS (lógica idêntica ao demo)
     ===================================================================== */
  var Store = {
    LIMITS: LIMITS, PERFIL: PERFIL, init: init, ready: function () { return _ready; }, onError: null,
    reset: function () { return init(); },

    /* ---- Config ---- */
    getConfig: function () { return load().config; },
    saveConfig: function (cfg) {
      var db = load(); db.config = Object.assign(db.config, cfg);
      persist('config_loja', Object.assign({ id: 1 }, {
        nome_loja: db.config.nomeLoja, slogan: db.config.slogan, whatsapp: db.config.whatsapp,
        telefone_exibicao: db.config.telefoneExibicao, endereco: db.config.endereco, cep: db.config.cep,
        horario: db.config.horario, instagram: db.config.instagram, mapa: db.config.mapa,
        ads: db.config.ads || {}, redes: db.config.redes || {}, negocio: db.config.negocio || {}
      }));
      return db.config;
    },
    getAds: function () { return Object.assign({ gtmId: '', ga4Id: '', metaPixelId: '', googleAdsId: '', googleAdsLabel: '' }, load().config.ads || {}); },
    saveAds: function (ads) { var db = load(); db.config.ads = Object.assign(db.config.ads || {}, ads); this.saveConfig({}); return db.config.ads; },
    getRedes: function () { return Object.assign({ facebook: '', youtube: '', tiktok: '', linkedin: '' }, load().config.redes || {}); },
    saveRedes: function (redes) { var db = load(); db.config.redes = Object.assign(db.config.redes || {}, redes); this.saveConfig({}); return db.config.redes; },
    redesSameAs: function () {
      var cfg = load().config || {}, r = cfg.redes || {}, out = [];
      if (cfg.instagram) out.push('https://instagram.com/' + cfg.instagram);
      ['facebook', 'youtube', 'tiktok', 'linkedin'].forEach(function (k) { if (r[k]) out.push(r[k]); });
      return out;
    },

    /* ---- Permissões ---- */
    getPerms: function () { return load().permissoes; },
    savePerms: function (p) {
      var db = load(); db.permissoes = Object.assign(db.permissoes, p);
      persist('permissoes', { id: 1,
        editar_preco: !!db.permissoes.editarPreco, ver_consignante: !!db.permissoes.verConsignante,
        registrar_venda: !!db.permissoes.registrarVenda, gerenciar_clientes: !!db.permissoes.gerenciarClientes });
      return db.permissoes;
    },
    can: function (session, key) { if (!session) return false; if (session.role === 'admin') return true; return !!load().permissoes[key]; },

    /* ---- Veículos (filtros/compute idênticos ao demo) ---- */
    getVehicles: function (filters) {
      var list = load().veiculos.slice(); filters = filters || {};
      if (filters.status) list = list.filter(function (v) { return v.status === filters.status; });
      if (filters.destaque) list = list.filter(function (v) { return v.destaque; });
      PERFIL.facetas.forEach(function (f) { if (filters[f]) list = list.filter(function (v) { return v[f] === filters[f]; }); });
      if (filters.precoMax) list = list.filter(function (v) { return v.preco <= filters.precoMax; });
      if (filters.busca) { var q = filters.busca.toLowerCase(); list = list.filter(function (v) { return PERFIL.nome(v).toLowerCase().indexOf(q) > -1; }); }
      if (filters.ordenar === 'preco-asc') list.sort(function (a, b) { return a.preco - b.preco; });
      else if (filters.ordenar === 'preco-desc') list.sort(function (a, b) { return b.preco - a.preco; });
      else if (filters.ordenar === 'km-asc') list.sort(function (a, b) { return a.km - b.km; });
      else if (filters.ordenar === 'ano-desc') list.sort(function (a, b) { return b.ano - a.ano; });
      return list;
    },
    getPublicVehicles: function (filters) { return this.getVehicles(filters).filter(function (v) { return v.status !== 'vendido'; }); },
    getVehicle: function (id) { var f = load().veiculos.filter(function (v) { return v.id === id; }); return f.length ? f[0] : null; },
    nomeVeiculo: function (v) { return PERFIL.nome(v); },
    valoresFaceta: function (campo) { var s = {}; load().veiculos.forEach(function (v) { if (v[campo]) s[v[campo]] = 1; }); return Object.keys(s).sort(); },
    marcas: function () { return this.valoresFaceta('marca'); },
    tipos: function () { return this.valoresFaceta('tipo'); },
    saveVehicle: function (v) {
      var db = load(), saved = v;
      if (!v.id) { v.id = uid(); if (!v.dataEntrada) v.dataEntrada = nowISODate(); db.veiculos.unshift(v); }
      else { var i = -1; db.veiculos.forEach(function (x, idx) { if (x.id === v.id) i = idx; }); if (i > -1) { db.veiculos[i] = Object.assign(db.veiculos[i], v); saved = db.veiculos[i]; } else db.veiculos.unshift(v); }
      var changed = [];
      if (saved.status === 'vendido') { saved.destaque = false; changed = topUpDestaques(db); }
      persist('veiculos', vToRow(saved));
      changed.forEach(function (c) { persist('veiculos', vToRow(c)); });
      return saved;
    },
    deleteVehicle: function (id) {
      var db = load(); db.veiculos = db.veiculos.filter(function (v) { return v.id !== id; });
      var changed = topUpDestaques(db);
      remove('veiculos', id);
      changed.forEach(function (c) { persist('veiculos', vToRow(c)); });
    },
    diasParado: function (v) { if (!v.dataEntrada) return 0; return Math.max(0, Math.round((new Date() - new Date(v.dataEntrada)) / 86400000)); },

    /* ---- Clientes / Leads ---- */
    getClientes: function () { return load().clientes.slice(); },
    getCliente: function (id) { var f = load().clientes.filter(function (c) { return c.id === id; }); return f.length ? f[0] : null; },
    saveCliente: function (c) {
      var db = load();
      if (!c.id) { c.id = uid(); c.criadoEm = nowISODate(); db.clientes.unshift(c); }
      else { var i = -1; db.clientes.forEach(function (x, idx) { if (x.id === c.id) i = idx; }); if (i > -1) db.clientes[i] = Object.assign(db.clientes[i], c); else db.clientes.unshift(c); }
      persist('clientes', cToRow(c));
      return c;
    },
    criarLeadDoSite: function (dados) {
      dados = dados || {};
      return this.saveCliente({
        nome: (dados.nome || '').trim() || 'Contato do site', telefone: dados.telefone || '',
        cidade: dados.cidade || '', veiculoId: dados.veiculoId || '', interesse: dados.interesse || '',
        origem: 'Site', vendedor: '', obs: dados.obs || '', etapa: 'novo'
      });
    },
    deleteCliente: function (id) { var db = load(); db.clientes = db.clientes.filter(function (c) { return c.id !== id; }); remove('clientes', id); },
    setClienteEtapa: function (id, etapa) {
      var db = load(); db.clientes.forEach(function (c) { if (c.id === id) c.etapa = etapa; });
      persist('clientes', { id: id, etapa: etapa });
    },
    nomeCliente: function (id) { var c = this.getCliente(id); return c ? c.nome : '—'; },

    /* ---- Vendas ---- */
    getVendas: function () { return load().vendas.slice(); },
    proximoNumeroVenda: function () { return load().vendas.reduce(function (m, s) { return Math.max(m, s.numero || 0); }, 0) + 1; },
    registrarVenda: function (dados) {
      var db = load(), v = null;
      db.veiculos.forEach(function (x) { if (x.id === dados.veiculoId) v = x; });
      if (!v) return null;
      var venda = {
        id: uid(), numero: this.proximoNumeroVenda(), veiculoId: v.id, veiculoNome: PERFIL.nome(v),
        clienteId: dados.clienteId || '', compradorNome: dados.compradorNome || '', compradorTel: dados.compradorTel || '',
        cidade: dados.cidade || '', vendedor: dados.vendedor || '', valorFinal: Number(dados.valorFinal) || 0,
        status: dados.status || 'Concluída', dataVenda: dados.dataVenda || nowISODate()
      };
      db.vendas.unshift(venda);
      v.status = 'vendido'; v.destaque = false;
      var changed = topUpDestaques(db);
      if (dados.clienteId) db.clientes.forEach(function (c) { if (c.id === dados.clienteId) c.etapa = 'fechado'; });
      // persiste: venda + veículo vendido + destaques promovidos + cliente fechado
      persist('vendas', vendaToRow(venda));
      persist('veiculos', vToRow(v));
      changed.forEach(function (c) { persist('veiculos', vToRow(c)); });
      if (dados.clienteId) persist('clientes', { id: dados.clienteId, etapa: 'fechado' });
      return venda;
    },
    setVendaStatus: function (id, status) {
      var db = load(); db.vendas.forEach(function (s) { if (s.id === id) s.status = status; });
      persist('vendas', { id: id, status: status });
    },
    cancelarVenda: function (id) {
      var db = load(), venda = null;
      db.vendas.forEach(function (s) { if (s.id === id) { s.status = 'Cancelada'; venda = s; } });
      if (venda) {
        persist('vendas', { id: id, status: 'Cancelada' });
        db.veiculos.forEach(function (v) { if (v.id === venda.veiculoId && v.status === 'vendido') { v.status = 'disponivel'; persist('veiculos', { id: v.id, status: 'disponivel' }); } });
      }
      return venda;
    },

    /* ---- Usuários (perfis) ----
       VERIFICAR: criar usuário no Auth exige service_role (não no cliente).
       Por ora: criar no painel do Supabase; aqui só atualizamos nome/papel/ativo. */
    getUsers: function () { return load().usuarios.slice(); },
    saveUser: function (u, originalUser) {
      var db = load(), key = originalUser || u.user, i = -1;
      db.usuarios.forEach(function (x, idx) { if (x.user === key) i = idx; });
      if (i > -1) db.usuarios[i] = u; else db.usuarios.push(u);
      var uuidp = userToUuid(u.user);
      if (uuidp) persist('perfis', { id: uuidp, usuario: u.user, nome: u.nome, papel: u.role, ativo: u.ativo !== false });
      else onError('saveUser')(new Error('Crie o usuário no Supabase Auth primeiro (perfil sem uuid).'));
      return u;
    },
    deleteUser: function (user) {
      var db = load(); db.usuarios = db.usuarios.filter(function (u) { return u.user !== user; });
      var uuidp = userToUuid(user); if (uuidp) persist('perfis', { id: uuidp, ativo: false });   // desativa (não apaga auth)
    },
    userName: function (user) { var f = load().usuarios.filter(function (u) { return u.user === user; }); return f.length ? f[0].nome : (user || '—'); },

    /* ---- Autenticação (Supabase Auth — ASSÍNCRONO, por e-mail) ---- */
    login: function (email, senha) {
      if (!sb) return Promise.reject(new Error('Supabase não configurado'));
      return sb.auth.signInWithPassword({ email: email, password: senha }).then(function (r) {
        if (r.error || !r.data.user) return null;
        return init().then(function () { return _session; });   // re-hidrata com a sessão nova
      });
    },
    logout: function () { if (sb) return sb.auth.signOut(); },
    session: function () { return _session; },

    /* ---- Eventos (cache + insert no Supabase) ---- */
    logEvent: function (action, data) {
      if (!action) return; data = data || {};
      load().eventos.push({ a: action, t: Date.now(), id: data.id || '', nome: data.nome || '' });
      if (sb) sb.from('eventos').insert({ acao: action, veiculo_id: data.id || null, pagina: data.pagina || null }).then(function (r) { if (r && r.error) onError('insert eventos')(r.error); });
    },
    eventStats: function (opts) {
      opts = opts || {}; var arr = load().eventos; if (opts.desde) arr = arr.filter(function (e) { return e.t >= opts.desde; });
      var c = {}, vistos = {};
      arr.forEach(function (e) { c[e.a] = (c[e.a] || 0) + 1; if (e.a === 'ver_veiculo' && e.id) vistos[e.id] = (vistos[e.id] || 0) + 1; });
      var WA = ['contato_whatsapp', 'simular_financiamento', 'avaliar_veiculo'];
      var wa = WA.reduce(function (s, k) { return s + (c[k] || 0); }, 0);
      var topId = '', topN = 0; Object.keys(vistos).forEach(function (id) { if (vistos[id] > topN) { topN = vistos[id]; topId = id; } });
      return { total: arr.length, whatsapp: wa, verVeiculo: c.ver_veiculo || 0, simulacoes: c.simular_financiamento || 0, avaliacoes: c.avaliar_veiculo || 0, veiculoMaisVistoId: topId, veiculoMaisVistoN: topN };
    },
    eventosPorDia: function (action, dias) {
      dias = dias || 7; var arr = load().eventos, hoje = new Date(), res = [], WA = ['contato_whatsapp', 'simular_financiamento', 'avaliar_veiculo'];
      function dISO(t) { var d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
      for (var i = dias - 1; i >= 0; i--) {
        var d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - i);
        var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        var label = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
        var n = arr.filter(function (e) { if (dISO(e.t) !== key) return false; return action === 'whatsapp' ? WA.indexOf(e.a) > -1 : e.a === action; }).length;
        res.push({ label: label, value: n });
      }
      return res;
    },
    resetEventos: function () { /* no-op em produção (eventos vivem no banco) */ },

    /* ---- Storage de fotos ---- */
    // uso: Store.uploadFoto(file).then(url => ...). Caminho único por upload.
    uploadFoto: function (file) {
      if (!sb) return Promise.reject(new Error('Supabase não configurado'));
      var ext = (file.name || 'jpg').split('.').pop();
      var path = 'veiculos/' + uid() + '.' + ext;
      return sb.storage.from(BUCKET_FOTOS).upload(path, file, { upsert: false }).then(function (r) {
        if (r.error) throw r.error;
        return sb.storage.from(BUCKET_FOTOS).getPublicUrl(path).data.publicUrl;
      });
    },

    /* =================================================================
       DASHBOARD / relatórios / gráficos — idênticos ao demo (sobre o cache)
       ================================================================= */
    dashboard: function (vendedorUser) {
      var db = load(), self = this;
      var disp = db.veiculos.filter(function (v) { return v.status !== 'vendido'; });
      var proprios = disp.filter(function (v) { return v.origem === 'proprio'; });
      var consig = disp.filter(function (v) { return v.origem === 'consignado'; });
      var mesAtual = new Date().toISOString().slice(0, 7), hoje = new Date().toISOString().slice(0, 10);
      var vendasMes = db.vendas.filter(function (s) { return (s.dataVenda || '').slice(0, 7) === mesAtual && s.status !== 'Cancelada' && (!vendedorUser || s.vendedor === vendedorUser); });
      var fatMes = vendasMes.reduce(function (a, s) { return a + (s.valorFinal || 0); }, 0);
      var parados = disp.map(function (v) { return { v: v, dias: self.diasParado(v) }; }).sort(function (a, b) { return b.dias - a.dias; });
      var docPendente = disp.filter(function (v) { return v.docStatus === 'pendente'; });
      var clientes = vendedorUser ? db.clientes.filter(function (c) { return c.vendedor === vendedorUser; }) : db.clientes;
      var funil = { novo: 0, atendimento: 0, negociando: 0, fechado: 0, perdido: 0 };
      clientes.forEach(function (c) { if (funil[c.etapa] != null) funil[c.etapa]++; });
      var ativos = funil.novo + funil.atendimento + funil.negociando, encerrados = funil.fechado + funil.perdido;
      var conversao = encerrados ? Math.round((funil.fechado / encerrados) * 100) : 0;
      var retornos = clientes.filter(function (c) { return c.proximoContato && c.proximoContato <= hoje && c.etapa !== 'fechado' && c.etapa !== 'perdido'; }).sort(function (a, b) { return (a.proximoContato || '').localeCompare(b.proximoContato || ''); });
      var ranking = [];
      if (!vendedorUser) {
        var rank = {};
        vendasMes.forEach(function (s) { var k = s.vendedor || '—'; if (!rank[k]) rank[k] = { vendedor: k, nome: self.userName(k), qtd: 0, valor: 0 }; rank[k].qtd++; rank[k].valor += s.valorFinal || 0; });
        ranking = Object.keys(rank).map(function (k) { return rank[k]; }).sort(function (a, b) { return b.valor - a.valor; });
      }
      return {
        totalEstoque: disp.length, valorEstoque: disp.reduce(function (a, v) { return a + (v.preco || 0); }, 0),
        proprios: { qtd: proprios.length, valor: proprios.reduce(function (a, v) { return a + v.preco; }, 0) },
        consignados: { qtd: consig.length, valor: consig.reduce(function (a, v) { return a + v.preco; }, 0) },
        vendidosMes: vendasMes.length, faturamentoMes: fatMes, ticketMedio: vendasMes.length ? Math.round(fatMes / vendasMes.length) : 0,
        parados: parados.slice(0, 5), docPendente: docPendente, funil: funil, clientesAtivos: ativos, conversao: conversao, ranking: ranking, retornos: retornos
      };
    },
    relatorio: function (mes, vendedorUser) {
      var vendas = load().vendas.slice();
      if (mes) vendas = vendas.filter(function (s) { return (s.dataVenda || '').slice(0, 7) === mes; });
      if (vendedorUser) vendas = vendas.filter(function (s) { return s.vendedor === vendedorUser; });
      vendas.sort(function (a, b) { return (b.numero || 0) - (a.numero || 0); });
      return vendas;
    },
    mesesComVenda: function () { var s = {}; load().vendas.forEach(function (v) { if (v.dataVenda) s[v.dataVenda.slice(0, 7)] = 1; }); return Object.keys(s).sort().reverse(); },
    faturamentoPorMes: function (n, vendedorUser) {
      n = n || 6;
      var vendas = load().vendas.filter(function (s) { return s.status !== 'Cancelada' && (!vendedorUser || s.vendedor === vendedorUser); });
      var now = new Date(), res = [];
      for (var i = n - 1; i >= 0; i--) {
        var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        var ym = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        var total = vendas.filter(function (s) { return (s.dataVenda || '').slice(0, 7) === ym; }).reduce(function (a, s) { return a + (s.valorFinal || 0); }, 0);
        res.push({ ym: ym, label: Store.fmtMes(ym), valor: total });
      }
      return res;
    },
    estoquePorTipo: function () {
      var disp = load().veiculos.filter(function (v) { return v.status !== 'vendido'; }), map = {};
      disp.forEach(function (v) { var t = v.tipo || 'Outro'; map[t] = (map[t] || 0) + 1; });
      return Object.keys(map).map(function (k) { return { tipo: k, qtd: map[k] }; }).sort(function (a, b) { return b.qtd - a.qtd; });
    }
  };

  /* ---------- Helpers de formatação (idênticos ao demo) ---------- */
  Store.fmtPreco = function (n) { if (n == null || n === '') return '—'; return 'R$ ' + Number(n).toLocaleString('pt-BR'); };
  Store.fmtKm = function (n) { return Number(n).toLocaleString('pt-BR') + ' km'; };
  Store.fmtData = function (iso) { if (!iso) return '—'; var p = String(iso).split('-'); return p.length === 3 ? p[2].slice(0, 2) + '/' + p[1] + '/' + p[0] : iso; };
  Store.fmtMes = function (ym) { if (!ym) return '—'; var meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']; var p = ym.split('-'); return meses[Number(p[1]) - 1] + '/' + p[0]; };
  Store.fmtNumeroVenda = function (n) { return '#' + String(n || 0).padStart(4, '0'); };
  Store.placeholder = function (v) { return PERFIL.placeholder(v); };
  Store.foto = function (v) { return (v.fotos && v.fotos.length) ? v.fotos[0] : Store.placeholder(v); };
  Store.waLink = function (texto) { var cfg = Store.getConfig(); return 'https://wa.me/' + cfg.whatsapp + '?text=' + encodeURIComponent(texto || 'Olá! Vi um veículo no site da Dicar e quero mais informações.'); };

  global.Store = Store;
})(window);
