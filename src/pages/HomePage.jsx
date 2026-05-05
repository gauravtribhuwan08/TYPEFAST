import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="homepage-container">
      {/* Background Animated Orbs */}
      <div className="home-orb orb-1"></div>
      <div className="home-orb orb-2"></div>
      <div className="home-orb orb-3"></div>
      <div className="grid-overlay"></div>

      {/* Navbar */}
      <nav className={`home-navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-brand animate-nav-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span className="brand-text">TypeFast</span>
        </div>
        <div className="home-nav-links animate-nav-links">
          {user ? (
            <>
              <button className="nav-link-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
              <button className="btn-glow" onClick={() => navigate('/play')}>
                <span>Play Now</span>
              </button>
              <button className="icon-btn logout-btn" onClick={handleLogout} title="Logout">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button className="nav-link-btn" onClick={() => navigate('/login')}>Login</button>
              <button className="btn-glow" onClick={() => navigate('/signup')}>
                <span>Sign Up Free</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero-section">
        {/* Floating Decorative Elements */}
        <div className="floating-keycaps">
          <div className="keycap cap-w">W</div>
          <div className="keycap cap-p">P</div>
          <div className="keycap cap-m">M</div>
        </div>

        <div className="hero-content">
          <div className="hero-badge animate-fade-up delay-1">
            <span className="badge-glow"></span>
            <span className="badge-text">v2.0 is live with Global Leaderboards</span>
          </div>
          
          <h1 className="hero-title animate-fade-up delay-2">
            Unleash Your True <br />
            <span className="gradient-text type-animation">Typing Speed<span className="cursor-blink">|</span></span>
          </h1>
          
          <p className="hero-subtitle animate-fade-up delay-3">
            Experience the next generation of typing tests. Hyper-responsive, 
            beautifully designed, and packed with deep analytics to help you 
            break your limits and type at the speed of thought.
          </p>
          
          <div className="hero-actions animate-fade-up delay-4">
            <button className="btn-glow large" onClick={() => navigate(user ? '/play' : '/signup')}>
              <span>{user ? 'Launch Typing Test' : 'Start Typing Now'}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow-icon">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            
            {!user && (
              <button className="btn-glass" onClick={() => navigate('/login')}>
                <span>I already have an account</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Feature Cards Grid */}
        <div className="features-grid">
          <div className="glass-card animate-slide-up delay-5 hover-tilt">
            <div className="card-glow-bg violet"></div>
            <div className="icon-wrapper violet">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h3>Real-Time Metrics</h3>
            <p>Watch your WPM and accuracy shift instantly. Zero latency, pure performance.</p>
          </div>
          
          <div className="glass-card animate-slide-up delay-6 hover-tilt">
            <div className="card-glow-bg blue"></div>
            <div className="icon-wrapper blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
            </div>
            <h3>Deep Analytics</h3>
            <p>Visualize your progress through interactive charts and historical keystroke data.</p>
          </div>

          <div className="glass-card animate-slide-up delay-7 hover-tilt">
            <div className="card-glow-bg pink"></div>
            <div className="icon-wrapper pink">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3>Flawless Precision</h3>
            <p>Identify your weakest keys and eliminate errors with targeted feedback loops.</p>
          </div>
        </div>
      </main>

      <footer className="home-footer">
        <div className="footer-line"></div>
        <p>© {new Date().getFullYear()} TypeFast. Designed for speed.</p>
      </footer>
    </div>
  );
};

export default HomePage;
