/* =====================================================================
   Dicar Veículos — Camada de dados (store)
   ---------------------------------------------------------------------
   DEMO: tudo roda no navegador (localStorage), funciona offline.
   PRODUÇÃO: trocar os métodos abaixo por chamadas ao Supabase.
   Toda a leitura/escrita do site e do painel passa por aqui — então
   pra ligar o banco de verdade, só este arquivo muda.
   ===================================================================== */

(function (global) {
  'use strict';

  var DB_KEY = 'dicar_db_v2';
  var SESSION_KEY = 'dicar_session_v1';

  /* ---------- Dados iniciais (seed) ---------- */
  // Os 3 primeiros são os carros REAIS (fonte: NaPista, jun/2026).
  // Os demais são EXEMPLOS pra mostrar a vitrine cheia — apague no painel.
  var SEED = {
    config: {
      nomeLoja: 'Dicar Veículos',
      slogan: 'Compra · Venda · Troca · Financia',
      whatsapp: '5591988475944', // ⚠️ número oficial a confirmar com o cliente
      telefoneExibicao: '(91) 98847-5944',
      endereco: 'Av. Pres. Getúlio Vargas, 1852 — Castanhal/PA',
      cep: '68740-005',
      horario: 'Seg a Sex 07:30–18:00 · Sáb 08:00–13:00',
      instagram: 'dicar_veiculos',
      mapa: 'https://www.google.com/maps?q=Av.+Pres.+Get%C3%BAlio+Vargas,+1852,+Castanhal+PA'
    },
    veiculos: [
      {
        id: 'v-polo-2025', real: true, tipo: 'Hatch', marca: 'Volkswagen', modelo: 'Polo',
        versao: '1.0 Track', ano: 2025, km: 40000, preco: 79000,
        cambio: 'Manual', combustivel: 'Flex', cor: 'Branco', portas: 4,
        destaque: true, status: 'disponivel', fotos: ['assets/polo2025.webp'],
        descricao: 'Polo Track 1.0, completo, único dono, revisões em dia. Procedência e garantia Dicar.'
      },
      {
        id: 'v-nivus-2024', real: true, tipo: 'SUV', marca: 'Volkswagen', modelo: 'Nivus',
        versao: '1.0 200 TSI Comfortline Aut.', ano: 2024, km: 60814, preco: 110900,
        cambio: 'Automático', combustivel: 'Flex', cor: 'Cinza', portas: 4,
        destaque: true, status: 'disponivel', fotos: ['assets/nivus2024.webp'],
        descricao: 'Nivus TSI automático, SUV de entrada com baixo consumo e multimídia. Aceita troca.'
      },
      {
        id: 'v-mobi-2023', real: true, tipo: 'Hatch', marca: 'Fiat', modelo: 'Mobi',
        versao: '1.0 Like', ano: 2023, km: 58471, preco: 56000,
        cambio: 'Manual', combustivel: 'Flex', cor: 'Vermelho', portas: 4,
        destaque: true, status: 'disponivel', fotos: ['assets/mobi2023.webp'],
        descricao: 'Mobi Like econômico, ideal pro primeiro carro. Financiamento facilitado.'
      }
    ],
    usuarios: [
      { user: 'admin', senha: 'admin123', nome: 'Dirceu (Dono)', role: 'admin' },
      { user: 'vendedor', senha: 'venda123', nome: 'Vendedor', role: 'funcionario' }
    ]
  };

  /* ---------- Persistência ---------- */
  function load() {
    try {
      var raw = global.localStorage.getItem(DB_KEY);
      if (!raw) { save(SEED); return clone(SEED); }
      return JSON.parse(raw);
    } catch (e) { return clone(SEED); }
  }
  function save(db) { global.localStorage.setItem(DB_KEY, JSON.stringify(db)); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---------- API pública ---------- */
  var Store = {
    reset: function () { global.localStorage.removeItem(DB_KEY); return load(); },

    getConfig: function () { return load().config; },
    saveConfig: function (cfg) {
      var db = load(); db.config = Object.assign(db.config, cfg); save(db); return db.config;
    },

    /* Veículos */
    getVehicles: function (filters) {
      var list = load().veiculos.slice();
      filters = filters || {};
      if (filters.status) list = list.filter(function (v) { return v.status === filters.status; });
      if (filters.destaque) list = list.filter(function (v) { return v.destaque; });
      if (filters.marca) list = list.filter(function (v) { return v.marca === filters.marca; });
      if (filters.tipo) list = list.filter(function (v) { return v.tipo === filters.tipo; });
      if (filters.cambio) list = list.filter(function (v) { return v.cambio === filters.cambio; });
      if (filters.precoMax) list = list.filter(function (v) { return v.preco <= filters.precoMax; });
      if (filters.busca) {
        var q = filters.busca.toLowerCase();
        list = list.filter(function (v) {
          return (v.marca + ' ' + v.modelo + ' ' + v.versao).toLowerCase().indexOf(q) > -1;
        });
      }
      if (filters.ordenar === 'preco-asc') list.sort(function (a, b) { return a.preco - b.preco; });
      else if (filters.ordenar === 'preco-desc') list.sort(function (a, b) { return b.preco - a.preco; });
      else if (filters.ordenar === 'km-asc') list.sort(function (a, b) { return a.km - b.km; });
      else if (filters.ordenar === 'ano-desc') list.sort(function (a, b) { return b.ano - a.ano; });
      return list;
    },
    getVehicle: function (id) {
      var found = load().veiculos.filter(function (v) { return v.id === id; });
      return found.length ? found[0] : null;
    },
    marcas: function () {
      var set = {}; load().veiculos.forEach(function (v) { set[v.marca] = 1; });
      return Object.keys(set).sort();
    },
    saveVehicle: function (v) {
      var db = load();
      if (!v.id) {
        v.id = 'v-' + Date.now();
        db.veiculos.unshift(v);
      } else {
        var i = -1; db.veiculos.forEach(function (x, idx) { if (x.id === v.id) i = idx; });
        if (i > -1) db.veiculos[i] = v; else db.veiculos.unshift(v);
      }
      save(db); return v;
    },
    deleteVehicle: function (id) {
      var db = load();
      db.veiculos = db.veiculos.filter(function (v) { return v.id !== id; });
      save(db);
    },

    /* Usuários (admin) */
    getUsers: function () { return load().usuarios.slice(); },
    saveUser: function (u, originalUser) {
      var db = load();
      var i = -1; db.usuarios.forEach(function (x, idx) { if (x.user === (originalUser || u.user)) i = idx; });
      if (i > -1) db.usuarios[i] = u; else db.usuarios.push(u);
      save(db); return u;
    },
    deleteUser: function (user) {
      var db = load();
      db.usuarios = db.usuarios.filter(function (u) { return u.user !== user; });
      save(db);
    },

    /* Autenticação (demo — em produção, Supabase Auth) */
    login: function (user, senha) {
      var found = load().usuarios.filter(function (u) { return u.user === user && u.senha === senha; });
      if (!found.length) return null;
      var sess = { user: found[0].user, nome: found[0].nome, role: found[0].role };
      global.localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
      return sess;
    },
    logout: function () { global.localStorage.removeItem(SESSION_KEY); },
    session: function () {
      try { return JSON.parse(global.localStorage.getItem(SESSION_KEY)); } catch (e) { return null; }
    }
  };

  /* ---------- Helpers de formatação (usados no site) ---------- */
  Store.fmtPreco = function (n) {
    return 'R$ ' + Number(n).toLocaleString('pt-BR');
  };
  Store.fmtKm = function (n) {
    return Number(n).toLocaleString('pt-BR') + ' km';
  };
  Store.placeholder = function (v) {
    // SVG placeholder na marca, usado quando o carro não tem foto
    var txt = (v.marca + ' ' + v.modelo).toUpperCase();
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
      '<rect width="400" height="300" fill="#1a1a1a"/>' +
      '<path d="M70 195 l20-45 a25 25 0 0 1 22-14 h96 a25 25 0 0 1 20 10 l28 38 32 8 a12 12 0 0 1 10 12 v18 h-30 a22 22 0 0 0-44 0 h-70 a22 22 0 0 0-44 0 h-26 a10 10 0 0 1-10-10 v-13 a12 12 0 0 1 8-12z" fill="#2b2b2b"/>' +
      '<circle cx="128" cy="208" r="16" fill="#0d0d0d" stroke="#CE181E" stroke-width="4"/>' +
      '<circle cx="242" cy="208" r="16" fill="#0d0d0d" stroke="#CE181E" stroke-width="4"/>' +
      '<text x="200" y="266" fill="#8a8a8a" font-family="Arial" font-size="15" font-weight="bold" text-anchor="middle">' + txt + '</text>' +
      '</svg>';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  };
  Store.foto = function (v) {
    return (v.fotos && v.fotos.length) ? v.fotos[0] : Store.placeholder(v);
  };
  Store.waLink = function (texto) {
    var cfg = Store.getConfig();
    return 'https://wa.me/' + cfg.whatsapp + '?text=' + encodeURIComponent(texto || 'Olá! Vi um carro no site da Dicar e quero mais informações.');
  };

  global.Store = Store;
})(window);
