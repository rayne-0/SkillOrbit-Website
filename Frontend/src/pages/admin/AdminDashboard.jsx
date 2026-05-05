import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import AdminCourses from './AdminCourses';
import AdminUsers from './AdminUsers';
import AdminFinancials from './AdminFinancials';
import AdminSettings from './AdminSettings';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const pageRef = useScrollAnimation();
  
  const [activeNav, setActiveNav] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stored = localStorage.getItem('skillorbit_tokens');
        if (!stored) return;
        const tokens = JSON.parse(stored);
        
        const res = await fetch('http://localhost:8000/api/courses/admin/stats/', {
          headers: { Authorization: `Bearer ${tokens.access}` }
        });
        const data = await res.json();
        
        if (data.success) {
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const displayName = user?.name || 'Administrator';

  return (
    <div className="admin-page" ref={pageRef}>
      {/* Admin Topbar */}
      <div className="admin-banner animate">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Platform Control Center</h1>
            <p style={{ margin: '0.25rem 0 0', opacity: 0.8, fontSize: '0.95rem' }}>Active Workspace: SkillOrbit Production</p>
          </div>
          <div className="admin-badge">Admin Privileges Active</div>
        </div>
      </div>

      <div className="container">
        <div className="admin-layout">
          {/* Admin Sidebar */}
          <aside className="admin-sidebar animate-left">
            <div className="admin-user-card">
              <div className="admin-avatar">{displayName[0]?.toUpperCase()}</div>
              <div className="admin-name">{displayName}</div>
              <div className="admin-email">{user?.email}</div>
              <button 
                onClick={logout} 
                className="btn btn-outline btn-sm admin-logout-btn"
              >
                End Session
              </button>
            </div>

            <nav className="admin-nav-menu">
              <div 
                className={`admin-nav-item ${activeNav === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveNav('overview')}
              >
                <span>📊</span> Overview
              </div>
              <div 
                className={`admin-nav-item ${activeNav === 'courses' ? 'active' : ''}`}
                onClick={() => setActiveNav('courses')}
              >
                <span>📚</span> Courses Library
              </div>
              <div 
                className={`admin-nav-item ${activeNav === 'users' ? 'active' : ''}`}
                onClick={() => setActiveNav('users')}
              >
                <span style={{width: '24px'}}>👥</span> <span>Manage Users</span>
              </div>
              <div 
                className={`admin-nav-item ${activeNav === 'revenue' ? 'active' : ''}`}
                onClick={() => setActiveNav('revenue')}
              >
                <span>💳</span> Financials
              </div>
              <div 
                className={`admin-nav-item ${activeNav === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveNav('settings')}
              >
                <span>⚙️</span> Portal Settings
              </div>
            </nav>
          </aside>

          {/* Admin Main Workspace */}
          <main className="admin-main animate-right">
            {loading ? (
              <div className="admin-loading">Synchronizing with cluster...</div>
            ) : activeNav === 'overview' ? (
              <>
                <div className="admin-section-header">
                  <h2>System Overview</h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Updated just now</div>
                </div>

                {/* KPI Widgets */}
                <div className="admin-widgets stagger-children">
                  <div className="admin-widget">
                    <div className="aw-icon aw-blue">👥</div>
                    <div className="aw-content">
                      <div className="aw-value">{stats?.metrics?.total_students || 0}</div>
                      <div className="aw-label">Total Learners</div>
                    </div>
                  </div>
                  <div className="admin-widget">
                    <div className="aw-icon aw-gold">💵</div>
                    <div className="aw-content">
                      <div className="aw-value">₹ {(stats?.metrics?.total_revenue || 0).toLocaleString()}</div>
                      <div className="aw-label">Gross Processed</div>
                    </div>
                  </div>
                  <div className="admin-widget">
                    <div className="aw-icon aw-green">📚</div>
                    <div className="aw-content">
                      <div className="aw-value">{stats?.metrics?.total_courses || 0}</div>
                      <div className="aw-label">Active Courses</div>
                    </div>
                  </div>
                  <div className="admin-widget">
                    <div className="aw-icon aw-teal">📈</div>
                    <div className="aw-content">
                      <div className="aw-value">{stats?.metrics?.total_enrollments || 0}</div>
                      <div className="aw-label">Total Enrollments</div>
                    </div>
                  </div>
                </div>

                {/* Recent Platform Activity */}
                <div className="admin-section-header" style={{ marginTop: '2.5rem' }}>
                  <h2>Recent Enrollments</h2>
                </div>
                <div className="admin-card">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Date / Time</th>
                        <th>Learner</th>
                        <th>Course Target</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.recent_activity?.length > 0 ? (
                        stats.recent_activity.map((act) => (
                          <tr key={act.id}>
                            <td className="admin-td-date">{act.date}</td>
                            <td>
                              <div style={{ fontWeight: 500 }}>{act.user_name}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{act.user_email}</div>
                            </td>
                            <td style={{ fontWeight: 500 }}>{act.course_title}</td>
                            <td><span className="admin-status-badge active">ONBOARDED</span></td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>No recent system activity</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : activeNav === 'courses' ? (
              <AdminCourses />
            ) : activeNav === 'users' ? (
              <AdminUsers />
            ) : activeNav === 'revenue' ? (
              <AdminFinancials />
            ) : activeNav === 'settings' ? (
              <AdminSettings />
            ) : (
              <div className="admin-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🚧</div>
                <h3 style={{ marginBottom: '0.5rem' }}>Module Under Construction</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>
                  The {activeNav.charAt(0).toUpperCase() + activeNav.slice(1)} management interface will be available in the next system update.
                </p>
                <button 
                  className="btn btn-primary" 
                  style={{ marginTop: '1.5rem', display: 'inline-flex' }}
                  onClick={() => setActiveNav('overview')}
                >
                  Return to Overview
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
