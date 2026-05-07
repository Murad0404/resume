import { supabase as _supabase } from '../utils/supabaseClient';

const STORAGE_KEY = 'resume_site_data';

// Convert any YouTube URL to embed format
export const toYouTubeEmbed = (url) => {
  if (!url) return '';
  // Already embed
  if (url.includes('youtube.com/embed/')) return url;
  // Short link: youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  // Standard: youtube.com/watch?v=VIDEO_ID
  const fullMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (fullMatch) return `https://www.youtube.com/embed/${fullMatch[1]}`;
  return url;
};

// Initial seed data
const defaultData = {
  courses: [
    {
      id: 'module-1',
      title: '1-Modul: AI Vositalar (Amaliy)',
      duration: '2 oy',
      price: '700 000 UZS',
      discountPrice: '500 000 UZS', // added discount
      description: 'AI yordamida rasm va video generatsiya qilish, eski rasmlarni tiklash, va qaysi AI qaysi soha uchun yaxshiligi — hammasi amaliy misollar bilan.',
      features: [
        '🎨 AI bilan rasm generatsiya (Midjourney, DALL-E, Stable Diffusion)',
        '🎬 AI bilan video generatsiya (Sora, Runway, Kling)',
        '🖼️ Eski foto va rasmlarni AI orqali tiklash',
        '🤖 Qaysi AI qaysi sohada eng kuchli — taqqoslash',
        '💡 ChatGPT, Claude, Gemini — farqlari va foydalanish usullari',
      ],
      videoCount: 14,
      videos: [] // videos inside
    },
    {
      id: 'module-2',
      title: '2-Modul: AI Bilan Dasturlash & Prompting',
      duration: '2 oy',
      price: '700 000 UZS',
      description: "AI yordamida Frontend va Backend kod yozish, to'g'ri va optimal prompt tuzish, AI limitlarini tejab ishlash va eng foydali AI workflow strategiyalari.",
      features: [
        '⚡ AI bilan Frontend (React, HTML/CSS) tez qurish',
        '🔧 AI bilan Backend (API, DB) logika yozish',
        "📝 To'g'ri prompt berish (Prompt Engineering asoslari)",
        '🔋 Limitdan samarali foydalanish — tokenni tejash usullari',
        '🚀 AI workflow: loyihada AI ni qanday integratsiya qilish',
      ],
      videoCount: 16,
      videos: []
    }
  ],
  prompts: [
    {
      id: 'p-1',
      category: 'Restoration',
      title: 'Professional Old Photo Restoration',
      prompt: 'A highly detailed restoration of a vintage 1920s photograph. Remove scratches, enhance facial features naturally, keep the sepia tone but increase dynamic range. 8k resolution, realistic textures.',
      image: '/src/assets/prompts/restoration.png',
      isFree: true
    },
    {
      id: 'p-2',
      category: 'Video',
      title: 'Cinematic Sci-Fi City Reveal',
      prompt: 'Drone shot flying over a futuristic cyberpunk city at neon-lit night, flying cars, rain reflecting neon lights, cinematic lighting, photorealistic, Unreal Engine 5 render style.',
      image: '/src/assets/prompts/video.png',
      isFree: false
    },
    {
      id: 'p-3',
      category: 'Media',
      title: 'Luxury Perfume Product Ad',
      prompt: 'A sleek, modern 3D advertising graphic for a luxury perfume bottle. The background is a minimalist silk texture with soft studio lighting, gold accents, and a premium feel. Professional commercial photography style.',
      image: '/src/assets/prompts/media.png',
      isFree: false
    }
  ],
  stats: {
    visitors: 125, // Total
    dailyVisits: {}, // { 'YYYY-MM-DD': count }
    sales: 14,     // Total
    courseSales: { 'module-1': 10, 'module-2': 4 } // Sales per course
  },
  messages: [
    { id: 'm-1', text: "Assalomu alaykum! Kursga xush kelibsiz. Tushunmagan joylaringiz bo'lsa shu yerda so'rashingiz mumkin.", isAdmin: true, userId: 'system', userName: 'Admin', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ],
  pricingPlans: [
    {
      id: 'six-months',
      title: '6 Oylik',
      price: '1.50',
      discountPrice: '',
      duration: '6 Months',
      features: [
        "Barcha promtlarga ruxsat",
        "Yangi promtlar qo'shilib boradi",
        "Texnik yordam"
      ],
      color: '#3b82f6'
    },
    {
      id: 'lifetime',
      title: 'Umrbod',
      price: '3.50',
      discountPrice: '2.99',
      duration: 'Lifetime',
      features: [
        "Barcha promtlarga ruxsat",
        "Umrbod yangilanishlar",
        "Texnik yordam",
        "Priority Support"
      ],
      color: '#8b5cf6',
      featured: true
    }
  ]
};

// Initialize or load data
const loadData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Data migration to ensure new structures exist
      if (!parsed.stats.dailyVisits) parsed.stats.dailyVisits = {};
      if (!parsed.stats.courseSales) parsed.stats.courseSales = {};
      if (!parsed.messages) parsed.messages = defaultData.messages;
      if (!parsed.pricingPlans) parsed.pricingPlans = defaultData.pricingPlans;
      return parsed;
    }
    // Save default if not exists
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return defaultData;
  } catch (e) {
    console.error("Local storage error", e);
    return defaultData;
  }
};

const saveData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const dataService = {
  // COURSES
  getCourses: () => {
    return loadData().courses;
  },
  addCourse: (course) => {
    const data = loadData();
    const newCourse = { ...course, id: `course-${Date.now()}` };
    data.courses.push(newCourse);
    saveData(data);
    return newCourse;
  },
  updateCourse: (id, updatedCourse) => {
    const data = loadData();
    const index = data.courses.findIndex(c => c.id === id);
    if (index !== -1) {
      data.courses[index] = { ...data.courses[index], ...updatedCourse };
      saveData(data);
    }
  },
  deleteCourse: (id) => {
    const data = loadData();
    data.courses = data.courses.filter(c => c.id !== id);
    saveData(data);
  },

  // PROMPTS
  getPrompts: () => {
    return loadData().prompts;
  },
  addPrompt: (prompt) => {
    const data = loadData();
    const newPrompt = { ...prompt, isFree: prompt.isFree || false, id: `prompt-${Date.now()}` };
    data.prompts.push(newPrompt);
    saveData(data);
    return newPrompt;
  },
  updatePrompt: (id, updatedPrompt) => {
    const data = loadData();
    const index = data.prompts.findIndex(p => p.id === id);
    if (index !== -1) {
      data.prompts[index] = { ...data.prompts[index], ...updatedPrompt };
      saveData(data);
    }
  },
  deletePrompt: (id) => {
    const data = loadData();
    data.prompts = data.prompts.filter(p => p.id !== id);
    saveData(data);
  },

  // STATS & ANALYTICS
  getStats: async () => {
    const data = loadData();
    let realVisitors = data.stats.visitors;
    
    // Fallback: If Supabase works, we might try to fetch real stats, but localStorage is reliable for now.
    const today = new Date().toISOString().split('T')[0];
    const todayVisits = data.stats.dailyVisits[today] || 0;

    // Get registered users from localStorage
    const usersStr = localStorage.getItem('registered_users');
    const users = usersStr ? JSON.parse(usersStr) : {};
    const registeredUsersCount = Object.keys(users).length;

    return {
      visitors: realVisitors,
      todayVisits: todayVisits,
      sales: data.stats.sales,
      courseSales: data.stats.courseSales,
      dailyVisits: data.stats.dailyVisits,
      registeredUsers: registeredUsersCount
    };
  },
  
  incrementVisit: () => {
    const data = loadData();
    // Check session to prevent multiple increments on reload in same session
    if (!sessionStorage.getItem('visited')) {
      const today = new Date().toISOString().split('T')[0];
      data.stats.visitors += 1;
      data.stats.dailyVisits[today] = (data.stats.dailyVisits[today] || 0) + 1;
      saveData(data);
      sessionStorage.setItem('visited', 'true');
    }
  },
  
  registerSale: (courseId) => {
    const data = loadData();
    data.stats.sales += 1;
    if (courseId) {
      data.stats.courseSales[courseId] = (data.stats.courseSales[courseId] || 0) + 1;
    }
    saveData(data);
  },

  // PRICING PLANS
  getPricingPlans: () => {
    return loadData().pricingPlans;
  },
  updatePricingPlan: (id, updatedPlan) => {
    const data = loadData();
    const index = data.pricingPlans.findIndex(p => p.id === id);
    if (index !== -1) {
      data.pricingPlans[index] = { ...data.pricingPlans[index], ...updatedPlan };
      saveData(data);
    }
  },

  // MESSAGES (Chat) — per-user threads
  getMessages: () => {
    return loadData().messages;
  },
  getMessagesByUser: (userId) => {
    const all = loadData().messages;
    return all.filter(m => 
      // System message to all
      (m.isAdmin && m.userId === 'system') || 
      // User's own messages
      m.userId === userId ||
      // Admin's direct reply to the user
      (m.isAdmin && m.targetUserId === userId)
    );
  },
  getAllUserThreads: () => {
    const all = loadData().messages;
    const threads = {};
    
    // First pass: create thread objects for all users who have sent a message
    all.forEach(m => {
      if (!m.isAdmin && m.userId && m.userId !== 'system') {
        if (!threads[m.userId]) {
          threads[m.userId] = { userId: m.userId, userName: m.userName || m.userId, messages: [], lastTime: m.time };
        }
      }
    });

    // Second pass: add messages to their respective threads
    all.forEach(m => {
      if (!m.isAdmin && threads[m.userId]) {
        threads[m.userId].messages.push(m);
        threads[m.userId].lastTime = m.time;
      } else if (m.isAdmin && m.targetUserId && threads[m.targetUserId]) {
        threads[m.targetUserId].messages.push(m);
        threads[m.targetUserId].lastTime = m.time;
      }
    });

    // Sort by lastTime descending if needed (optional)
    return Object.values(threads).sort((a, b) => new Date('1970/01/01 ' + b.lastTime) - new Date('1970/01/01 ' + a.lastTime));
  },
  addMessage: (text, isAdmin = false, userId = 'anonymous', userName = '') => {
    const data = loadData();
    const newMsg = {
      id: Date.now().toString(),
      text,
      isAdmin,
      userId: isAdmin ? 'admin' : userId,
      targetUserId: isAdmin ? userId : null, // Store who the admin is replying to
      userName: isAdmin ? 'Admin' : (userName || userId),
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    data.messages.push(newMsg);
    saveData(data);
    return newMsg;
  },

  // CARDS (User Payment Methods)
  getCards: () => {
    const stored = localStorage.getItem('user_cards');
    return stored ? JSON.parse(stored) : [];
  },
  addCard: (card) => {
    const cards = dataService.getCards();
    const newCard = { ...card, id: `card-${Date.now()}` };
    cards.push(newCard);
    localStorage.setItem('user_cards', JSON.stringify(cards));
    return newCard;
  },
  deleteCard: (id) => {
    const cards = dataService.getCards();
    const filtered = cards.filter(c => c.id !== id);
    localStorage.setItem('user_cards', JSON.stringify(filtered));
  }
};
