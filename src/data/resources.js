export const resources = [
  {
    id: 'ai-llm',
    category: 'AI & LLM',
    category_tr: 'Yapay Zeka & LLM',
    items: [
      {
        name: 'OpenRouter',
        description: 'One API to access many free models like DeepSeek R1/V3, Llama 3, and Phi. Perfect for cost-effective AI logic.',
        description_tr: 'DeepSeek R1/V3, Llama 3 ve Phi gibi birçok ücretsiz modele tek bir API üzerinden erişim sağlar. Maliyeti düşük tutmak için idealdir.',
        url: 'https://openrouter.ai/models?q=free',
        tags: ['Free Models', 'API', 'LLM']
      },
      {
        name: 'Langfuse',
        description: 'If you scale your AI features, this helps you debug and monitor LLM calls. (50k observations/mo).',
        description_tr: 'AI özelliklerinizi büyüttüğünüzde, LLM çağrılarını hata ayıklamanıza ve izlemenize yardımcı olur. (Aylık 50 bin gözlem ücretsiz).',
        url: 'https://langfuse.com/',
        tags: ['Observability', 'LLMOps', 'Monitoring']
      },
      {
        name: 'Pollinations.AI',
        description: 'Entirely free image generation via API. No keys required.',
        description_tr: 'API üzerinden tamamen ücretsiz görsel oluşturma imkanı sunar. Anahtar (API key) gerektirmez.',
        url: 'https://pollinations.ai/',
        tags: ['Image Gen', 'API', 'No-Auth']
      },
      {
        name: 'Composio',
        description: 'Integrate AI Agents with over 100+ tools like GitHub, Slack, and more.',
        description_tr: 'AI Ajanlarınızı GitHub, Slack gibi 100\'den fazla araçla entegre etmenizi sağlar.',
        url: 'https://composio.dev/',
        tags: ['AI Agents', 'Automation', 'Tools']
      }
    ]
  },
  {
    id: 'managed-databases',
    category: 'Managed Databases',
    category_tr: 'Yönetilen Veritabanları',
    items: [
      {
        name: 'Neon',
        description: 'Serverless Postgres. It scales to zero when not in use, making it ideal for Next.js projects.',
        description_tr: 'Sunucusuz (Serverless) Postgres. Kullanılmadığında kendini kapatır ve Next.js projeleri için mükemmel bir seçimdir.',
        url: 'https://neon.tech/',
        tags: ['Postgres', 'Serverless', 'Next.js']
      },
      {
        name: 'Aiven',
        description: 'Managed PostgreSQL, MySQL, and Redis with free plans.',
        description_tr: 'MySQL, PostgreSQL ve hatta Redis için ücretsiz planlar sunar.',
        url: 'https://aiven.io/',
        tags: ['Postgres', 'MySQL', 'Redis']
      },
      {
        name: 'CockroachDB Cloud',
        description: 'Distributed SQL database with a generous 10GB free tier.',
        description_tr: '10GB depolama alanı sunan dağıtık SQL veritabanı. Finansal veri yapıları için uygundur.',
        url: 'https://www.cockroachlabs.com/pricing/',
        tags: ['SQL', 'Scalable', 'Cloud']
      },
      {
        name: 'Nile',
        description: 'A Postgres platform specifically built for B2B/multi-tenant apps.',
        description_tr: 'Özellikle B2B ve çok kiracılı (multi-tenant) uygulamalar için tasarlanmış bir Postgres platformudur.',
        url: 'https://www.thenile.dev/',
        tags: ['Postgres', 'B2B', 'Multi-tenant']
      }
    ]
  },
  {
    id: 'hosting-infra',
    category: 'Hosting & Infra',
    category_tr: 'Hosting & Altyapı',
    items: [
      {
        name: 'Render',
        description: 'Unified cloud for apps and sites with free plans for web services and databases.',
        description_tr: 'Web servisleri ve veritabanları için ücretsiz planlar sunan bulut platformu. Vercel\'e harika bir alternatiftir.',
        url: 'https://render.com',
        tags: ['Cloud', 'Deployment', 'Backend']
      },
      {
        name: 'Railway',
        description: 'Excellent DX. Provides $5 free credits monthly for any type of containerized app.',
        description_tr: 'Harika bir geliştirici deneyimi sunar. Her türlü konteyner tabanlı uygulama için aylık 5 dolarlık ücretsiz kredi sağlar.',
        url: 'https://railway.app/',
        tags: ['PaaS', 'Container', 'Credits']
      },
      {
        name: 'BrowserCat',
        description: 'Headless browser API for scraping and automation (1k requests/mo free).',
        description_tr: 'Web\'den veri çekme (scraping) ve otomasyon için headless tarayıcı API\'si (aylık 1000 ücretsiz istek).',
        url: 'https://www.browsercat.com',
        tags: ['Scraping', 'Headless', 'Automation']
      }
    ]
  },
  {
    id: 'analytics-monitoring',
    category: 'Analytics & Monitoring',
    category_tr: 'Analitik & İzleme',
    items: [
      {
        name: 'PostHog',
        description: 'Product analytics, session recording, and feature flags (1m events/mo free).',
        description_tr: 'Çok güçlü ürün analitiği, oturum kaydı ve özellik bayrakları (aylık 1 milyon etkinlik ücretsiz).',
        url: 'https://posthog.com',
        tags: ['Analytics', 'Product', 'UX']
      },
      {
        name: 'LogSpot',
        description: 'Unified analytics with robots for Slack/Telegram alerts.',
        description_tr: 'Slack ve Telegram botlarıyla entegre analitik platformu. Anlık uyarılar almak için iyidir.',
        url: 'https://logspot.io',
        tags: ['Logging', 'Alerts', 'Real-time']
      },
      {
        name: 'GoatCounter',
        description: 'Privacy-focused web analytics alternative to Google Analytics.',
        description_tr: 'Basit ve gizlilik odaklı web analitiği. Google Analytics alternatifi.',
        url: 'https://www.goatcounter.com/',
        tags: ['Privacy', 'Analytics', 'Lightweight']
      }
    ]
  }
];
