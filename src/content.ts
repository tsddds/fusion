import type { Activity, Locale, LocalizedText, PublicContent } from './types'

const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
const text = (es: string, zhHant: string, en: string, pt: string): LocalizedText => ({
  en,
  es,
  pt,
  zhHant,
})

export const activities: Activity[] = [
  {
    audience: text('Todas las edades', '適合所有年齡', 'All ages', 'Todas as idades'),
    detail: text(
      'Conoce el significado de los trazos, prepara la tinta y crea una pieza guiada con pincel sobre papel.',
      '認識筆畫的含義、準備墨汁，並在引導下用毛筆完成一件作品。',
      'Learn the meaning of each stroke, prepare the ink, and create a guided brush piece on paper.',
      'Conheça o significado dos traços, prepare a tinta e crie uma peça guiada com pincel sobre papel.',
    ),
    duration: text('30–45 minutos', '30–45 分鐘', '30–45 minutes', '30–45 minutos'),
    id: 'calligraphy',
    image: asset('assets/optimized/ruyuen-calligraphy.webp'),
    order: 1,
    summary: text(
      'Escritura, paciencia y expresión a través del pincel.',
      '透過毛筆體驗書寫、耐心與表達。',
      'Writing, patience, and expression through the brush.',
      'Escrita, paciência e expressão através do pincel.',
    ),
    title: text('Caligrafía china', '中國書法', 'Chinese calligraphy', 'Caligrafia chinesa'),
  },
  {
    audience: text('Jóvenes y adultos', '青少年與成人', 'Teens and adults', 'Jovens e adultos'),
    detail: text(
      'Una introducción respetuosa a símbolos, relatos y prácticas tradicionales de reflexión cultural.',
      '以尊重的方式認識傳統文化中的象徵、故事與思考方式。',
      'A respectful introduction to symbols, stories, and traditional practices of cultural reflection.',
      'Uma introdução respeitosa a símbolos, relatos e práticas tradicionais de reflexão cultural.',
    ),
    duration: text('15–25 minutos', '15–25 分鐘', '15–25 minutes', '15–25 minutos'),
    id: 'traditions',
    image: asset('assets/optimized/ruyuen-hero-festival.webp'),
    order: 2,
    summary: text(
      'Símbolos y relatos para acercarse a otras formas de comprender el mundo.',
      '透過象徵與故事，接近不同的世界觀。',
      'Symbols and stories that open new ways of understanding the world.',
      'Símbolos e relatos para conhecer outras formas de compreender o mundo.',
    ),
    title: text('Tradiciones y relatos', '傳統與故事', 'Traditions and stories', 'Tradições e histórias'),
  },
  {
    audience: text('Todas las edades', '適合所有年齡', 'All ages', 'Todas as idades'),
    detail: text(
      'Prueba sabores, técnicas y preparaciones que convierten la mesa en un lugar de encuentro.',
      '品嚐風味與烹飪技法，感受餐桌如何成為相聚的地方。',
      'Explore flavors and techniques that turn the table into a place for connection.',
      'Experimente sabores e técnicas que transformam a mesa em um lugar de encontro.',
    ),
    duration: text('Actividad abierta', '開放式活動', 'Open activity', 'Atividade aberta'),
    id: 'gastronomy',
    image: asset('assets/optimized/ruyuen-food-crafts.webp'),
    order: 3,
    summary: text(
      'Sabores, aromas y conocimientos que se comparten alrededor de la mesa.',
      '在餐桌上共享風味、香氣與知識。',
      'Flavors, aromas, and knowledge shared around the table.',
      'Sabores, aromas e conhecimentos compartilhados ao redor da mesa.',
    ),
    title: text('Gastronomía', '中華美食', 'Gastronomy', 'Gastronomia'),
  },
  {
    audience: text('Familias y principiantes', '家庭與初學者', 'Families and beginners', 'Famílias e iniciantes'),
    detail: text(
      'Aprende técnicas sencillas de plegado, nudos decorativos y objetos tradicionales para llevar.',
      '學習簡單的摺紙、裝飾結與傳統手作技巧。',
      'Learn simple folding, decorative knot, and traditional craft techniques.',
      'Aprenda técnicas simples de dobradura, nós decorativos e artesanato tradicional.',
    ),
    duration: text('30–50 minutos', '30–50 分鐘', '30–50 minutes', '30–50 minutos'),
    id: 'crafts',
    image: asset('assets/optimized/ruyuen-food-crafts.webp'),
    order: 4,
    summary: text(
      'Crear con las manos para comprender símbolos y celebraciones.',
      '透過手作理解象徵與節慶。',
      'Make with your hands to understand symbols and celebrations.',
      'Criar com as mãos para compreender símbolos e celebrações.',
    ),
    title: text('Artes y manualidades', '藝術與手作', 'Arts and crafts', 'Artes e trabalhos manuais'),
  },
  {
    audience: text('Desde 8 años', '8 歲以上', 'Ages 8+', 'A partir de 8 anos'),
    detail: text(
      'Practica postura, coordinación y movimientos básicos en un ambiente cuidado y progresivo.',
      '在安全且循序漸進的環境中練習姿勢、協調與基本動作。',
      'Practice posture, coordination, and basic movements in a safe, progressive environment.',
      'Pratique postura, coordenação e movimentos básicos em um ambiente seguro e progressivo.',
    ),
    duration: text('35–50 minutos', '35–50 分鐘', '35–50 minutes', '35–50 minutos'),
    id: 'martial-arts',
    image: asset('assets/optimized/ruyuen-hero-festival.webp'),
    order: 5,
    summary: text(
      'Disciplina, respeto y equilibrio a través del movimiento.',
      '透過動作培養紀律、尊重與平衡。',
      'Discipline, respect, and balance through movement.',
      'Disciplina, respeito e equilíbrio através do movimento.',
    ),
    title: text('Artes marciales', '武術', 'Martial arts', 'Artes marciais'),
  },
  {
    audience: text('Público general', '一般大眾', 'General audience', 'Público geral'),
    detail: text(
      'Presentaciones y demostraciones que reúnen música, movimiento y expresión colectiva.',
      '結合音樂、動作與集體表演的展演活動。',
      'Performances that bring together music, movement, and collective expression.',
      'Apresentações que reúnem música, movimento e expressão coletiva.',
    ),
    duration: text('Según programación', '依活動安排', 'According to schedule', 'Conforme programação'),
    id: 'performances',
    image: asset('assets/optimized/ruyuen-hero-festival.webp'),
    order: 6,
    summary: text(
      'Energía, música y escena para vivir la cultura en comunidad.',
      '以能量、音樂與舞台共同感受文化。',
      'Energy, music, and performance to experience culture together.',
      'Energia, música e palco para viver a cultura em comunidade.',
    ),
    title: text('Danza y exhibiciones', '舞蹈與展演', 'Dance and exhibitions', 'Dança e apresentações'),
  },
]

export const fallbackContent: PublicContent = {
  activities,
  events: [],
  notices: [],
  sessions: [],
}

// Solo se usa durante el desarrollo local para recorrer el flujo completo de reservas.
// Nunca se incluye como un encuentro publicado en la web pública.
export const demoContent: PublicContent = {
  activities,
  events: [{
    address: 'Datos de demostración · no corresponde a un evento real',
    cover: asset('assets/optimized/ruyuen-hero-festival.webp'),
    endAt: '2027-10-18T18:00:00-03:00',
    id: 'demo-encuentro-ruyuen',
    registrationOpen: true,
    slug: 'demostracion-reservas',
    startAt: '2027-10-18T11:00:00-03:00',
    status: 'published',
    summary: text('Evento de prueba para recorrer el registro, QR y control de cupos. No es una convocatoria real.', '本地測試活動，用於體驗報名、QR 與名額管理。', 'A test event to try registration, QR, and capacity control. Not a real call.', 'Evento de teste para experimentar inscrição, QR e controle de vagas. Não é real.'),
    title: text('Encuentro de demostración', '示範文化聚會', 'Demo cultural gathering', 'Encontro de demonstração'),
    venue: text('Espacio de prueba Ruyuen', 'Ruyuen 測試空間', 'Ruyuen test space', 'Espaço de teste Ruyuen'),
  }],
  notices: [{
    active: true,
    body: text('Estás viendo datos ficticios para probar el sistema. Nada de esta información se publicará ni se guardará en la planilla.', '您正在查看測試資料；這些資訊不會發布或寫入試算表。', 'You are viewing sample data for testing. Nothing here is published or stored in the spreadsheet.', 'Você está vendo dados de teste. Nada será publicado nem salvo na planilha.'),
    id: 'local-demo',
    priority: 'high',
    title: text('Modo de prueba local', '本機測試模式', 'Local test mode', 'Modo de teste local'),
  }],
  sessions: [
    { activityId: 'calligraphy', capacity: 4, endAt: '2027-10-18T12:00:00-03:00', eventId: 'demo-encuentro-ruyuen', id: 'demo-caligrafia-1100', startAt: '2027-10-18T11:00:00-03:00', status: 'open' },
    { activityId: 'martial-arts', capacity: 8, endAt: '2027-10-18T13:00:00-03:00', eventId: 'demo-encuentro-ruyuen', id: 'demo-artes-marciales-1200', startAt: '2027-10-18T12:00:00-03:00', status: 'open' },
  ],
}

export const languageOptions: Array<{ code: Locale; label: string; short: string }> = [
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'zhHant', label: '繁體中文', short: '繁' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'pt', label: 'Português', short: 'PT' },
]

export const copyByLocale = {
  es: {
    aboutBody: 'Creamos espacios donde la cultura se aprende participando: con las manos, el cuerpo, los sentidos y la conversación.',
    aboutEyebrow: 'Sobre Ruyuen',
    aboutTitle: 'Una organización cultural nacida para encontrarnos.',
    activitiesBody: 'Cada experiencia tiene una explicación simple para que sepas qué harás, cuánto dura y para quién está pensada.',
    activitiesEyebrow: 'Actividades permanentes',
    activitiesTitle: 'Explora, practica y comparte.',
    audience: 'Recomendado para',
    booking: 'Reservar',
    close: 'Cerrar',
    contact: 'Contacto',
    discover: 'Descubrir actividades',
    duration: 'Duración',
    email: 'Email',
    eventArchive: 'Encuentros anteriores',
    eventBody: 'Publicaremos aquí las fechas, el lugar, los horarios y los cupos cuando el próximo encuentro esté confirmado.',
    eventEyebrow: 'Próximos encuentros',
    eventTitle: 'Estamos preparando nuevas fechas.',
    heroBody: 'Acercamos la cultura china a Chile a través de prácticas, sabores y comunidad.',
    heroKicker: 'Organización Cultura Ruyuen',
    heroTitle: 'Tradiciones vivas, encuentros reales',
    instagram: 'Ver Instagram',
    journey: [
      ['Conocer', 'Historia, filosofía y expresiones de la cultura china.'],
      ['Practicar', 'Talleres y actividades para desarrollar habilidades y bienestar.'],
      ['Compartir', 'Sabores, celebraciones y experiencias que nos unen.'],
      ['Encontrarse', 'Comunidad, amistad y redes que perduran.'],
    ],
    learnMore: 'Conocer más sobre nosotros',
    navAbout: 'Sobre nosotros',
    navActivities: 'Actividades',
    navEvents: 'Encuentros',
    notify: 'Quiero recibir novedades',
    notifyBody: 'Elige email o WhatsApp. Solo usaremos tu contacto para avisarte sobre actividades y próximos encuentros.',
    notifyConsent: 'Acepto recibir novedades de Ruyuen y puedo solicitar dejar de recibirlas.',
    notifySuccess: '¡Listo! Te avisaremos cuando publiquemos un nuevo encuentro.',
    phone: 'WhatsApp',
    readActivity: 'Conocer la actividad',
  },
  zhHant: {
    aboutBody: '我們創造以參與來學習文化的空間：透過雙手、身體、感官與交流。',
    aboutEyebrow: '關於 Ruyuen',
    aboutTitle: '一個為相遇而生的文化組織。',
    activitiesBody: '每項體驗都有清楚說明，讓你了解內容、時間與適合對象。',
    activitiesEyebrow: '常設文化活動',
    activitiesTitle: '探索、實踐與分享。',
    audience: '適合對象', booking: '預約', close: '關閉', contact: '聯絡方式', discover: '探索活動', duration: '時間', email: '電子郵件',
    eventArchive: '過往活動', eventBody: '下一場活動確認後，我們會在此公布日期、地點、時段與名額。', eventEyebrow: '近期活動', eventTitle: '我們正在準備新的日期。',
    heroBody: '透過實踐、風味與社群，讓智利更貼近中華文化。', heroKicker: 'Ruyuen 文化組織', heroTitle: '活的傳統，真實的相遇', instagram: '查看 Instagram',
    journey: [['認識', '探索中華文化的歷史、哲學與表達。'], ['實踐', '透過活動培養技巧與身心平衡。'], ['分享', '共享風味、節慶與體驗。'], ['相遇', '建立持久的社群、友誼與連結。']],
    learnMore: '認識我們', navAbout: '關於我們', navActivities: '文化活動', navEvents: '近期活動', notify: '接收最新消息',
    notifyBody: '選擇電子郵件或 WhatsApp。我們只會用來通知活動消息。', notifyConsent: '我同意接收 Ruyuen 的活動消息，並可隨時取消。', notifySuccess: '完成！新活動公布時我們會通知你。', phone: 'WhatsApp', readActivity: '認識活動',
  },
  en: {
    aboutBody: 'We create spaces where culture is learned by taking part—with your hands, body, senses, and conversation.',
    aboutEyebrow: 'About Ruyuen', aboutTitle: 'A cultural organization created for real connection.',
    activitiesBody: 'Every experience has a clear explanation so you know what you will do, how long it takes, and who it is for.',
    activitiesEyebrow: 'Ongoing activities', activitiesTitle: 'Explore, practice, and share.', audience: 'Recommended for', booking: 'Book', close: 'Close', contact: 'Contact', discover: 'Discover activities', duration: 'Duration', email: 'Email',
    eventArchive: 'Past gatherings', eventBody: 'We will publish dates, venue, schedule, and availability here once the next gathering is confirmed.', eventEyebrow: 'Upcoming gatherings', eventTitle: 'We are preparing new dates.',
    heroBody: 'We bring Chinese culture closer to Chile through practices, flavors, and community.', heroKicker: 'Organización Cultura Ruyuen', heroTitle: 'Living traditions, real connections', instagram: 'View Instagram',
    journey: [['Discover', 'History, philosophy, and expressions of Chinese culture.'], ['Practice', 'Workshops that build skills and wellbeing.'], ['Share', 'Flavors, celebrations, and experiences that connect us.'], ['Connect', 'Community, friendship, and lasting networks.']],
    learnMore: 'Learn more about us', navAbout: 'About us', navActivities: 'Activities', navEvents: 'Gatherings', notify: 'Send me updates', notifyBody: 'Choose email or WhatsApp. We will only use your contact for Ruyuen activity updates.', notifyConsent: 'I agree to receive Ruyuen updates and can unsubscribe at any time.', notifySuccess: 'Done! We will let you know when a new gathering is published.', phone: 'WhatsApp', readActivity: 'Explore activity',
  },
  pt: {
    aboutBody: 'Criamos espaços onde a cultura é aprendida participando: com as mãos, o corpo, os sentidos e a conversa.',
    aboutEyebrow: 'Sobre Ruyuen', aboutTitle: 'Uma organização cultural criada para nos encontrarmos.',
    activitiesBody: 'Cada experiência tem uma explicação simples para você saber o que fará, quanto dura e para quem é indicada.',
    activitiesEyebrow: 'Atividades permanentes', activitiesTitle: 'Explore, pratique e compartilhe.', audience: 'Indicado para', booking: 'Reservar', close: 'Fechar', contact: 'Contato', discover: 'Descobrir atividades', duration: 'Duração', email: 'Email',
    eventArchive: 'Encontros anteriores', eventBody: 'Publicaremos aqui datas, local, horários e vagas quando o próximo encontro estiver confirmado.', eventEyebrow: 'Próximos encontros', eventTitle: 'Estamos preparando novas datas.',
    heroBody: 'Aproximamos a cultura chinesa do Chile por meio de práticas, sabores e comunidade.', heroKicker: 'Organização Cultura Ruyuen', heroTitle: 'Tradições vivas, encontros reais', instagram: 'Ver Instagram',
    journey: [['Conhecer', 'História, filosofia e expressões da cultura chinesa.'], ['Praticar', 'Oficinas para desenvolver habilidades e bem-estar.'], ['Compartilhar', 'Sabores, celebrações e experiências que nos unem.'], ['Encontrar-se', 'Comunidade, amizade e redes que permanecem.']],
    learnMore: 'Conhecer mais sobre nós', navAbout: 'Sobre nós', navActivities: 'Atividades', navEvents: 'Encontros', notify: 'Quero receber novidades', notifyBody: 'Escolha email ou WhatsApp. Usaremos seu contato apenas para novidades da Ruyuen.', notifyConsent: 'Aceito receber novidades da Ruyuen e posso cancelar a qualquer momento.', notifySuccess: 'Pronto! Avisaremos quando um novo encontro for publicado.', phone: 'WhatsApp', readActivity: 'Conhecer atividade',
  },
} satisfies Record<Locale, Record<string, unknown>>

export const heroVideo = asset('assets/videos/martial-arts.mp4')
export const heroPoster = asset('assets/optimized/ruyuen-hero-festival.webp')
