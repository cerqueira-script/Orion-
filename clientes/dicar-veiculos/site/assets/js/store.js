/* =====================================================================
   Dicar Veículos — Camada de dados (store)
   ---------------------------------------------------------------------
   DEMO: tudo roda no navegador (localStorage), funciona offline.
   PRODUÇÃO: trocar os métodos abaixo por chamadas ao Supabase.
   Toda a leitura/escrita do site e do painel passa por aqui — então
   pra ligar o banco de verdade, só este arquivo muda.
   O schema do banco está em: produtos/sistema-revenda/db/schema.sql

   v4: sem módulo financeiro (custo/margem/valor-mínimo). Foco em estoque,
   clientes (CRM) e vendas. "Leads" virou "clientes".
   ===================================================================== */

(function (global) {
  'use strict';

  var DB_KEY = 'dicar_db_v5';
  var SESSION_KEY = 'dicar_session_v1';

  /* Limites do sistema (segurança / não sobrecarregar o banco) */
  var LIMITS = {
    fotos: 10,                 // por veículo
    fotoMB: 5,                 // por foto
    tiposFoto: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    titulo: 100,               // versão / título do anúncio
    descricao: 2000,
    marca: 50,
    modelo: 50,
    obs: 500
  };

  /* ---------- Dados iniciais (seed) ---------- */
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
    // Permissões do papel "funcionário" (admin vê/faz tudo).
    permissoes: {
      verConsignante: false,
      editarPreco: false,
      registrarVenda: true,
      gerenciarClientes: true
    },
    veiculos: [
      {
        id: 'v-polo-2025', real: true, tipo: 'Hatch', marca: 'Volkswagen', modelo: 'Polo',
        versao: '1.0 Track', ano: 2025, km: 40000, preco: 79000,
        cambio: 'Manual', combustivel: 'Flex', cor: 'Branco', portas: 4,
        destaque: true, status: 'disponivel', fotos: ['assets/polo2025.webp'],
        descricao: 'Polo Track 1.0, completo, único dono, revisões em dia. Procedência e garantia Dicar.',
        origem: 'proprio', consignanteNome: '', consignanteTel: '', placa: 'RGT1A23',
        docStatus: 'ok', dataEntrada: '2026-05-12'
      },
      {
        id: 'v-nivus-2024', real: true, tipo: 'SUV', marca: 'Volkswagen', modelo: 'Nivus',
        versao: '1.0 200 TSI Comfortline Aut.', ano: 2024, km: 60814, preco: 110900,
        cambio: 'Automático', combustivel: 'Flex', cor: 'Cinza', portas: 4,
        destaque: true, status: 'disponivel', fotos: ['assets/nivus2024.webp'],
        descricao: 'Nivus TSI automático, SUV de entrada com baixo consumo e multimídia. Aceita troca.',
        origem: 'consignado', consignanteNome: 'Marcos Andrade', consignanteTel: '(91) 99123-4567', placa: 'PAB2C34',
        docStatus: 'pendente', dataEntrada: '2026-03-02'
      },
      {
        id: 'v-mobi-2023', real: true, tipo: 'Hatch', marca: 'Fiat', modelo: 'Mobi',
        versao: '1.0 Like', ano: 2023, km: 58471, preco: 56000,
        cambio: 'Manual', combustivel: 'Flex', cor: 'Vermelho', portas: 4,
        destaque: true, status: 'disponivel', fotos: ['assets/mobi2023.webp'],
        descricao: 'Mobi Like econômico, ideal pro primeiro carro. Financiamento facilitado.',
        origem: 'proprio', consignanteNome: '', consignanteTel: '', placa: 'QZX3D45',
        docStatus: 'ok', dataEntrada: '2026-06-01'
      },

      /* ----- exemplos de teste (apague no painel quando quiser) ----- */
      {
        id: 'v-hb20-2023', real: false, tipo: 'Hatch', marca: 'Hyundai', modelo: 'HB20',
        versao: '1.0 Comfort Plus', ano: 2023, km: 38000, preco: 68900,
        cambio: 'Manual', combustivel: 'Flex', cor: 'Prata', portas: 4,
        destaque: false, status: 'disponivel', fotos: [],
        descricao: 'HB20 econômico, completo, pneus novos.',
        origem: 'proprio', consignanteNome: '', consignanteTel: '',
        docStatus: 'ok', dataEntrada: '2026-05-28'
      },
      {
        id: 'v-onix-2022', real: false, tipo: 'Hatch', marca: 'Chevrolet', modelo: 'Onix',
        versao: '1.0 Turbo LT', ano: 2022, km: 45000, preco: 74900,
        cambio: 'Automático', combustivel: 'Flex', cor: 'Branco', portas: 4,
        destaque: false, status: 'disponivel', fotos: [],
        descricao: 'Onix Turbo automático, multimídia, central de som original.',
        origem: 'proprio', consignanteNome: '', consignanteTel: '',
        docStatus: 'ok', dataEntrada: '2026-04-10'
      },
      {
        id: 'v-corolla-2022', real: false, tipo: 'Sedã', marca: 'Toyota', modelo: 'Corolla',
        versao: 'XEI 2.0', ano: 2022, km: 51000, preco: 129900,
        cambio: 'Automático', combustivel: 'Flex', cor: 'Preto', portas: 4,
        destaque: false, status: 'disponivel', fotos: [],
        descricao: 'Corolla XEI completo, couro, único dono. Sedã top de linha.',
        origem: 'consignado', consignanteNome: 'Helena Martins', consignanteTel: '(91) 99876-1122',
        docStatus: 'ok', dataEntrada: '2026-02-15'
      },
      {
        id: 'v-tcross-2022', real: false, tipo: 'SUV', marca: 'Volkswagen', modelo: 'T-Cross',
        versao: '200 TSI Comfortline', ano: 2022, km: 48000, preco: 119900,
        cambio: 'Automático', combustivel: 'Flex', cor: 'Cinza', portas: 4,
        destaque: false, status: 'disponivel', fotos: [],
        descricao: 'T-Cross TSI, SUV espaçoso, baixo consumo. Aceita troca.',
        origem: 'consignado', consignanteNome: 'Rafael Nunes', consignanteTel: '(91) 98654-7788',
        docStatus: 'pendente', dataEntrada: '2026-04-22'
      },
      {
        id: 'v-kwid-2023', real: false, tipo: 'Hatch', marca: 'Renault', modelo: 'Kwid',
        versao: 'Zen 1.0', ano: 2023, km: 30000, preco: 58900,
        cambio: 'Manual', combustivel: 'Flex', cor: 'Vermelho', portas: 4,
        destaque: false, status: 'disponivel', fotos: [],
        descricao: 'Kwid Zen, baixa quilometragem, ideal pra cidade.',
        origem: 'proprio', consignanteNome: '', consignanteTel: '',
        docStatus: 'ok', dataEntrada: '2026-06-10'
      },
      {
        id: 'v-strada-2024', real: false, tipo: 'Picape', marca: 'Fiat', modelo: 'Strada',
        versao: 'Volcano 1.3', ano: 2024, km: 22000, preco: 109900,
        cambio: 'Manual', combustivel: 'Flex', cor: 'Branco', portas: 4,
        destaque: false, status: 'negociando', fotos: [],
        descricao: 'Strada Volcano cabine dupla, seminova, pra trabalho ou lazer.',
        origem: 'proprio', consignanteNome: '', consignanteTel: '',
        docStatus: 'ok', dataEntrada: '2026-05-05'
      },
      {
        id: 'v-renegade-2021', real: false, tipo: 'SUV', marca: 'Jeep', modelo: 'Renegade',
        versao: 'Longitude 1.8', ano: 2021, km: 70000, preco: 98000,
        cambio: 'Automático', combustivel: 'Flex', cor: 'Cinza', portas: 4,
        destaque: false, status: 'disponivel', fotos: [],
        descricao: 'Renegade Longitude, robusto, revisado. Parado há um tempo — bom pra negociar.',
        origem: 'proprio', consignanteNome: '', consignanteTel: '',
        docStatus: 'pendente', dataEntrada: '2026-01-20'
      },
      /* vendidos (têm venda correspondente) */
      {
        id: 'v-onix-2021', real: false, tipo: 'Hatch', marca: 'Chevrolet', modelo: 'Onix',
        versao: '1.0 LT', ano: 2021, km: 62000, preco: 61500,
        cambio: 'Manual', combustivel: 'Flex', cor: 'Prata', portas: 4,
        destaque: false, status: 'vendido', fotos: [],
        descricao: 'Onix LT, bem cuidado.',
        origem: 'proprio', consignanteNome: '', consignanteTel: '',
        docStatus: 'ok', dataEntrada: '2026-03-18'
      },
      {
        id: 'v-argo-2022', real: false, tipo: 'Hatch', marca: 'Fiat', modelo: 'Argo',
        versao: 'Drive 1.0', ano: 2022, km: 41000, preco: 64500,
        cambio: 'Manual', combustivel: 'Flex', cor: 'Azul', portas: 4,
        destaque: false, status: 'vendido', fotos: [],
        descricao: 'Argo Drive, completo.',
        origem: 'consignado', consignanteNome: 'Tiago Brito', consignanteTel: '(91) 99001-2233',
        docStatus: 'ok', dataEntrada: '2026-04-02'
      },
      {
        id: 'v-civic-2020', real: false, tipo: 'Sedã', marca: 'Honda', modelo: 'Civic',
        versao: 'EXL 2.0', ano: 2020, km: 75000, preco: 94000,
        cambio: 'Automático', combustivel: 'Flex', cor: 'Preto', portas: 4,
        destaque: false, status: 'vendido', fotos: [],
        descricao: 'Civic EXL, top de linha, couro.',
        origem: 'proprio', consignanteNome: '', consignanteTel: '',
        docStatus: 'ok', dataEntrada: '2026-03-05'
      }
    ],
    usuarios: [
      { user: 'admin', senha: 'admin123', nome: 'Dirceu (Dono)', role: 'admin' },
      { user: 'vendedor', senha: 'venda123', nome: 'João (Vendedor)', role: 'funcionario' }
    ],
    clientes: [
      {
        id: 'c-1', nome: 'Ana Paula', telefone: '(91) 98111-2222', cidade: 'Castanhal/PA', veiculoId: 'v-polo-2025',
        interesse: '', origem: 'WhatsApp', vendedor: 'vendedor', obs: 'Quer simular financiamento em 48x.',
        proximoContato: '2026-06-24', etapa: 'negociando', criadoEm: '2026-06-18'
      },
      {
        id: 'c-2', nome: 'Roberto Lima', telefone: '(91) 98333-4444', cidade: 'Castanhal/PA', veiculoId: 'v-nivus-2024',
        interesse: '', origem: 'Loja', vendedor: 'vendedor', obs: 'Tem um Onix 2020 pra dar na troca.',
        proximoContato: '2026-06-23', etapa: 'atendimento', criadoEm: '2026-06-20'
      },
      {
        id: 'c-3', nome: 'Carla Souza', telefone: '(91) 98555-6666', cidade: 'Inhangapi/PA', veiculoId: '',
        interesse: 'SUV até R$ 90 mil', origem: 'Instagram', vendedor: 'vendedor', obs: '',
        proximoContato: '', etapa: 'novo', criadoEm: '2026-06-21'
      },
      {
        id: 'c-4', nome: 'Fernanda Dias', telefone: '(91) 98777-8899', cidade: 'Castanhal/PA', veiculoId: '',
        interesse: 'HB20 ou Onix automático', origem: 'Instagram', vendedor: 'vendedor', obs: 'Primeiro carro.',
        proximoContato: '', etapa: 'novo', criadoEm: '2026-06-22'
      },
      {
        id: 'c-5', nome: 'Lucas Pereira', telefone: '(91) 98444-1010', cidade: 'Santa Izabel do Pará', veiculoId: 'v-strada-2024',
        interesse: '', origem: 'WhatsApp', vendedor: 'admin', obs: 'Quer a Strada pra trabalho. Vai dar entrada de 30 mil.',
        proximoContato: '2026-06-20', etapa: 'atendimento', criadoEm: '2026-06-15'
      },
      {
        id: 'c-6', nome: 'Patrícia Gomes', telefone: '(91) 98121-3131', cidade: 'Castanhal/PA', veiculoId: 'v-corolla-2022',
        interesse: '', origem: 'Loja', vendedor: 'admin', obs: 'Decidindo entre Corolla e Civic.',
        proximoContato: '2026-06-25', etapa: 'negociando', criadoEm: '2026-06-16'
      },
      {
        id: 'c-7', nome: 'Eduardo Ramos', telefone: '(91) 98262-4242', cidade: 'Inhangapi/PA', veiculoId: 'v-tcross-2022',
        interesse: '', origem: 'Site', vendedor: 'vendedor', obs: 'Negociando a troca do Gol 2015.',
        proximoContato: '2026-06-26', etapa: 'negociando', criadoEm: '2026-06-19'
      },
      {
        id: 'c-8', nome: 'Sandra Lima', telefone: '(91) 98383-5353', cidade: 'Belém/PA', veiculoId: '',
        interesse: 'Caminhonete a diesel', origem: 'Telefone', vendedor: 'vendedor', obs: 'Achou mais barato em outra loja.',
        proximoContato: '', etapa: 'perdido', criadoEm: '2026-06-10'
      },
      {
        id: 'c-juliana', nome: 'Juliana Castro', telefone: '(91) 98220-3344', cidade: 'Castanhal/PA', veiculoId: 'v-onix-2021',
        interesse: '', origem: 'WhatsApp', vendedor: 'vendedor', obs: 'Comprou o Onix LT.',
        proximoContato: '', etapa: 'fechado', criadoEm: '2026-05-30'
      },
      {
        id: 'c-marcos', nome: 'Marcos Vinícius', telefone: '(91) 98505-6262', cidade: 'Castanhal/PA', veiculoId: 'v-argo-2022',
        interesse: '', origem: 'Loja', vendedor: 'admin', obs: 'Comprou o Argo.',
        proximoContato: '', etapa: 'fechado', criadoEm: '2026-06-08'
      },
      {
        id: 'c-pedro', nome: 'Pedro Henrique', telefone: '(91) 98616-7373', cidade: 'Ananindeua/PA', veiculoId: 'v-civic-2020',
        interesse: '', origem: 'Indicação', vendedor: 'vendedor', obs: 'Comprou o Civic EXL.',
        proximoContato: '', etapa: 'fechado', criadoEm: '2026-06-14'
      }
    ],
    vendas: [
      {
        id: 'venda-3', numero: 3, veiculoId: 'v-civic-2020', veiculoNome: 'Honda Civic EXL 2.0',
        clienteId: 'c-pedro', compradorNome: 'Pedro Henrique', compradorTel: '(91) 98616-7373', cidade: 'Ananindeua/PA',
        vendedor: 'vendedor', valorFinal: 94000, status: 'Concluída', dataVenda: '2026-06-19'
      },
      {
        id: 'venda-2', numero: 2, veiculoId: 'v-argo-2022', veiculoNome: 'Fiat Argo Drive 1.0',
        clienteId: 'c-marcos', compradorNome: 'Marcos Vinícius', compradorTel: '(91) 98505-6262', cidade: 'Castanhal/PA',
        vendedor: 'admin', valorFinal: 64500, status: 'Concluída', dataVenda: '2026-06-13'
      },
      {
        id: 'venda-1', numero: 1, veiculoId: 'v-onix-2021', veiculoNome: 'Chevrolet Onix 1.0 LT',
        clienteId: 'c-juliana', compradorNome: 'Juliana Castro', compradorTel: '(91) 98220-3344', cidade: 'Castanhal/PA',
        vendedor: 'vendedor', valorFinal: 61500, status: 'Concluída', dataVenda: '2026-06-04'
      }
    ],
    seqVenda: 3
  };

  /* ---------- Persistência ---------- */
  function load() {
    try {
      var raw = global.localStorage.getItem(DB_KEY);
      if (!raw) { save(SEED); return clone(SEED); }
      var db = JSON.parse(raw);
      if (!db.permissoes) db.permissoes = clone(SEED.permissoes);
      if (!db.clientes) db.clientes = [];
      if (!db.vendas) db.vendas = [];
      if (db.seqVenda == null) db.seqVenda = 0;
      // migração: o status "reservado" passou a se chamar "negociando";
      // e o tipo "Sedan" foi padronizado para "Sedã" (alinhar sistema ↔ site)
      var mig = false;
      (db.veiculos || []).forEach(function (v) {
        if (v.status === 'reservado') { v.status = 'negociando'; mig = true; }
        if (v.tipo === 'Sedan') { v.tipo = 'Sedã'; mig = true; }
      });
      if (mig) save(db);
      return db;
    } catch (e) { return clone(SEED); }
  }
  function save(db) { global.localStorage.setItem(DB_KEY, JSON.stringify(db)); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function uid(p) { return (p || 'id') + '-' + Date.now() + '-' + Math.floor(Math.random() * 1000); }
  var MAX_DESTAQUE = 3;
  // completa os destaques até o máximo, promovendo os veículos há mais tempo em estoque
  // (mais antigos primeiro). Mexe no db; não salva. Manual continua valendo — só preenche vazios.
  function topUpDestaques(db) {
    var ativos = db.veiculos.filter(function (v) { return v.status !== 'vendido'; });
    var qtd = ativos.filter(function (v) { return v.destaque; }).length;
    if (qtd >= MAX_DESTAQUE) return;
    var candidatos = ativos.filter(function (v) { return !v.destaque; })
      .sort(function (a, b) { return (a.dataEntrada || '9999').localeCompare(b.dataEntrada || '9999'); });
    for (var i = 0; i < candidatos.length && qtd < MAX_DESTAQUE; i++) { candidatos[i].destaque = true; qtd++; }
  }

  /* ---------- API pública ---------- */
  var Store = {
    LIMITS: LIMITS,
    reset: function () { global.localStorage.removeItem(DB_KEY); return load(); },

    getConfig: function () { return load().config; },
    saveConfig: function (cfg) {
      var db = load(); db.config = Object.assign(db.config, cfg); save(db); return db.config;
    },

    /* ---- Permissões ---- */
    getPerms: function () { return load().permissoes; },
    savePerms: function (p) {
      var db = load(); db.permissoes = Object.assign(db.permissoes, p); save(db); return db.permissoes;
    },
    can: function (session, key) {
      if (!session) return false;
      if (session.role === 'admin') return true;
      return !!load().permissoes[key];
    },

    /* ---- Veículos ---- */
    getVehicles: function (filters) {
      var list = load().veiculos.slice();
      filters = filters || {};
      if (filters.status) list = list.filter(function (v) { return v.status === filters.status; });
      if (filters.destaque) list = list.filter(function (v) { return v.destaque; });
      if (filters.marca) list = list.filter(function (v) { return v.marca === filters.marca; });
      if (filters.tipo) list = list.filter(function (v) { return v.tipo === filters.tipo; });
      if (filters.cambio) list = list.filter(function (v) { return v.cambio === filters.cambio; });
      if (filters.origem) list = list.filter(function (v) { return v.origem === filters.origem; });
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
    // o que aparece no site: tudo que NÃO está vendido (disponível + negociando)
    getPublicVehicles: function (filters) {
      return this.getVehicles(filters).filter(function (v) { return v.status !== 'vendido'; });
    },
    getVehicle: function (id) {
      var found = load().veiculos.filter(function (v) { return v.id === id; });
      return found.length ? found[0] : null;
    },
    nomeVeiculo: function (v) {
      if (!v) return '—';
      return (v.marca + ' ' + v.modelo + ' ' + (v.versao || '')).trim();
    },
    marcas: function () {
      var set = {}; load().veiculos.forEach(function (v) { set[v.marca] = 1; });
      return Object.keys(set).sort();
    },
    // tipos distintos existentes no estoque (pro filtro do site nascer dos dados, sem lista fixa)
    tipos: function () {
      var set = {}; load().veiculos.forEach(function (v) { if (v.tipo) set[v.tipo] = 1; });
      return Object.keys(set).sort();
    },
    saveVehicle: function (v) {
      var db = load();
      var saved = v;
      if (!v.id) {
        v.id = uid('v');
        if (!v.dataEntrada) v.dataEntrada = new Date().toISOString().slice(0, 10);
        db.veiculos.unshift(v);
      } else {
        var i = -1; db.veiculos.forEach(function (x, idx) { if (x.id === v.id) i = idx; });
        if (i > -1) { db.veiculos[i] = Object.assign(db.veiculos[i], v); saved = db.veiculos[i]; } else db.veiculos.unshift(v);
      }
      // se foi marcado como vendido pela edição, sai do destaque e promove o mais antigo
      if (saved.status === 'vendido') { saved.destaque = false; topUpDestaques(db); }
      save(db); return saved;
    },
    deleteVehicle: function (id) {
      var db = load();
      db.veiculos = db.veiculos.filter(function (v) { return v.id !== id; });
      topUpDestaques(db);       // mantém os destaques completos
      save(db);
    },
    diasParado: function (v) {
      if (!v.dataEntrada) return 0;
      return Math.max(0, Math.round((new Date() - new Date(v.dataEntrada)) / 86400000));
    },

    /* ---- Clientes (CRM — antes "leads") ---- */
    getClientes: function () { return load().clientes.slice(); },
    getCliente: function (id) {
      var f = load().clientes.filter(function (c) { return c.id === id; }); return f.length ? f[0] : null;
    },
    saveCliente: function (c) {
      var db = load();
      if (!c.id) { c.id = uid('c'); c.criadoEm = new Date().toISOString().slice(0, 10); db.clientes.unshift(c); }
      else {
        var i = -1; db.clientes.forEach(function (x, idx) { if (x.id === c.id) i = idx; });
        if (i > -1) db.clientes[i] = Object.assign(db.clientes[i], c); else db.clientes.unshift(c);
      }
      save(db); return c;
    },
    deleteCliente: function (id) {
      var db = load(); db.clientes = db.clientes.filter(function (c) { return c.id !== id; }); save(db);
    },
    setClienteEtapa: function (id, etapa) {
      var db = load();
      db.clientes.forEach(function (c) { if (c.id === id) c.etapa = etapa; });
      save(db);
    },
    nomeCliente: function (id) {
      var c = this.getCliente(id); return c ? c.nome : '—';
    },

    /* ---- Vendas ---- */
    getVendas: function () { return load().vendas.slice(); },
    proximoNumeroVenda: function () { return (load().seqVenda || 0) + 1; },
    // registra a venda, gera número e marca o veículo como vendido
    registrarVenda: function (dados) {
      var db = load();
      var v = null;
      db.veiculos.forEach(function (x) { if (x.id === dados.veiculoId) v = x; });
      if (!v) return null;
      db.seqVenda = (db.seqVenda || 0) + 1;
      var venda = {
        id: uid('venda'),
        numero: db.seqVenda,
        veiculoId: v.id,
        veiculoNome: (v.marca + ' ' + v.modelo + ' ' + (v.versao || '')).trim(),
        clienteId: dados.clienteId || '',
        compradorNome: dados.compradorNome || '',
        compradorTel: dados.compradorTel || '',
        cidade: dados.cidade || '',
        vendedor: dados.vendedor || '',
        valorFinal: Number(dados.valorFinal) || 0,
        status: dados.status || 'Concluída',
        dataVenda: dados.dataVenda || new Date().toISOString().slice(0, 10)
      };
      db.vendas.unshift(venda);
      v.status = 'vendido';
      v.destaque = false;       // vendido sai do destaque
      topUpDestaques(db);       // e entra o mais antigo no lugar
      // fecha o cliente vinculado, se houver
      if (dados.clienteId) db.clientes.forEach(function (c) { if (c.id === dados.clienteId) c.etapa = 'fechado'; });
      save(db);
      return venda;
    },
    setVendaStatus: function (id, status) {
      var db = load();
      db.vendas.forEach(function (s) { if (s.id === id) s.status = status; });
      save(db);
    },
    // cancela a venda e devolve o veículo ao estoque (disponível)
    cancelarVenda: function (id) {
      var db = load(); var venda = null;
      db.vendas.forEach(function (s) { if (s.id === id) { s.status = 'Cancelada'; venda = s; } });
      if (venda) db.veiculos.forEach(function (v) { if (v.id === venda.veiculoId && v.status === 'vendido') v.status = 'disponivel'; });
      save(db);
      return venda;
    },

    /* ---- Usuários (admin) ---- */
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
    userName: function (user) {
      var f = load().usuarios.filter(function (u) { return u.user === user; });
      return f.length ? f[0].nome : (user || '—');
    },

    /* ---- Autenticação (demo — em produção, Supabase Auth) ---- */
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
    },

    /* =================================================================
       DASHBOARD — só os indicadores operacionais (sem financeiro de lucro)
       ================================================================= */
    dashboard: function () {
      var db = load();
      var vs = db.veiculos;
      var disp = vs.filter(function (v) { return v.status !== 'vendido'; });
      var proprios = disp.filter(function (v) { return v.origem === 'proprio'; });
      var consig = disp.filter(function (v) { return v.origem === 'consignado'; });
      var mesAtual = new Date().toISOString().slice(0, 7);
      var vendasMes = db.vendas.filter(function (s) { return (s.dataVenda || '').slice(0, 7) === mesAtual && s.status !== 'Cancelada'; });
      var fatMes = vendasMes.reduce(function (a, s) { return a + (s.valorFinal || 0); }, 0);

      var self = this;
      var parados = disp.map(function (v) { return { v: v, dias: self.diasParado(v) }; })
        .sort(function (a, b) { return b.dias - a.dias; });

      var docPendente = disp.filter(function (v) { return v.docStatus === 'pendente'; });

      // ----- comercial (funil de clientes + conversão + ranking de vendedores) -----
      var funil = { novo: 0, atendimento: 0, negociando: 0, fechado: 0, perdido: 0 };
      db.clientes.forEach(function (c) { if (funil[c.etapa] != null) funil[c.etapa]++; });
      var ativos = funil.novo + funil.atendimento + funil.negociando;
      var encerrados = funil.fechado + funil.perdido;
      var conversao = encerrados ? Math.round((funil.fechado / encerrados) * 100) : 0;
      var rank = {};
      vendasMes.forEach(function (s) {
        var k = s.vendedor || '—';
        if (!rank[k]) rank[k] = { vendedor: k, nome: self.userName(k), qtd: 0, valor: 0 };
        rank[k].qtd++; rank[k].valor += s.valorFinal || 0;
      });
      var ranking = Object.keys(rank).map(function (k) { return rank[k]; })
        .sort(function (a, b) { return b.valor - a.valor; });

      return {
        totalEstoque: disp.length,
        valorEstoque: disp.reduce(function (a, v) { return a + (v.preco || 0); }, 0),
        proprios: { qtd: proprios.length, valor: proprios.reduce(function (a, v) { return a + v.preco; }, 0) },
        consignados: { qtd: consig.length, valor: consig.reduce(function (a, v) { return a + v.preco; }, 0) },
        vendidosMes: vendasMes.length,
        faturamentoMes: fatMes,
        ticketMedio: vendasMes.length ? Math.round(fatMes / vendasMes.length) : 0,
        parados: parados.slice(0, 5),
        docPendente: docPendente,
        funil: funil,
        clientesAtivos: ativos,
        conversao: conversao,
        ranking: ranking
      };
    },

    /* RELATÓRIO de vendas por período (mês YYYY-MM ou tudo) */
    relatorio: function (mes) {
      var vendas = load().vendas.slice();
      if (mes) vendas = vendas.filter(function (s) { return (s.dataVenda || '').slice(0, 7) === mes; });
      vendas.sort(function (a, b) { return (b.numero || 0) - (a.numero || 0); });
      return vendas;
    },
    mesesComVenda: function () {
      var set = {};
      load().vendas.forEach(function (s) { if (s.dataVenda) set[s.dataVenda.slice(0, 7)] = 1; });
      return Object.keys(set).sort().reverse();
    }
  };

  /* ---------- Helpers de formatação ---------- */
  Store.fmtPreco = function (n) {
    if (n == null || n === '') return '—';
    return 'R$ ' + Number(n).toLocaleString('pt-BR');
  };
  Store.fmtKm = function (n) { return Number(n).toLocaleString('pt-BR') + ' km'; };
  Store.fmtData = function (iso) {
    if (!iso) return '—';
    var p = iso.split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso;
  };
  Store.fmtMes = function (ym) {
    if (!ym) return '—';
    var meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    var p = ym.split('-'); return meses[Number(p[1]) - 1] + '/' + p[0];
  };
  Store.fmtNumeroVenda = function (n) { return '#' + String(n || 0).padStart(4, '0'); };
  Store.placeholder = function (v) {
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
    return 'https://wa.me/' + cfg.whatsapp + '?text=' + encodeURIComponent(texto || 'Olá! Vi um veículo no site da Dicar e quero mais informações.');
  };

  global.Store = Store;
})(window);
