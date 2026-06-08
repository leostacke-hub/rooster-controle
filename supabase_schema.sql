-- Rooster Weddings - Supabase Database Schema

-- 1. SETTINGS Table (One row configuration per event_type)
create table if not exists settings (
  id uuid default gen_random_uuid() primary key,
  event_type text not null unique,
  whatsapp_number text not null default '5511999999999',
  contact_email text not null default 'contato@roosterfilms.com.br',
  instagram_handle text not null default '@roosterfilms',
  address text not null default 'São Paulo, SP',
  authority_title text not null default 'A Excelência da Arte Cinematográfica',
  authority_subtitle text not null default 'A Beleza no Detalhe',
  faq_items jsonb not null default '[]'::jsonb,
  testimonials jsonb not null default '[]'::jsonb,
  authority_cards jsonb not null default '[]'::jsonb,
  footer_text text not null default 'Rooster Films. Todos os direitos reservados.',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table settings enable row level security;

-- Policies for settings (Public read, authenticated admin write)
create policy "Allow public read access to settings" on settings for select using (true);
create policy "Allow authenticated admin write access to settings" on settings for all using (auth.role() = 'authenticated');

-- 2. PORTFOLIO Table
create table if not exists portfolio (
  id uuid default gen_random_uuid() primary key,
  event_type text not null default 'casamento',
  title text not null,
  couple text not null,
  location text not null,
  duration text not null,
  cover_image text not null,
  video_url text not null,
  category text not null default 'videos',
  highlighted boolean default false,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table portfolio enable row level security;

create policy "Allow public read access to portfolio" on portfolio for select using (true);
create policy "Allow authenticated admin write access to portfolio" on portfolio for all using (auth.role() = 'authenticated');

-- 3. PHOTOS Table
create table if not exists photos (
  id uuid default gen_random_uuid() primary key,
  event_type text not null default 'casamento',
  url text not null,
  alt text not null,
  caption text,
  category text not null default 'decoracao',
  display_order integer default 0,
  highlighted boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table photos enable row level security;

create policy "Allow public read access to photos" on photos for select using (true);
create policy "Allow authenticated admin write access to photos" on photos for all using (auth.role() = 'authenticated');

-- 4. SERVICES Table (Simulator Pricing Items)
create table if not exists services (
  id text primary key,
  event_type text not null default 'casamento',
  name text not null,
  price numeric not null,
  category text not null,
  description text not null,
  required boolean default false,
  active boolean default true,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table services enable row level security;

create policy "Allow public read access to services" on services for select using (true);
create policy "Allow authenticated admin write access to services" on services for all using (auth.role() = 'authenticated');

-- 5. PACKAGES Table (Recommended package configurations)
create table if not exists packages (
  id uuid default gen_random_uuid() primary key,
  event_type text not null default 'casamento',
  name text not null,
  category text not null,
  description text not null,
  inclusions jsonb not null default '[]'::jsonb,
  base_price numeric not null,
  promo_price numeric not null,
  badge text,
  highlight_color text,
  display_order integer default 0,
  active boolean default true,
  benefit_type text not null default 'desconto',
  benefit_desc text not null default '',
  enable_recommendations boolean default true,
  recommendation_priority integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table packages enable row level security;

create policy "Allow public read access to packages" on packages for select using (true);
create policy "Allow authenticated admin write access to packages" on packages for all using (auth.role() = 'authenticated');

-- 6. BENEFITS Table (Reward Progressive thresholds)
create table if not exists benefits (
  id uuid default gen_random_uuid() primary key,
  event_type text not null default 'casamento',
  target_price numeric not null,
  missing_text text not null,
  benefit_title text not null,
  benefit_description text not null,
  active boolean default true,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table benefits enable row level security;

create policy "Allow public read access to benefits" on benefits for select using (true);
create policy "Allow authenticated admin write access to benefits" on benefits for all using (auth.role() = 'authenticated');

-- 7. BUDGETS Table (Leads / CRM)
create table if not exists budgets (
  id uuid default gen_random_uuid() primary key,
  event_type text not null default 'casamento',
  name text not null,
  email text not null,
  phone text not null,
  event_date date not null,
  location text not null,
  options jsonb not null default '[]'::jsonb,
  total_price numeric not null,
  status text not null default 'pending',
  pdf_url text,
  lead_source text,
  referred_by text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table budgets enable row level security;

-- Budgets policies: public insert, authenticated admin read/write
create policy "Allow public inserts to budgets" on budgets for insert with check (true);
create policy "Allow authenticated admin read access to budgets" on budgets for select using (auth.role() = 'authenticated');
create policy "Allow authenticated admin write access to budgets" on budgets for all using (auth.role() = 'authenticated');


-- =========================================================================
-- INITIAL SEED DATA
-- =========================================================================

-- Seed 1: Settings
insert into settings (
  event_type,
  whatsapp_number,
  contact_email,
  instagram_handle,
  address,
  authority_title,
  authority_subtitle,
  faq_items,
  testimonials,
  authority_cards,
  footer_text
) values (
  'casamento',
  '5511999999999',
  'contato@roosterfilms.com.br',
  '@roosterfilms',
  'São Paulo, SP',
  'A Excelência da Arte Cinematográfica',
  'A Beleza no Detalhe',
  '[
    {
      "question": "Com quanta antecedência devemos contratar a Rooster Films?",
      "answer": "Recomendamos entrar em contato de 8 a 12 meses antes do casamento. Como trabalhamos com uma quantidade muito limitada de casamentos por ano e apenas um evento por dia, nossas datas costumam esgotar rapidamente."
    },
    {
      "question": "Vocês realizam casamentos fora de sua cidade natal ou no exterior?",
      "answer": "Sim! Viajamos para qualquer lugar do Brasil ou do mundo. Nossa equipe cuida de toda a logística de viagem e incluímos esses custos de forma clara e simplificada na proposta final."
    },
    {
      "question": "Qual é o prazo de entrega dos filmes finalizados?",
      "answer": "O prazo médio de entrega dos filmes é de até 90 dias úteis após a data do casamento, necessário para curadoria, edição, colorização e finalização artística."
    }
  ]'::jsonb,
  '[
    {
      "id": 1,
      "couple": "Julia & Ricardo",
      "location": "Fazenda Vila Rica, Itatiba - SP",
      "quote": "Não temos palavras para descrever o que foi assistir ao nosso filme pela primeira vez. A equipe da Rooster Films conseguiu capturar a essência da nossa emoção de uma forma inexplicável.",
      "image": "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=150&h=150&q=80"
    }
  ]'::jsonb,
  '[
    {
      "title": "SENTIMOS CADA HISTÓRIA",
      "description": "Mais do que filmar, nos conectamos com o que realmente importa: vocês. Capturamos emoções reais de forma leve e autêntica.",
      "bgImage": "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=800&q=80"
    }
  ]'::jsonb,
  '© Rooster Films. Todos os direitos reservados.'
),
(
  'aniversario',
  '5511999999999',
  'contato@roosterfilms.com.br',
  '@roosterfilms',
  'São Paulo, SP',
  'A Celebração da Vida',
  'Registrando Marcos Inesquecíveis',
  '[
    {
      "question": "Qual o prazo de entrega das fotos e vídeos do aniversário?",
      "answer": "O prazo de entrega é de até 30 dias úteis para tratamento de imagem e edição de vídeo."
    }
  ]'::jsonb,
  '[
    {
      "id": 2,
      "couple": "Juliana Santos",
      "location": "Espaço Trio, São Paulo - SP",
      "quote": "A cobertura do meu aniversário de 30 anos foi impecável. Os vídeos capturaram exatamente a alegria de rever todos os meus amigos.",
      "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80"
    }
  ]'::jsonb,
  '[
    {
      "title": "CADA ANO IMPORTA",
      "description": "Registramos os abraços sinceros, os sorrisos espontâneos e a energia de celebrar mais um ano de vida.",
      "bgImage": "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80"
    }
  ]'::jsonb,
  '© Rooster Films. Todos os direitos reservados.'
),
(
  'revelacao',
  '5511999999999',
  'contato@roosterfilms.com.br',
  '@roosterfilms',
  'São Paulo, SP',
  'A Emoção da Descoberta',
  'Eternizando o Início de Uma Nova Jornada',
  '[
    {
      "question": "Como funciona a confidencialidade do resultado no Chá Revelação?",
      "answer": "Nossa equipe pode receber o envelope diretamente do laboratório ou da pessoa de confiança designada e garantimos sigilo absoluto até o momento exato da revelação."
    }
  ]'::jsonb,
  '[
    {
      "id": 3,
      "couple": "Paula & Marcos",
      "location": "Residência, Alphaville - SP",
      "quote": "O vídeo do nosso chá revelação nos faz chorar toda vez. Capturou perfeitamente o momento em que a fumaça rosa subiu e descobrimos que era a nossa pequena Laura.",
      "image": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80"
    }
  ]'::jsonb,
  '[
    {
      "title": "REVELANDO AMOR",
      "description": "Eternizamos a expectativa, os palpites e a explosão de alegria das famílias ao descobrirem o gênero do bebê.",
      "bgImage": "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80"
    }
  ]'::jsonb,
  '© Rooster Films. Todos os direitos reservados.'
)
on conflict(event_type) do update set updated_at = now();

-- Seed 2: Portfolio Videos
insert into portfolio (event_type, title, couple, location, duration, cover_image, video_url, category, highlighted, display_order) values
('casamento', 'O Amor sob a Luz da Toscana', 'Isabella & Alessandro', 'Val d''Orcia, Toscana - Itália', '4:15', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80', 'https://assets.mixkit.co/videos/preview/mixkit-bride-and-groom-holding-hands-walking-in-a-field-44339-large.mp4', 'videos', true, 1),
('casamento', 'Promessas ao Pôr do Sol', 'Mariana & Roberto', 'Praia do Rosa, Santa Catarina - Brasil', '3:40', 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80', 'https://assets.mixkit.co/videos/preview/mixkit-wedding-couple-under-the-veil-44338-large.mp4', 'videos', true, 2),
('casamento', 'Sinfonia Urbana de um Sim', 'Gabriela & Henrique', 'Haras Albar, Campinas - SP', '5:10', 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80', 'https://assets.mixkit.co/videos/preview/mixkit-newlyweds-kiss-while-walking-outside-44341-large.mp4', 'videos', true, 3),
('aniversario', 'Première dos 15 Anos', 'Larissa Fernandes', 'Palácio dos Cedros, São Paulo - SP', '3:10', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80', 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-in-a-beautiful-dress-having-fun-at-a-party-41662-large.mp4', 'videos', true, 1),
('revelacao', 'O Dia da Descoberta', 'Mariana & Thiago', 'Haras Albar, Campinas - SP', '2:45', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80', 'https://assets.mixkit.co/videos/preview/mixkit-gender-reveal-powder-explosion-celebration-45120-large.mp4', 'videos', true, 1);

-- Seed 3: Photos Masonry
insert into photos (event_type, url, alt, caption, category, display_order, highlighted) values
('casamento', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80', 'O beijo sob o véu', 'Cenas repletas de poesia e sensibilidade no altar.', 'cerimonia', 1, true),
('casamento', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', 'Decoração de Luxo', 'Detalhes meticulosos da recepção sob luz quente.', 'decoracao', 2, true),
('casamento', 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80', 'Passeio do casal', 'Retratos espontâneos no campo durante o pôr do sol.', 'ensaio', 3, true),
('casamento', 'https://images.unsplash.com/photo-1519225495810-7517c300ea87?auto=format&fit=crop&w=800&q=80', 'Cintilações da festa', 'Saída dos noivos celebrada com sparkles sob céu estrelado.', 'festa', 4, true),
('casamento', 'https://images.unsplash.com/photo-1520854221256-17451cc35953?auto=format&fit=crop&w=800&q=80', 'A Entrada da Noiva', 'Olhares cúmplices e carregados de emoção.', 'cerimonia', 5, true),
('casamento', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80', 'Brinde', 'Celebrações sinceras que ecoarão por gerações.', 'festa', 6, true),
('aniversario', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80', 'Bolo de aniversário', 'O soprar das velinhas rodeado de amigos.', 'festa', 1, true),
('revelacao', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80', 'Decoração chá revelação', 'Os tons de azul e rosa decorando a ansiedade dos pais.', 'decoracao', 1, true);

-- Seed 4: Services
insert into services (id, event_type, name, price, category, description, required, active, display_order) values
('pre_wedding_vid', 'casamento', 'Pré Wedding', 1200, 'pre_wedding', 'Ensaio gravado antes do casamento em local à escolha dos noivos.', false, true, 1),
('captacao_cerimonia', 'casamento', 'Cerimônia', 1800, 'captacao', 'Cobertura completa da cerimônia de casamento (obrigatório).', true, true, 2),
('captacao_making_of', 'casamento', 'Making Of do Casal', 800, 'captacao', 'Registro poético e espontâneo dos preparativos dos noivos antes da cerimônia.', false, true, 3),
('captacao_festa', 'casamento', 'Festa', 1200, 'captacao', 'Captação da recepção, brinde, valsa e os momentos mais animados da pista.', false, true, 4),
('video_teaser', 'casamento', 'Teaser', 1000, 'videos', 'Vídeo compacto de 3 minutos com os melhores momentos (obrigatório).', true, true, 5),
('video_filme_6_10', 'casamento', 'Filme 6-10 min', 1500, 'videos', 'Curta-metragem cinematográfico contando a história completa do dia.', false, true, 6),
('video_filme_12_18', 'casamento', 'Filme 12-18 min', 2200, 'videos', 'Documentário cinematográfico estendido, ideal para registrar discursos e votos.', false, true, 7),
('extra_same_day', 'casamento', 'Same Day Edit', 1700, 'extras', 'Vídeo de até 2 minutos editado no local do evento e transmitido na própria festa.', false, true, 8),
('ensaio_aniversario', 'aniversario', 'Vídeo Ensaio Pré Aniversário', 1000, 'pre_wedding', 'Ensaio em vídeo realizado antes do evento principal.', false, true, 1),
('captacao_festa_aniversario', 'aniversario', 'Captação Festa', 1500, 'captacao', 'Cobertura completa dos parabéns e da pista de dança (obrigatório).', true, true, 2),
('video_teaser_aniversario', 'aniversario', 'Teaser de Aniversário (2 min)', 800, 'videos', 'Vídeo curto e dinâmico com os melhores momentos (obrigatório).', true, true, 3),
('video_filme_aniversario', 'aniversario', 'Filme de Aniversário (5 a 8 min)', 1200, 'videos', 'Registro completo e emocional da comemoração.', false, true, 4),
('ensaio_gestante', 'revelacao', 'Vídeo Ensaio Gestante', 1100, 'pre_wedding', 'Registro em vídeo externo celebrando a gestação.', false, true, 1),
('captacao_revelacao', 'revelacao', 'Captação Chá Revelação', 1200, 'captacao', 'Cobertura da recepção e do grande momento da revelação (obrigatório).', true, true, 2),
('video_teaser_revelacao', 'revelacao', 'Teaser Revelação (2 min)', 700, 'videos', 'Edição emocionante focada nas reações e descoberta (obrigatório).', true, true, 3);

-- Seed 5: Recommended Packages
insert into packages (event_type, name, category, description, inclusions, base_price, promo_price, badge, highlight_color, display_order, active) values
('casamento', 'Experiência Essencial', 'Sugestão', 'Para casais que desejam preservar os momentos mais importantes da cerimônia com elegância e sensibilidade.', '["captacao_cerimonia", "video_teaser"]'::jsonb, 2800, 2800, null, null, 1, true),
('casamento', 'Experiência Completa', 'Recomendada', 'Uma narrativa completa do seu dia, registrando desde a emoção dos preparativos até a celebração da festa.', '["captacao_cerimonia", "video_teaser", "captacao_making_of", "captacao_festa"]'::jsonb, 4800, 4500, null, null, 2, true),
('casamento', 'Experiência Cinematográfica', 'Exclusiva', 'A experiência definitiva para quem deseja transformar o casamento em um verdadeiro filme.', '["pre_wedding_vid", "captacao_making_of", "captacao_cerimonia", "captacao_festa", "video_teaser", "video_filme_6_10"]'::jsonb, 7500, 7000, 'MAIS ESCOLHIDA', 'gold', 3, true),
('aniversario', 'EXPERIÊNCIA PREMIÈRE', 'Recomendada', 'A cobertura ideal para seu aniversário, registrando a recepção e a festa.', '["captacao_festa_aniversario", "video_teaser_aniversario"]'::jsonb, 2300, 2300, 'MAIS ESCOLHIDA', 'gold', 1, true),
('revelacao', 'MEMÓRIA ETERNA', 'Recomendada', 'Guarde para sempre a emoção e a surpresa da descoberta do seu bebê.', '["captacao_revelacao", "video_teaser_revelacao"]'::jsonb, 1900, 1900, 'MAIS ESCOLHIDA', 'gold', 1, true);

-- Seed 6: Progressive Benefits
insert into benefits (event_type, target_price, missing_text, benefit_title, benefit_description, active, display_order) values
('casamento', 8000, 'Falta R$ {missing} para desbloquear a prioridade.', 'Entrega Prioritária', 'Seu filme entra em uma fila de edição e finalização prioritária.', true, 1),
('casamento', 10000, 'Falta R$ {missing} para desbloquear o brinde físico.', 'Kit Premium', 'Receba todos os vídeos em uma apresentação física personalizada.', true, 2),
('aniversario', 3000, 'Falta R$ {missing} para desbloquear brinde de aniversário.', 'Retrospectiva Rápida', 'Ganhos de uma edição expressa para compartilhar no dia seguinte.', true, 1),
('revelacao', 2500, 'Falta R$ {missing} para desbloquear fotos extras.', 'Painel Digital', 'Mini-galeria online entregue em 24h.', true, 1);

-- 8. TESTIMONIALS Table
create table if not exists testimonials (
  id uuid default gen_random_uuid() primary key,
  client_name text not null,
  subtitle text not null,
  quote text not null,
  stars integer not null default 5 check (stars >= 1 and stars <= 5),
  image_url text,
  event_type text not null default 'casamento',
  active boolean default true,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table testimonials enable row level security;

create policy "Allow public read access to testimonials" on testimonials for select using (true);
create policy "Allow authenticated admin write access to testimonials" on testimonials for all using (auth.role() = 'authenticated');

-- Alter Settings to support testimonial carousel customization
alter table settings add column if not exists testimonial_per_page integer not null default 4;
alter table settings add column if not exists testimonial_per_slide integer not null default 1;
alter table settings add column if not exists testimonial_transition_speed integer not null default 3000;
alter table settings add column if not exists testimonial_autoplay boolean not null default true;
alter table settings add column if not exists testimonial_style text not null default 'classico';

-- Seed initial testimonials
insert into testimonials (client_name, subtitle, quote, stars, image_url, event_type, active, display_order) values
('Julia & Ricardo', 'Fazenda Vila Rica, Itatiba - SP', 'Não temos palavras para descrever o que foi assistir ao nosso filme pela primeira vez. A equipe da Rooster Films conseguiu capturar a essência da nossa emoção de uma forma inexplicável.', 5, 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=150&h=150&q=80', 'casamento', true, 1),
('Juliana Santos', 'Espaço Trio, São Paulo - SP', 'A cobertura do meu aniversário de 30 anos foi impecável. Os vídeos capturaram exatamente a alegria de rever todos os meus amigos.', 5, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80', 'aniversario', true, 1),
('Paula & Marcos', 'Residência, Alphaville - SP', 'O vídeo do nosso chá revelação nos faz chorar toda vez. Capturou perfeitamente o momento em que a fumaça rosa subiu e descobrimos que era a nossa pequena Laura.', 5, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80', 'revelacao', true, 1)
on conflict do nothing;

alter table services add column if not exists bg_image text;

-- 9. FEATURES Table (Differentials / "A Beleza no Detalhe")
create table if not exists features (
  id uuid default gen_random_uuid() primary key,
  icon text not null default 'heart',
  title text not null,
  description text not null,
  display_order integer default 0,
  event_type text not null default 'casamento',
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table features enable row level security;

create policy "Allow public read access to features" on features for select using (true);
create policy "Allow authenticated admin write access to features" on features for all using (auth.role() = 'authenticated');

-- Seed initial features / differentials
insert into features (event_type, icon, title, description, display_order, active) values
('casamento', 'heart', 'Sentimos Cada História', 'Mais do que filmar, buscamos compreender quem vocês são para registrar emoções verdadeiras.', 1, true),
('casamento', 'film', 'Narrativa Cinematográfica', 'Cada filme é construído com ritmo, emoção e intenção artística.', 2, true),
('casamento', 'eye', 'Presença Discreta', 'Registramos momentos autênticos sem interromper ou dirigir excessivamente o casal.', 3, true),
('casamento', 'clock', 'Memórias que Permanecem', 'Criamos filmes que continuam emocionando mesmo muitos anos depois.', 4, true),

('aniversario', 'sparkles', 'Alegria Compartilhada', 'Registramos cada abraço sincero e os sorrisos mais espontâneos da festa.', 1, true),
('aniversario', 'film', 'Edição Dinâmica', 'Um ritmo empolgante que faz você reviver a energia da pista de dança.', 2, true),
('aniversario', 'eye', 'Olhar Atento', 'Não perdemos nenhum detalhe da decoração aos momentos surpresa.', 3, true),
('aniversario', 'clock', 'Prazo Express', 'Seus melhores momentos entregues rapidamente para compartilhar.', 4, true),

('revelacao', 'heart', 'Emoção Pura', 'Capturamos a expectativa e a explosão de alegria com a revelação.', 1, true),
('revelacao', 'eye', 'Foco na Reação', 'Câmeras posicionadas para registrar as lágrimas e sorrisos de toda a família.', 2, true),
('revelacao', 'shield', 'Sigilo Absoluto', 'Garantimos segredo total até o momento exato da grande descoberta.', 3, true),
('revelacao', 'clock', 'Teaser Rápido', 'Um clipe emocionante entregue em poucos dias para as suas redes.', 4, true)
on conflict do nothing;

-- 10. EVENTS Table (Operational tracking after lead won)
create table if not exists events (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid references budgets(id) on delete set null,
  name text not null,
  phone text not null,
  email text not null,
  event_date date not null,
  location text not null,
  total_price numeric not null,
  status text not null default 'Planejamento', -- 'Planejamento', 'Confirmado', 'Em Produção', 'Entregas Pendentes', 'Finalizado'
  event_type text not null default 'casamento',
  
  -- General logistics
  time text,
  city text,
  google_maps_link text,
  
  -- JSON details for flexibility and easy integration with localMock
  schedule jsonb not null default '[]'::jsonb,
  team jsonb not null default '[]'::jsonb,
  equipment_checklist jsonb not null default '[]'::jsonb,
  deliverables jsonb not null default '[]'::jsonb,
  
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table events enable row level security;

create policy "Allow authenticated admin read access to events" on events for select using (auth.role() = 'authenticated');
create policy "Allow authenticated admin write access to events" on events for all using (auth.role() = 'authenticated');



