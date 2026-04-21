import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Check, 
  Bot, 
  BarChart3, 
  School, 
  Users, 
  Calendar, 
  ShieldCheck, 
  Smartphone, 
  Star,
  Users2
} from 'lucide-react';

const Logo = ({ className = "" }) => (
  <div className={`logo-mark ${className}`}>
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '36px', height: '36px' }}>
      <rect width="40" height="40" rx="10" fill="#F5A623"/>
      <path d="M8 28L14 14L20 22L26 12L32 28" stroke="#0D0F14" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="20" cy="22" r="3" fill="#0D0F14"/>
      <path d="M8 32H32" stroke="#0D0F14" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
    </svg>
    <span className="logo-text" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--white)', letterSpacing: '-0.5px' }}>
      upgrade<span style={{ color: 'var(--amber)' }}>fied</span>
    </span>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="landing-container" style={{ background: 'var(--ink)' }}>
      {/* NAV */}
      <nav className="land-nav" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 60px', background: 'rgba(13,15,20,0.85)',
        backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.04)'
      }}>
        <Logo />
        <div className="land-nav-links" style={{ display: 'flex', gap: '32px' }}>
          <a href="#features" style={{ color: 'var(--soft)', textDecoration: 'none', fontSize: '15px' }}>Features</a>
          <a href="#schools" style={{ color: 'var(--soft)', textDecoration: 'none', fontSize: '15px' }}>For Schools</a>
          <a href="#parents" style={{ color: 'var(--soft)', textDecoration: 'none', fontSize: '15px' }}>For Parents</a>
          <a href="#pricing" style={{ color: 'var(--soft)', textDecoration: 'none', fontSize: '15px' }}>Pricing</a>
        </div>
        <div className="land-nav-right" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn-ghost" onClick={() => navigate('/login')}>Login</button>
          <button className="btn-primary" onClick={() => navigate('/signup')}>Get Started →</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '120px 60px 80px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div className="hero-bg" style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'radial-gradient(ellipse 800px 600px at 70% 40%, rgba(245,166,35,0.06) 0%, transparent 70%), radial-gradient(ellipse 600px 400px at 20% 80%, rgba(0,201,167,0.05) 0%, transparent 60%), radial-gradient(ellipse 400px 400px at 90% 90%, rgba(167,139,250,0.04) 0%, transparent 60%)'
        }}></div>
        <div className="hero-grid" style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '60px 60px', opacity: 0.5,
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)'
        }}></div>
        
        <div className="hero-inner" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '80px', alignItems: 'center' }}>
          <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            <motion.div variants={itemVariants} className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(245,166,35,0.1)', border: '1px solid var(--amber-rim)', borderRadius: '20px', padding: '6px 14px', marginBottom: '28px' }}>
              <div className="hero-badge-dot" style={{ width: '6px', height: '6px', background: 'var(--amber)', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '12px', color: 'var(--amber)', fontWeight: 500, letterSpacing: '0.5px' }}>Now serving 500+ schools across India</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} style={{ fontSize: 'clamp(44px, 5vw, 68px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-2px', color: 'var(--white)', marginBottom: '24px' }}>
              The School OS that <span className="gradient-text" style={{ background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>actually works</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} style={{ fontSize: '17px', color: 'var(--soft)', lineHeight: 1.7, maxWidth: '480px', marginBottom: '40px' }}>
              ERP + AI Chatbot + Parent Daily Reports. One platform for school management, student learning, and parent visibility — built for how schools really run.
            </motion.p>
            
            <motion.div variants={itemVariants} className="hero-actions" style={{ display: 'flex', gap: '14px' }}>
              <button className="btn-hero" onClick={() => navigate(token ? '/dashboard' : '/signup')} style={{ background: 'var(--amber)', color: '#0D0F14', padding: '14px 30px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {token ? 'Go to Dashboard' : 'Get Started'} <ArrowRight size={18} />
              </button>
              <button className="btn-hero-outline" style={{ background: 'transparent', border: '1.5px solid var(--rim)', color: 'var(--text)', padding: '14px 30px', borderRadius: '10px', cursor: 'pointer' }}>Book a demo</button>
            </motion.div>

            <motion.div variants={itemVariants} className="hero-stats" style={{ display: 'flex', gap: '32px', marginTop: '52px', paddingTop: '36px', borderTop: '1px solid var(--rim)' }}>
              <div><div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--white)' }}>12.4k</div><div style={{ fontSize: '13px', color: 'var(--muted)' }}>Students tracked</div></div>
              <div><div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--white)' }}>98%</div><div style={{ fontSize: '13px', color: 'var(--muted)' }}>Parent engagement</div></div>
              <div><div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--white)' }}>3min</div><div style={{ fontSize: '13px', color: 'var(--muted)' }}>Setup per class</div></div>
            </motion.div>
          </motion.div>

          <div className="hero-visual" style={{ position: 'relative' }}>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="hero-float-1" 
              style={{ position: 'absolute', top: '-20px', right: '-20px', background: 'var(--ink2)', border: '1px solid var(--amber-rim)', borderRadius: '14px', padding: '14px 18px', zIndex: 5, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
            >
              <div style={{ fontSize: '11px', color: 'var(--amber)', fontWeight: 600, textTransform: 'uppercase' }}>Efficiency Gain</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--white)' }}>+34%</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>vs manual tracking</div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               style={{ background: 'var(--ink2)', border: '1px solid var(--rim)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}
            >
               <div style={{ background: 'var(--ink3)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--rim)' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5F57' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FEBC2E' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28C840' }}></div>
                  <span style={{ fontSize: '13px', color: 'var(--muted)', marginLeft: '8px' }}>Dashboard Overview — Sri Chaitanya</span>
               </div>
               <div style={{ padding: '24px' }}>
                  {[
                    { label: 'Total Students', val: '1,247' },
                    { label: 'Active Classes', val: '48' },
                    { label: 'Staff Members', val: '86' },
                    { label: 'Portal Status', val: 'Live', badge: 'badge-green' },
                    { label: 'Parent Reports', val: '1,183', sub: 'sent today' }
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--ink3)', borderRadius: '10px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--soft)' }}>{row.label}</span>
                      <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--white)' }}>
                        {row.badge ? <span className={`sb-active`} style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px' }}>{row.val}</span> : row.val}
                      </span>
                    </div>
                  ))}
               </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.7 }}
               className="hero-float-2" 
               style={{ position: 'absolute', bottom: '-20px', left: '-30px', background: 'var(--ink2)', border: '1px solid rgba(0,201,167,0.3)', borderRadius: '14px', padding: '12px 16px', zIndex: 5, display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
            >
               <div style={{ width: '36px', height: '36px', background: 'rgba(0,201,167,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🤖</div>
               <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--white)' }}>AI Chatbot Active</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>342 doubts cleared today</div>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PERSONAS */}
      <section id="roles" className="section" style={{ padding: '0 60px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div className="section-tag" style={{ margin: '0 auto 20px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,201,167,0.1)', border: '1px solid rgba(0,201,167,0.25)', borderRadius: '20px', padding: '5px 14px' }}>
            <span style={{ fontSize: '12px', color: 'var(--teal)', fontWeight: 600, textTransform: 'uppercase' }}>Built for everyone</span>
          </div>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: 'var(--white)', letterSpacing: '-1.5px' }}>One platform. Three perspectives.</h2>
          <p style={{ fontSize: '17px', color: 'var(--soft)', maxWidth: '560px', margin: '20px auto 0', lineHeight: 1.7 }}>Every stakeholder in a school has different needs. Upgradefied adapts intelligently to each one.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <PersonaCard 
            icon="🏫" 
            role="School Management" 
            title="Total Control" 
            desc="Manage staff, schedules, classes, and student records from one powerful command center."
            features={["ERP Dashboard", "Staff Roster", "Master Schedule", "Attendance Monitoring"]}
            color="var(--amber)"
            onClick={() => navigate('/login')}
          />
          <PersonaCard 
            icon="👨‍👩‍👧" 
            role="Parents" 
            title="Stay in the Loop" 
            desc="Get daily summaries of what your child learned, homework due, and upcoming tests — automatically."
            features={["Daily Class Recap", "Homework Alerts", "Direct Messaging", "Progress Tracking"]}
            color="var(--teal)"
            onClick={() => navigate('/login')}
          />
          <PersonaCard 
            icon="🎓" 
            role="Students" 
            title="Learn Smarter" 
            desc="Ask any question, track your schedule, and get AI-powered doubt clearing — available 24/7."
            features={["AI Doubt Clearing", "Period Tracker", "Homework Reminders", "Performance Analytics"]}
            color="var(--violet)"
            onClick={() => navigate('/login')}
          />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section" style={{ padding: '100px 60px', borderTop: '1px solid var(--rim)' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
            <div>
               <div className="section-tag" style={{ marginBottom: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,201,167,0.1)', border: '1px solid rgba(0,201,167,0.25)', borderRadius: '20px', padding: '5px 14px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--teal)', fontWeight: 600, textTransform: 'uppercase' }}>Platform Features</span>
               </div>
               <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: 'var(--white)', letterSpacing: '-1.5px', maxWidth: '600px' }}>Everything your school needs. Nothing it doesn't.</h2>
            </div>
            <p style={{ fontSize: '15px', color: 'var(--soft)', maxWidth: '380px', lineHeight: 1.7 }}>Purpose-built for Indian schools. Fast to deploy, easy to use, built to scale.</p>
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <FeatureCard icon={<Bot />} title="AI Doubt Clearing" desc="Students ask questions anytime. The AI assistant explains concepts and solves problems." />
            <FeatureCard icon={<BarChart3 />} title="Daily Parent Reports" desc="Auto-generated summaries sent to parents every evening. Topics covered and homework assigned." />
            <FeatureCard icon={<School />} title="School ERP" desc="Class scheduling, staff management, student records, fee tracking, and attendance." />
            <FeatureCard icon={<Calendar />} title="Smart Timetables" desc="Build and manage master schedules with drag-and-drop. Conflicts detected automatically." />
            <FeatureCard icon={<ShieldCheck />} title="Role-Based Access" desc="Principals, teachers, parents, and students each see exactly what they need." />
            <FeatureCard icon={<Smartphone />} title="Mobile First" desc="Works beautifully on any device. Parents get WhatsApp-style reports via the portal." />
         </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '80px 60px 40px', borderTop: '1px solid var(--rim)', background: 'var(--ink2)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '60px', marginBottom: '48px' }}>
            <div>
              <Logo />
              <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '20px', maxWidth: '260px', lineHeight: 1.7 }}>The intelligent school platform for modern education institutions across India.</p>
            </div>
            <div className="footer-col">
              <h5 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--white)', marginBottom: '16px', textTransform: 'uppercase' }}>Product</h5>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'var(--muted)', textDecoration: 'none', marginBottom: '10px' }}>Features</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'var(--muted)', textDecoration: 'none', marginBottom: '10px' }}>Pricing</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'var(--muted)', textDecoration: 'none', marginBottom: '10px' }}>API</a>
            </div>
            <div className="footer-col">
              <h5 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--white)', marginBottom: '16px', textTransform: 'uppercase' }}>Resources</h5>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'var(--muted)', textDecoration: 'none', marginBottom: '10px' }}>Documentation</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'var(--muted)', textDecoration: 'none', marginBottom: '10px' }}>Community</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'var(--muted)', textDecoration: 'none', marginBottom: '10px' }}>Support</a>
            </div>
            <div className="footer-col">
              <h5 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--white)', marginBottom: '16px', textTransform: 'uppercase' }}>Legal</h5>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'var(--muted)', textDecoration: 'none', marginBottom: '10px' }}>Privacy</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'var(--muted)', textDecoration: 'none', marginBottom: '10px' }}>Terms</a>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '24px', borderTop: '1px solid var(--rim)' }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>© 2026 Upgradefied. All rights reserved.</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>Built with ❤️ for Indian schools</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const PersonaCard = ({ icon, role, title, desc, features, color, onClick }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    onClick={onClick}
    className="persona-card" 
    style={{ background: 'var(--ink2)', border: '1px solid var(--rim)', borderRadius: '20px', padding: '36px', cursor: 'pointer', transition: 'all 0.3s' }}
  >
    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '24px' }}>{icon}</div>
    <div style={{ fontSize: '12px', fontWeight: 600, color: color, textTransform: 'uppercase', marginBottom: '16px' }}>{role}</div>
    <h3 style={{ fontSize: '22px', color: 'var(--white)', marginBottom: '8px' }}>{title}</h3>
    <p style={{ fontSize: '14px', color: 'var(--soft)', lineHeight: 1.7, marginBottom: '24px' }}>{desc}</p>
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {features.map((f, i) => (
        <li key={i} style={{ fontSize: '13px', color: 'var(--text)', padding: '6px 0', borderBottom: '1px solid var(--rim)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: color }}></div> {f}
        </li>
      ))}
    </ul>
    <div style={{ marginTop: '24px', color, fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
      Explore View <ArrowRight size={14} />
    </div>
  </motion.div>
);

const FeatureCard = ({ icon, title, desc }) => (
  <div style={{ background: 'var(--ink2)', border: '1px solid var(--rim)', borderRadius: '16px', padding: '28px' }}>
    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--ink3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)', marginBottom: '18px' }}>
      {icon}
    </div>
    <h4 style={{ fontSize: '17px', color: 'var(--white)', fontWeight: 700, marginBottom: '8px' }}>{title}</h4>
    <p style={{ fontSize: '14px', color: 'var(--soft)', lineHeight: 1.6 }}>{desc}</p>
  </div>
);

export default LandingPage;
