import { supabase as _supabase } from '../utils/supabaseClient';
import restorationImg from '../assets/prompts/restoration.png';
import videoImg from '../assets/prompts/video.png';
import mediaImg from '../assets/prompts/media.png';

const STORAGE_KEY = 'resume_site_data';

// One-time clear of all current users list from database as per user request
if (!localStorage.getItem('db_users_cleared_may7')) {
  localStorage.setItem('registered_users', JSON.stringify({}));
  localStorage.removeItem('user_session');
  localStorage.removeItem('user_cards');
  localStorage.removeItem('hasPurchasedPrompts');
  
  // Clear all purchased and payment status keys
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('purchased_') || key.startsWith('payment_status_') || key.startsWith('completed_vids_') || key.startsWith('otp_')) {
      localStorage.removeItem(key);
    }
  });

  // Clear messages inside STORAGE_KEY
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      parsed.messages = [
        { id: 'm-1', text: "Assalomu alaykum! Kursga xush kelibsiz. Tushunmagan joylaringiz bo'lsa shu yerda so'rashingiz mumkin.", isAdmin: true, userId: 'system', userName: 'Admin', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch (e) {
    console.error(e);
  }

  localStorage.setItem('db_users_cleared_may7', 'true');
}


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
      image: restorationImg,
      isFree: true
    },
    {
      id: 'p-2',
      category: 'Video',
      title: 'Cinematic Sci-Fi City Reveal',
      prompt: 'Drone shot flying over a futuristic cyberpunk city at neon-lit night, flying cars, rain reflecting neon lights, cinematic lighting, photorealistic, Unreal Engine 5 render style.',
      image: videoImg,
      isFree: false
    },
    {
      id: 'p-3',
      category: 'Media',
      title: 'Luxury Perfume Product Ad',
      prompt: 'A sleek, modern 3D advertising graphic for a luxury perfume bottle. The background is a minimalist silk texture with soft studio lighting, gold accents, and a premium feel. Professional commercial photography style.',
      image: mediaImg,
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
      
      // Clean old hardcoded paths in local storage if they exist
      if (parsed.prompts) {
        parsed.prompts = parsed.prompts.map(p => {
          if (p.id === 'p-1' && (!p.image || p.image.includes('/src/assets/prompts/restoration.png'))) {
            p.image = restorationImg;
          }
          if (p.id === 'p-2' && (!p.image || p.image.includes('/src/assets/prompts/video.png'))) {
            p.image = videoImg;
          }
          if (p.id === 'p-3' && (!p.image || p.image.includes('/src/assets/prompts/media.png'))) {
            p.image = mediaImg;
          }
          return p;
        });
      }
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
  getCourses: async () => {
    try {
      if (_supabase) {
        const { data, error } = await _supabase.from('courses').select('*').order('created_at', { ascending: true });
        if (!error && data) {
          return data.map(c => ({
            id: c.id,
            title: c.title,
            duration: c.duration,
            price: c.price,
            discountPrice: c.discount_price || '',
            description: c.description,
            features: Array.isArray(c.features) ? c.features : [],
            videoCount: c.video_count || 0,
            videos: Array.isArray(c.videos) ? c.videos : []
          }));
        }
      }
    } catch (e) {
      console.warn("Supabase getCourses error, falling back to localStorage:", e);
    }
    return loadData().courses;
  },
  
  addCourse: async (course) => {
    const newCourse = { ...course, id: `course-${Date.now()}` };
    try {
      if (_supabase) {
        const { error } = await _supabase.from('courses').insert([{
          id: newCourse.id,
          title: newCourse.title,
          duration: newCourse.duration,
          price: newCourse.price,
          discount_price: newCourse.discountPrice || null,
          description: newCourse.description,
          features: newCourse.features,
          video_count: newCourse.videoCount || 0,
          videos: newCourse.videos || []
        }]);
        if (!error) {
          const data = loadData();
          data.courses.push(newCourse);
          saveData(data);
          return newCourse;
        }
      }
    } catch (e) {
      console.warn("Supabase addCourse error:", e);
    }
    const data = loadData();
    data.courses.push(newCourse);
    saveData(data);
    return newCourse;
  },
  
  updateCourse: async (id, updatedCourse) => {
    try {
      if (_supabase) {
        const { error } = await _supabase.from('courses').update({
          title: updatedCourse.title,
          duration: updatedCourse.duration,
          price: updatedCourse.price,
          discount_price: updatedCourse.discountPrice || null,
          description: updatedCourse.description,
          features: updatedCourse.features,
          video_count: updatedCourse.videoCount || 0,
          videos: updatedCourse.videos || []
        }).eq('id', id);
        if (!error) {
          const data = loadData();
          const index = data.courses.findIndex(c => c.id === id);
          if (index !== -1) {
            data.courses[index] = { ...data.courses[index], ...updatedCourse };
            saveData(data);
          }
          return;
        }
      }
    } catch (e) {
      console.warn("Supabase updateCourse error:", e);
    }
    const data = loadData();
    const index = data.courses.findIndex(c => c.id === id);
    if (index !== -1) {
      data.courses[index] = { ...data.courses[index], ...updatedCourse };
      saveData(data);
    }
  },
  
  deleteCourse: async (id) => {
    try {
      if (_supabase) {
        const { error } = await _supabase.from('courses').delete().eq('id', id);
        if (!error) {
          const data = loadData();
          data.courses = data.courses.filter(c => c.id !== id);
          saveData(data);
          return;
        }
      }
    } catch (e) {
      console.warn("Supabase deleteCourse error:", e);
    }
    const data = loadData();
    data.courses = data.courses.filter(c => c.id !== id);
    saveData(data);
  },

  // PROMPTS
  getPrompts: async () => {
    try {
      if (_supabase) {
        const { data, error } = await _supabase.from('prompts').select('*').order('created_at', { ascending: true });
        if (!error && data) {
          return data.map(p => ({
            id: p.id,
            category: p.category,
            title: p.title,
            prompt: p.prompt,
            image: p.image,
            isFree: p.is_free
          }));
        }
      }
    } catch (e) {
      console.warn("Supabase getPrompts error, falling back to localStorage:", e);
    }
    return loadData().prompts;
  },
  
  addPrompt: async (prompt) => {
    const newPrompt = { ...prompt, isFree: prompt.isFree || false, id: `prompt-${Date.now()}` };
    try {
      if (_supabase) {
        const { error } = await _supabase.from('prompts').insert([{
          id: newPrompt.id,
          category: newPrompt.category,
          title: newPrompt.title,
          prompt: newPrompt.prompt,
          image: newPrompt.image || null,
          is_free: newPrompt.isFree
        }]);
        if (!error) {
          const data = loadData();
          data.prompts.push(newPrompt);
          saveData(data);
          return newPrompt;
        }
      }
    } catch (e) {
      console.warn("Supabase addPrompt error:", e);
    }
    const data = loadData();
    data.prompts.push(newPrompt);
    saveData(data);
    return newPrompt;
  },
  
  updatePrompt: async (id, updatedPrompt) => {
    try {
      if (_supabase) {
        const { error } = await _supabase.from('prompts').update({
          category: updatedPrompt.category,
          title: updatedPrompt.title,
          prompt: updatedPrompt.prompt,
          image: updatedPrompt.image || null,
          is_free: updatedPrompt.isFree
        }).eq('id', id);
        if (!error) {
          const data = loadData();
          const index = data.prompts.findIndex(p => p.id === id);
          if (index !== -1) {
            data.prompts[index] = { ...data.prompts[index], ...updatedPrompt };
            saveData(data);
          }
          return;
        }
      }
    } catch (e) {
      console.warn("Supabase updatePrompt error:", e);
    }
    const data = loadData();
    const index = data.prompts.findIndex(p => p.id === id);
    if (index !== -1) {
      data.prompts[index] = { ...data.prompts[index], ...updatedPrompt };
      saveData(data);
    }
  },
  
  deletePrompt: async (id) => {
    try {
      if (_supabase) {
        const { error } = await _supabase.from('prompts').delete().eq('id', id);
        if (!error) {
          const data = loadData();
          data.prompts = data.prompts.filter(p => p.id !== id);
          saveData(data);
          return;
        }
      }
    } catch (e) {
      console.warn("Supabase deletePrompt error:", e);
    }
    const data = loadData();
    data.prompts = data.prompts.filter(p => p.id !== id);
    saveData(data);
  },

  // STATS & ANALYTICS
  getStats: async () => {
    const data = loadData();
    let realVisitors = data.stats.visitors;
    let todayVisits = 0;
    
    try {
      if (_supabase) {
        const { count: totalCount, error: errTotal } = await _supabase.from('visits').select('*', { count: 'exact', head: true });
        if (!errTotal && totalCount !== null) {
          realVisitors = totalCount;
        }

        const todayStart = new Date();
        todayStart.setHours(0,0,0,0);
        const { count: tCount, error: errToday } = await _supabase.from('visits').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString());
        if (!errToday && tCount !== null) {
          todayVisits = tCount;
        }
      }
    } catch (e) {
      console.warn("Supabase getStats error, falling back to localStorage stats:", e);
      const today = new Date().toISOString().split('T')[0];
      todayVisits = data.stats.dailyVisits[today] || 0;
    }

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
  
  incrementVisit: async () => {
    const data = loadData();
    if (!sessionStorage.getItem('visited')) {
      const today = new Date().toISOString().split('T')[0];
      data.stats.visitors += 1;
      data.stats.dailyVisits[today] = (data.stats.dailyVisits[today] || 0) + 1;
      saveData(data);
      sessionStorage.setItem('visited', 'true');

      try {
        if (_supabase) {
          await _supabase.from('visits').insert([{}]);
        }
      } catch (e) {
        console.warn("Supabase incrementVisit sync failed:", e);
      }
    }
  },
  
  registerSale: async (courseId) => {
    const data = loadData();
    data.stats.sales += 1;
    if (courseId) {
      data.stats.courseSales[courseId] = (data.stats.courseSales[courseId] || 0) + 1;
    }
    saveData(data);
  },

  // PRICING PLANS
  getPricingPlans: async () => {
    try {
      if (_supabase) {
        const { data, error } = await _supabase.from('pricing_plans').select('*').order('created_at', { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map(p => ({
            id: p.id,
            title: p.title,
            price: p.price,
            discountPrice: p.discount_price || '',
            duration: p.duration,
            features: Array.isArray(p.features) ? p.features : [],
            color: p.color,
            featured: p.featured
          }));
        }
      }
    } catch (e) {
      console.warn("Supabase getPricingPlans error, falling back:", e);
    }
    return loadData().pricingPlans;
  },
  
  updatePricingPlan: async (id, updatedPlan) => {
    try {
      if (_supabase) {
        const updateObj = {};
        if (updatedPlan.title !== undefined) updateObj.title = updatedPlan.title;
        if (updatedPlan.price !== undefined) updateObj.price = updatedPlan.price;
        if (updatedPlan.discountPrice !== undefined) updateObj.discount_price = updatedPlan.discountPrice;
        if (updatedPlan.duration !== undefined) updateObj.duration = updatedPlan.duration;
        if (updatedPlan.features !== undefined) updateObj.features = updatedPlan.features;
        if (updatedPlan.color !== undefined) updateObj.color = updatedPlan.color;
        if (updatedPlan.featured !== undefined) updateObj.featured = updatedPlan.featured;

        const { error } = await _supabase.from('pricing_plans').update(updateObj).eq('id', id);
        if (!error) {
          const data = loadData();
          const index = data.pricingPlans.findIndex(p => p.id === id);
          if (index !== -1) {
            data.pricingPlans[index] = { ...data.pricingPlans[index], ...updatedPlan };
            saveData(data);
          }
          return;
        }
      }
    } catch (e) {
      console.warn("Supabase updatePricingPlan error:", e);
    }
    const data = loadData();
    const index = data.pricingPlans.findIndex(p => p.id === id);
    if (index !== -1) {
      data.pricingPlans[index] = { ...data.pricingPlans[index], ...updatedPlan };
      saveData(data);
    }
  },

  // MESSAGES (Chat) - per-user threads
  getMessages: async () => {
    try {
      if (_supabase) {
        const { data, error } = await _supabase.from('chat_messages').select('*').order('created_at', { ascending: true });
        if (!error && data) {
          return data.map(m => ({
            id: m.id,
            text: m.text,
            isAdmin: m.is_admin,
            userId: m.user_id,
            targetUserId: m.target_user_id,
            userName: m.user_name,
            time: m.time
          }));
        }
      }
    } catch (e) {
      console.warn("Supabase getMessages error, falling back:", e);
    }
    return loadData().messages;
  },
  
  getMessagesByUser: async (userId) => {
    const all = await dataService.getMessages();
    return all.filter(m => 
      (m.isAdmin && m.userId === 'system') || 
      m.userId === userId ||
      (m.isAdmin && m.targetUserId === userId)
    );
  },
  
  getAllUserThreads: async () => {
    const all = await dataService.getMessages();
    const threads = {};
    
    all.forEach(m => {
      if (!m.isAdmin && m.userId && m.userId !== 'system') {
        if (!threads[m.userId]) {
          threads[m.userId] = { userId: m.userId, userName: m.userName || m.userId, messages: [], lastTime: m.time };
        }
      }
    });

    all.forEach(m => {
      if (!m.isAdmin && threads[m.userId]) {
        threads[m.userId].messages.push(m);
        threads[m.userId].lastTime = m.time;
      } else if (m.isAdmin && m.targetUserId && threads[m.targetUserId]) {
        threads[m.targetUserId].messages.push(m);
        threads[m.targetUserId].lastTime = m.time;
      }
    });

    return Object.values(threads).sort((a, b) => new Date('1970/01/01 ' + b.lastTime) - new Date('1970/01/01 ' + a.lastTime));
  },
  
  addMessage: async (text, isAdmin = false, userId = 'anonymous', userName = '') => {
    const newMsg = {
      id: Date.now().toString(),
      text,
      isAdmin,
      userId: isAdmin ? 'admin' : userId,
      targetUserId: isAdmin ? userId : null,
      userName: isAdmin ? 'Admin' : (userName || userId),
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    try {
      if (_supabase) {
        const { error } = await _supabase.from('chat_messages').insert([{
          id: newMsg.id,
          text: newMsg.text,
          is_admin: newMsg.isAdmin,
          user_id: newMsg.userId,
          target_user_id: newMsg.targetUserId,
          user_name: newMsg.userName,
          time: newMsg.time
        }]);
        if (!error) {
          const data = loadData();
          data.messages.push(newMsg);
          saveData(data);
          return newMsg;
        }
      }
    } catch (e) {
      console.warn("Supabase addMessage error:", e);
    }

    const data = loadData();
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
