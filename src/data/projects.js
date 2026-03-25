export const projects = [
  {
    id: 1,
    slug: 'edgeglimpse',
    title: {
      tr: 'EdgeGlimpse',
      en: 'EdgeGlimpse'
    },
    description: {
      tr: 'Gerçek zamanlı finansal piyasa verileri sunan, gelişmiş analitik dashboard\'lar ve AI destekli piyasa içgörüleri içeren kapsamlı bir fintech platformu.',
      en: 'A comprehensive fintech platform offering real-time financial market data, advanced analytics dashboards, and AI-powered market insights.'
    },
    tags: ['Next.js', 'React', 'Node.js', 'AI', 'Fintech'],
    category: 'web',
    image: '/images/projects/edgeglimpse.png',
    liveUrl: 'https://edgeglimpse.com',
    githubUrl: null,
    featured: true
  },
  {
    id: 2,
    slug: 'portfolio-site',
    title: {
      tr: 'Kişisel Portfolyo',
      en: 'Personal Portfolio'
    },
    description: {
      tr: 'Next.js, çoklu dil desteği ve Midnight Aurora tasarım konseptini kullanan modern, performanslı kişisel web sitesi.',
      en: 'A modern, high-performance personal website built with Next.js, multilingual support, and the Midnight Aurora design concept.'
    },
    tags: ['Next.js', 'CSS', 'i18n', 'MDX'],
    category: 'web',
    image: '/images/projects/portfolio.png',
    liveUrl: 'https://mustafaalisolmazgul.com.tr',
    githubUrl: null,
    featured: true
  },
  {
    id: 3,
    slug: 'ai-trading-bot',
    title: {
      tr: 'AI Trading Bot',
      en: 'AI Trading Bot'
    },
    description: {
      tr: 'Makine öğrenmesi algoritmaları kullanarak piyasa analizleri yapan ve otomatik alım-satım stratejileri üreten bir yapay zeka botu.',
      en: 'An AI bot that performs market analysis using machine learning algorithms and generates automated trading strategies.'
    },
    tags: ['Python', 'TensorFlow', 'API', 'Data Science'],
    category: 'ai',
    image: '/images/projects/trading-bot.png',
    liveUrl: null,
    githubUrl: null,
    featured: true
  },
  {
    id: 4,
    slug: 'task-manager',
    title: {
      tr: 'Görev Yöneticisi',
      en: 'Task Manager'
    },
    description: {
      tr: 'Drag-and-drop arayüzlü, ekip iş birliği özellikli modern bir proje yönetim aracı.',
      en: 'A modern project management tool with drag-and-drop interface and team collaboration features.'
    },
    tags: ['React', 'Node.js', 'MongoDB', 'Socket.io'],
    category: 'web',
    image: '/images/projects/task-manager.png',
    liveUrl: null,
    githubUrl: null,
    featured: false
  }
];

export const categories = [
  { id: 'all', label: { tr: 'Tümü', en: 'All' } },
  { id: 'web', label: { tr: 'Web', en: 'Web' } },
  { id: 'ai', label: { tr: 'Yapay Zeka', en: 'AI' } },
  { id: 'mobile', label: { tr: 'Mobil', en: 'Mobile' } }
];
