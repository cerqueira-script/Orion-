-- =====================================================================
-- Seed da DICAR VEÍCULOS — rode UMA VEZ no SQL Editor do Supabase,
-- DEPOIS do schema.sql. Põe a marca/contatos reais + o NAP estruturado
-- (que alimenta o schema do site) + 3 veículos de exemplo.
-- (Os dados internos/consignante são fictícios — ajuste no painel.)
-- =====================================================================

-- 1. Config da loja (atualiza a linha única id=1 criada pelo schema)
update config_loja set
  nome_loja         = 'Dicar Veículos',
  slogan            = 'Compra · Venda · Troca · Financia',
  whatsapp          = '5591988475944',
  telefone_exibicao = '(91) 98847-5944',
  endereco          = 'Av. Pres. Getúlio Vargas, 1852 — Castanhal/PA',
  cep               = '68740-005',
  horario           = 'Seg a Sex 07:30–18:00 · Sáb 08:00–13:00',
  instagram         = 'dicar_veiculos',
  mapa              = 'https://www.google.com/maps?q=Av.+Pres.+Get%C3%BAlio+Vargas,+1852,+Castanhal+PA',
  redes             = '{"facebook":"","youtube":"","tiktok":"","linkedin":""}'::jsonb,
  negocio           = '{
    "alternateName": "Dicar Veículos Castanhal",
    "descricao": "Revenda de carros novos e seminovos com procedência e garantia em Castanhal/PA. Compra, venda, troca e financiamento.",
    "streetAddress": "Av. Pres. Getúlio Vargas, 1852",
    "addressLocality": "Castanhal",
    "addressRegion": "PA",
    "postalCode": "68740-005",
    "addressCountry": "BR",
    "priceRange": "R$ 50.000 - R$ 120.000",
    "ratingValue": "5.0",
    "reviewCount": "5",
    "imagem": "assets/loja.webp",
    "logo": "assets/favicon.svg",
    "horarios": [
      {"dias": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "abre": "07:30", "fecha": "18:00"},
      {"dias": ["Saturday"], "abre": "08:00", "fecha": "13:00"}
    ],
    "areaServed": ["Castanhal","Ananindeua","Marituba","Belém","Capanema","São Miguel do Guamá","Igarapé-Açu","Santa Maria do Pará","Vigia","Maracanã","Curuçá","Inhangapi","Terra Alta","Santo Antônio do Tauá","Ourém","Bragança"]
  }'::jsonb
where id = 1;

-- 2. Três veículos de exemplo (apague/edite pelo painel quando quiser)
insert into veiculos (tipo, marca, modelo, versao, ano, km, preco, cambio, combustivel, cor, portas, descricao, fotos, destaque, status, origem, consignante_nome, consignante_tel, placa, doc_status, data_entrada) values
  ('Hatch','Volkswagen','Polo','1.0 Track',2025,40000,79000,'Manual','Flex','Branco',4,
   'Polo Track 1.0, completo, único dono, revisões em dia. Procedência e garantia Dicar.',
   '["assets/polo2025.webp"]'::jsonb, true, 'disponivel','proprio',null,null,'RGT1A23','ok','2026-05-12'),
  ('SUV','Volkswagen','Nivus','1.0 200 TSI Comfortline Aut.',2024,60814,110900,'Automático','Flex','Cinza',4,
   'Nivus TSI automático, SUV de entrada com baixo consumo e multimídia. Aceita troca.',
   '["assets/nivus2024.webp"]'::jsonb, true, 'disponivel','consignado','Marcos Andrade','(91) 99123-4567','PAB2C34','pendente','2026-03-02'),
  ('Hatch','Fiat','Mobi','1.0 Like',2023,58471,56000,'Manual','Flex','Vermelho',4,
   'Mobi Like econômico, ideal pro primeiro carro. Financiamento facilitado.',
   '["assets/mobi2023.webp"]'::jsonb, true, 'disponivel','proprio',null,null,'QZX3D45','ok','2026-06-01');

-- =====================================================================
-- FIM. Recarregue o site/painel — já deve aparecer "Dicar Veículos" + os 3 carros.
-- =====================================================================
