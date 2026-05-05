import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';



const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    dob: '',
    gender: '',
    address: '',
    country: '',
    state: '',
    city: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // Multi-step: 1 = account, 2 = personal
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Password strength
  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return { level: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: '#f87171' };
    if (score <= 2) return { level: 2, label: 'Fair', color: '#fb923c' };
    if (score <= 3) return { level: 3, label: 'Good', color: '#facc15' };
    if (score <= 4) return { level: 4, label: 'Strong', color: '#4ade80' };
    return { level: 5, label: 'Excellent', color: '#22d3ee' };
  };

  const strength = getPasswordStrength();

  // Validate step 1
  const validateStep1 = () => {
    if (!formData.username || formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (!formData.email) {
      setError('Email is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const goToStep2 = () => {
    setError('');
    if (validateStep1()) {
      setStep(2);
    }
  };



  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.dob) {
      setError('Date of birth is required');
      return;
    }
    if (!formData.gender) {
      setError('Please select your gender');
      return;
    }
    if (!formData.country || !formData.state || !formData.city) {
      setError('Country, state, and city are required');
      return;
    }


    setIsLoading(true);

    try {
      await signup(
        formData.username,
        formData.email,
        formData.password,
        formData.dob,
        formData.gender,
        formData.address,
        formData.country,
        formData.state,
        formData.city
      );
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Social login handlers (placeholder)
  const handleGoogleSignup = () => {
    // TODO: Integrate with Google OAuth
    alert('Google Sign Up will be integrated with OAuth. Please use email signup for now.');
  };

  const handleFacebookSignup = () => {
    // TODO: Integrate with Facebook OAuth
    alert('Facebook Sign Up will be integrated with OAuth. Please use email signup for now.');
  };

  return (
    <div className="auth-page">
      {/* Animated background orbs */}
      <div className="auth-orb auth-orb-1"></div>
      <div className="auth-orb auth-orb-2"></div>
      <div className="auth-orb auth-orb-3"></div>

      <div className="auth-container auth-container-wide">
        <div className="auth-card">
          {/* Logo / Brand */}
          <div className="auth-brand">
            <div className="auth-logo">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="url(#grad2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join Type Fast and track your speed</p>
          </div>

          {/* Step indicator */}
          <div className="step-indicator">
            <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>
              <span>1</span>
              <p>Account</p>
            </div>
            <div className="step-line">
              <div className={`step-line-fill ${step >= 2 ? 'filled' : ''}`}></div>
            </div>
            <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>
              <span>2</span>
              <p>Personal</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="auth-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}

          {/* ========== STEP 1: Account Info ========== */}
          {step === 1 && (
            <div className="auth-form" id="signup-step1">
              <div className="auth-field">
                <label htmlFor="signup-username">Username</label>
                <div className="auth-input-wrapper">
                  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    id="signup-username"
                    type="text"
                    name="username"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    minLength={3}
                    maxLength={30}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="signup-email">Email</label>
                <div className="auth-input-wrapper">
                  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <input
                    id="signup-email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="signup-password">Password</label>
                <div className="auth-input-wrapper">
                  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bars">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`strength-bar ${i <= strength.level ? 'active' : ''}`}
                          style={{ backgroundColor: i <= strength.level ? strength.color : '' }}
                        />
                      ))}
                    </div>
                    <span className="strength-label" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="auth-field">
                <label htmlFor="signup-confirm">Confirm Password</label>
                <div className="auth-input-wrapper">
                  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <input
                    id="signup-confirm"
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                  {formData.confirmPassword && (
                    <span className="auth-match-icon">
                      {formData.password === formData.confirmPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      )}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="auth-submit-btn"
                onClick={goToStep2}
              >
                Continue
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>

              {/* Divider */}
              <div className="auth-divider">
                <span>or sign up with</span>
              </div>

              {/* Social Buttons */}
              <div className="social-buttons">
                <button type="button" className="social-btn google-btn" onClick={handleGoogleSignup}>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                <button type="button" className="social-btn facebook-btn" onClick={handleFacebookSignup}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
              </div>

              {/* Footer */}
              <div className="auth-footer">
                <p>
                  Already have an account?{' '}
                  <Link to="/login" className="auth-link">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* ========== STEP 2: Personal Info ========== */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="auth-form" id="signup-step2">
              {/* DOB */}
              <div className="auth-field">
                <label htmlFor="signup-dob">Date of Birth</label>
                <div className="auth-input-wrapper">
                  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <input
                    id="signup-dob"
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="auth-field">
                <label>Gender</label>
                <div className="gender-options">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <label
                      key={g}
                      className={`gender-option ${formData.gender === g ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={formData.gender === g}
                        onChange={handleChange}
                      />
                      <span className="gender-icon">
                        {g === 'Male' && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="14" r="5"/><path d="M19 5l-5.4 5.4"/><path d="M15 5h4v4"/></svg>
                        )}
                        {g === 'Female' && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5"/><path d="M12 13v7"/><path d="M9 18h6"/></svg>
                        )}
                        {g === 'Other' && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M16 12h6"/><path d="M2 12h6"/><path d="M12 2v6"/><path d="M12 16v6"/></svg>
                        )}
                      </span>
                      {g}
                    </label>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div className="auth-field">
                <label htmlFor="signup-address">Address</label>
                <div className="auth-input-wrapper">
                  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ top: '14px' }}>
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <textarea
                    id="signup-address"
                    name="address"
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    className="auth-textarea"
                  />
                </div>
              </div>

              {/* Country & State */}
              <div className="auth-row">
                <div className="auth-field">
                  <label htmlFor="signup-country">Country</label>
                  <div className="auth-input-wrapper">
                    <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <input
                      id="signup-country"
                      type="text"
                      name="country"
                      placeholder="Country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="auth-field">
                  <label htmlFor="signup-state">State</label>
                  <div className="auth-input-wrapper">
                    <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21h18" />
                      <path d="M5 21V7l8-4v18" />
                      <path d="M19 21V11l-6-4" />
                    </svg>
                    <input
                      id="signup-state"
                      type="text"
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* City */}
              <div className="auth-field">
                <label htmlFor="signup-city">City</label>
                <div className="auth-input-wrapper">
                  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18" />
                    <path d="M9 21V9l-3 3V21" />
                    <path d="M15 21V9l3 3V21" />
                    <path d="M12 21V3l-3 3" />
                    <path d="M12 3l3 3" />
                  </svg>
                  <input
                    id="signup-city"
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>



              {/* Buttons */}
              <div className="auth-step-buttons">
                <button
                  type="button"
                  className="auth-back-btn"
                  onClick={() => { setStep(1); setError(''); }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5" />
                    <path d="m12 19-7-7 7-7" />
                  </svg>
                  Back
                </button>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  id="signup-submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="auth-spinner"></span>
                  ) : (
                    <>
                      Create Account
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              {/* Footer */}
              <div className="auth-footer">
                <p>
                  Already have an account?{' '}
                  <Link to="/login" className="auth-link">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
