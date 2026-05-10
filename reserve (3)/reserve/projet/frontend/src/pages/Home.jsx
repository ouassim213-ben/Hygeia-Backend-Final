import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowDown, ArrowRight, Camera, UserCheck, Utensils, MessageSquare, X, Send, Bot, BookOpen } from 'lucide-react';
import Groq from "groq-sdk";

import './Home.css';
import api from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { PLANS } from './Plans';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [chatOpen, setChatOpen] = useState(false);
  const [activeService, setActiveService] = useState(null);
  const [nutritionists, setNutritionists] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  // --- الستايت تاع الشات مصلح (بدون تكرار) ---
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", content: "مرحباً! أنا مساعد Hygeia الذكي، كيفاش نقدر نعاونك اليوم؟" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // إعداد Groq
  const groq = new Groq({ 
  apiKey: "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", // تأكد بلي هذا هو!
  dangerouslyAllowBrowser: true 
});

  // دالة الإرسال مصلحة 100% لـ Groq
  const handleSendMessage = async () => {
    const messageText = input.trim();
    if (!messageText || isTyping) return;

    const newUserMsg = { role: "user", content: messageText };
    setChatHistory(prev => [...prev, newUserMsg]);
    setInput("");
    setIsTyping(true);

  try {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { 
        role: "system", 
        // هنا رانا نحينا "Algerian Darija" وعوضناها بـ "English"
       content: `You are Hygeia AI, the official medical and nutrition assistant for the Hygeia platform. 

Your mission:
1. NUTRITION LOGIC: If a user asks for a 'meal plan' (plan alimentation), you MUST ask for their (Age, Weight, Height, and Health Goal) before providing a specific plan.
2. HYGEIA BRANDING: You are part of the Hygeia website. Encourage users to track their calories and explore health articles on the platform.
3. CONCISE & PROFESSIONAL: Keep your answers short and fact-based. 
4. SAFETY: For serious medical issues, always advise consulting a professional doctor.
5. LANGUAGE: Respond in the same language the user uses. If they speak English, use professional English. If they use Arabic/Darija, use Arabic script (حروف عربية).`
      },
      { role: "user", content: messageText },
    ],
    model: "llama-3.3-70b-versatile",
  });
  // ... بقية الكود

      const aiResponse = chatCompletion.choices[0]?.message?.content;
      if (aiResponse) {
        setChatHistory(prev => [...prev, { role: "assistant", content: aiResponse }]);
      }
    } catch (error) {
      // هادي هي الصح: افتح الـ Console (F12) وقولي واش راه مكتوب مورا كلمة DETAILED
      console.error("DETAILED ERROR:", error); 
      
      // باش الميساج تاع الخطأ في الشاشة يوريلك واش كاين
      setChatHistory(prev => [...prev, { role: "assistant", content: "Error: " + (error.message || "Unknown error") }]);
    } finally {
      setIsTyping(false);
    }
  };
  // سكرول تلقائي
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  // جلب أخصائيي التغذية
  useEffect(() => {
    const fetchNutritionists = async () => {
      try {
        const response = await api.get('specialists/');
        setNutritionists(response.data);
      } catch (error) {
        console.error("Error fetching nutritionists:", error);
      } finally {
        setLoadingTeam(false);
      }
    };
    fetchNutritionists();
  }, []);

  const handlePlanSelection = (planId) => {
    localStorage.setItem('pendingPlan', planId);
    navigate('/signup');
  };

  // Handle hash scrolling when arriving from another page
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        // Small delay to ensure the page has rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  const servicesList = [
    {
      id: 'ai-tracking',
      title: 'AI Nutrition Tracking',
      icon: <Camera size={32} />,
      desc: 'Snap a photo of your meal and let our advanced AI calculate calories and macros instantly.',
      advantages: ['Real-time recognition', 'Precise macro breakdown', 'Historical tracking']
    },
    {
      id: 'expert-consult',
      title: 'Expert Consultations',
      icon: <UserCheck size={32} />,
      desc: 'Connect with certified nutritionists for personalized medical advice and plan adjustments.',
      advantages: ['Video consultations', 'Direct messaging', 'Medical-grade advice']
    },
    {
      id: 'meal-plans',
      title: 'Dynamic Meal Plans',
      icon: <Utensils size={32} />,
      desc: 'Adaptive nutrition plans that evolve with your progress and specific health goals.',
      advantages: ['Tailored to bio-data', 'Weekly updates', 'Seasonal recipes']
    },
    {
      id: 'educational-blogs',
      title: 'Educational Blogs',
      icon: <BookOpen size={32} />,
      desc: 'Access a library of expert-written articles and guides to deepen your knowledge of nutrition and wellness.',
      advantages: ['Expert-written articles', 'Scientific guides', 'Wellness tips']
    }
  ];

  return (
    <div className="home-magazine-layout" id="home" style={{ backgroundColor: '#FCFCFC' }}>
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="hero-grid-container">
        <div className="hero-center-content">
          <h1 className="hero-magazine-title">
            Your Journey to Better <br /> Nutrition Starts Here
          </h1>
          <p className="hero-magazine-subtitle">
            HYGEIA: A professional platform connecting you with expert nutritionists and health coaches for a better lifestyle.
          </p>
          <Link to="/signup" className="btn-magazine-cta">
            Book a Consultation <ArrowRight size={20} />
          </Link>
        </div>

        <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800" alt="Healthy Salad" className="floating-img img-tl" />
        <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800" alt="Nutrition Bowl" className="floating-img img-tr" />
        <img src="https://images.unsplash.com/photo-1494390248081-4e521a5940db?q=80&w=800" alt="Fresh Fruit" className="floating-img img-bl" />
        <img src="https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800" alt="Healthy Meal" className="floating-img img-br" />

        <div className="scroll-indicator" onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
          <ArrowDown size={32} />
        </div>
      </section>

      {/* 2. SERVICES SECTION */}
      <section className="services-section" id="services" style={{ padding: '60px 5%' }}>
        <div className="container-wide">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title">Our Services</h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
              Comprehensive health solutions combining artificial intelligence with professional medical expertise.
            </p>
          </div>
          
          <div className="services-grid-modern" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {servicesList.map((service) => (
              <div 
                key={service.id}
                onClick={() => setActiveService(activeService === service.id ? null : service.id)}
                className={`service-card ${activeService === service.id ? 'active' : ''}`}
                style={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: '24px', 
                  padding: '2.5rem 2rem', 
                  cursor: 'pointer',
                  border: '1px solid #f1f5f9',
                  boxShadow: activeService === service.id ? '0 30px 60px rgba(13, 59, 63, 0.05)' : '0 4px 6px rgba(0,0,0,0.02)',
                  transform: activeService === service.id ? 'translateY(-10px)' : 'none',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  minHeight: '400px'
                }}
              >
                <div style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', width: '70px', height: '80px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  {service.icon}
                </div>
                <h3 style={{ color: '#0D3B3F', fontSize: '1.3rem', marginBottom: '0.8rem', fontWeight: 'bold', fontFamily: "'Playfair Display', serif" }}>{service.title}</h3>
                <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '1rem', fontSize: '1rem' }}>{service.desc}</p>
                <div style={{ overflow: 'hidden', transition: 'max-height 0.5s ease, opacity 0.5s ease', maxHeight: activeService === service.id ? '400px' : '0', opacity: activeService === service.id ? 1 : 0, width: '100%' }}>
                  <div style={{ padding: '1rem 0 0', borderTop: '1px solid #f1f5f9', marginTop: '1rem' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', textAlign: 'left' }}>
                      {service.advantages.map((adv, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.8rem', color: '#475569', fontSize: '0.95rem' }}><span style={{ color: '#c4e892', fontWeight: 'bold' }}>✓</span> {adv}</li>
                      ))}
                    </ul>
                    <button onClick={(e) => { e.stopPropagation(); navigate('/signup'); }} className="btn-magazine-cta" style={{ width: '100%', padding: '1rem', fontSize: '1rem', justifyContent: 'center' }}>Join Today</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PROGRAMS SECTION */}
      <section className="programs-section" id="programs" style={{ padding: '60px 5% 120px' }}>
        <div className="container-wide">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 className="section-title">Our Programs</h2>
            <p style={{ color: '#64748b', fontSize: '1.2rem', maxWidth: '750px', margin: '0 auto' }}>
              Experience the future of nutrition with our scientifically-backed membership plans.
            </p>
          </div>

          <div className="programs-grid-minimal">
            {Object.values(PLANS).map((plan) => (
              <div key={plan.id} className={`plan-card-luxury ${plan.id === 'golden' ? 'featured' : ''}`}>
                <h3 className="plan-title-journal">{plan.name}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{plan.tagline}</p>
                <div className="plan-price-journal">{plan.price}</div>
                <ul className="plan-features-minimal">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="plan-feature-minimal-item"><span style={{ color: '#c5a059' }}>•</span> {feature.text}</li>
                  ))}
                  <li className="plan-feature-minimal-item"><span style={{ color: '#c5a059' }}>•</span> 24/7 AI Health Assistant</li>
                </ul>
                <button onClick={() => handlePlanSelection(plan.id)} className="btn-choose-link">Choose {plan.name} <ArrowRight size={18} /></button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TEAM SECTION */}
      <section className="team-section" id="team" style={{ padding: '60px 5%' }}>
        <div className="container-wide">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 className="section-title" style={{ fontFamily: "'Playfair Display', serif", color: "#0d3b3f", fontSize: '2.8rem' }}>Our Team</h2>
            <div className="section-underline-gold"></div>
          </div>

          {loadingTeam ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner-modern"></div></div>
          ) : (
            <div className="team-grid-modern">
              {nutritionists.map((member) => (
                <div key={member.id} className="team-card-modern">
                  <div className="team-image-container">
                    <img src={member.image || 'https://via.placeholder.com/300x400?text=Expert'} alt={member.full_name} />
                  </div>
                  <div className="team-info">
                    <h3 className="team-name-minimal">{member.full_name}</h3>
                    <p className="team-title-gold">{member.specialty_type || 'Nutritionist'}</p>
                    <button onClick={() => navigate('/signup')} className="btn-team-pill">Connect</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. FLOATING AI CHATBOT */}
      <div className="ai-chatbot-float" style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
        {chatOpen && (
          <div className="chat-window-mini" style={{ width: '320px', height: '450px', backgroundColor: 'white', borderRadius: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <div className="chat-header" style={{ padding: '1rem', background: '#0d3b3f', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bot size={18} />
                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>HYGEIA AI</span>
              </div>
              <X size={18} style={{ cursor: 'pointer' }} onClick={() => setChatOpen(false)} />
            </div>

            <div className="chat-messages" style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {chatHistory.map((msg, i) => (
                <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{ 
                    background: msg.role === 'user' ? '#10b981' : '#f1f5f9', 
                    color: msg.role === 'user' ? 'white' : '#0d3b3f',
                    padding: '8px 12px', 
                    borderRadius: msg.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0', 
                    fontSize: '0.85rem' 
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && <div style={{ alignSelf: 'flex-start', fontSize: '0.75rem', color: '#64748b' }}>AI is thinking...</div>}
              <div ref={scrollRef} />
            </div>

            <div className="chat-input-area" style={{ padding: '0.8rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..." 
                style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px', fontSize: '0.85rem', outline: 'none' }} 
              />
              <button 
                onClick={handleSendMessage} 
                disabled={isTyping || !input.trim()} 
                style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', opacity: (isTyping || !input.trim()) ? 0.6 : 1 }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="chat-toggle-btn" style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#0d3b3f', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} onClick={() => setChatOpen(!chatOpen)}>
          {chatOpen ? <X size={28} /> : <Bot size={28} />}
        </div>
      </div>

      <Footer />
    </div>
  );
}