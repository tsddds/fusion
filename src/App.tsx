import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { MotionProps } from 'framer-motion'
import {
  Bell,
  Brush,
  Camera,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Crown,
  Download,
  Drama,
  HeartHandshake,
  Languages,
  LockKeyhole,
  MapPin,
  QrCode,
  ScrollText,
  Search,
  Sparkles,
  Soup,
  Ticket,
  Utensils,
  UserCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { toDataURL } from 'qrcode'
import './App.css'

type LanguageCode = 'es' | 'zhHant' | 'zhHans' | 'en'
type ActivityId =
  | 'calligraphy'
  | 'fortune'
  | 'food'
  | 'crafts'
  | 'martial'
  | 'stage'

type BookingTicket = {
  activityId: ActivityId
  activityName: string
  attendee: string
  contact: string
  guests: string
  id: string
  language: LanguageCode
  slotLabel: string
}

type ActivityMedia = {
  image: string
  video?: string
  videos?: readonly string[]
}

type AppRoute = 'home' | 'booking' | 'admin'
type BookingStatus = 'reserved' | 'checked-in' | 'no-show' | 'cancelled' | 'completed'

type StoredBooking = BookingTicket & {
  checkedInAt?: string
  createdAt: string
  status: BookingStatus
}

type Notice = {
  active: boolean
  body: string
  id: string
  priority: 'normal' | 'high'
  title: string
}

type AdminFilter = 'all' | BookingStatus

const languageOptions: Array<{
  code: LanguageCode
  label: string
  short: string
}> = [
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'zhHant', label: '繁體中文', short: '繁' },
  { code: 'zhHans', label: '简体中文', short: '简' },
  { code: 'en', label: 'English', short: 'EN' },
]

const routeLabels: Record<LanguageCode, Record<AppRoute, string>> = {
  en: { admin: 'Staff', booking: 'Reserve', home: 'Home' },
  es: { admin: 'Equipo', booking: 'Reservar', home: 'Inicio' },
  zhHans: { admin: '后台', booking: '预约', home: '首页' },
  zhHant: { admin: '後台', booking: '預約', home: '首頁' },
}

const bookingStatusLabels: Record<LanguageCode, Record<BookingStatus, string>> = {
  en: {
    cancelled: 'Cancelled',
    completed: 'Activity ended',
    'checked-in': 'Checked in',
    'no-show': 'No show',
    reserved: 'Reserved',
  },
  es: {
    cancelled: 'Cancelado',
    completed: 'Actividad terminada',
    'checked-in': 'Llegó',
    'no-show': 'No llegó',
    reserved: 'Reservado',
  },
  zhHans: {
    cancelled: '已取消',
    completed: '活动已结束',
    'checked-in': '已到场',
    'no-show': '未到',
    reserved: '已预约',
  },
  zhHant: {
    cancelled: '已取消',
    completed: '活動已結束',
    'checked-in': '已到場',
    'no-show': '未到',
    reserved: '已預約',
  },
}

const adminCopy = {
  en: {
    activityCards: 'Activity guide',
    adminTitle: 'Staff control panel',
    adminBody: 'Simple list for checking reservations, arrivals and notices.',
    adminLogin: 'Enter staff PIN',
    adminPassword: 'Staff PIN',
    adminUnlock: 'Open panel',
    bookingPageBody:
      'Start with the form, or review each activity below and jump back with it selected.',
    bookingPageTitle: 'Reserve an activity',
    contentHelp:
      'Final activity text, image URLs and video URLs should live in the Google Sheet Activities tab.',
    noticeBody: 'Notice body',
    noticeSave: 'Publish notice',
    noticeTitle: 'Notice title',
    notices: 'Notices',
    search: 'Search name, contact or ticket',
    table: 'Reservations',
    wrongPin: 'PIN is not correct.',
  },
  es: {
    activityCards: 'Guía de actividades',
    adminTitle: 'Panel del equipo',
    adminBody: 'Lista simple para revisar reservas, llegadas y avisos.',
    adminLogin: 'Ingresa la clave del equipo',
    adminPassword: 'Clave del equipo',
    adminUnlock: 'Abrir panel',
    bookingPageBody:
      'Empieza con el formulario, o revisa cada actividad abajo y vuelve con esa opción seleccionada.',
    bookingPageTitle: 'Reservar una actividad',
    contentHelp:
      'Los textos, URLs de imágenes y videos finales deben vivir en la pestaña Activities de Google Sheets.',
    noticeBody: 'Texto del aviso',
    noticeSave: 'Publicar aviso',
    noticeTitle: 'Título del aviso',
    notices: 'Avisos',
    search: 'Buscar nombre, contacto o ticket',
    table: 'Reservas',
    wrongPin: 'La clave no es correcta.',
  },
  zhHans: {
    activityCards: '活动介绍',
    adminTitle: '工作人员后台',
    adminBody: '用简单名单确认预约、到场状态和通知。',
    adminLogin: '输入工作人员密码',
    adminPassword: '工作人员密码',
    adminUnlock: '进入后台',
    bookingPageBody: '可以先填写表格，也可以先看下面的活动介绍，再一键选择预约。',
    bookingPageTitle: '预约活动',
    contentHelp: '最终活动文字、图片网址和视频网址建议放在 Google Sheets 的 Activities 工作表。',
    noticeBody: '通知内容',
    noticeSave: '发布通知',
    noticeTitle: '通知标题',
    notices: '通知',
    search: '搜索姓名、联系方式或票号',
    table: '预约名单',
    wrongPin: '密码不正确。',
  },
  zhHant: {
    activityCards: '活動介紹',
    adminTitle: '工作人員後台',
    adminBody: '用簡單名單確認預約、到場狀態和通知。',
    adminLogin: '輸入工作人員密碼',
    adminPassword: '工作人員密碼',
    adminUnlock: '進入後台',
    bookingPageBody: '可以先填寫表格，也可以先看下面的活動介紹，再一鍵選擇預約。',
    bookingPageTitle: '預約活動',
    contentHelp: '最終活動文字、圖片網址和影片網址建議放在 Google Sheets 的 Activities 工作表。',
    noticeBody: '通知內容',
    noticeSave: '發布通知',
    noticeTitle: '通知標題',
    notices: '通知',
    search: '搜尋姓名、聯絡方式或票號',
    table: '預約名單',
    wrongPin: '密碼不正確。',
  },
} as const

const bookingsStorageKey = 'ruyuen-bookings'
const noticesStorageKey = 'ruyuen-notices'
const privateStaffPath = String(import.meta.env.VITE_RUYUEN_STAFF_PATH || 'equipo-ruyuen-7c9f')
  .replace(/^#?\/?/, '')
  .replace(/\/$/, '')
const hasRemoteApi = Boolean(import.meta.env.VITE_RUYUEN_API_URL)
const localDemoAdminPin = import.meta.env.VITE_RUYUEN_DEMO_ADMIN_PIN || '1234'

const activityIcons: Record<ActivityId, LucideIcon> = {
  calligraphy: Brush,
  fortune: ScrollText,
  food: Soup,
  crafts: Sparkles,
  martial: HeartHandshake,
  stage: Drama,
}

const foodVideoSources = [
  '/assets/videos/food-baozi-hd.mp4',
  '/assets/videos/food-zongzi-hd.mp4',
] as const

const getMediaVideos = (media: ActivityMedia) =>
  media.videos ?? (media.video ? [media.video] : [])

const activityMedia: Record<ActivityId, ActivityMedia> = {
  calligraphy: {
    image: '/assets/ruyuen-calligraphy.png',
    video: '/assets/videos/calligraphy-brush-characters-hd.mp4',
  },
  crafts: {
    image: '/assets/ruyuen-food-crafts.png',
    video: '/assets/videos/origami-folding.mp4',
  },
  food: {
    image: '/assets/ruyuen-food-crafts.png',
    video: foodVideoSources[0],
    videos: foodVideoSources,
  },
  fortune: {
    image: '/assets/ruyuen-hero-festival.png',
    video: '/assets/videos/lanterns-night.mp4',
  },
  martial: {
    image: '/assets/ruyuen-hero-festival.png',
    video: '/assets/videos/shaolin-staff-hd.mp4',
  },
  stage: {
    image: '/assets/ruyuen-hero-festival.png',
    video: '/assets/videos/lion-dance-performance-hd.mp4',
  },
}

const heroVisuals = [
  {
    id: 'lion-dance',
    label: {
      en: 'Lion dance',
      es: 'Danza de león',
      zhHans: '舞龙舞狮',
      zhHant: '舞龍舞獅',
    },
    poster: activityMedia.stage.image,
    src: '/assets/videos/lion-dance-performance-hd.mp4',
  },
  {
    id: 'shaolin-staff',
    label: {
      en: 'Shaolin staff',
      es: 'Bastón Shaolin',
      zhHans: '少林棍法',
      zhHant: '少林棍法',
    },
    poster: activityMedia.martial.image,
    src: '/assets/videos/shaolin-staff-hd.mp4',
  },
  {
    id: 'nunchaku',
    label: {
      en: 'Nunchaku',
      es: 'Shuang jie gun',
      zhHans: '双节棍',
      zhHant: '雙節棍',
    },
    poster: activityMedia.martial.image,
    src: '/assets/videos/nunchaku-hd.mp4',
  },
  {
    id: 'festival-food',
    label: {
      en: 'Festival bites',
      es: 'Sabores chinos',
      zhHans: '中国小吃',
      zhHant: '中國小吃',
    },
    poster: activityMedia.food.image,
    src: foodVideoSources[0],
  },
  {
    id: 'food-zongzi',
    label: {
      en: 'Zongzi',
      es: 'Zongzi',
      zhHans: '面食',
      zhHant: '麵食',
    },
    poster: activityMedia.food.image,
    src: foodVideoSources[1],
  },
  {
    id: 'calligraphy',
    label: {
      en: 'Calligraphy',
      es: 'Caligrafía',
      zhHans: '毛笔书法',
      zhHant: '毛筆書法',
    },
    poster: activityMedia.calligraphy.image,
    src: '/assets/videos/calligraphy-brush-characters-hd.mp4',
  },
] as const

const videoProps = {
  autoPlay: true,
  loop: true,
  muted: true,
  playsInline: true,
  preload: 'metadata',
} as const

const scrollingVideoProps = {
  ...videoProps,
  autoPlay: false,
} as const

const slots: Array<{
  activityId: ActivityId
  capacity: number
  id: string
  label: string
}> = [
  { id: 'cal-1200', activityId: 'calligraphy', label: '12:00 - 12:45', capacity: 12 },
  { id: 'cal-1500', activityId: 'calligraphy', label: '15:00 - 15:45', capacity: 12 },
  { id: 'for-1300', activityId: 'fortune', label: '13:00 - 13:30', capacity: 10 },
  { id: 'for-1700', activityId: 'fortune', label: '17:00 - 17:30', capacity: 10 },
  { id: 'cra-1400', activityId: 'crafts', label: '14:00 - 14:45', capacity: 14 },
  { id: 'cra-1800', activityId: 'crafts', label: '18:00 - 18:45', capacity: 14 },
  { id: 'mar-1600', activityId: 'martial', label: '16:00 - 16:40', capacity: 16 },
  { id: 'sta-1900', activityId: 'stage', label: '19:00 - 19:30', capacity: 40 },
]

const content = {
  es: {
    nav: ['Actividades', 'Escenario', 'Comida', 'Inscripción'],
    hero: {
      kicker: 'Organización Cultura Ruyuen',
      title: 'Fusión 2025',
      subtitle:
        'Un espacio para vivir la esencia del antiguo oriente: cultura, amistad, gastronomía y movimiento.',
      primary: 'Inscribirme',
      secondary: 'Ver programa',
      date: '11 de octubre',
      time: '12:00 - 21:00',
      place: 'Lugar por confirmar',
      openEntry: 'Entrada liberada',
    },
    mission: {
      label: 'Propósito',
      title: 'Compartir cultura china y crear encuentros reales.',
      body:
        'Ruyuen reúne talleres, demostraciones, comida y escenario para acercar tradiciones chinas a familias, amistades y nuevos visitantes.',
      values: ['Aprender haciendo', 'Probar sabores', 'Ver demostraciones', 'Conocer personas'],
    },
    sections: {
      activities: 'Zonas de actividad',
      stage: 'Programa de escenario',
      market: 'Sabores y recuerdos',
      booking: 'Reserva tu experiencia',
      visit: 'Planifica tu visita',
    },
    activities: [
      {
        id: 'calligraphy',
        title: 'Caligrafía china',
        tag: 'Taller guiado',
        text:
          'Practica trazos básicos con pincel, tinta y papel. Ideal para llevarte una pieza hecha por ti.',
        image: '/assets/ruyuen-calligraphy.png',
      },
      {
        id: 'fortune',
        title: 'Consulta y sorteo tradicional',
        tag: 'Experiencia breve',
        text:
          'Una estación simbólica para conocer rituales, preguntas y mensajes de inspiración cultural.',
      },
      {
        id: 'food',
        title: 'Gastronomía china',
        tag: 'Puestos de comida',
        text:
          'Baozi, dumplings y pequeños snacks calientes para probar entre talleres y funciones.',
        image: '/assets/ruyuen-food-crafts.png',
      },
      {
        id: 'crafts',
        title: 'Nudos chinos y faroles',
        tag: 'Manualidades',
        text:
          'Aprende formas simples de nudos decorativos, papel plegado y faroles para todas las edades.',
      },
      {
        id: 'martial',
        title: 'Introducción a artes marciales',
        tag: 'Cuerpo y disciplina',
        text:
          'Sesiones de movimientos básicos, coordinación y respeto por la práctica tradicional.',
      },
      {
        id: 'stage',
        title: 'Danza del león y armas tradicionales',
        tag: 'Escenario exterior',
        text:
          'Presentaciones de kung fu, bastón, guandao, nunchaku, tai chi y espada tai chi durante el día.',
      },
    ],
    stage: [
      ['12:30', 'Apertura cultural y bienvenida'],
      ['14:00', 'Danza del león y percusión'],
      ['15:30', 'Demostración de bastón y guandao'],
      ['17:00', 'Tai chi y espada tai chi'],
      ['19:00', 'Función central de artes marciales'],
    ],
    market: [
      ['Baozi', 'Panes al vapor con rellenos salados.'],
      ['Dumplings', 'Bocados calientes para compartir.'],
      ['Snacks', 'Dulces y pequeñas preparaciones de feria.'],
      ['Artesanías', 'Nudos chinos, faroles y recuerdos culturales.'],
    ],
    booking: {
      eyebrow: 'Flujo de prueba',
      title: 'Elige una actividad y genera tu ticket QR.',
      body:
        'Esta primera versión simula la reserva. En la siguiente fase se conectará a una planilla simple para ver cupos e inscritos.',
      activity: 'Actividad',
      slot: 'Horario',
      name: 'Nombre',
      contact: 'Correo o WhatsApp',
      guests: 'Personas',
      submit: 'Generar ticket',
      ticketTitle: 'Ticket de muestra',
      download: 'Descargar QR',
      note: 'No se envían datos reales en esta versión.',
    },
    visit: {
      instagram: 'Ver Instagram',
      copy:
        'Síguenos para confirmar dirección, novedades, fotos oficiales y anuncios de cupos.',
    },
    form: {
      attendeePlaceholder: 'Ej. Valentina Chen',
      contactPlaceholder: 'Ej. +56 9 1234 5678',
    },
  },
  zhHant: {
    nav: ['活動', '舞台', '美食', '報名'],
    hero: {
      kicker: '如願文化組織',
      title: 'Fusión 2025',
      subtitle: '一起體驗東方文化：書法、美食、武術、舞台表演，並在交流中結交朋友。',
      primary: '我要報名',
      secondary: '查看節目',
      date: '10月11日',
      time: '12:00 - 21:00',
      place: '地點待確認',
      openEntry: '免費入場',
    },
    mission: {
      label: '宗旨',
      title: '分享中國文化，也創造真正相遇的空間。',
      body:
        'Ruyuen 透過工作坊、演示、美食與舞台活動，把中國傳統帶給家庭、朋友與第一次接觸文化活動的訪客。',
      values: ['動手學習', '品嚐美食', '觀看演出', '認識朋友'],
    },
    sections: {
      activities: '活動區域',
      stage: '舞台節目',
      market: '美食與紀念品',
      booking: '預約體驗',
      visit: '參觀資訊',
    },
    activities: [
      {
        id: 'calligraphy',
        title: '毛筆書法',
        tag: '引導式工作坊',
        text: '使用毛筆、墨與紙練習基本筆畫，完成一份屬於自己的作品。',
        image: '/assets/ruyuen-calligraphy.png',
      },
      {
        id: 'fortune',
        title: '抽籤與傳統體驗',
        tag: '短時間體驗',
        text: '以文化介紹為主，了解象徵性的儀式、提問方式與祝福訊息。',
      },
      {
        id: 'food',
        title: '中國餐點',
        tag: '美食攤位',
        text: '包子、水餃與各式小吃，讓訪客在活動之間品嚐熱騰騰的味道。',
        image: '/assets/ruyuen-food-crafts.png',
      },
      {
        id: 'crafts',
        title: '中國結與摺紙燈籠',
        tag: '手作活動',
        text: '學習簡單的裝飾結、紙藝與燈籠，適合不同年齡一起參加。',
      },
      {
        id: 'martial',
        title: '武術入門',
        tag: '身體與紀律',
        text: '體驗基本動作、協調與傳統練習中的尊重精神。',
      },
      {
        id: 'stage',
        title: '舞龍舞獅與傳統兵器',
        tag: '戶外舞台',
        text: '全天安排武術、棍術、關刀、雙節棍、太極拳與太極劍表演。',
      },
    ],
    stage: [
      ['12:30', '文化開幕與歡迎'],
      ['14:00', '舞獅與鼓樂'],
      ['15:30', '棍術與關刀示範'],
      ['17:00', '太極拳與太極劍'],
      ['19:00', '武術主場演出'],
    ],
    market: [
      ['包子', '熱騰騰的中式蒸包。'],
      ['水餃', '適合分享的小點。'],
      ['小吃', '市集風格的甜食與小食。'],
      ['手作', '中國結、燈籠與文化紀念品。'],
    ],
    booking: {
      eyebrow: '試用流程',
      title: '選擇活動並產生 QR 票券。',
      body: '這一版先模擬報名。下一階段會接到簡單表格後台，方便查看名單與名額。',
      activity: '活動',
      slot: '時段',
      name: '姓名',
      contact: 'Email 或 WhatsApp',
      guests: '人數',
      submit: '產生票券',
      ticketTitle: '示範票券',
      download: '下載 QR',
      note: '此版本不會送出真實資料。',
    },
    visit: {
      instagram: '查看 Instagram',
      copy: '追蹤我們確認地址、最新消息、官方照片與報名名額公告。',
    },
    form: {
      attendeePlaceholder: '例：陳小如',
      contactPlaceholder: '例：+56 9 1234 5678',
    },
  },
  zhHans: {
    nav: ['活动', '舞台', '美食', '报名'],
    hero: {
      kicker: '如愿文化组织',
      title: 'Fusión 2025',
      subtitle: '一起体验东方文化：书法、美食、武术、舞台表演，并在交流中结交朋友。',
      primary: '我要报名',
      secondary: '查看节目',
      date: '10月11日',
      time: '12:00 - 21:00',
      place: '地点待确认',
      openEntry: '免费入场',
    },
    mission: {
      label: '宗旨',
      title: '分享中国文化，也创造真正相遇的空间。',
      body:
        'Ruyuen 通过工作坊、演示、美食与舞台活动，把中国传统带给家庭、朋友与第一次接触文化活动的访客。',
      values: ['动手学习', '品尝美食', '观看演出', '认识朋友'],
    },
    sections: {
      activities: '活动区域',
      stage: '舞台节目',
      market: '美食与纪念品',
      booking: '预约体验',
      visit: '参观信息',
    },
    activities: [
      {
        id: 'calligraphy',
        title: '毛笔书法',
        tag: '引导式工作坊',
        text: '使用毛笔、墨与纸练习基本笔画，完成一份属于自己的作品。',
        image: '/assets/ruyuen-calligraphy.png',
      },
      {
        id: 'fortune',
        title: '抽签与传统体验',
        tag: '短时间体验',
        text: '以文化介绍为主，了解象征性的仪式、提问方式与祝福信息。',
      },
      {
        id: 'food',
        title: '中国餐点',
        tag: '美食摊位',
        text: '包子、水饺与各式小吃，让访客在活动之间品尝热腾腾的味道。',
        image: '/assets/ruyuen-food-crafts.png',
      },
      {
        id: 'crafts',
        title: '中国结与折纸灯笼',
        tag: '手作活动',
        text: '学习简单的装饰结、纸艺与灯笼，适合不同年龄一起参加。',
      },
      {
        id: 'martial',
        title: '武术入门',
        tag: '身体与纪律',
        text: '体验基本动作、协调与传统练习中的尊重精神。',
      },
      {
        id: 'stage',
        title: '舞龙舞狮与传统兵器',
        tag: '户外舞台',
        text: '全天安排武术、棍术、关刀、双节棍、太极拳与太极剑表演。',
      },
    ],
    stage: [
      ['12:30', '文化开幕与欢迎'],
      ['14:00', '舞狮与鼓乐'],
      ['15:30', '棍术与关刀示范'],
      ['17:00', '太极拳与太极剑'],
      ['19:00', '武术主场演出'],
    ],
    market: [
      ['包子', '热腾腾的中式蒸包。'],
      ['水饺', '适合分享的小点。'],
      ['小吃', '市集风格的甜食与小食。'],
      ['手作', '中国结、灯笼与文化纪念品。'],
    ],
    booking: {
      eyebrow: '试用流程',
      title: '选择活动并生成 QR 门票。',
      body: '这一版先模拟报名。下一阶段会接到简单表格后台，方便查看名单与名额。',
      activity: '活动',
      slot: '时段',
      name: '姓名',
      contact: 'Email 或 WhatsApp',
      guests: '人数',
      submit: '生成门票',
      ticketTitle: '示范门票',
      download: '下载 QR',
      note: '此版本不会提交真实资料。',
    },
    visit: {
      instagram: '查看 Instagram',
      copy: '关注我们确认地址、最新消息、官方照片与报名名额公告。',
    },
    form: {
      attendeePlaceholder: '例：陈小如',
      contactPlaceholder: '例：+56 9 1234 5678',
    },
  },
  en: {
    nav: ['Activities', 'Stage', 'Food', 'Booking'],
    hero: {
      kicker: 'Organización Cultura Ruyuen',
      title: 'Fusión 2025',
      subtitle:
        'A welcoming space to experience Chinese culture through workshops, food, performance and friendship.',
      primary: 'Book a spot',
      secondary: 'See schedule',
      date: 'October 11',
      time: '12:00 - 21:00',
      place: 'Venue to be confirmed',
      openEntry: 'Free entry',
    },
    mission: {
      label: 'Purpose',
      title: 'Sharing Chinese culture while creating real human connection.',
      body:
        'Ruyuen brings together hands-on workshops, demonstrations, food and stage performances for families, friends and first-time visitors.',
      values: ['Learn by doing', 'Taste traditions', 'Watch performances', 'Meet people'],
    },
    sections: {
      activities: 'Activity zones',
      stage: 'Stage program',
      market: 'Flavors and keepsakes',
      booking: 'Reserve your experience',
      visit: 'Plan your visit',
    },
    activities: [
      {
        id: 'calligraphy',
        title: 'Chinese calligraphy',
        tag: 'Guided workshop',
        text:
          'Practice brush strokes with ink and paper, then take home a piece made by you.',
        image: '/assets/ruyuen-calligraphy.png',
      },
      {
        id: 'fortune',
        title: 'Traditional draw and reading',
        tag: 'Short experience',
        text:
          'A symbolic station for learning about rituals, questions and cultural messages of inspiration.',
      },
      {
        id: 'food',
        title: 'Chinese food area',
        tag: 'Food stalls',
        text:
          'Baozi, dumplings and warm snacks to enjoy between workshops and performances.',
        image: '/assets/ruyuen-food-crafts.png',
      },
      {
        id: 'crafts',
        title: 'Chinese knots and paper lanterns',
        tag: 'Craft workshop',
        text:
          'Learn simple decorative knots, paper folding and lanterns for visitors of different ages.',
      },
      {
        id: 'martial',
        title: 'Martial arts introduction',
        tag: 'Movement and discipline',
        text:
          'Experience basic movements, coordination and respect for traditional practice.',
      },
      {
        id: 'stage',
        title: 'Lion dance and traditional weapons',
        tag: 'Outdoor stage',
        text:
          'Kung fu, staff, guandao, nunchaku, tai chi and tai chi sword presentations throughout the day.',
      },
    ],
    stage: [
      ['12:30', 'Cultural opening and welcome'],
      ['14:00', 'Lion dance and percussion'],
      ['15:30', 'Staff and guandao demonstration'],
      ['17:00', 'Tai chi and tai chi sword'],
      ['19:00', 'Main martial arts performance'],
    ],
    market: [
      ['Baozi', 'Steamed buns with savory fillings.'],
      ['Dumplings', 'Warm bites made for sharing.'],
      ['Snacks', 'Sweet and savory fair-style treats.'],
      ['Crafts', 'Chinese knots, lanterns and cultural keepsakes.'],
    ],
    booking: {
      eyebrow: 'Prototype flow',
      title: 'Choose an activity and generate your QR ticket.',
      body:
        'This first version simulates booking. The next phase will connect it to a simple spreadsheet for capacity and registrations.',
      activity: 'Activity',
      slot: 'Time slot',
      name: 'Name',
      contact: 'Email or WhatsApp',
      guests: 'People',
      submit: 'Generate ticket',
      ticketTitle: 'Sample ticket',
      download: 'Download QR',
      note: 'No real data is submitted in this version.',
    },
    visit: {
      instagram: 'Open Instagram',
      copy:
        'Follow us for the confirmed address, updates, official photos and registration announcements.',
    },
    form: {
      attendeePlaceholder: 'E.g. Valentina Chen',
      contactPlaceholder: 'E.g. +56 9 1234 5678',
    },
  },
} as const

function isLanguageCode(value: string | null): value is LanguageCode {
  return languageOptions.some((language) => language.code === value)
}

function getRouteFromHash(): AppRoute {
  const hash = window.location.hash.replace(/^#\/?/, '')

  if (hash.startsWith('booking')) {
    return 'booking'
  }

  if (hash === privateStaffPath) {
    return 'admin'
  }

  return 'home'
}

function readStoredArray<T>(key: string, fallback: T[]): T[] {
  try {
    const value = window.localStorage.getItem(key)
    return value ? (JSON.parse(value) as T[]) : fallback
  } catch {
    return fallback
  }
}

function writeStoredArray<T>(key: string, value: T[]) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function defaultNotices(language: LanguageCode): Notice[] {
  const localized = {
    en: {
      body: 'Reservations are open in demo mode. Final address and schedule will be confirmed soon.',
      title: 'Ruyuen Fusion updates',
    },
    es: {
      body: 'Las reservas están abiertas en modo demo. La dirección y el programa final se confirmarán pronto.',
      title: 'Avisos Ruyuen Fusion',
    },
    zhHans: {
      body: '预约功能目前已开放试用。最终地址和时间表会在确认后更新。',
      title: 'Ruyuen Fusion 通知',
    },
    zhHant: {
      body: '預約功能目前已開放試用。最終地址和時間表會在確認後更新。',
      title: 'Ruyuen Fusion 通知',
    },
  }[language]

  return [
    {
      active: true,
      body: localized.body,
      id: 'notice-demo-open',
      priority: 'high',
      title: localized.title,
    },
  ]
}

async function postSheetAction<T>(action: string, payload: Record<string, unknown>): Promise<T | null> {
  const apiUrl = import.meta.env.VITE_RUYUEN_API_URL

  if (!apiUrl) {
    return null
  }

  const response = await fetch(apiUrl, {
    body: JSON.stringify({ action, ...payload }),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`Sheets API ${response.status}`)
  }

  return (await response.json()) as T
}

function App() {
  const shouldReduceMotion = useReducedMotion()
  const [route, setRoute] = useState<AppRoute>(() => getRouteFromHash())
  const [heroVisualIndex, setHeroVisualIndex] = useState(0)
  const heroVideoRefs = useRef<Array<HTMLVideoElement | null>>([])
  const [language, setLanguage] = useState<LanguageCode>(() => {
    const stored = window.localStorage.getItem('ruyuen-language')
    return isLanguageCode(stored) ? stored : 'es'
  })
  const copy = content[language]
  const ui = adminCopy[language]
  const navItems = [
    { href: '#/', key: 'home' as const, label: routeLabels[language].home },
    { href: '#/booking', key: 'booking' as const, label: routeLabels[language].booking },
  ]
  const [selectedActivity, setSelectedActivity] = useState<ActivityId>('calligraphy')
  const [activeExperienceId, setActiveExperienceId] = useState<ActivityId>('calligraphy')
  const [menuOpen, setMenuOpen] = useState(false)
  const availableSlots = useMemo(
    () => slots.filter((slot) => slot.activityId === selectedActivity),
    [selectedActivity],
  )
  const activeExperience =
    copy.activities.find((activity) => activity.id === activeExperienceId) ?? copy.activities[0]
  const activeExperienceMedia = activityMedia[activeExperience.id]
  const activeExperienceVideos = getMediaVideos(activeExperienceMedia)
  const ActiveExperienceIcon = activityIcons[activeExperience.id]
  const marketVideos = getMediaVideos(activityMedia.food)
  const [selectedSlot, setSelectedSlot] = useState(availableSlots[0]?.id ?? '')
  const [attendee, setAttendee] = useState('')
  const [contact, setContact] = useState('')
  const [guests, setGuests] = useState('1')
  const [ticket, setTicket] = useState<BookingTicket | null>(null)
  const [qrImage, setQrImage] = useState('')
  const [bookings, setBookings] = useState<StoredBooking[]>(() =>
    readStoredArray<StoredBooking>(bookingsStorageKey, []),
  )
  const [notices, setNotices] = useState<Notice[]>(() =>
    readStoredArray<Notice>(noticesStorageKey, defaultNotices(language)),
  )
  const [bookingError, setBookingError] = useState('')
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false)
  const [adminPin, setAdminPin] = useState('')
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false)
  const [adminError, setAdminError] = useState('')
  const [adminSearch, setAdminSearch] = useState('')
  const [adminStatusFilter, setAdminStatusFilter] = useState<AdminFilter>('all')
  const [adminActivityFilter, setAdminActivityFilter] = useState<ActivityId | 'all'>('all')
  const [noticeDraft, setNoticeDraft] = useState({ body: '', title: '' })
  const activeNotices = notices.filter((notice) => notice.active)
  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = adminStatusFilter === 'all' || booking.status === adminStatusFilter
    const matchesActivity = adminActivityFilter === 'all' || booking.activityId === adminActivityFilter
    const search = adminSearch.trim().toLowerCase()
    const matchesSearch =
      !search ||
      booking.attendee.toLowerCase().includes(search) ||
      booking.contact.toLowerCase().includes(search) ||
      booking.id.toLowerCase().includes(search)

    return matchesStatus && matchesActivity && matchesSearch
  })
  const reservedCount = bookings.filter((booking) => booking.status === 'reserved').length
  const checkedInCount = bookings.filter((booking) => booking.status === 'checked-in').length
  const cancelledCount = bookings.filter((booking) => booking.status === 'cancelled').length

  useEffect(() => {
    window.localStorage.setItem('ruyuen-language', language)
  }, [language])

  useEffect(() => {
    const onHashChange = () => setRoute(getRouteFromHash())
    window.addEventListener('hashchange', onHashChange)
    onHashChange()

    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    writeStoredArray(bookingsStorageKey, bookings)
  }, [bookings])

  useEffect(() => {
    writeStoredArray(noticesStorageKey, notices)
  }, [notices])

  useEffect(() => {
    postSheetAction<{ notices?: Notice[] }>('content', {})
      .then((response) => {
        if (response?.notices?.length) {
          setNotices(response.notices)
        }
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (shouldReduceMotion) {
      return
    }

    const timer = window.setInterval(() => {
      setHeroVisualIndex((current) => (current + 1) % heroVisuals.length)
    }, 6800)

    return () => window.clearInterval(timer)
  }, [shouldReduceMotion])

  useEffect(() => {
    heroVideoRefs.current.forEach((video, index) => {
      if (!video) {
        return
      }

      if (index === heroVisualIndex) {
        video.play().catch(() => undefined)
      } else {
        video.pause()
      }
    })
  }, [heroVisualIndex])

  useEffect(() => {
    const videos = Array.from(
      document.querySelectorAll<HTMLVideoElement>('video[data-autopause-video="true"]'),
    )

    if (!videos.length) {
      return
    }

    if (!('IntersectionObserver' in window)) {
      videos.forEach((video) => {
        video.play().catch(() => undefined)
      })
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement

          if (entry.isIntersecting && entry.intersectionRatio > 0.18) {
            video.play().catch(() => undefined)
          } else {
            video.pause()
          }
        })
      },
      { rootMargin: '140px 0px', threshold: [0, 0.18, 0.5] },
    )

    videos.forEach((video) => {
      video.pause()
      observer.observe(video)
    })

    return () => observer.disconnect()
  }, [activeExperienceId])

  useEffect(() => {
    setSelectedSlot(availableSlots[0]?.id ?? '')
  }, [availableSlots])

  useEffect(() => {
    if (!ticket) {
      setQrImage('')
      return
    }

    const payload = {
      event: 'Ruyuen Fusion 2025',
      ticket: ticket.id,
      activity: ticket.activityName,
      slot: ticket.slotLabel,
      attendee: ticket.attendee,
    }

    toDataURL(JSON.stringify(payload), {
      color: { dark: '#172A2A', light: '#F7F1E3' },
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 240,
    }).then(setQrImage)
  }, [ticket])

  const reveal = (delay = 0): MotionProps =>
    shouldReduceMotion
      ? { initial: false }
      : {
          initial: { opacity: 0, scale: 0.992, y: 22 },
          transition: { delay, duration: 0.58, ease: [0.22, 1, 0.36, 1] },
          viewport: { amount: 0.16, margin: '-48px', once: false },
          whileInView: { opacity: 1, scale: 1, y: 0 },
        }

  const chooseLanguage = (nextLanguage: LanguageCode) => {
    setLanguage(nextLanguage)
  }

  const chooseActivityForBooking = (activityId: ActivityId) => {
    setSelectedActivity(activityId)
    setActiveExperienceId(activityId)
    window.location.hash = '/booking'
    window.setTimeout(() => {
      document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  const handleAdminUnlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const staffPin = adminPin.trim()

    if (!staffPin) {
      setAdminError(ui.wrongPin)
      setIsAdminUnlocked(false)
      return
    }

    if (hasRemoteApi) {
      try {
        const response = await postSheetAction<{ bookings?: StoredBooking[]; error?: string }>(
          'adminListBookings',
          { adminPin: staffPin },
        )

        if (response?.error) {
          throw new Error(response.error)
        }

        if (response?.bookings) {
          setBookings(response.bookings)
        }

        setAdminError('')
        setIsAdminUnlocked(true)
      } catch {
        setAdminError(ui.wrongPin)
        setIsAdminUnlocked(false)
      }
      return
    }

    if (staffPin !== localDemoAdminPin) {
      setAdminError(ui.wrongPin)
      setIsAdminUnlocked(false)
      return
    }

    setAdminError('')
    setIsAdminUnlocked(true)
  }

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    const checkedInAt = status === 'checked-in' ? new Date().toISOString() : undefined

    setBookings((current) =>
      current.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              checkedInAt,
              status,
            }
          : booking,
      ),
    )

    try {
      await postSheetAction('adminUpdateBooking', {
        adminPin,
        bookingId,
        checkedInAt,
        status,
      })
    } catch {
      // Local mode stays usable even when the sheet is not connected yet.
    }
  }

  const saveNotice = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const title = noticeDraft.title.trim()
    const body = noticeDraft.body.trim()

    if (!title || !body) {
      return
    }

    const notice: Notice = {
      active: true,
      body,
      id: `notice-${Date.now()}`,
      priority: 'normal',
      title,
    }

    setNotices((current) => [notice, ...current])
    setNoticeDraft({ body: '', title: '' })

    try {
      await postSheetAction('adminUpsertContent', { adminPin, notice })
    } catch {
      // Notice is already saved locally for the prototype.
    }
  }

  const toggleNotice = (noticeId: string) => {
    setNotices((current) =>
      current.map((notice) =>
        notice.id === noticeId ? { ...notice, active: !notice.active } : notice,
      ),
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBookingError('')
    const activity = copy.activities.find((item) => item.id === selectedActivity)
    const slot = slots.find((item) => item.id === selectedSlot)

    if (!activity || !slot) {
      return
    }

    const guestCount = Math.max(1, Number.parseInt(guests, 10) || 1)
    const alreadyReserved = bookings
      .filter(
        (booking) =>
          booking.slotLabel === slot.label &&
          booking.activityId === activity.id &&
          !['cancelled', 'no-show'].includes(booking.status),
      )
      .reduce((sum, booking) => sum + (Number.parseInt(booking.guests, 10) || 1), 0)

    if (alreadyReserved + guestCount > slot.capacity) {
      setBookingError(
        language === 'es'
          ? 'Este horario ya no tiene cupos suficientes.'
          : language === 'en'
            ? 'This slot does not have enough capacity left.'
            : '這個時段剩餘名額不足。',
      )
      return
    }

    const booking: StoredBooking = {
      activityId: activity.id,
      activityName: activity.title,
      attendee: attendee.trim() || 'Invitado Ruyuen',
      contact: contact.trim() || 'sin contacto',
      createdAt: new Date().toISOString(),
      guests: String(guestCount),
      id: `RY-${Date.now().toString().slice(-6)}`,
      language,
      slotLabel: slot.label,
      status: 'reserved',
    }

    setIsSubmittingBooking(true)

    try {
      const response = await postSheetAction<{ booking?: StoredBooking; error?: string }>(
        'createBooking',
        { booking },
      )

      if (response?.error) {
        setBookingError(response.error)
        return
      }

      const confirmedBooking = response?.booking ?? booking
      setBookings((current) => [confirmedBooking, ...current])
      setTicket(confirmedBooking)
    } catch {
      setBookings((current) => [booking, ...current])
      setTicket(booking)
    } finally {
      setIsSubmittingBooking(false)
    }
  }

  const downloadQr = () => {
    if (!qrImage || !ticket) {
      return
    }

    const link = document.createElement('a')
    link.href = qrImage
    link.download = `${ticket.id}-ruyuen-qr.png`
    link.click()
  }

  return (
    <main className="site-shell">
      <header className="site-header">
        <a className="brand" href="#/" aria-label="Ruyuen">
          <span className="brand-mark">R</span>
          <span>
            <strong>Ruyuen</strong>
            <small>cultura fusion</small>
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Primary">
          {navItems.map((item) => (
            <a className={route === item.key ? 'active' : ''} href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <div className="language-switcher" aria-label="Language selector">
            <Languages size={17} aria-hidden="true" />
            {languageOptions.map((option) => (
              <button
                aria-pressed={language === option.code}
                className={language === option.code ? 'active' : ''}
                key={option.code}
                onClick={() => chooseLanguage(option.code)}
                title={option.label}
                type="button"
              >
                {option.short}
              </button>
            ))}
          </div>

          <button
            aria-expanded={menuOpen}
            aria-label="Open menu"
            className="mobile-menu-button"
            onClick={() => setMenuOpen(true)}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className={`mobile-menu-overlay ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-top">
          <strong>Ruyuen</strong>
          <button aria-label="Close menu" onClick={() => setMenuOpen(false)} type="button">
            X
          </button>
        </div>
        <nav aria-label="Mobile primary">
          {navItems.map((item, index) => (
            <a
              href={item.href}
              className={route === item.key ? 'active' : ''}
              key={item.href}
              onClick={() => setMenuOpen(false)}
              style={{ transitionDelay: menuOpen ? `${index * 80 + 120}ms` : '0ms' }}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a
          className="mobile-menu-cta"
          href="#booking"
          onClick={() => setMenuOpen(false)}
          style={{ transitionDelay: menuOpen ? '480ms' : '0ms' }}
        >
          {copy.hero.primary}
        </a>
      </div>

      {route === 'home' ? (
        <>
      <section className="hero-section" id="top">
        <div aria-hidden="true" className="hero-motion-stack">
          <div
            className="hero-slide-track"
            style={{ transform: `translate3d(-${heroVisualIndex * 100}%, 0, 0)` }}
          >
            {heroVisuals.map((visual, index) => (
              <div className="hero-slide" key={visual.id}>
                <video
                  {...videoProps}
                  autoPlay={index === heroVisualIndex}
                  className="hero-motion-video"
                  poster={visual.poster}
                  preload={index === heroVisualIndex ? 'auto' : 'metadata'}
                  ref={(node) => {
                    heroVideoRefs.current[index] = node
                  }}
                  src={visual.src}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="hero-shard-field" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <motion.div className="hero-copy" {...reveal()}>
          <span className="eyebrow hero-badge liquid-glass">
            <Crown size={16} aria-hidden="true" />
            {copy.hero.kicker}
          </span>
          <h1>
            <span>Ruyuen</span>
            <span>{copy.hero.title}</span>
          </h1>
          <p>{copy.hero.subtitle}</p>
          <div className="hero-actions">
            <a className="primary-action" href="#booking">
              <Ticket size={18} aria-hidden="true" />
              {copy.hero.primary}
            </a>
            <a className="secondary-action" href="#stage">
              <CalendarDays size={18} aria-hidden="true" />
              {copy.hero.secondary}
            </a>
          </div>
        </motion.div>

        <motion.div className="hero-facts" {...reveal(0.15)}>
          <span>
            <CalendarDays size={18} aria-hidden="true" />
            {copy.hero.date}
          </span>
          <span>
            <Clock3 size={18} aria-hidden="true" />
            {copy.hero.time}
          </span>
          <span>
            <MapPin size={18} aria-hidden="true" />
            {copy.hero.place}
          </span>
          <strong>{copy.hero.openEntry}</strong>
        </motion.div>
      </section>

      {activeNotices.length ? (
        <section className="notice-strip" aria-label={ui.notices}>
          {activeNotices.slice(0, 2).map((notice) => (
            <article className={notice.priority === 'high' ? 'priority' : ''} key={notice.id}>
              <Bell size={18} aria-hidden="true" />
              <div>
                <strong>{notice.title}</strong>
                <p>{notice.body}</p>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      <div className="marquee-strip" aria-hidden="true">
        <div>
          {[...copy.activities, ...copy.activities].map((activity, index) => (
            <span key={`${activity.id}-${index}`}>{activity.title}</span>
          ))}
        </div>
      </div>

      <section className="mission-band">
        <motion.div className="section-heading" {...reveal()}>
          <span className="eyebrow">{copy.mission.label}</span>
          <h2>{copy.mission.title}</h2>
          <p>{copy.mission.body}</p>
        </motion.div>
        <div className="value-strip">
          {copy.mission.values.map((value) => (
            <span key={value}>{value}</span>
          ))}
        </div>
      </section>

      <section className="content-section" id="activities">
        <motion.div className="section-heading compact" {...reveal()}>
          <span className="eyebrow">Ruyuen</span>
          <h2>{copy.sections.activities}</h2>
        </motion.div>

        <div className="experience-showcase">
          <div className="experience-index" aria-label="Activity explorer">
            {copy.activities.map((activity, index) => {
              const Icon = activityIcons[activity.id]
              return (
                <button
                  className={activity.id === activeExperienceId ? 'active' : ''}
                  key={activity.id}
                  onClick={() => {
                    setActiveExperienceId(activity.id)
                    setSelectedActivity(activity.id)
                  }}
                  type="button"
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <Icon size={18} aria-hidden="true" />
                  <strong>{activity.title}</strong>
                </button>
              )
            })}
          </div>

          <div className="experience-stage" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.article
                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                className="piece-panel"
                exit={{ opacity: 0, rotateX: -7, y: -20 }}
                initial={{ opacity: 0, rotateX: 7, y: 20 }}
                key={activeExperience.id}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="piece-copy">
                  <span>
                    <ActiveExperienceIcon size={18} aria-hidden="true" />
                    {activeExperience.tag}
                  </span>
                  <h3>{activeExperience.title}</h3>
                  <p>{activeExperience.text}</p>
                </div>
                <div className="fragment-collage" aria-hidden="true">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <video
                      {...scrollingVideoProps}
                      className="fragment-piece"
                      data-autopause-video="true"
                      key={`${activeExperience.id}-fragment-${index}`}
                      poster={activeExperienceMedia.image}
                      src={activeExperienceVideos[index % activeExperienceVideos.length]}
                    />
                  ))}
                </div>
              </motion.article>
            </AnimatePresence>
          </div>
        </div>

        <div className="activity-grid">
          {copy.activities.map((activity, index) => {
            const Icon = activityIcons[activity.id]
            const media = activityMedia[activity.id]
            const mediaVideo = getMediaVideos(media)[0]
            return (
              <motion.article
                className="activity-card"
                key={activity.id}
                {...reveal(index * 0.04)}
              >
                {mediaVideo ? (
                  <video
                    {...scrollingVideoProps}
                    className="activity-video"
                    data-autopause-video="true"
                    poster={media.image}
                    src={mediaVideo}
                  />
                ) : media.image ? (
                  <img src={media.image} alt="" />
                ) : (
                  <div className={`activity-illustration ${activity.id}`}>
                    <Icon size={42} aria-hidden="true" />
                  </div>
                )}
                <div className="activity-card-body">
                  <span>
                    <Icon size={16} aria-hidden="true" />
                    {activity.tag}
                  </span>
                  <h3>{activity.title}</h3>
                  <p>{activity.text}</p>
                </div>
              </motion.article>
            )
          })}
        </div>
      </section>

      <section className="stage-section" id="stage">
        <motion.div className="section-heading compact" {...reveal()}>
          <span className="eyebrow">Stage</span>
          <h2>{copy.sections.stage}</h2>
        </motion.div>

        <div className="stage-layout">
          <aside className="stage-side-panel">
            <span>01 / 05</span>
            <strong>Ruyuen live program</strong>
            <p>{copy.hero.date} · {copy.hero.time}</p>
          </aside>

          <div className="timeline">
            {copy.stage.map(([time, title], index) => (
              <motion.article
                className="timeline-item"
                data-index={String(index + 1).padStart(2, '0')}
                key={`${time}-${title}`}
                {...reveal(index * 0.05)}
              >
                <time>{time}</time>
                <div>
                  <h3>{title}</h3>
                  <span>
                    <ChevronRight size={16} aria-hidden="true" />
                    Ruyuen Fusion
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="market-section" id="market">
        <motion.div className="section-heading compact" {...reveal()}>
          <span className="eyebrow">Market</span>
          <h2>{copy.sections.market}</h2>
        </motion.div>
        <div className="market-layout">
          <div className="market-video-reel" aria-hidden="true">
            {marketVideos.map((src) => (
              <video
                {...scrollingVideoProps}
                className="market-video"
                data-autopause-video="true"
                key={src}
                poster="/assets/ruyuen-food-crafts.png"
                src={src}
              />
            ))}
          </div>
          <div className="market-list">
            {copy.market.map(([name, detail]) => (
              <article className="market-row" key={name}>
                <Utensils size={19} aria-hidden="true" />
                <div>
                  <h3>{name}</h3>
                  <p>{detail}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

        </>
      ) : null}

      {route === 'booking' ? (
      <section className="booking-section booking-page" id="booking">
        <motion.div className="section-heading compact" {...reveal()}>
          <span className="eyebrow">{copy.booking.eyebrow}</span>
          <h2>{ui.bookingPageTitle}</h2>
          <p>{ui.bookingPageBody}</p>
        </motion.div>

        <div className="booking-layout">
          <form className="booking-form" id="booking-form" onSubmit={handleSubmit}>
            <label>
              {copy.booking.activity}
              <select
                onChange={(event) => setSelectedActivity(event.target.value as ActivityId)}
                value={selectedActivity}
              >
                {copy.activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {copy.booking.slot}
              <select onChange={(event) => setSelectedSlot(event.target.value)} value={selectedSlot}>
                {availableSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.label} · {slot.capacity}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {copy.booking.name}
              <input
                onChange={(event) => setAttendee(event.target.value)}
                placeholder={copy.form.attendeePlaceholder}
                value={attendee}
              />
            </label>

            <label>
              {copy.booking.contact}
              <input
                onChange={(event) => setContact(event.target.value)}
                placeholder={copy.form.contactPlaceholder}
                value={contact}
              />
            </label>

            <label>
              {copy.booking.guests}
              <input
                max="8"
                min="1"
                onChange={(event) => setGuests(event.target.value)}
                type="number"
                value={guests}
              />
            </label>

            {bookingError ? <p className="form-error">{bookingError}</p> : null}

            <button className="primary-action form-submit" disabled={isSubmittingBooking} type="submit">
              <QrCode size={18} aria-hidden="true" />
              {isSubmittingBooking ? '...' : copy.booking.submit}
            </button>
            <p className="form-note">{copy.booking.note}</p>
          </form>

          <aside className="ticket-preview" aria-live="polite">
            {ticket ? (
              <>
                <span className="ticket-label">{copy.booking.ticketTitle}</span>
                <h3>{ticket.activityName}</h3>
                <p>{ticket.slotLabel}</p>
                <p>{ticket.attendee}</p>
                <p>{ticket.contact}</p>
                {qrImage ? (
                  <img className="qr-image" src={qrImage} alt="QR ticket" />
                ) : (
                  <div className="qr-placeholder">
                    <QrCode size={56} aria-hidden="true" />
                  </div>
                )}
                <strong>{ticket.id}</strong>
                <button className="secondary-action ticket-download" onClick={downloadQr} type="button">
                  <Download size={18} aria-hidden="true" />
                  {copy.booking.download}
                </button>
              </>
            ) : (
              <div className="empty-ticket">
                <Ticket size={58} aria-hidden="true" />
                <span>{copy.booking.ticketTitle}</span>
              </div>
            )}
          </aside>
        </div>

        <motion.div className="section-heading compact booking-guide-heading" {...reveal(0.08)}>
          <span className="eyebrow">Ruyuen</span>
          <h2>{ui.activityCards}</h2>
          <p>{copy.mission.body}</p>
        </motion.div>

        <div className="booking-activity-grid">
          {copy.activities.map((activity, index) => {
            const Icon = activityIcons[activity.id]
            const media = activityMedia[activity.id]
            const mediaVideo = getMediaVideos(media)[0]
            return (
              <motion.article className="booking-activity-card" key={activity.id} {...reveal(index * 0.04)}>
                <div className="booking-activity-media">
                  {mediaVideo ? (
                    <video
                      {...scrollingVideoProps}
                      data-autopause-video="true"
                      poster={media.image}
                      src={mediaVideo}
                    />
                  ) : (
                    <img src={media.image} alt="" />
                  )}
                </div>
                <div className="booking-activity-body">
                  <span>
                    <Icon size={17} aria-hidden="true" />
                    {activity.tag}
                  </span>
                  <h3>{activity.title}</h3>
                  <p>{activity.text}</p>
                  <button
                    className="primary-action"
                    onClick={() => chooseActivityForBooking(activity.id)}
                    type="button"
                  >
                    <Ticket size={18} aria-hidden="true" />
                    {copy.hero.primary}
                  </button>
                </div>
              </motion.article>
            )
          })}
        </div>
      </section>
      ) : null}

      {route === 'admin' ? (
        <section className="admin-section">
          <motion.div className="section-heading compact" {...reveal()}>
            <span className="eyebrow">
              <LockKeyhole size={16} aria-hidden="true" />
              {routeLabels[language].admin}
            </span>
            <h2>{ui.adminTitle}</h2>
            <p>{ui.adminBody}</p>
          </motion.div>

          {!isAdminUnlocked ? (
            <form className="admin-login-card" onSubmit={handleAdminUnlock}>
              <label>
                {ui.adminLogin}
                <input
                  onChange={(event) => setAdminPin(event.target.value)}
                  placeholder={ui.adminPassword}
                  type="password"
                  value={adminPin}
                />
              </label>
              {adminError ? <p className="form-error">{adminError}</p> : null}
              <button className="primary-action" type="submit">
                <LockKeyhole size={18} aria-hidden="true" />
                {ui.adminUnlock}
              </button>
            </form>
          ) : (
            <div className="admin-dashboard">
              <div className="admin-stat-grid">
                <article>
                  <ClipboardList size={22} aria-hidden="true" />
                  <span>{bookings.length}</span>
                  <p>{ui.table}</p>
                </article>
                <article>
                  <Ticket size={22} aria-hidden="true" />
                  <span>{reservedCount}</span>
                  <p>{bookingStatusLabels[language].reserved}</p>
                </article>
                <article>
                  <UserCheck size={22} aria-hidden="true" />
                  <span>{checkedInCount}</span>
                  <p>{bookingStatusLabels[language]['checked-in']}</p>
                </article>
                <article>
                  <CheckCircle2 size={22} aria-hidden="true" />
                  <span>{cancelledCount}</span>
                  <p>{bookingStatusLabels[language].cancelled}</p>
                </article>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-heading">
                  <div>
                    <span className="eyebrow">{ui.table}</span>
                    <h3>{filteredBookings.length} / {bookings.length}</h3>
                  </div>
                  <div className="admin-filters">
                    <label>
                      <Search size={16} aria-hidden="true" />
                      <input
                        onChange={(event) => setAdminSearch(event.target.value)}
                        placeholder={ui.search}
                        value={adminSearch}
                      />
                    </label>
                    <select
                      onChange={(event) => setAdminActivityFilter(event.target.value as ActivityId | 'all')}
                      value={adminActivityFilter}
                    >
                      <option value="all">All</option>
                      {copy.activities.map((activity) => (
                        <option key={activity.id} value={activity.id}>
                          {activity.title}
                        </option>
                      ))}
                    </select>
                    <select
                      onChange={(event) => setAdminStatusFilter(event.target.value as AdminFilter)}
                      value={adminStatusFilter}
                    >
                      <option value="all">All</option>
                      {Object.entries(bookingStatusLabels[language]).map(([status, label]) => (
                        <option key={status} value={status}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="admin-booking-table">
                  {filteredBookings.length ? (
                    filteredBookings.map((booking) => (
                      <article key={booking.id}>
                        <div>
                          <strong>{booking.attendee}</strong>
                          <span>{booking.id} · {booking.contact}</span>
                        </div>
                        <div>
                          <strong>{booking.activityName}</strong>
                          <span>{booking.slotLabel} · {booking.guests}</span>
                        </div>
                        <select
                          onChange={(event) =>
                            updateBookingStatus(booking.id, event.target.value as BookingStatus)
                          }
                          value={booking.status}
                        >
                          {Object.entries(bookingStatusLabels[language]).map(([status, label]) => (
                            <option key={status} value={status}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </article>
                    ))
                  ) : (
                    <div className="admin-empty">
                      <ClipboardList size={42} aria-hidden="true" />
                      <span>{ui.table}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-grid">
                <form className="admin-panel notice-editor" onSubmit={saveNotice}>
                  <span className="eyebrow">
                    <Bell size={16} aria-hidden="true" />
                    {ui.notices}
                  </span>
                  <label>
                    {ui.noticeTitle}
                    <input
                      onChange={(event) =>
                        setNoticeDraft((current) => ({ ...current, title: event.target.value }))
                      }
                      value={noticeDraft.title}
                    />
                  </label>
                  <label>
                    {ui.noticeBody}
                    <textarea
                      onChange={(event) =>
                        setNoticeDraft((current) => ({ ...current, body: event.target.value }))
                      }
                      value={noticeDraft.body}
                    />
                  </label>
                  <button className="primary-action" type="submit">
                    <Bell size={18} aria-hidden="true" />
                    {ui.noticeSave}
                  </button>
                  <div className="notice-list">
                    {notices.map((notice) => (
                      <button
                        className={notice.active ? 'active' : ''}
                        key={notice.id}
                        onClick={() => toggleNotice(notice.id)}
                        type="button"
                      >
                        <strong>{notice.title}</strong>
                        <span>{notice.active ? 'ON' : 'OFF'}</span>
                      </button>
                    ))}
                  </div>
                </form>

                <aside className="admin-panel content-guide">
                  <span className="eyebrow">{ui.activityCards}</span>
                  <h3>Google Sheets</h3>
                  <p>{ui.contentHelp}</p>
                  <div>
                    <code>Activities</code>
                    <code>Slots</code>
                    <code>Bookings</code>
                    <code>Notices</code>
                  </div>
                </aside>
              </div>
            </div>
          )}
        </section>
      ) : null}

      <footer className="site-footer">
        <div>
          <span className="eyebrow">{copy.sections.visit}</span>
          <p>{copy.visit.copy}</p>
        </div>
        <a className="secondary-action" href="https://www.instagram.com/ruyuen.oficial/" rel="noreferrer" target="_blank">
          <Camera size={18} aria-hidden="true" />
          {copy.visit.instagram}
        </a>
      </footer>
    </main>
  )
}

export default App
