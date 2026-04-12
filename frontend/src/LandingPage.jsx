import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  ShieldCheck, 
  BarChart3, 
  LayoutDashboard, 
  Globe2, 
  Database, 
  Zap,
  ArrowRight,
  CheckCircle2,
  Lock,
  Calendar,
  Layers
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
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

  const floatingVariants = {
    animate: {
      y: [0, -15, 0],
      rotateZ: [0, 2, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="hero-content"
        >
          <motion.div variants={itemVariants} className="hero-badge">
            <Zap size={14} className="text-teal" />
            <span>Empowering 500+ Institutions Worldwide</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="hero-title">
            The Intelligent OS for <br />
            <span className="gradient-text">Modern Education</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="hero-subtitle">
            A comprehensive CRM & SaaS platform designed to streamline classroom management, 
            track academic progress, and manage organizational growth with surgical precision.
          </motion.p>
          
          <motion.div variants={itemVariants} className="hero-actions">
            {token ? (
              <button className="btn-primary hero-btn" onClick={() => navigate('/dashboard')}>
                Explore Dashboard <ArrowRight size={18} />
              </button>
            ) : (
              <>
                <button className="btn-primary hero-btn" onClick={() => navigate('/signup')}>
                  Get Started for Free <ArrowRight size={18} />
                </button>
                <button className="btn-secondary hero-btn" onClick={() => navigate('/login')}>
                  Live Demo
                </button>
              </>
            )}
          </motion.div>
        </motion.div>

        <div className="hero-visual">
          <motion.div 
            variants={floatingVariants}
            animate="animate"
            className="floating-card-container"
          >
            {/* 3D-like Effect Cards */}
            <div className="card-3d card-main">
              <div className="card-header">
                <div className="dot red"></div>
                <div className="dot yellow"></div>
                <div className="dot green"></div>
              </div>
              <div className="card-body">
                <div className="content-line long"></div>
                <div className="content-line short"></div>
                <div className="grid-mini">
                  <div className="mini-box"></div>
                  <div className="mini-box"></div>
                  <div className="mini-box"></div>
                  <div className="mini-box"></div>
                </div>
              </div>
            </div>
            
            <motion.div 
              style={{ x: -40, y: 120, zIndex: 5 }}
              animate={{ 
                y: [120, 100, 120],
                rotateY: [0, 10, 0]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="card-3d card-overlay glass"
            >
              <Users size={24} className="text-pink" />
              <div>
                <p className="card-label">Students Tracked</p>
                <p className="card-value">12.4k</p>
              </div>
            </motion.div>

            <motion.div 
              style={{ x: 180, y: -20, zIndex: 1 }}
              animate={{ 
                y: [-20, -40, -20],
                rotateY: [0, -10, 0] 
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="card-3d card-overlay glass"
            >
              <BarChart3 size={24} className="text-teal" />
              <div>
                <p className="card-label">Efficiency Gain</p>
                <p className="card-value">+34%</p>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Background Glows */}
          <div className="hero-glow primary"></div>
          <div className="hero-glow secondary"></div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Built for Every Role</h2>
          <p className="section-subtitle">A unified platform that adapts to your institution's hierarchy.</p>
        </div>

        <div className="features-grid">
          <FeatureCard 
            icon={<ShieldCheck className="text-teal" />}
            title="Role-Based Security"
            description="Granular access control for Owners, Managers, Instructors, Parents, and Students."
            delay={0.1}
          />
          <FeatureCard 
            icon={<LayoutDashboard className="text-pink" />}
            title="Dynamic Dashboards"
            description="Real-time insights tailored to each user's responsibilities and oversight needs."
            delay={0.2}
          />
          <FeatureCard 
            icon={<Database className="text-purple" />}
            title="Custom Field Schema"
            description="Design your own data structures for student records and staff profiles on the fly."
            delay={0.3}
          />
          <FeatureCard 
            icon={<Calendar className="text-teal" />}
            title="Master Scheduling"
            description="Automated timetable generation with conflict resolution and resource management."
            delay={0.4}
          />
          <FeatureCard 
            icon={<Globe2 className="text-pink" />}
            title="Multi-Org Sync"
            description="Manage multiple school branches or departments from a single administrator portal."
            delay={0.5}
          />
          <FeatureCard 
            icon={<Layers className="text-purple" />}
            title="Subject Bank"
            description="Centralized curriculum management and seamless subject-classroom association."
            delay={0.6}
          />
        </div>
      </section>

      {/* 3D Scroll Animated Section */}
      <section className="scroll-animation-section">
        <div className="sticky-content">
          <div className="scroll-grid">
            <motion.div 
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              className="scroll-text"
            >
              <h2 className="section-title">Scalable. Secure. <br />Surgical.</h2>
              <ul className="feature-list">
                <li><CheckCircle2 size={18} className="text-teal" /> <span>Enterprise-grade data encryption</span></li>
                <li><CheckCircle2 size={18} className="text-teal" /> <span>99.9% Up-time SLA guaranteed</span></li>
                <li><CheckCircle2 size={18} className="text-teal" /> <span>Real-time activity monitoring</span></li>
                <li><CheckCircle2 size={18} className="text-teal" /> <span>Automated backup & recovery</span></li>
              </ul>
              <button className="btn-primary mt-2" onClick={() => navigate(token ? '/dashboard' : '/signup')}>
                 {token ? 'Back to Work' : 'Start Your Journey'}
              </button>
            </motion.div>

            <div className="scroll-visual">
              <motion.div 
                style={{ rotateY: 30, rotateX: 15 }}
                whileInView={{ rotateY: -10, rotateX: 5 }}
                transition={{ type: 'spring', stiffness: 50 }}
                className="visual-container"
              >
                <div className="visual-box glass-card">
                  <div className="visual-icon-circle">
                    <Lock size={40} className="text-white" />
                  </div>
                  <h3>Secure by Default</h3>
                  <div className="visual-lines">
                    <div className="line"></div>
                    <div className="line"></div>
                    <div className="line half"></div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <motion.div 
          whileInView={{ scale: [0.95, 1], opacity: [0, 1] }}
          className="cta-card"
        >
          <h2>Ready to transform your institution?</h2>
          <p>Join hundreds of forward-thinking schools today.</p>
          <div className="cta-buttons">
            {token ? (
              <button className="btn-primary btn-large" onClick={() => navigate('/dashboard')}>Go to Your Dashboard</button>
            ) : (
              <>
                <button className="btn-primary btn-large" onClick={() => navigate('/signup')}>Get Started Now</button>
                <button className="btn-secondary btn-large" onClick={() => navigate('/login')}>Sign In</button>
              </>
            )}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="nav-brand">DailyTracker</div>
            <p>The standard for educational excellence.</p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h4>Product</h4>
              <a href="#">Features</a>
              <a href="#">Security</a>
              <a href="#">Pricing</a>
            </div>
            <div className="link-group">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Contact</a>
              <a href="#">Privacy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 DailyTracker CRM. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -10 }}
    className="feature-card glass-card"
  >
    <div className="feature-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{description}</p>
  </motion.div>
);

export default LandingPage;
