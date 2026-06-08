import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing. Running with mock client for local development.'
  );
}

// Global in-memory mock database state for offline development
const mockDatabase: Record<string, any[]> = {
  settings: [
    {
      id: 'casamento',
      event_type: 'casamento',
      whatsapp_number: '5511999999999',
      contact_email: 'contato@roosterfilms.com.br',
      instagram_handle: '@roosterfilms',
      address: 'São Paulo, SP',
      authority_title: 'A Excelência da Arte Cinematográfica',
      authority_subtitle: 'A Beleza no Detalhe',
      payment_terms: '- Forma de pagamento padrão: 30% sinal via Pix + saldo parcelado em até 10x sem juros.',
      site_url: '/casamento',
      faq_items: [
        {
          question: "Com quanta antecedência devemos reservar nossa data?",
          answer: "Recomendamos reservar assim que a data e o local estiverem definidos. Como atendemos um número limitado de eventos por período, algumas datas podem ser preenchidas com vários meses de antecedência."
        },
        {
          question: "Vocês atendem casamentos fora de Sinop ou em outros estados?",
          answer: "Sim. Realizamos casamentos em diversas cidades e regiões do Brasil. Caso o evento aconteça fora de Sinop - MT, os custos de deslocamento, hospedagem e logística serão calculados separadamente e apresentados de forma transparente na proposta final."
        },
        {
          question: "O que acontece após enviarmos a solicitação de orçamento?",
          answer: "Após recebermos sua solicitação, verificamos a disponibilidade da data e entramos em contato para alinhar detalhes do evento. Em seguida, enviamos a proposta oficial e orientamos todo o processo de reserva."
        },
        {
          question: "Como funciona a reserva da data?",
          answer: "A data é garantida mediante assinatura do contrato e pagamento do sinal de reserva. Até a formalização da contratação, a data permanece disponível para outros casais."
        },
        {
          question: "Vocês captam o áudio dos votos e da cerimônia?",
          answer: "Sim. Utilizamos sistemas profissionais de captação para registrar os votos, falas do celebrante e momentos importantes da cerimônia, garantindo uma experiência muito mais emocionante no filme final."
        },
        {
          question: "Qual é o prazo de entrega dos filmes?",
          answer: "O prazo médio de entrega é de até 90 dias úteis após o evento. Cada filme passa por um processo cuidadoso de curadoria, edição, tratamento de cor, design de som e finalização artística."
        },
        {
          question: "Podemos escolher as músicas do filme?",
          answer: "Sempre buscamos entender o estilo e a personalidade de cada casal. Quando possível, levamos as preferências musicais em consideração, respeitando também questões de licenciamento e a proposta cinematográfica do filme."
        },
        {
          question: "Se chover ou houver mudanças no cronograma, isso afeta a cobertura?",
          answer: "Não. Estamos preparados para lidar com imprevistos e adaptações de roteiro. Nosso foco é registrar a essência do dia independentemente das condições ou mudanças de programação."
        },
        {
          question: "O pré-wedding é obrigatório?",
          answer: "Não. O pré-wedding é opcional e pode ser incluído para enriquecer ainda mais a narrativa do filme, criando uma conexão emocional entre a história do casal e o grande dia."
        },
        {
          question: "Como sabemos qual experiência escolher?",
          answer: "Você pode montar sua própria experiência ou selecionar um dos pacotes recomendados. Durante o processo, nosso sistema sugere combinações que oferecem a melhor narrativa e o melhor aproveitamento do investimento."
        }
      ],
      testimonials: [
        {
          id: 1,
          couple: "Julia & Ricardo",
          location: "Fazenda Vila Rica, Itatiba - SP",
          quote: "Não temos palavras para descrever o que foi assistir ao nosso filme pela primeira vez. A equipe da Rooster Films conseguiu capturar a essência da nossa emoção de uma forma inexplicável.",
          image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=150&h=150&q=80"
        }
      ],
      authority_cards: [
        {
          title: "SENTIMOS CADA HISTÓRIA",
          description: "Mais do que filmar, nos conectamos com o que realmente importa: vocês. Capturamos emoções reais de forma leve e autêntica.",
          bgImage: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=800&q=80"
        }
      ],
      footer_text: '© Rooster Films. Todos os direitos reservados.',
      testimonial_per_page: 4,
      testimonial_per_slide: 1,
      testimonial_transition_speed: 3000,
      testimonial_autoplay: true,
      testimonial_style: 'classico'
    },
    {
      id: 'aniversario',
      event_type: 'aniversario',
      whatsapp_number: '5511999999999',
      contact_email: 'contato@roosterfilms.com.br',
      instagram_handle: '@roosterfilms',
      address: 'São Paulo, SP',
      authority_title: 'A Celebração da Vida',
      authority_subtitle: 'Registrando Marcos Inesquecíveis',
      payment_terms: '- Forma de pagamento padrão: 30% sinal via Pix + saldo parcelado em até 10x sem juros.',
      site_url: '/aniversario',
      faq_items: [
        {
          question: "Qual o prazo de entrega das fotos e vídeos do aniversário?",
          answer: "O prazo de entrega é de até 30 dias úteis para tratamento de imagem e edição de vídeo."
        },
        {
          question: "Vocês fazem aniversários infantis ou apenas adultos?",
          answer: "Atendemos todos os tipos de aniversários: de 1 ano, 15 anos, aniversários adultos e datas comemorativas especiais."
        }
      ],
      testimonials: [
        {
          id: 2,
          couple: "Juliana Santos",
          location: "Espaço Trio, São Paulo - SP",
          quote: "A cobertura do meu aniversário de 30 anos foi impecável. Os vídeos capturaram exatamente a alegria de rever todos os meus amigos.",
          image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80"
        }
      ],
      authority_cards: [
        {
          title: "CADA ANO IMPORTA",
          description: "Registramos os abraços sinceros, os sorrisos espontâneos e a energia de celebrar mais um ano de vida.",
          bgImage: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80"
        }
      ],
      footer_text: '© Rooster Films. Todos os direitos reservados.',
      testimonial_per_page: 4,
      testimonial_per_slide: 1,
      testimonial_transition_speed: 3000,
      testimonial_autoplay: true,
      testimonial_style: 'classico'
    },
    {
      id: 'revelacao',
      event_type: 'revelacao',
      whatsapp_number: '5511999999999',
      contact_email: 'contato@roosterfilms.com.br',
      instagram_handle: '@roosterfilms',
      address: 'São Paulo, SP',
      authority_title: 'A Emoção da Descoberta',
      authority_subtitle: 'Eternizando o Início de Uma Nova Jornada',
      payment_terms: '- Forma de pagamento padrão: 30% sinal via Pix + saldo parcelado em até 10x sem juros.',
      site_url: '/revelacao',
      faq_items: [
        {
          question: "Como funciona a confidencialidade do resultado no Chá Revelação?",
          answer: "Nossa equipe pode receber o envelope diretamente do laboratório ou da pessoa de confiança designada e garantimos sigilo absoluto até o momento exato da revelação."
        }
      ],
      testimonials: [
        {
          id: 3,
          couple: "Paula & Marcos",
          location: "Residência, Alphaville - SP",
          quote: "O vídeo do nosso chá revelação nos faz chorar toda vez. Capturou perfeitamente o momento em que a fumaça rosa subiu e descobrimos que era a nossa pequena Laura.",
          image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80"
        }
      ],
      authority_cards: [
        {
          title: "REVELANDO AMOR",
          description: "Eternizamos a expectativa, os palpites e a explosão de alegria das famílias ao descobrirem o gênero do bebê.",
          bgImage: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80"
        }
      ],
      footer_text: '© Rooster Films. Todos os direitos reservados.',
      testimonial_per_page: 4,
      testimonial_per_slide: 1,
      testimonial_transition_speed: 3000,
      testimonial_autoplay: true,
      testimonial_style: 'classico'
    }
  ],
  portfolio: [
    {
      id: "1",
      event_type: "casamento",
      title: "O Amor sob a Luz da Toscana",
      couple: "Isabella & Alessandro",
      location: "Val d'Orcia, Toscana - Itália",
      duration: "4:15",
      cover_image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
      video_url: "https://assets.mixkit.co/videos/preview/mixkit-bride-and-groom-holding-hands-walking-in-a-field-44339-large.mp4",
      category: "videos",
      highlighted: true,
      display_order: 1
    },
    {
      id: "2",
      event_type: "aniversario",
      title: "Première dos 15 Anos",
      couple: "Larissa Fernandes",
      location: "Palácio dos Cedros, São Paulo - SP",
      duration: "3:10",
      cover_image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
      video_url: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-in-a-beautiful-dress-having-fun-at-a-party-41662-large.mp4",
      category: "videos",
      highlighted: true,
      display_order: 1
    },
    {
      id: "3",
      event_type: "revelacao",
      title: "O Dia da Descoberta",
      couple: "Mariana & Thiago",
      location: "Haras Albar, Campinas - SP",
      duration: "2:45",
      cover_image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80",
      video_url: "https://assets.mixkit.co/videos/preview/mixkit-gender-reveal-powder-explosion-celebration-45120-large.mp4",
      category: "videos",
      highlighted: true,
      display_order: 1
    }
  ],
  photos: [
    {
      id: "1",
      event_type: "casamento",
      url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
      alt: "O beijo sob o véu",
      caption: "Cenas repletas de poesia e sensibilidade no altar.",
      category: "cerimonia",
      display_order: 1,
      highlighted: true
    },
    {
      id: "2",
      event_type: "aniversario",
      url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80",
      alt: "Bolo de aniversário",
      caption: "O soprar das velinhas rodeado de amigos.",
      category: "festa",
      display_order: 1,
      highlighted: true
    },
    {
      id: "3",
      event_type: "revelacao",
      url: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80",
      alt: "Decoração chá revelação",
      caption: "Os tons de azul e rosa decorando a ansiedade dos pais.",
      category: "decoracao",
      display_order: 1,
      highlighted: true
    }
  ],
  services: [
    // Casamento
    { id: 'pre_wedding_vid', event_type: 'casamento', name: 'Pré Wedding', price: 1200, category: 'pre_wedding', description: 'Ensaio gravado antes do casamento em local à escolha dos noivos.', required: false, active: true, display_order: 1 },
    { id: 'captacao_cerimonia', event_type: 'casamento', name: 'Cerimônia', price: 1800, category: 'captacao', description: 'Cobertura completa da cerimônia de casamento (obrigatório).', required: true, active: true, display_order: 2 },
    { id: 'captacao_making_of', event_type: 'casamento', name: 'Making Of do Casal', price: 800, category: 'captacao', description: 'Registro poético e espontâneo dos preparativos dos noivos antes da cerimônia.', required: false, active: true, display_order: 3 },
    { id: 'captacao_festa', event_type: 'casamento', name: 'Festa', price: 1200, category: 'captacao', description: 'Captação da recepção, brinde, valsa e os momentos mais animados da pista.', required: false, active: true, display_order: 4 },
    { id: 'video_teaser', event_type: 'casamento', name: 'Teaser', price: 1000, category: 'videos', description: 'Vídeo compacto de 3 minutos com os melhores momentos (obrigatório).', required: true, active: true, display_order: 5 },
    { id: 'video_filme_6_10', event_type: 'casamento', name: 'Filme 6-10 min', price: 1500, category: 'videos', description: 'Curta-metragem cinematográfico contando a história completa do dia.', required: false, active: true, display_order: 6 },
    { id: 'video_filme_12_18', event_type: 'casamento', name: 'Filme 12-18 min', price: 2200, category: 'videos', description: 'Documentário cinematográfico estendido, ideal para registrar discursos e votos.', required: false, active: true, display_order: 7 },
    { id: 'extra_same_day', event_type: 'casamento', name: 'Same Day Edit', price: 1700, category: 'extras', description: 'Vídeo de até 2 minutos editado no local do evento e transmitido na própria festa.', required: false, active: true, display_order: 8 },
    
    // Aniversário
    { id: 'ensaio_aniversario', event_type: 'aniversario', name: 'Vídeo Ensaio Pré Aniversário', price: 1000, category: 'pre_wedding', description: 'Ensaio em vídeo realizado antes do evento principal.', required: false, active: true, display_order: 1 },
    { id: 'captacao_festa_aniversario', event_type: 'aniversario', name: 'Captação Festa', price: 1500, category: 'captacao', description: 'Cobertura completa dos parabéns e da pista de dança (obrigatório).', required: true, active: true, display_order: 2 },
    { id: 'video_teaser_aniversario', event_type: 'aniversario', name: 'Teaser de Aniversário (2 min)', price: 800, category: 'videos', description: 'Vídeo curto e dinâmico com os melhores momentos (obrigatório).', required: true, active: true, display_order: 3 },
    { id: 'video_filme_aniversario', event_type: 'aniversario', name: 'Filme de Aniversário (5 a 8 min)', price: 1200, category: 'videos', description: 'Registro completo e emocional da comemoração.', required: false, active: true, display_order: 4 },

    // Revelação
    { id: 'ensaio_gestante', event_type: 'revelacao', name: 'Vídeo Ensaio Gestante', price: 1100, category: 'pre_wedding', description: 'Registro em vídeo externo celebrando a gestação.', required: false, active: true, display_order: 1 },
    { id: 'captacao_revelacao', event_type: 'revelacao', name: 'Captação Chá Revelação', price: 1200, category: 'captacao', description: 'Cobertura da recepção e do grande momento da revelação (obrigatório).', required: true, active: true, display_order: 2 },
    { id: 'video_teaser_revelacao', event_type: 'revelacao', name: 'Teaser Revelação (2 min)', price: 700, category: 'videos', description: 'Edição emocionante focada nas reações e descoberta (obrigatório).', required: true, active: true, display_order: 3 }
  ],
  packages: [
    // Casamento
    { id: '1', event_type: 'casamento', name: 'Experiência Essencial', category: 'Sugestão', description: 'Para casais que desejam preservar os momentos mais importantes da cerimônia com elegância e sensibilidade.', inclusions: ['captacao_cerimonia', 'video_teaser'], base_price: 2800, promo_price: 2800, badge: null, highlight_color: null, display_order: 1, active: true, benefit_type: 'entrega_prioritaria', benefit_desc: 'Entrega Prioritária', enable_recommendations: true, recommendation_priority: 1 },
    { id: '2', event_type: 'casamento', name: 'Experiência Completa', category: 'Recomendada', description: 'Uma narrativa completa do seu dia, registrando desde a emoção dos preparativos até a celebração da festa.', inclusions: ['captacao_cerimonia', 'video_teaser', 'captacao_making_of', 'captacao_festa'], base_price: 4800, promo_price: 4500, badge: null, highlight_color: null, display_order: 2, active: true, benefit_type: 'desconto', benefit_desc: 'Economize R$ 300', enable_recommendations: true, recommendation_priority: 2 },
    { id: '3', event_type: 'casamento', name: 'Experiência Cinematográfica', category: 'Exclusiva', description: 'A experiência definitiva para quem deseja transformar o casamento em um verdadeiro filme.', inclusions: ['pre_wedding_vid', 'captacao_making_of', 'captacao_cerimonia', 'captacao_festa', 'video_teaser', 'video_filme_6_10'], base_price: 7500, promo_price: 7000, badge: 'MAIS ESCOLHIDA', highlight_color: 'gold', display_order: 3, active: true, benefit_type: 'desconto', benefit_desc: 'Economize R$ 500', enable_recommendations: true, recommendation_priority: 3 },
    
    // Aniversário
    { id: 'a1', event_type: 'aniversario', name: 'EXPERIÊNCIA PREMIÈRE', category: 'Recomendada', description: 'A cobertura ideal para seu aniversário, registrando a recepção e a festa.', inclusions: ['captacao_festa_aniversario', 'video_teaser_aniversario'], base_price: 2300, promo_price: 2300, badge: 'MAIS ESCOLHIDA', highlight_color: 'gold', display_order: 1, active: true, benefit_type: 'brinde', benefit_desc: 'Quadro de Assinaturas', enable_recommendations: true, recommendation_priority: 1 },
    
    // Revelação
    { id: 'r1', event_type: 'revelacao', name: 'MEMÓRIA ETERNA', category: 'Recomendada', description: 'Guarde para sempre a emoção e a surpresa da descoberta do seu bebê.', inclusions: ['captacao_revelacao', 'video_teaser_revelacao'], base_price: 1900, promo_price: 1900, badge: 'MAIS ESCOLHIDA', highlight_color: 'gold', display_order: 1, active: true, benefit_type: 'upgrade', benefit_desc: 'Ganhe Same Day Edit', enable_recommendations: true, recommendation_priority: 1 }
  ],
  benefits: [
    { id: 'b1', event_type: 'casamento', target_price: 8000, missing_text: 'Falta R$ {missing} para desbloquear a prioridade.', benefit_title: 'Entrega Prioritária', benefit_description: 'Seu filme entra em uma fila de edição e finalização prioritária.', active: true, display_order: 1 },
    
    { id: 'b3', event_type: 'aniversario', target_price: 3000, missing_text: 'Falta R$ {missing} para desbloquear brinde de aniversário.', benefit_title: 'Retrospectiva Rápida', benefit_description: 'Ganhos de uma edição expressa para compartilhar no dia seguinte.', active: true, display_order: 1 },
    
    { id: 'b4', event_type: 'revelacao', target_price: 2500, missing_text: 'Falta R$ {missing} para desbloquear fotos extras.', benefit_title: 'Painel Digital', benefit_description: 'Mini-galeria online entregue em 24h.', active: true, display_order: 1 }
  ],
  budgets: [
    {
      id: "mock-l1",
      event_type: "casamento",
      name: "Maria Da Penha & João",
      email: "maria@example.com",
      phone: "+55 (66) 9 9643-3212",
      event_date: "2026-06-18",
      location: "Haras Albar, Campinas - SP",
      options: [
        { name: "Cerimônia", price: 1800 },
        { name: "Teaser de até 3 minutos", price: 1000 }
      ],
      total_price: 2800,
      status: "pending",
      created_at: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ],
  testimonials: [
    {
      id: 't1',
      client_name: 'Julia & Ricardo',
      subtitle: 'Fazenda Vila Rica, Itatiba - SP',
      quote: 'Não temos palavras para descrever o que foi assistir ao nosso filme pela primeira vez. A equipe da Rooster Films conseguiu capturar a essência da nossa emoção de uma forma inexplicável.',
      stars: 5,
      image_url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=150&h=150&q=80',
      event_type: 'casamento',
      active: true,
      display_order: 1
    },
    {
      id: 't2',
      client_name: 'Juliana Santos',
      subtitle: 'Espaço Trio, São Paulo - SP',
      quote: 'A cobertura do meu aniversário de 30 anos foi impecável. Os vídeos capturaram exatamente a alegria de rever todos os meus amigos.',
      stars: 5,
      image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
      event_type: 'aniversario',
      active: true,
      display_order: 1
    },
    {
      id: 't3',
      client_name: 'Paula & Marcos',
      subtitle: 'Residência, Alphaville - SP',
      quote: 'O vídeo do nosso chá revelação nos faz chorar toda vez. Capturou perfeitamente o momento em que a fumaça rosa subiu e descobrimos que era a nossa pequena Laura.',
      stars: 5,
      image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80',
      event_type: 'revelacao',
      active: true,
      display_order: 1
    }
  ],
  features: [
    // Casamento
    { id: 'f1', event_type: 'casamento', icon: 'heart', title: 'Sentimos Cada História', description: 'Mais do que filmar, buscamos compreender quem vocês são para registrar emoções verdadeiras.', active: true, display_order: 1 },
    { id: 'f2', event_type: 'casamento', icon: 'film', title: 'Narrativa Cinematográfica', description: 'Cada filme é construído com ritmo, emoção e intenção artística.', active: true, display_order: 2 },
    { id: 'f3', event_type: 'casamento', icon: 'eye', title: 'Presença Discreta', description: 'Registramos momentos autênticos sem interromper ou dirigir excessivamente o casal.', active: true, display_order: 3 },
    { id: 'f4', event_type: 'casamento', icon: 'clock', title: 'Memórias que Permanecem', description: 'Criamos filmes que continuam emocionando mesmo muitos anos depois.', active: true, display_order: 4 },
    
    // Aniversário
    { id: 'f5', event_type: 'aniversario', icon: 'sparkles', title: 'Alegria Compartilhada', description: 'Registramos cada abraço sincero e os sorrisos mais espontâneos da festa.', active: true, display_order: 1 },
    { id: 'f6', event_type: 'aniversario', icon: 'film', title: 'Edição Dinâmica', description: 'Um ritmo empolgante que faz você reviver a energia da pista de dança.', active: true, display_order: 2 },
    { id: 'f7', event_type: 'aniversario', icon: 'eye', title: 'Olhar Atento', description: 'Não perdemos nenhum detalhe da decoração aos momentos surpresa.', active: true, display_order: 3 },
    { id: 'f8', event_type: 'aniversario', icon: 'clock', title: 'Prazo Express', description: 'Seus melhores momentos entregues rapidamente para compartilhar.', active: true, display_order: 4 },

    // Revelação
    { id: 'f9', event_type: 'revelacao', icon: 'heart', title: 'Emoção Pura', description: 'Capturamos a expectativa e a explosão de alegria com a revelação.', active: true, display_order: 1 },
    { id: 'f10', event_type: 'revelacao', icon: 'eye', title: 'Foco na Reação', description: 'Câmeras posicionadas para registrar as lágrimas e sorrisos de toda a família.', active: true, display_order: 2 },
    { id: 'f11', event_type: 'revelacao', icon: 'shield', title: 'Sigilo Absoluto', description: 'Garantimos segredo total até o momento exato da grande descoberta.', active: true, display_order: 3 },
    { id: 'f12', event_type: 'revelacao', icon: 'clock', title: 'Teaser Rápido', description: 'Um clipe emocionante entregue em poucos dias para as suas redes.', active: true, display_order: 4 }
  ],
  events: [
    {
      id: "mock-event-1",
      lead_id: "mock-l1",
      name: "Maria Da Penha & João",
      phone: "+55 (66) 9 9643-3212",
      email: "maria@example.com",
      event_date: (() => {
        const d = new Date();
        d.setDate(d.getDate() - 43);
        return d.toISOString().split('T')[0];
      })(),
      location: "Haras Albar, Campinas - SP",
      total_price: 2800,
      status: "Em Produção",
      event_type: "casamento",
      time: "16:00",
      city: "Campinas",
      google_maps_link: "https://maps.google.com/?q=Haras+Albar+Campinas",
      schedule: [
        { name: "Pré Wedding", start_time: "", end_time: "", address: "", notes: "" },
        { name: "Making Of Noiva", start_time: "", end_time: "", address: "", notes: "" },
        { name: "Making Of Noivo", start_time: "", end_time: "", address: "", notes: "" },
        { name: "Cerimônia", start_time: "16:00", end_time: "17:30", address: "Haras Albar, Campinas - SP", notes: "Gravar áudio dos votos no celebrante e nos noivos." },
        { name: "Sessão de Fotos", start_time: "17:30", end_time: "18:30", address: "Haras Albar, Campinas - SP", notes: "Fotos protocolares e do casal." },
        { name: "Festa", start_time: "19:00", end_time: "02:00", address: "Haras Albar, Campinas - SP", notes: "Brinde, corte do bolo e pista." }
      ],
      team: [
        { role: "Cinegrafista", name: "João Silva", phone: "11988888888", fee: 800 },
        { role: "Fotógrafo", name: "Pedro Souza", phone: "11977777777", fee: 900 }
      ],
      equipment_checklist: [
        { name: "Câmera Principal", checked: true },
        { name: "Câmera Backup", checked: true },
        { name: "Drone", checked: false },
        { name: "Cartões SD", checked: true },
        { name: "Baterias", checked: true },
        { name: "Gravador", checked: true }
      ],
      deliverables: [
        { name: "Pré Wedding", status: "Não iniciado" },
        { name: "Teaser", status: "Em edição" },
        { name: "Filme 6-10", status: "Não iniciado" },
        { name: "Filme 12-20", status: "Não iniciado" },
        { name: "Same Day", status: "Não iniciado" }
      ],
      notes: "Contrato assinado em junho. Noivos solicitaram foco nas reações da mãe da noiva.",
      created_at: new Date(Date.now() - 50 * 24 * 3600 * 1000).toISOString()
    }
  ]
};

const getMockDatabase = (): Record<string, any[]> => {
  if (typeof window === 'undefined') {
    return mockDatabase;
  }
  const stored = localStorage.getItem('mock_supabase_db');
  if (stored) {
    try {
      const db = JSON.parse(stored);
      let changed = false;

      // Migrate features table
      if (!db.features) {
        db.features = mockDatabase.features;
        changed = true;
      }

      // Migrate events table
      if (!db.events) {
        db.events = mockDatabase.events || [];
        changed = true;
      }
      
      // Sanitization: Remove duplicate services from mock database
      if (db.services && Array.isArray(db.services)) {
        const seen = new Set();
        const initialLength = db.services.length;
        db.services = db.services.filter((item: any) => {
          if (!item.id) return true;
          const isDup = seen.has(item.id);
          seen.add(item.id);
          return !isDup;
        });
        if (db.services.length !== initialLength) {
          changed = true;
        }
      }

      // Upgrade packages names in-place
      if (db.packages && Array.isArray(db.packages)) {
        db.packages.forEach((p: any) => {
          if (p.name === 'ESSENCIAL') {
            p.name = 'Experiência Essencial';
            changed = true;
          }
          if (p.name === 'RECOMENDADO') {
            p.name = 'Experiência Recomendada';
            changed = true;
          }
          if (!p.event_type) {
            p.event_type = 'casamento';
            changed = true;
          }
          if (p.benefit_type === undefined) {
            p.benefit_type = 'desconto';
            changed = true;
          }
          if (p.benefit_desc === undefined) {
            p.benefit_desc = '';
            changed = true;
          }
          if (p.enable_recommendations === undefined) {
            p.enable_recommendations = true;
            changed = true;
          }
          if (p.recommendation_priority === undefined) {
            p.recommendation_priority = 0;
            changed = true;
          }
        });
      }

      // Upgrade services names in-place
      if (db.services && Array.isArray(db.services)) {
        db.services.forEach((s: any) => {
          if (s.name === 'Vídeo Pré Wedding') {
            s.name = 'Pré Wedding';
            changed = true;
          }
          if (!s.event_type) {
            s.event_type = 'casamento';
            changed = true;
          }
        });
      }

      // Ensure other entries have event_type
      if (db.settings && Array.isArray(db.settings)) {
        db.settings.forEach((s: any) => {
          if (!s.event_type) {
            s.event_type = 'casamento';
            changed = true;
          }
          if (s.event_type === 'casamento' && (!s.faq_items || s.faq_items.length <= 3)) {
            s.faq_items = mockDatabase.settings[0].faq_items;
            changed = true;
          }
          if (s.payment_terms === undefined) {
            s.payment_terms = '- Forma de pagamento padrão: 30% sinal via Pix + saldo parcelado em até 10x sem juros.';
            changed = true;
          }
          if (s.site_url === undefined) {
            s.site_url = s.event_type ? `/${s.event_type}` : '/casamento';
            changed = true;
          }
        });
      }
      if (db.benefits && Array.isArray(db.benefits)) {
        db.benefits.forEach((b: any) => {
          if (!b.event_type) {
            b.event_type = 'casamento';
            changed = true;
          }
        });
      }

      if (changed) {
        localStorage.setItem('mock_supabase_db', JSON.stringify(db));
      }
      return db;
    } catch (e) {
      // Fallback
    }
  }
  localStorage.setItem('mock_supabase_db', JSON.stringify(mockDatabase));
  return mockDatabase;
};

const saveMockDatabase = (db: Record<string, any[]>) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('mock_supabase_db', JSON.stringify(db));
      window.dispatchEvent(new Event('mock-database-update'));
    } catch (e: any) {
      console.error("LocalStorage error:", e);
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22) {
        alert("Erro: O limite de armazenamento local (LocalStorage) foi excedido. As fotos anteriores salvas no modo de testes offline ocuparam todo o espaço. Tente apagar algumas fotos antigas antes de adicionar novas.");
      } else {
        alert("Erro ao salvar no banco de dados local: " + e.message);
      }
    }
  }
};

// Custom query builder simulator for mock database
class MockQueryBuilder {
  private table: string;
  private operation: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private opData: any = null;
  private filters: Array<{ column: string; value: any }> = [];
  private orderBy: { column: string; ascending: boolean } | null = null;
  private isSingle: boolean = false;
  private limitVal: number | null = null;

  constructor(table: string) {
    this.table = table;
  }

  select(columns?: string) {
    this.operation = 'select';
    return this;
  }

  insert(data: any) {
    this.operation = 'insert';
    this.opData = data;
    return this;
  }

  update(data: any) {
    this.operation = 'update';
    this.opData = data;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ column, value });
    return this;
  }

  order(column: string, { ascending = true } = {}) {
    this.orderBy = { column, ascending };
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  limit(value: number) {
    this.limitVal = value;
    return this;
  }

  async execute() {
    // Delay slightly to simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 150));

    const db = getMockDatabase();
    if (!db[this.table]) {
      db[this.table] = [];
    }

    if (this.operation === 'select') {
      let rows = JSON.parse(JSON.stringify(db[this.table]));

      // Apply equality filters
      for (const filter of this.filters) {
        rows = rows.filter((row: any) => row[filter.column] === filter.value);
      }

      // Apply ordering
      if (this.orderBy) {
        const col = this.orderBy.column;
        const asc = this.orderBy.ascending;
        rows.sort((a: any, b: any) => {
          let valA = a[col];
          let valB = b[col];
          if (typeof valA === 'string' && typeof valB === 'string') {
            return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
          }
          return asc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
        });
      } else {
        // Default orders
        if (this.table === 'portfolio' || this.table === 'photos' || this.table === 'services' || this.table === 'packages' || this.table === 'benefits' || this.table === 'testimonials' || this.table === 'features') {
          rows.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
        } else if (this.table === 'budgets') {
          rows.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        }
      }

      if (this.limitVal !== null) {
        rows = rows.slice(0, this.limitVal);
      }

      if (this.isSingle) {
        return { data: rows[0] || null, error: null };
      }
      return { data: rows, error: null };
    }

    if (this.operation === 'insert') {
      const isArray = Array.isArray(this.opData);
      const itemsToInsert = isArray ? this.opData : [this.opData];
      const insertedRows = [];

      for (const item of itemsToInsert) {
        const newRow = {
          id: item.id || ('mock-' + Math.random().toString(36).substring(2, 9)),
          created_at: new Date().toISOString(),
          ...item
        };
        db[this.table].push(newRow);
        insertedRows.push(newRow);
      }

      saveMockDatabase(db);
      return { data: isArray ? insertedRows : insertedRows[0], error: null };
    }

    if (this.operation === 'update') {
      let updatedCount = 0;
      let lastUpdatedRow: any = null;

      db[this.table] = db[this.table].map((row: any) => {
        // Check if row matches all filters
        let matches = true;
        for (const filter of this.filters) {
          if (row[filter.column] !== filter.value) {
            matches = false;
            break;
          }
        }

        // If table is settings and settings usually has id: 1, if there are no filters, we default to matches settings id = 1
        if (this.table === 'settings' && this.filters.length === 0) {
          matches = row.id === 1;
        }

        if (matches) {
          updatedCount++;
          const newRow = { ...row, ...this.opData };
          lastUpdatedRow = newRow;
          return newRow;
        }
        return row;
      });

      saveMockDatabase(db);
      return { data: lastUpdatedRow, error: null };
    }

    if (this.operation === 'delete') {
      db[this.table] = db[this.table].filter((row: any) => {
        // Keep rows that do NOT match all filters
        let matches = true;
        for (const filter of this.filters) {
          if (row[filter.column] !== filter.value) {
            matches = false;
            break;
          }
        }
        return !matches;
      });

      saveMockDatabase(db);
      return { data: null, error: null };
    }

    return { data: null, error: { message: 'Unsupported operation' } };
  }

  // Promise thenable implementation
  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : {
      from: (table: string) => new MockQueryBuilder(table),
      auth: {
        getSession: async () => {
          await new Promise((resolve) => setTimeout(resolve, 200));
          // Check localStorage or return mock authenticated state
          let userMetadata = { full_name: 'Administrador', phone: '66996801085' };
          if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('mock_admin_metadata');
            if (saved) {
              try {
                userMetadata = JSON.parse(saved);
              } catch (e) {}
            }
          }
          const session = typeof window !== 'undefined' && localStorage.getItem('mock_admin_session')
            ? { user: { email: 'stackeleonardo@gmail.com', user_metadata: userMetadata } }
            : null;
          return { data: { session }, error: null };
        },
        signInWithPassword: async ({ email, password }: any) => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          if ((email === 'admin@rooster.com' || email === 'stackeleonardo@gmail.com') && password === 'rooster123') {
            if (typeof window !== 'undefined') {
              localStorage.setItem('mock_admin_session', 'true');
            }
            return { data: { user: { email } }, error: null };
          }
          return { data: null, error: { message: "Credenciais inválidas. Use stackeleonardo@gmail.com e rooster123 para testar." } };
        },
        updateUser: async (attributes: any) => {
          await new Promise((resolve) => setTimeout(resolve, 300));
          if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('mock_admin_metadata');
            let current = saved ? JSON.parse(saved) : {};
            if (attributes.data) {
              current = { ...current, ...attributes.data };
            }
            localStorage.setItem('mock_admin_metadata', JSON.stringify(current));
          }
          return { data: { user: { email: 'stackeleonardo@gmail.com', user_metadata: attributes.data || {} } }, error: null };
        },
        signOut: async () => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('mock_admin_session');
          }
          return { error: null };
        }
      },
      storage: {
        from: (bucket: string) => ({
          upload: async (path: string, file: any) => {
            const fileName = file?.name || 'document.pdf';
            console.log(`[Mock Storage Upload to bucket: ${bucket}, path: ${path}]:`, fileName);
            await new Promise((resolve) => setTimeout(resolve, 300));
            // Return fake object url
            const objectUrl = `https://mockstorage.supabase.co/${bucket}/${path}`;
            return { data: { path }, error: null };
          },
          getPublicUrl: (path: string) => {
            return { data: { publicUrl: `https://mockstorage.supabase.co/${bucket}/${path}` } };
          }
        })
      }
    } as any;
