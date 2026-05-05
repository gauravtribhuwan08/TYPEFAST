import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateWords } from './words';
import { useAuth } from './context/AuthContext';

const TEST_DURATION = 60;

const App = () => {
  const { user, logout, updateStats } = useAuth();
  const navigate = useNavigate();

  const [state, setState] = useState({
    words: generateWords(100),
    activeWordIndex: 0,
    status: 'waiting', // waiting | started | finished
    timeLeft: TEST_DURATION,
  });

  const [isFocused, setIsFocused] = useState(true);
  const typingBoxRef = useRef(null);
  const [statsSaved, setStatsSaved] = useState(false);

  // Focus management
  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Timer logic
  useEffect(() => {
    let interval;
    if (state.status === 'started' && state.timeLeft > 0) {
      interval = setInterval(() => {
        setState((prev) => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
          status: prev.timeLeft - 1 === 0 ? 'finished' : prev.status,
        }));
      }, 1000);
    } else if (state.timeLeft === 0 && state.status !== 'finished') {
      setState((prev) => ({ ...prev, status: 'finished' }));
    }
    
    return () => clearInterval(interval);
  }, [state.status, state.timeLeft]);

  // Keypress event listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setState({
          words: generateWords(100),
          activeWordIndex: 0,
          status: 'waiting',
          timeLeft: TEST_DURATION,
        });
        setStatsSaved(false);
        if (typingBoxRef.current) {
          typingBoxRef.current.scrollTop = 0;
        }
        return;
      }

      if (!isFocused || state.status === 'finished') return;

      // Prevent interacting if modifier key is pressed
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Ignore standard modifier action keys
      if (e.key.length > 1 && e.key !== 'Backspace' && e.key !== 'Enter' && e.key !== ' ') return;

      e.preventDefault();

      setState((prev) => {
        let { words, activeWordIndex, status, timeLeft } = prev;
        
        // Don't process input if finished
        if (status === 'finished') return prev;

        const newWords = [...words];
        const currentWord = { ...newWords[activeWordIndex] };

        if (e.key === 'Backspace') {
          if (currentWord.typed.length > 0) {
            currentWord.typed = currentWord.typed.slice(0, -1);
            newWords[activeWordIndex] = currentWord;
          } else if (activeWordIndex > 0) {
            activeWordIndex--;
          }
        } else if (e.key === ' ') {
          if (currentWord.typed.length > 0) {
            activeWordIndex++;
            if (activeWordIndex > newWords.length - 20) {
              newWords.push(...generateWords(50));
            }
          }
        } else if (e.key.length === 1) {
          currentWord.typed += e.key;
          newWords[activeWordIndex] = currentWord;
        }

        return {
          ...prev,
          words: newWords,
          activeWordIndex,
          status: status === 'waiting' && (e.key.length === 1 || e.key === 'Backspace') ? 'started' : status,
        };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused, state.status]);

  // Restart function
  const restartTest = () => {
    setState({
      words: generateWords(100),
      activeWordIndex: 0,
      status: 'waiting',
      timeLeft: TEST_DURATION,
    });
    setStatsSaved(false);
    // Scroll window back to top
    if (typingBoxRef.current) {
        typingBoxRef.current.scrollTop = 0;
    }
  };

  // Calculate live and final stats
  const stats = useMemo(() => {
    let correctChars = 0;
    let totalChars = 0;

    state.words.forEach((word) => {
      if (word.typed.length > 0) {
        const minLen = Math.min(word.original.length, word.typed.length);
        for (let i = 0; i < minLen; i++) {
          totalChars++;
          if (word.original[i] === word.typed[i]) {
            correctChars++;
          }
        }
        if (word.typed.length > word.original.length) {
          totalChars += word.typed.length - word.original.length;
        }
      }
    });

    const timeElapsed = (TEST_DURATION - state.timeLeft) / 60;
    // Prevent Infinity when timeElapsed is 0, just use wpm of 0
    const wpm = timeElapsed > 0 ? Math.round((correctChars / 5) / timeElapsed) : 0;
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;

    return {
      wpm,
      accuracy,
      correctChars,
      incorrectChars: totalChars - correctChars,
    };
  }, [state.words, state.timeLeft]);

  // Save stats when test finishes
  useEffect(() => {
    if (state.status === 'finished' && !statsSaved && user) {
      updateStats(stats.wpm, stats.accuracy);
      setStatsSaved(true);
    }
  }, [state.status, statsSaved, user, stats.wpm, stats.accuracy, updateStats]);

  // Word rendering
  const renderWord = (word, index) => {
    const isActive = index === state.activeWordIndex;
    const chars = word.original.split('');
    const typed = word.typed.split('');
    const extraChars = typed.slice(chars.length);

    return (
      <div key={index} className={`word ${isActive ? 'active' : ''}`}>
        {chars.map((char, charIdx) => {
          let statusClass = '';
          if (charIdx < typed.length) {
            statusClass = typed[charIdx] === char ? 'correct' : 'incorrect';
          }
          const isCaret = isActive && charIdx === typed.length && isFocused;

          return (
            <span key={charIdx} className={`char ${statusClass}`} style={{ position: 'relative', display: 'inline-block' }}>
              {isCaret && <span className="caret"></span>}
              {char}
            </span>
          );
        })}
        {extraChars.map((char, extraIdx) => {
          const isCaret = isActive && chars.length + extraIdx === typed.length && isFocused;
          return (
            <span key={`extra-${extraIdx}`} className="char extra incorrect" style={{ position: 'relative', display: 'inline-block' }}>
              {isCaret && <span className="caret"></span>}
              {char}
            </span>
          );
        })}
        {/* Caret at the absolute end of the word */}
        <span style={{ position: 'relative', display: 'inline-block', width: '0px' }}>
             {isActive && typed.length === chars.length + extraChars.length && isFocused && (
               <span className="caret"></span>
             )}
        </span>
      </div>
    );
  };

  // Keep active word visible by scrolling
  useEffect(() => {
    if (typingBoxRef.current) {
        const activeEl = typingBoxRef.current.querySelector('.word.active');
        if (activeEl) {
            const container = typingBoxRef.current;
            if (activeEl.offsetTop > container.scrollTop + container.clientHeight - 60) {
                container.scrollTo({
                    top: activeEl.offsetTop - 50,
                    behavior: 'smooth'
                });
            } else if (activeEl.offsetTop < container.scrollTop) {
                container.scrollTo({
                    top: activeEl.offsetTop - 50,
                    behavior: 'smooth'
                });
            }
        }
    }
  }, [state.activeWordIndex]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      {/* User Navbar */}
      <nav className="user-navbar">
        <div className="nav-brand" onClick={() => navigate('/')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#navGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="navGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span>Type Fast</span>
        </div>
        <div className="nav-user">
          {user && (
            <div className="nav-user-info">
              <div className="nav-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="nav-user-details" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                <span className="nav-username">{user.username}</span>
                <span className="nav-user-stat">Best: {user.bestWpm} WPM</span>
              </div>
            </div>
          )}
          <button className="nav-logout-btn" onClick={handleLogout} title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </nav>

      <header>
        <h1> Type  Fast </h1>
        <p>Test your typing speed and accuracy</p>
      </header>

      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
             <Clock size={16} /> Time
          </span>
          <span className="stat-value timer">{state.timeLeft}s</span>
        </div>
        <div className="stat-item">
          <span className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
             <Activity size={16} /> WPM
          </span>
          <span className="stat-value">{stats.wpm}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
             <Target size={16} /> %
          </span>
          <span className="stat-value">{stats.accuracy}</span>
        </div>
      </div>

      <div className={`typing-container ${!isFocused && state.status !== 'finished' ? 'focus-lost' : ''}`} ref={typingBoxRef} style={{ maxHeight: state.status === 'finished' ? 'none' : '250px', overflowY: 'hidden', position: 'relative' }}>
        
        {/* Unfocused overlay */}
        {!isFocused && state.status !== 'finished' && (
          <div className="focus-overlay" onClick={() => setIsFocused(true)}>
            Click here or press any key to focus
          </div>
        )}

        {/* Typing Box */}
        {state.status !== 'finished' && (
          <div className="words">
            {state.words.map((word, index) => renderWord(word, index))}
          </div>
        )}

        {/* Results Modal overlay when finished */}
        {state.status === 'finished' && (
          <div className="results-modal">
            <h2>Test Complete!</h2>
            {user && statsSaved && (
              <p className="stats-saved-msg">✓ Results saved to your profile</p>
            )}
            <div className="results-grid">
              <div className="stat-item">
                <span className="stat-label">WPM</span>
                <span className="stat-value timer" style={{ fontSize: '3rem' }}>{stats.wpm}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Accuracy</span>
                <span className="stat-value timer" style={{ fontSize: '3rem', color: 'var(--color-correct)' }}>{stats.accuracy}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Correct Chars</span>
                <span className="stat-value text-green-400" style={{ fontSize: '2rem', color: 'var(--color-correct)' }}>{stats.correctChars}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Errors</span>
                <span className="stat-value text-red-400" style={{ fontSize: '2rem', color: 'var(--color-incorrect)' }}>{stats.incorrectChars}</span>
              </div>
            </div>
            <button className="restart-btn" onClick={restartTest}>
              <RefreshCw size={18} /> Restart Test (Esc)
            </button>
          </div>
        )}
      </div>

      {state.status !== 'finished' && (
         <div className="actions">
           <button className="restart-btn" onClick={restartTest} title="Restart (Escape)">
             <RefreshCw size={18} /> Restart
           </button>
         </div>
      )}
    </div>
  );
};

// Extremely simple SVG components to replace Lucide without bundle size / npm install issues
const Clock = ({size}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const Activity = ({size}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const Target = ({size}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const RefreshCw = ({size}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>;

export default App;
