import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Copy, CheckCircle, Sparkles, Layout, Clock, ArrowRight, Bot, Sliders, RefreshCw, Plus, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { otpService } from '../services/otpService';
import { useLanguage } from '../contexts/LanguageContext';

const PromptDashboard = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [prompts, setPrompts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Barchasi');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [session, setSession] = useState(() => otpService.getSession());

  // Tabs
  const [activeTab, setActiveTab] = useState('database'); // 'database' or 'ai_assistant'
  
  // AI Generator state
  const [aiInput, setAiInput] = useState('');
  const [aiModel, setAiModel] = useState('gpt4o');
  const [aiStyle, setAiStyle] = useState('cinematic');
  const [aiRatio, setAiRatio] = useState('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Semantic Search state
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [semanticMatches, setSemanticMatches] = useState(null); // array of matched IDs or null
  const [aiSuggestedPrompts, setAiSuggestedPrompts] = useState([]); // suggested prompts on the fly
  const [searchMode, setSearchMode] = useState('idle'); // 'idle' | 'typing' | 'searching' | 'done'
  const debounceTimer = useRef(null);

  useEffect(() => {
    // Check access
    const hasAccess = localStorage.getItem('hasPurchasedPrompts') === 'true';
    if (!hasAccess && !session) {
      navigate('/prompts');
      return;
    }
    const fetchPrompts = async () => {
      const data = await dataService.getPrompts();
      setPrompts(data || []);
    };
    fetchPrompts();
  }, [navigate, session]);

  const categories = ['Barchasi', ...new Set(prompts.map(p => p.category))];

  const filteredPrompts = prompts.filter(p => {
    if (semanticMatches !== null) {
      return semanticMatches.includes(p.id);
    }
    const matchesCategory = activeCategory === 'Barchasi' || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getLocalFallbackPrompt = (input, model, style, ratio) => {
    const cleanInput = input || "Beautiful landscape";
    const title = `AI ${style.charAt(0).toUpperCase() + style.slice(1)} ${model.charAt(0).toUpperCase() + model.slice(1)}`;
    
    let enhanced = cleanInput;
    let negative = "blurry, low quality, deformed, low resolution, bad hands, mutated, extra fingers";
    let explanation = "Sun'iy intellekt orqali professional darajadagi va yuqori aniqlikdagi kalit so'zlar qo'shildi.";
    
    const styleKeywords = {
      cinematic: "cinematic lighting, dramatic atmosphere, 8k resolution, shot on 35mm lens, highly detailed, photorealistic, color graded",
      photorealistic: "photorealistic, hyper-detailed, 8k, realistic textures, volumetric lighting, DSLR, f/1.8, high dynamic range",
      anime: "vibrant anime style, beautifully detailed 2D illustration, studio ghibli or makoto shinkai aesthetic, colorful, masterpiece",
      render3d: "unreal engine 5 render, octane render, 3D masterpiece, Ray Tracing, highly detailed, metallic textures, 4k",
      cyberpunk: "cyberpunk aesthetic, neon glowing lights, rainy night reflections, high-tech, futuristic street, dark atmosphere, ultra detailed",
      vector: "modern minimalist flat vector illustration, clean lines, SVG style, trendy colors, isolated graphic",
      vintage: "vintage film style, retro colors, old camera grain, nostalgic feel, warm sepia tone, classic 1970s look"
    };

    const modelSuffix = {
      midjourney: ` --ar ${ratio} --v 6.0 --stylize 250`,
      stablediffusion: `, hyper-detailed, 4k resolution, masterpiece`,
      dalle3: `, digital art, highly detailed, masterpieces`,
      sora: `, photorealistic, 60fps, smooth cinematic camera motion`,
      chatgpt: ` Write a comprehensive detailed explanation about this concept with step-by-step instructions.`,
      gpt4o: ` Be extremely detailed and creative. Return a structured response with visual elements, mood, and technical specifications.`,
      gemini: ` Ultra-detailed, Google DeepMind optimized, high fidelity, comprehensive visual description.`
    };

    enhanced = `${enhanced}, ${styleKeywords[style] || styleKeywords.photorealistic}${modelSuffix[model] || ''}`;
    
    return {
      title,
      optimizedPrompt: enhanced,
      negativePrompt: negative,
      explanation: lang === 'uz' ? explanation : "Добавлены высококачественные ключевые слова для профессионального результата."
    };
  };

  const generateAIPrompt = async (userInput, model, style, ratio) => {
    const systemPrompt = `You are an elite AI Prompt Engineer and Master of Generative Art. Your sole purpose is to take a simple description (which could be in Uzbek, Russian, or English) and transform it into an incredibly detailed, breathtaking, and professional-grade AI prompt in English.

CRITICAL RULES:
1. NEVER just repeat or echo back the user's input directly. That is unacceptable.
2. DEEPLY ANALYZE the concept and expand it with highly specific visual details: camera models, lens types (e.g., 85mm f/1.4, anamorphic), lighting setups (volumetric, dramatic chiaroscuro, studio softbox), surroundings, color grading, material textures, and environment details.
3. Keep the optimized prompt purely in English.
4. Adhere strictly to the requested Art Style and Target Model parameters (like aspect ratios, render engines, styles).

FEW-SHOT EXAMPLES:
- User Input: "yomg'irda qizil mashina" (red car in rain)
  Art Style: "cinematic"
  Target Model: "midjourney"
  Result: {
    "title": "Neon Rain Supercar",
    "optimizedPrompt": "A sleek, modern hypercar in crimson red, parked on a wet asphalt street of Tokyo during a heavy downpour, hyper-realistic water droplets on the metallic body, reflections of glowing cyberpunk neon signs in puddles, shot on 35mm camera, dramatic cinematic lighting, volumetric atmosphere, unreal engine 5 render, 8k resolution, photorealistic, color graded --ar 16:9 --v 6.0 --stylize 300",
    "negativePrompt": "blurry, low quality, cartoon, illustration, low-res, deformed wheels, bad lighting",
    "explanation": "Ushbu promtga yomg'ir tomchilari aks etishi, kiberpank neon chiroqlari va 35mm li kamera kabi detallar qo'shildi."
  }

- User Input: "kelajakdagi shahar" (future city)
  Art Style: "photorealistic"
  Target Model: "stablediffusion"
  Result: {
    "title": "Futuristic Metropolis",
    "optimizedPrompt": "A towering high-tech sci-fi metropolis with flying vehicles cruising between massive skyscrapers, glass and metallic textures, glowing holographic advertisements, lush vertical gardens hanging from balconies, cinematic dusk lighting, beautiful sunset casting long shadows, 8k, photorealistic, hyper-detailed, masterpiece",
    "negativePrompt": "old style, classic architecture, 2d, hand-drawn, low quality",
    "explanation": "Gologrammalar, uchar mashinalar va vertikal bog'lar kabi professional elementlar qo'shildi."
  }

The user's current chosen options are:
- Target Model: "${model}"
- Art Style/Preset: "${style}"
- Aspect Ratio: "${ratio}"

Generate the result for the user's input. You MUST return a JSON object with EXACTLY the following structure (do not include any other text, markdown blocks, or explanation outside the JSON):
{
  "title": "A short, catchy, professional title for the prompt",
  "optimizedPrompt": "Highly optimized and enriched English prompt following the critical rules above",
  "negativePrompt": "Appropriate negative prompts for this style",
  "explanation": "A 2-sentence explanation in Uzbek or Russian (matching the user's input language: ${lang}) explaining what key parameters were added and how to get the best result."
}
`;

    // Pick the actual AI engine based on target model
    const engineModel = model === 'gpt4o' ? 'openai' : model === 'gemini' ? 'gemini' : 'openai';

    try {
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Generate a prompt for: "${userInput}"` }
          ],
          model: engineModel,
          jsonMode: true
        })
      });

      if (!response.ok) throw new Error('API request failed');
      
      const text = await response.text();
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7);
      else if (cleanText.startsWith('```')) cleanText = cleanText.substring(3);
      if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3);
      cleanText = cleanText.trim();
      
      return JSON.parse(cleanText);
    } catch (error) {
      console.warn('Real AI failed, using fallback:', error);
      return getLocalFallbackPrompt(userInput, model, style, ratio);
    }
  };

  const handleAIGenerate = async () => {
    if (!aiInput.trim()) return;
    setIsGenerating(true);
    setGeneratedResult(null);
    setIsImageLoading(true);

    try {
      const result = await generateAIPrompt(aiInput, aiModel, aiStyle, aiRatio);
      setGeneratedResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGeneratedPrompt = async () => {
    if (!generatedResult) return;
    setIsSaving(true);
    
    const newPromptObj = {
      category: aiStyle.charAt(0).toUpperCase() + aiStyle.slice(1),
      title: generatedResult.title,
      prompt: generatedResult.optimizedPrompt,
      image: `https://image.pollinations.ai/prompt/${encodeURIComponent(generatedResult.optimizedPrompt)}?width=1024&height=1024&nologo=true`,
      isFree: false
    };

    await dataService.addPrompt(newPromptObj);
    const data = await dataService.getPrompts();
    setPrompts(data || []);
    
    setIsSaving(false);
    alert(lang === 'uz' ? "Promt muvaffaqiyatli kutubxonangizga saqlandi! Uni 'Promtlar To'plami' bo'limida ko'rishingiz mumkin." : "Промпт успешно сохранен в вашу библиотеку! Вы можете найти его в разделе 'Коллекция промптов'.");
  };

  const runSemanticSearch = async (query, currentPrompts) => {
    const promptsList = currentPrompts || prompts;
    if (!query.trim() || promptsList.length === 0) {
      setSemanticMatches(null);
      setAiSuggestedPrompts([]);
      setSearchMode('idle');
      return;
    }

    setIsSemanticSearching(true);
    setSearchMode('searching');
    setSemanticMatches([]);
    setAiSuggestedPrompts([]);

    // Send only compact data to avoid token limits
    const compactDb = promptsList.slice(0, 30).map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      keywords: p.prompt.substring(0, 120)
    }));

    const systemPrompt = `Semantic Prompt Matcher AI. Query: "${query}"
DB: ${JSON.stringify(compactDb)}
Find matching prompt IDs by concept/theme (not just keywords). Generate 2 new prompts.
Return ONLY JSON:
{"matchedIds":["id1"],"suggestedPrompts":[{"id":"suggested-11111","title":"Title","prompt":"detailed english prompt...","category":"Cat","isSuggested":true}]}`;

    try {
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query }
          ],
          model: 'openai',
          jsonMode: true
        })
      });

      if (!response.ok) throw new Error('API failed');

      const text = await response.text();
      let clean = text.trim();
      if (clean.startsWith('```json')) clean = clean.substring(7);
      else if (clean.startsWith('```')) clean = clean.substring(3);
      if (clean.endsWith('```')) clean = clean.substring(0, clean.length - 3);
      clean = clean.trim();

      const result = JSON.parse(clean);
      setSemanticMatches(result.matchedIds || []);
      setAiSuggestedPrompts(result.suggestedPrompts || []);
      setSearchMode('done');
    } catch (error) {
      console.warn('Semantic search failed:', error);
      setSemanticMatches(null);
      setAiSuggestedPrompts([]);
      setSearchMode('idle');
    } finally {
      setIsSemanticSearching(false);
    }
  };

  const handleSemanticSearch = () => runSemanticSearch(searchQuery, prompts);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setSearchMode('typing');
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!value.trim()) {
      setSemanticMatches(null);
      setAiSuggestedPrompts([]);
      setSearchMode('idle');
      return;
    }
    debounceTimer.current = setTimeout(() => {
      runSemanticSearch(value, prompts);
    }, 700);
  };

  const handleClearSearch = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setSearchQuery('');
    setSemanticMatches(null);
    setAiSuggestedPrompts([]);
    setSearchMode('idle');
  };

  const handleSaveSuggestedPrompt = async (suggested) => {
    const newPromptObj = {
      category: suggested.category,
      title: suggested.title,
      prompt: suggested.prompt,
      image: `https://image.pollinations.ai/prompt/${encodeURIComponent(suggested.prompt)}?width=1024&height=1024&nologo=true`,
      isFree: false
    };

    await dataService.addPrompt(newPromptObj);
    const data = await dataService.getPrompts();
    setPrompts(data || []);
    
    // Remove from recommended list since it's already saved
    setAiSuggestedPrompts(prev => prev.filter(p => p.id !== suggested.id));
    
    alert(lang === 'uz' ? "Tavsiya etilgan promt muvaffaqiyatli kutubxonangizga saqlandi! Uni 'Promtlar To'plami' bo'limida ko'rishingiz mumkin." : "Рекомендованный промпт успешно сохранен в вашу библиотеку!");
  };

  const getSubscriptionInfo = () => {
    const isLifetime = localStorage.getItem('purchased_lifetime') === 'true';
    const isSixMonths = localStorage.getItem('purchased_six-months') === 'true';
    const hasAnyAccess = localStorage.getItem('hasPurchasedPrompts') === 'true';
    
    if (isLifetime || (hasAnyAccess && !isSixMonths)) {
      return {
        type: 'lifetime',
        title: 'Umrbod',
        text: 'Barcha promtlar doim ochiq turadi'
      };
    } else if (isSixMonths) {
      let purchaseTime = parseInt(localStorage.getItem('purchased_six-months_at'));
      if (!purchaseTime) {
        try {
          const reqs = JSON.parse(localStorage.getItem('payment_requests') || '[]');
          const approvedSix = reqs.find(r => r.itemId === 'six-months' && r.status === 'approved');
          if (approvedSix) {
            const payIdStr = approvedSix.id.replace('pay-', '');
            purchaseTime = parseInt(payIdStr);
          }
        } catch (e) {}
      }
      if (!purchaseTime) {
        purchaseTime = Date.now() - 15 * 24 * 60 * 60 * 1000; // Fallback to 15 days ago for display
      }
      
      const totalDays = 180; // 6 months
      const msPerDay = 24 * 60 * 60 * 1000;
      const elapsedDays = Math.max(0, Math.floor((Date.now() - purchaseTime) / msPerDay));
      const remainingDays = Math.max(0, totalDays - elapsedDays);
      const remainingPercent = Math.max(0, Math.min(100, Math.round((remainingDays / totalDays) * 100)));
      
      return {
        type: 'six-months',
        title: '6 Oylik',
        remainingDays,
        totalDays,
        remainingPercent,
        isExpired: remainingDays <= 0
      };
    }
    
    return null;
  };

  const subInfo = getSubscriptionInfo();

  return (
    <div className="page-container" style={{ background: '#050505', minHeight: '100vh', color: '#fff' }}>
      <div className="bento-wrapper" style={{ paddingTop: '10rem', paddingBottom: '4rem' }}>
        
        {/* SUBSCRIPTION STATUS CARD */}
        {subInfo ? (
          subInfo.type === 'lifetime' ? (
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(90, 107, 250, 0.1) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '24px',
              padding: '2.5rem 2rem',
              marginBottom: '3rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
              boxShadow: '0 10px 30px rgba(139, 92, 246, 0.1)'
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '0.5rem' }}>
                  {lang === 'uz' ? 'FAOL TARIF' : 'АКТИВНЫЙ ТАРИФ'}
                </span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {lang === 'uz' ? 'Umrbod kirish' : 'Пожизненный доступ'} (Lifetime) <Sparkles size={24} color="#8b5cf6" />
                </h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', margin: '0.5rem 0 0 0', fontSize: '1rem' }}>
                  {lang === 'uz' ? 'Barcha professional promtlar doim ochiq turadi.' : 'Все профессиональные промпты всегда открыты.'}
                </p>
              </div>
              <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '0.75rem 1.5rem', borderRadius: '14px', color: '#8b5cf6', fontWeight: 800, fontSize: '0.9rem' }}>
                ♾️ {lang === 'uz' ? 'UMRBODGA' : 'ПОЖИЗНЕННО'}
              </div>
            </div>
          ) : (
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(90, 107, 250, 0.1) 100%)',
              border: subInfo.isExpired ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '24px',
              padding: '2.5rem 2rem',
              marginBottom: '3rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              boxShadow: subInfo.isExpired ? '0 10px 30px rgba(239, 68, 68, 0.1)' : '0 10px 30px rgba(59, 130, 246, 0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: subInfo.isExpired ? '#ef4444' : '#3b82f6', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '0.5rem' }}>
                    {lang === 'uz' ? 'OBUNA HOLATI' : 'СТАТУС ПОДПИСКИ'}
                  </span>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {lang === 'uz' ? '6 Oylik Obuna' : '6 Месячная Подписка'} <Clock size={24} color={subInfo.isExpired ? '#ef4444' : '#3b82f6'} />
                  </h2>
                </div>
                {!subInfo.isExpired ? (
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '0.75rem 1.5rem', borderRadius: '14px', color: '#3b82f6', fontWeight: 800, fontSize: '0.9rem' }}>
                    📅 {lang === 'uz' ? `Qolgan vaqt: ${subInfo.remainingDays} kun (${subInfo.remainingPercent}%)` : `Осталось: ${subInfo.remainingDays} дней (${subInfo.remainingPercent}%)`}
                  </div>
                ) : (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem 1.5rem', borderRadius: '14px', color: '#ef4444', fontWeight: 800, fontSize: '0.9rem' }}>
                    🚨 {lang === 'uz' ? 'OBUNA MUDDATI TUGADI' : 'СРОК ПОДПИСКИ ИСТЕК'}
                  </div>
                )}
              </div>

              {!subInfo.isExpired ? (
                <div style={{ width: '100%' }}>
                  <div style={{ height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${subInfo.remainingPercent}%` }} 
                      transition={{ duration: 1, ease: 'easeOut' }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }} 
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                    <span>0 {lang === 'uz' ? 'kun' : 'дней'}</span>
                    <span>{subInfo.totalDays} {lang === 'uz' ? 'kun (6 oy)' : 'дней (6 месяцев)'}</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                  <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '0.95rem', flex: 1 }}>
                    {lang === 'uz' ? 'Sizning obuna muddatingiz yakunlandi. Professional promtlardan foydalanishni davom ettirish uchun tarifni yangilang.' : 'Ваша подписка истекла. Пожалуйста, продлите подписку для дальнейшего использования.'}
                  </p>
                  <button 
                    onClick={() => navigate('/prompts')}
                    className="submit-form-btn" 
                    style={{ padding: '0.8rem 2rem', margin: 0, background: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    {lang === 'uz' ? 'Yana sotib olish' : 'Купить снова'} <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </div>
          )
        ) : (
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(90, 107, 250, 0.05) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            marginBottom: '3rem',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>
              {lang === 'uz' ? 'Obuna faol emas 🔒' : 'Подписка неактивна 🔒'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
              {lang === 'uz' ? 'Ushbu bo\'limdagi professional promtlardan foydalanish uchun tarif sotib olishingiz lozim.' : 'Пожалуйста, оформите подписку для доступа к профессиональным промптам.'}
            </p>
            <button 
              onClick={() => navigate('/prompts')}
              className="submit-form-btn" 
              style={{ padding: '0.8rem 2rem', background: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {lang === 'uz' ? 'Tarif tanlash' : 'Выбрать тариф'} <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Tab Switcher */}
        {subInfo && !subInfo.isExpired && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '1rem', 
            marginBottom: '3rem' 
          }}>
            <button
              onClick={() => setActiveTab('database')}
              style={{
                padding: '1rem 2rem',
                borderRadius: '16px',
                border: '1px solid',
                borderColor: activeTab === 'database' ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                background: activeTab === 'database' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.02)',
                color: activeTab === 'database' ? '#fff' : '#888',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s',
                boxShadow: activeTab === 'database' ? '0 0 20px rgba(139, 92, 246, 0.2)' : 'none'
              }}
            >
              <Layout size={18} />
              {lang === 'uz' ? "📚 Promtlar To'plami" : "📚 Коллекция промптов"}
            </button>
            <button
              onClick={() => setActiveTab('ai_assistant')}
              style={{
                padding: '1rem 2rem',
                borderRadius: '16px',
                border: '1px solid',
                borderColor: activeTab === 'ai_assistant' ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                background: activeTab === 'ai_assistant' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.02)',
                color: activeTab === 'ai_assistant' ? '#fff' : '#888',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s',
                boxShadow: activeTab === 'ai_assistant' ? '0 0 20px rgba(139, 92, 246, 0.2)' : 'none'
              }}
            >
              <Sparkles size={18} color="var(--accent)" />
              {lang === 'uz' ? "✨ Sun'iy Intellekt Assistent" : "✨ ИИ Ассистент Промптов"}
            </button>
          </div>
        )}

        {/* PROMPTS SECTION - ONLY ACCESSIBLE IF SUBSCRIPTION IS ACTIVE */}
        {subInfo && !subInfo.isExpired && activeTab === 'database' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Search & Filter Bar */}
            <div className="bento-box" style={{ padding: '2rem', marginBottom: '3rem', background: 'rgba(20, 20, 25, 0.9)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 0 30px rgba(139, 92, 246, 0.1)' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {lang === 'uz' ? 'Professional Promt Qidiruvi' : 'Профессиональный поиск промптов'}
                </h2>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  {lang === 'uz' ? 'Minglab yuqori sifatli promtlar ichidan keraklisini toping' : 'Найдите то, что вам нужно, среди тысяч качественных промптов'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                  {/* Left icon — sparkles or spinner */}
                  <div style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 2 }}>
                    {isSemanticSearching ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                        style={{ display: 'inline-block', lineHeight: 0 }}
                      >
                        <RefreshCw size={18} color="var(--accent)" />
                      </motion.div>
                    ) : searchMode === 'done' ? (
                      <CheckCircle size={18} color="#22c55e" />
                    ) : (
                      <Sparkles size={18} color={searchQuery ? 'var(--accent)' : '#555'} />
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder={lang === 'uz'
                      ? '🔍 Mavzu yozing — AI avtomatik mos promtlarni topadi...'
                      : '🔍 Введите тему — ИИ автоматически найдет подходящие промпты...'}
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '1.2rem 1.2rem 1.2rem 3.5rem',
                      borderRadius: '16px',
                      background: '#000',
                      border: `1px solid ${isSemanticSearching ? 'rgba(139,92,246,0.6)' : searchMode === 'done' ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
                      color: '#fff',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.3s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = isSemanticSearching ? 'rgba(139,92,246,0.6)' : searchMode === 'done' ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSemanticSearch(); }}
                  />

                  {/* Right: clear button */}
                  {searchQuery && !isSemanticSearching && (
                    <button
                      onClick={handleClearSearch}
                      style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  onClick={handleSemanticSearch}
                  disabled={isSemanticSearching || !searchQuery.trim()}
                  style={{
                    padding: '1.2rem 2rem',
                    borderRadius: '16px',
                    background: isSemanticSearching ? 'rgba(139,92,246,0.5)' : 'linear-gradient(90deg, var(--accent) 0%, #6366f1 100%)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 800,
                    cursor: searchQuery.trim() && !isSemanticSearching ? 'pointer' : 'not-allowed',
                    opacity: searchQuery.trim() ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: searchQuery.trim() ? '0 10px 20px rgba(139,92,246,0.2)' : 'none',
                    transition: 'all 0.3s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {isSemanticSearching ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} style={{ display: 'inline-block', lineHeight: 0 }}>
                        <RefreshCw size={16} />
                      </motion.div>
                      {lang === 'uz' ? 'Tahlil qilinmoqda...' : 'Анализируется...'}
                    </>
                  ) : (
                    <>
                      <Bot size={16} />
                      {lang === 'uz' ? '✨ AI Qidiruv' : '✨ AI Поиск'}
                    </>
                  )}
                </button>
              </div>

              {/* Status banner */}
              <AnimatePresence>
                {searchMode !== 'idle' && searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    style={{
                      marginTop: '1rem',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '12px',
                      background: isSemanticSearching
                        ? 'rgba(139,92,246,0.08)'
                        : searchMode === 'done'
                          ? 'rgba(34,197,94,0.08)'
                          : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSemanticSearching ? 'rgba(139,92,246,0.2)' : searchMode === 'done' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontSize: '0.88rem',
                      color: isSemanticSearching ? '#a78bfa' : searchMode === 'done' ? '#4ade80' : '#888'
                    }}
                  >
                    {isSemanticSearching ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} style={{ lineHeight: 0 }}><RefreshCw size={14} /></motion.div>
                        <span>
                          {lang === 'uz'
                            ? `"${searchQuery}" mavzusi bo'yicha AI semantik tahlil qilyapdi...`
                            : `ИИ анализирует тему "${searchQuery}"...`}
                        </span>
                      </>
                    ) : searchMode === 'done' ? (
                      <>
                        <CheckCircle size={14} />
                        <span>
                          {lang === 'uz'
                            ? `AI qidiruvi tugadi: ${filteredPrompts.length} ta mos promt topildi${aiSuggestedPrompts.length > 0 ? ` + ${aiSuggestedPrompts.length} ta yangi tavsiya` : ''}`
                            : `Поиск завершён: найдено ${filteredPrompts.length} промптов${aiSuggestedPrompts.length > 0 ? ` + ${aiSuggestedPrompts.length} новых рекомендаций` : ''}`}
                        </span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>{lang === 'uz' ? 'AI avtomatik qidiradi...' : 'ИИ автоматически начнет поиск...'}</span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.5rem', justifyContent: 'center' }}>
                {categories.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    style={{ 
                      padding: '0.7rem 1.4rem', 
                      borderRadius: '12px', 
                      border: '1px solid',
                      borderColor: activeCategory === cat ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                      background: activeCategory === cat ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                      color: activeCategory === cat ? 'var(--accent)' : '#888',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      transition: 'all 0.3s'
                    }}
                  >
                    {cat === 'Barchasi' ? (lang === 'uz' ? 'Barchasi' : 'Все') : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
              {filteredPrompts.map((p, idx) => (
                <motion.div 
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bento-box"
                  style={{ padding: 0, overflow: 'hidden', background: 'rgba(15, 15, 20, 0.9)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}
                >
                  {p.image && (
                    <div style={{ height: '200px', width: '100%', position: 'relative' }}>
                      <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.6)', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.7rem', backdropFilter: 'blur(4px)' }}>
                        {p.category}
                      </div>
                    </div>
                  )}
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Sparkles size={18} color="var(--accent)" /> {p.title}
                    </h3>
                    <div style={{ position: 'relative', background: '#0a0a0c', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.9rem', color: '#ccc', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                        "{p.prompt}"
                      </p>
                      <button 
                        onClick={() => handleCopy(p.prompt, p.id)}
                        style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: copiedId === p.id ? '#22c55e' : '#666' }}
                      >
                        {copiedId === p.id ? <CheckCircle size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontSize: '0.75rem', color: '#555' }}>ID: {p.id}</span>
                       <button onClick={() => handleCopy(p.prompt, p.id)} style={{ color: 'var(--accent)', background: 'none', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {copiedId === p.id 
                            ? (lang === 'uz' ? 'Nusxalandi' : 'Скопировано') 
                            : (lang === 'uz' ? 'Nusxa olish' : 'Копировать')} <Copy size={14} />
                       </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {filteredPrompts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '5rem 0', color: '#666' }}>
                <Search size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                <p>{lang === 'uz' ? 'Hech qanday promt topilmadi.' : 'Промпты не найдены.'}</p>
              </div>
            )}

            {/* AI Suggested/Recommended Prompts Section */}
            {aiSuggestedPrompts.length > 0 && (
              <div style={{ marginTop: '5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '4rem' }}>
                <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '0.5rem' }}>
                    {lang === 'uz' ? "Siz qidirgan mavzuga mos" : "Подходящие под ваш запрос"}
                  </span>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                    ✨ {lang === 'uz' ? "AI Tavsiya etgan yangi promtlar" : "Рекомендованные ИИ новые промпты"}
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
                    {lang === 'uz' 
                      ? "Kutubxonada siz qidirgan mavzuga mos tayyor promtlar topilmaganda, sun'iy intellekt maxsus yangi takliflar yaratdi:" 
                      : "Когда в библиотеке нет точных совпадений, ИИ предлагает специально сгенерированные новые варианты:"}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                  {aiSuggestedPrompts.map((p, idx) => (
                    <motion.div 
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bento-box"
                      style={{ 
                        padding: '1.5rem', 
                        background: 'rgba(20, 20, 25, 0.95)', 
                        border: '1px solid rgba(139, 92, 246, 0.2)', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        boxShadow: '0 10px 30px rgba(139, 92, 246, 0.05)',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 800, color: '#8b5cf6', letterSpacing: '1px' }}>
                          AI TAVSIYA
                        </span>
                        <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.7rem', color: '#aaa' }}>
                          {p.category}
                        </span>
                      </div>

                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                          <Sparkles size={18} color="var(--accent)" /> {p.title}
                        </h3>
                        <div style={{ position: 'relative', background: '#0a0a0c', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
                          <p style={{ fontSize: '0.9rem', color: '#ccc', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                            "{p.prompt}"
                          </p>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                           <button 
                             onClick={() => handleCopy(p.prompt, p.id)} 
                             style={{ color: '#fff', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.3s' }}
                           >
                              {copiedId === p.id 
                                ? (lang === 'uz' ? 'Nusxalandi ✓' : 'Скопировано ✓') 
                                : (lang === 'uz' ? 'Nusxa olish' : 'Копировать')} <Copy size={12} />
                           </button>

                           <button 
                             onClick={() => handleSaveSuggestedPrompt(p)} 
                             style={{ color: 'white', background: 'linear-gradient(90deg, var(--accent) 0%, #6366f1 100%)', border: 'none', borderRadius: '10px', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.3s' }}
                           >
                              <Plus size={12} /> {lang === 'uz' ? "Kutubxonaga" : "Добавить"}
                           </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* AI PROMPT ASSISTANT SECTION */}
        {subInfo && !subInfo.isExpired && activeTab === 'ai_assistant' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* AI Inputs panel */}
            <div className="bento-box" style={{ 
              padding: '2.5rem', 
              marginBottom: '3rem', 
              background: 'rgba(20, 20, 25, 0.95)', 
              border: '1px solid rgba(255,255,255,0.08)', 
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)' 
            }}>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{ display: 'inline-flex', padding: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '50%', marginBottom: '1rem', color: 'var(--accent)' }}>
                  <Bot size={32} />
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>
                  {lang === 'uz' ? "Sun'iy Intellekt Prompt Generatori" : "ИИ Генератор Промптов"}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
                  {lang === 'uz' 
                    ? "Oddiy textingizni chiroyli promt ko'rinishiga olib keling." 
                    : "Превратите ваш простой текст в красивый и профессиональный промпт."}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Main input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ccc' }}>
                    {lang === 'uz' ? "G'oyangiz yoki qisqa tavsifingiz:" : "Ваша идея или краткое описание:"}
                  </label>
                  <textarea 
                    rows={3}
                    placeholder={lang === 'uz' ? "Masalan: yomg'ir ostidagi qizil sport mashinasi, kiberpunk uslubda, neon chiroqlar..." : "Например: красная спортивная машина под дождем, в стиле киберпанк, неоновые огни..."}
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '1.2rem', 
                      borderRadius: '16px', 
                      background: '#09090b', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      color: '#fff', 
                      fontSize: '1rem', 
                      outline: 'none', 
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.3s' 
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>

                {/* Controls Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  {/* Model Selector */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#aaa', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Sliders size={14} /> {lang === 'uz' ? "Neyrotarmoq modeli" : "Модель нейросети"}
                    </label>
                    <select 
                      value={aiModel} 
                      onChange={(e) => setAiModel(e.target.value)}
                      style={{ padding: '1rem', background: '#09090b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '0.95rem', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="gpt4o">✨ GPT-4o (OpenAI)</option>
                      <option value="gemini">🔷 Gemini Pro (Google)</option>
                    </select>
                  </div>

                  {/* Style Preset */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#aaa', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      🎨 {lang === 'uz' ? "Uslub (Style)" : "Стиль (Style)"}
                    </label>
                    <select 
                      value={aiStyle} 
                      onChange={(e) => setAiStyle(e.target.value)}
                      style={{ padding: '1rem', background: '#09090b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '0.95rem', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="cinematic">Cinematic (Kino)</option>
                      <option value="photorealistic">Photorealistic (Realistik)</option>
                      <option value="anime">Anime / Manga</option>
                      <option value="render3d">3D Render (Unreal Engine)</option>
                      <option value="cyberpunk">Cyberpunk</option>
                      <option value="vector">Vector / Minimalist</option>
                      <option value="vintage">Vintage Film</option>
                    </select>
                  </div>

                  {/* Aspect Ratio */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#aaa', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      📐 {lang === 'uz' ? "O'lcham (Aspect Ratio)" : "Разрешение (Aspect Ratio)"}
                    </label>
                    <select 
                      value={aiRatio} 
                      onChange={(e) => setAiRatio(e.target.value)}
                      style={{ padding: '1rem', background: '#09090b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '0.95rem', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="16:9">16:9 (Landscape)</option>
                      <option value="1:1">1:1 (Square)</option>
                      <option value="9:16">9:16 (Portrait)</option>
                      <option value="4:3">4:3 (Classic)</option>
                    </select>
                  </div>
                </div>

                {/* Action Button */}
                <button 
                  onClick={handleAIGenerate}
                  disabled={isGenerating || !aiInput.trim()}
                  style={{ 
                    background: isGenerating ? 'rgba(139, 92, 246, 0.5)' : 'linear-gradient(90deg, var(--accent) 0%, #6366f1 100%)', 
                    color: 'white', 
                    border: 'none', 
                    padding: '1.2rem', 
                    borderRadius: '16px', 
                    fontWeight: 800, 
                    fontSize: '1.1rem', 
                    cursor: aiInput.trim() ? 'pointer' : 'not-allowed', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.75rem', 
                    marginTop: '1rem',
                    opacity: aiInput.trim() ? 1 : 0.6,
                    boxShadow: aiInput.trim() ? '0 10px 25px rgba(139, 92, 246, 0.3)' : 'none',
                    transition: 'all 0.3s'
                  }}
                >
                  {isGenerating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        style={{ display: 'inline-block', lineHeight: 0 }}
                      >
                        <RefreshCw size={20} />
                      </motion.div>
                      {lang === 'uz' ? "Sun'iy Intellekt tahlil qilmoqda..." : "ИИ анализирует..."}
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      {lang === 'uz' ? "Professional Promt Yaratish ✨" : "Создать профессиональный промпт ✨"}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI Result Card */}
             <AnimatePresence>
              {generatedResult && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bento-box"
                  style={{ 
                    padding: '2.5rem', 
                    background: 'rgba(15, 15, 20, 0.95)', 
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    boxShadow: '0 20px 50px rgba(139, 92, 246, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    alignItems: 'stretch'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '0.25rem' }}>
                      {lang === 'uz' ? "OPTIMIZATSIYA QILINGAN PROMT" : "ОПТИМИЗИРОВАННЫЙ ПРОМПТ"}
                    </span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                      {generatedResult.title}
                    </h3>
                  </div>

                  {/* Prompt Display */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#aaa' }}>
                      {lang === 'uz' ? "Asosiy Promt (Copy uchun):" : "Основной промпт (Для копирования):"}
                    </span>
                    <div style={{ position: 'relative', background: '#050507', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ fontSize: '1.1rem', color: '#fff', lineHeight: '1.6', margin: 0, fontStyle: 'italic', paddingRight: '2.5rem' }}>
                        "{generatedResult.optimizedPrompt}"
                      </p>
                      <button 
                        onClick={() => handleCopy(generatedResult.optimizedPrompt, 'gen-prompt')}
                        style={{ 
                          position: 'absolute', 
                          top: '1rem', 
                          right: '1rem', 
                          background: 'rgba(255,255,255,0.05)', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '10px', 
                          padding: '0.5rem', 
                          cursor: 'pointer', 
                          color: copiedId === 'gen-prompt' ? '#22c55e' : '#888',
                          transition: 'all 0.2s'
                        }}
                      >
                        {copiedId === 'gen-prompt' ? <CheckCircle size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Negative Prompt */}
                  {generatedResult.negativePrompt && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ea580c' }}>
                        {lang === 'uz' ? "Inkor Etuvchi Promt (Negative Prompt):" : "Негативный промпт (Negative Prompt):"}
                      </span>
                      <div style={{ background: 'rgba(234, 88, 12, 0.05)', padding: '1.2rem', borderRadius: '14px', border: '1px solid rgba(234, 88, 12, 0.15)' }}>
                        <p style={{ fontSize: '0.95rem', color: '#fdba74', margin: 0 }}>
                          {generatedResult.negativePrompt}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Explanation */}
                  {generatedResult.explanation && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#aaa' }}>
                        💡 {lang === 'uz' ? "Tahlil va Maslahatlar:" : "Анализ и Советы:"}
                      </span>
                      <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', margin: 0 }}>
                        {generatedResult.explanation}
                      </p>
                    </div>
                  )}

                  {/* Buttons Row */}
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                    <button 
                      onClick={() => handleCopy(generatedResult.optimizedPrompt, 'gen-prompt')}
                      className="submit-form-btn" 
                      style={{ 
                        padding: '0.8rem 1.5rem', 
                        margin: 0, 
                        background: copiedId === 'gen-prompt' ? '#22c55e' : 'var(--accent)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Copy size={16} /> 
                      {copiedId === 'gen-prompt' 
                        ? (lang === 'uz' ? "Nusxalandi!" : "Скопировано!") 
                        : (lang === 'uz' ? "Promtdan nusxa olish" : "Копировать промпt")}
                    </button>
                    
                    <button 
                      onClick={handleSaveGeneratedPrompt}
                      disabled={isSaving}
                      className="submit-form-btn" 
                      style={{ 
                        padding: '0.8rem 1.5rem', 
                        margin: 0, 
                        background: 'transparent',
                        border: '1px solid var(--accent)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Plus size={16} style={{ color: 'var(--accent)' }} /> 
                      {isSaving 
                        ? (lang === 'uz' ? "Saqlanmoqda..." : "Сохранение...") 
                        : (lang === 'uz' ? "Kutubxonaga saqlash" : "Сохранить в библиотеку")}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default PromptDashboard;
