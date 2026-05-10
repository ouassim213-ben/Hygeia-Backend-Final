import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Moon, Flame, Apple, Dumbbell, CheckCircle, Clock, Lightbulb, ArrowRight, ChevronLeft } from 'lucide-react';
import './FreePlanDetail.css';

const ALL_PLANS = [
  {
    id: 0,
    icon: <Moon size={36} />,
    title: 'Ramadan Healthy Fasting',
    tagline: 'Optimize your nutrition during the holy month. Stay hydrated and balanced.',
    badge: 'Spiritual Wellness',
    color: '#6C63FF',
    lightColor: 'rgba(108, 99, 255, 0.08)',
    dailyMenu: [
      { time: 'Suhoor (Pre-Dawn)', meal: 'Oats with banana & honey + 2 boiled eggs + 500ml water' },
      { time: 'Iftar (Sunset)', meal: '3 dates + 1 glass of water or laban (to break the fast)' },
      { time: 'Dinner', meal: 'Grilled chicken (200g) + brown rice (150g) + mixed salad' },
      { time: 'Evening Snack', meal: 'Greek yogurt with walnuts + fruit infused water' },
    ],
    ingredients: [
      'Oats, banana, honey',
      'Eggs, chicken breast',
      'Brown rice, lentils',
      'Dates, figs, almonds',
      'Cucumber, tomatoes, leafy greens',
      'Laban (yogurt drink), water, herbal teas',
    ],
    proTip: 'Suhoor is the most important meal during Ramadan. Prioritize slow-digesting carbs (oats, whole grains) and protein to stay full longer. Always start Iftar with water and dates before eating a full meal.',
  },
  {
    id: 1,
    icon: <Flame size={36} />,
    title: '10kg Weight Loss Intro',
    tagline: 'A 10-day starter guide to kickstart your metabolism and see results.',
    badge: 'Fat Loss',
    color: '#FF6B6B',
    lightColor: 'rgba(255, 107, 107, 0.08)',
    dailyMenu: [
      { time: 'Breakfast (7–8 AM)', meal: '2 scrambled eggs + 1 slice whole-grain toast + green tea' },
      { time: 'Mid-Morning (10 AM)', meal: '1 apple + 10 almonds' },
      { time: 'Lunch (1 PM)', meal: 'Grilled salmon (150g) + steamed broccoli + quinoa (100g)' },
      { time: 'Afternoon (4 PM)', meal: 'Low-fat yogurt + 1 tsp chia seeds' },
      { time: 'Dinner (7 PM)', meal: 'Clear vegetable soup + grilled chicken breast + large salad' },
    ],
    ingredients: [
      'Eggs, salmon, chicken breast',
      'Quinoa, oats, whole-grain bread',
      'Broccoli, spinach, cucumber',
      'Apples, berries, lemon',
      'Almonds, chia seeds',
      'Green tea, black coffee (no sugar)',
    ],
    proTip: 'A caloric deficit of 500kcal/day will yield roughly 0.5kg of actual fat loss per week. Pair this plan with 30 minutes of brisk walking daily for accelerated results without muscle loss.',
  },
  {
    id: 2,
    icon: <Apple size={36} />,
    title: 'Sugar-Free Challenge',
    tagline: 'Cleanse your body with this 7-day plan focused on whole foods.',
    badge: 'Detox',
    color: '#2ECC71',
    lightColor: 'rgba(46, 204, 113, 0.08)',
    dailyMenu: [
      { time: 'Breakfast', meal: 'Avocado toast on rye bread + 2 poached eggs + black coffee' },
      { time: 'Snack', meal: 'Handful of mixed berries + 1 tbsp almond butter' },
      { time: 'Lunch', meal: 'Large grilled chicken salad with olive oil & lemon dressing' },
      { time: 'Snack', meal: 'Carrot & celery sticks with hummus (no added sugar)' },
      { time: 'Dinner', meal: 'Baked cod (200g) + roasted vegetables + cauliflower rice' },
    ],
    ingredients: [
      'Avocado, eggs, rye bread',
      'Berries (blueberries, strawberries)',
      'Chicken breast, cod',
      'Leafy greens, bell peppers, cauliflower',
      'Almond butter, olive oil',
      'Hummus (sugar-free), lemon, garlic',
    ],
    proTip: 'Read every label. Sugar hides under names like "fructose syrup", "maltodextrin", and "dextrose". During this 7-day challenge, cook from scratch as much as possible. You\'ll be amazed by the mental clarity you gain by Day 4.',
  },
  {
    id: 3,
    icon: <Dumbbell size={36} />,
    title: 'High Protein Essentials',
    tagline: 'Fuel your workouts with a nutrition plan designed for muscle recovery.',
    badge: 'Performance',
    color: '#F39C12',
    lightColor: 'rgba(243, 156, 18, 0.08)',
    dailyMenu: [
      { time: 'Pre-Workout (7 AM)', meal: 'Whey protein shake + banana + coffee' },
      { time: 'Breakfast (9 AM)', meal: '4 egg whites + 2 whole eggs + oats with honey' },
      { time: 'Lunch (1 PM)', meal: '250g grilled chicken or tuna + sweet potato + steamed greens' },
      { time: 'Afternoon (4 PM)', meal: 'Cottage cheese (200g) + rice cakes + walnuts' },
      { time: 'Post-Workout Dinner (7 PM)', meal: 'Beef or chicken (200g) + brown rice + roasted vegetables' },
    ],
    ingredients: [
      'Chicken breast, beef, tuna, eggs',
      'Whey protein powder',
      'Sweet potato, brown rice, oats',
      'Cottage cheese, Greek yogurt',
      'Broccoli, spinach, asparagus',
      'Walnuts, almonds, olive oil',
    ],
    proTip: 'Aim for 1.6–2.2g of protein per kg of bodyweight for optimal muscle synthesis. Spread your protein intake across 4–5 meals to maximize absorption. The post-workout window (within 60 minutes) is critical — prioritize fast-digesting protein sources.',
  },
];

export default function FreePlanDetail() {
  const { id } = useParams();
  const plan = ALL_PLANS[parseInt(id)] || ALL_PLANS[0];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <div className="fpd-container">
      <Navbar />

      {/* Hero Banner */}
      <div className="fpd-hero" style={{ background: `linear-gradient(135deg, #021B27 0%, #0a2d3d 100%)` }}>
        <div className="fpd-hero-inner">
          <Link to="/" className="fpd-back-link">
            <ChevronLeft size={18} /> Back to Plans
          </Link>
          <div className="fpd-hero-icon" style={{ background: plan.lightColor, color: plan.color }}>
            {plan.icon}
          </div>
          <span className="fpd-badge" style={{ background: plan.color }}>{plan.badge}</span>
          <h1>{plan.title}</h1>
          <p>{plan.tagline}</p>
        </div>
      </div>

      <div className="fpd-body">
        {/* Daily Menu */}
        <div className="fpd-section">
          <div className="fpd-section-header">
            <span className="fpd-section-icon" style={{ background: plan.lightColor, color: plan.color }}>
              <Clock size={22} />
            </span>
            <h2>Daily Menu</h2>
          </div>
          <div className="fpd-timeline">
            {plan.dailyMenu.map((item, i) => (
              <div key={i} className="fpd-timeline-item">
                <div className="fpd-timeline-dot" style={{ background: plan.color }} />
                <div className="fpd-timeline-content">
                  <span className="fpd-time" style={{ color: plan.color }}>{item.time}</span>
                  <p>{item.meal}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Ingredients */}
        <div className="fpd-section">
          <div className="fpd-section-header">
            <span className="fpd-section-icon" style={{ background: plan.lightColor, color: plan.color }}>
              <CheckCircle size={22} />
            </span>
            <h2>Key Ingredients</h2>
          </div>
          <div className="fpd-ingredients-grid">
            {plan.ingredients.map((item, i) => (
              <div key={i} className="fpd-ingredient-chip" style={{ borderColor: plan.color }}>
                <span style={{ color: plan.color }}>✓</span> {item}
              </div>
            ))}
          </div>
        </div>

        {/* Pro Tip */}
        <div className="fpd-section">
          <div className="fpd-pro-tip" style={{ borderColor: plan.color, background: plan.lightColor }}>
            <div className="fpd-section-header" style={{ marginBottom: '1rem' }}>
              <span className="fpd-section-icon" style={{ background: 'white', color: plan.color }}>
                <Lightbulb size={22} />
              </span>
              <h2 style={{ color: plan.color }}>Pro Tip</h2>
            </div>
            <p>{plan.proTip}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="fpd-cta-block">
          <h2>Love this plan? Get a personalized version built just for you.</h2>
          <p>
            Sign up free and let our AI analyze your goals, body metrics, and lifestyle to create a 
            custom nutrition roadmap that actually fits your life.
          </p>
          <Link to="/signup" className="fpd-cta-button">
            Get Your Personalized AI Plan — Sign Up Now <ArrowRight size={22} />
          </Link>
          <p className="fpd-cta-sub">No credit card required. Always free to start.</p>
        </div>
      </div>

      <footer style={{ padding: '3rem 5%', textAlign: 'center', color: '#64748b', borderTop: '1px solid rgba(0,0,0,0.05)', background: '#f8fafc' }}>
        <p>© 2026 HYGEIA — Premier Health-Tech Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
