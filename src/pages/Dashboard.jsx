import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // overview | leaderboard | settings
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
    gender: user?.gender || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    country: user?.country || '',
  });
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/auth/leaderboard');
      setLeaderboard(res.data);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!setUser) {
      setStatusMsg({ type: 'error', text: 'Auth context not fully initialized ❌' });
      return;
    }
    
    setStatusMsg({ type: 'loading', text: 'Updating your profile...' });
    try {
      // Validate DOB
      if (!formData.dob) {
        throw new Error('Date of birth is required');
      }

      const res = await axios.put('/api/auth/profile', formData);
      setUser(res.data);
      setStatusMsg({ type: 'success', text: 'Profile updated successfully! ✅' });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setStatusMsg({ type: '', text: '' });
      }, 3000);
    } catch (err) {
      console.error('Update profile error:', err);
      const errorText = err.response?.data?.message || err.message || 'Update failed ❌';
      setStatusMsg({ type: 'error', text: errorText });
    }
  };

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Group user info for easier rendering
  const profileItems = [
    { label: 'Username', value: user.username, icon: <User size={18} /> },
    { label: 'Email', value: user.email, icon: <Mail size={18} /> },
    { label: 'Birthday', value: new Date(user.dob).toLocaleDateString(), icon: <Calendar size={18} /> },
    { label: 'Gender', value: user.gender, icon: <Users size={18} /> },
    { label: 'Location', value: `${user.city}, ${user.state}`, icon: <MapPin size={18} /> },
    { label: 'Country', value: user.country, icon: <Globe size={18} /> },
  ];

  return (
    <div className="dashboard-page">
      {/* Background orbs */}
      <div className="auth-orb auth-orb-1"></div>
      <div className="auth-orb auth-orb-2"></div>

      <div className="dashboard-container">
        {/* Sidebar / Navigation */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-brand" onClick={() => navigate('/')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
               <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>Type Fast</span>
          </div>

          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
               <Grid size={20} /> Dashboard
            </button>
            <button className="nav-item" onClick={() => navigate('/')}>
               <Zap size={20} /> Practice
            </button>
            <button 
              className={`nav-item ${activeTab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('leaderboard')}
            >
               <Trophy size={20} /> Leaderboard
            </button>
            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
               <Settings size={20} /> Settings
            </button>
          </nav>

          <div className="sidebar-footer">
            <button className="sidebar-logout" onClick={handleLogout}>
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          <header className="dashboard-header">
            <div className="header-left">
              <h1>
                {activeTab === 'overview' && `Welcome back, ${user.username}!`}
                {activeTab === 'leaderboard' && 'Global Leaderboard'}
                {activeTab === 'settings' && 'Account Settings'}
              </h1>
              <p>
                {activeTab === 'overview' && "Here's your typing progress overview."}
                {activeTab === 'leaderboard' && 'Top performing typists around the world.'}
                {activeTab === 'settings' && 'Manage your profile and account preferences.'}
              </p>
            </div>
            <div className="header-right">
              <div className="header-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          {activeTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <div className="dashboard-stats">
                <div className="stat-card wpm">
                  <div className="stat-card-icon"><Zap size={24} /></div>
                  <div className="stat-card-info">
                    <h3>Best Speed</h3>
                    <div className="stat-card-value">{user.bestWpm} <span>WPM</span></div>
                  </div>
                </div>
                <div className="stat-card accuracy">
                  <div className="stat-card-icon"><Target size={24} /></div>
                  <div className="stat-card-info">
                    <h3>Best Accuracy</h3>
                    <div className="stat-card-value">{user.bestAccuracy || 0}<span>%</span></div>
                  </div>
                </div>
                <div className="stat-card tests">
                  <div className="stat-card-icon"><Activity size={24} /></div>
                  <div className="stat-card-info">
                    <h3>Tests Completed</h3>
                    <div className="stat-card-value">{user.testsCompleted || 0}</div>
                  </div>
                </div>
              </div>

              <div className="dashboard-grid">
                {/* Profile Details */}
                <div className="dashboard-card profile-info-card">
                  <div className="card-header">
                    <h2>Profile Details</h2>
                    <button className="edit-profile-btn" onClick={() => setActiveTab('settings')}>Edit Profile</button>
                  </div>
                  <div className="profile-details-grid">
                    {profileItems.map((item, index) => (
                      <div key={index} className="profile-detail-item">
                        <span className="detail-icon">{item.icon}</span>
                        <div className="detail-info">
                          <label>{item.label}</label>
                          <p>{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="profile-address-full">
                    <span className="detail-icon"><Home size={18} /></span>
                    <div className="detail-info">
                       <label>Full Address</label>
                       <p>{user.address || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Performance Chart Placeholder */}
                <div className="dashboard-card chart-card">
                  <div className="card-header">
                    <h2>Performance Trend</h2>
                    <div className="chart-legend">
                       <span className="legend-item"><i className="dot wpm"></i> WPM</span>
                    </div>
                  </div>
                  <div className="chart-container">
                     {/* Visual placeholder for a chart */}
                     <div className="visual-chart">
                        <div className="chart-bars">
                           {[45, 52, 48, 61, 55, 68, 72].map((v, i) => (
                             <div key={i} className="chart-bar-wrapper">
                                <div className="chart-bar" style={{ height: `${(v/80)*100}%` }}>
                                   <span className="bar-tooltip">{v} WPM</span>
                                </div>
                                <span className="bar-label">T{i+1}</span>
                             </div>
                           ))}
                        </div>
                     </div>
                     <p className="chart-status">Your speed has improved by 23% this week!</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'leaderboard' && (
            <div className="dashboard-card leaderboard-card">
              <div className="leaderboard-table-container">
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>User</th>
                      <th>Best WPM</th>
                      <th>Accuracy</th>
                      <th>Tests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="5">Loading leaderboard...</td></tr>
                    ) : leaderboard.map((u, i) => (
                      <tr key={u._id} className={u.username === user.username ? 'me' : ''}>
                        <td>{i + 1}</td>
                        <td>
                          <div className="table-user">
                            <div className="table-avatar">{u.username.charAt(0).toUpperCase()}</div>
                            <span>{u.username}</span>
                          </div>
                        </td>
                        <td className="wpm-cell">{u.bestWpm}</td>
                        <td>{u.bestAccuracy}%</td>
                        <td>{u.testsCompleted}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="dashboard-card settings-card">
              <form className="settings-form" onSubmit={handleProfileUpdate}>
                {statusMsg.text && (
                  <div className={`status-msg ${statusMsg.type}`}>
                    {statusMsg.text}
                  </div>
                )}
                
                <div className="settings-grid">
                  <div className="settings-field">
                    <label>Username</label>
                    <input type="text" name="username" value={formData.username} onChange={handleInputChange} />
                  </div>
                  <div className="settings-field">
                    <label>Date of Birth</label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} />
                  </div>
                  <div className="settings-field">
                    <label>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="settings-field">
                    <label>City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} />
                  </div>
                  <div className="settings-field">
                    <label>State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleInputChange} />
                  </div>
                  <div className="settings-field">
                    <label>Country</label>
                    <input type="text" name="country" value={formData.country} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="settings-field full">
                  <label>Full Address</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} />
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-btn" disabled={statusMsg.type === 'loading'}>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Simple SVG components to avoid external deps
const User = ({size}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const Mail = ({size}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const Calendar = ({size}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const Users = ({size}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const MapPin = ({size}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const Globe = ({size}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const Grid = ({size}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const Zap = ({size}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const Trophy = ({size}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>;
const Settings = ({size}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const LogOut = ({size}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const Home = ({size}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const Target = ({size}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const Activity = ({size}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;

export default Dashboard;
