import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useScrollAnimation from '../hooks/useScrollAnimation';
import { useGamification, LEVEL_XP_THRESHOLDS } from '../context/GamificationContext';
import BadgeCard from '../components/BadgeCard';
import './Dashboard.css';

import { useCourses } from '../context/CourseContext';

// Fallback arrays for UI spacing if no data
const ENROLLED_FALLBACK = [];

const CERTS = [
  { icon: '🏆', title: 'JavaScript Fundamentals', date: 'Earned March 2025' },
  { icon: '🎓', title: 'Introduction to Data Science', date: 'Earned January 2025' },
];

const ACTIVITY = [
  { icon: '▶️', type: 'blue', text: <><strong>Continued</strong> The Complete Python Bootcamp — Decorators Deep Dive</>, time: '2 hours ago' },
  { icon: '✅', type: 'green', text: <><strong>Completed lesson</strong> "Async/Await & Promises" in React Course</>, time: '1 day ago' },
  { icon: '🏆', type: 'gold', text: <><strong>Earned certificate</strong> for Introduction to Data Science</>, time: '2 days ago' },
  { icon: '📝', type: 'blue', text: <><strong>Enrolled</strong> in AWS Certified Solutions Architect</>, time: '5 days ago' },
  { icon: '⭐', type: 'gold', text: <><strong>Left a 5-star review</strong> on Machine Learning A-Z</>, time: '1 week ago' },
];

const RECOMMENDED = [
  { id: 5, icon: '📊', cat: 'Data Science', title: 'Data Analysis with Pandas', price: '$15.99', rating: 4.6 },
  { id: 7, icon: '🔐', cat: 'Security', title: 'Ethical Hacking Bootcamp', price: '$16.99', rating: 4.8 },
  { id: 8, icon: '📱', cat: 'Mobile Dev', title: 'Flutter Complete Course', price: '$13.99', rating: 4.7 },
];

const NAV_ITEMS = [
  { icon: '🏠', label: 'Overview', key: 'overview' },
  { icon: '📚', label: 'My Courses', key: 'courses' },
  { icon: '🏆', label: 'Certificates', key: 'certs' },
  { icon: '🎮', label: 'Achievements', key: 'achievements' },
  { icon: '💳', label: 'Billing & Invoices', key: 'billing' },
  { icon: '⚙️', label: 'Settings', key: 'settings' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { enrollments, courses } = useCourses();
  const { profile, fetchProfile } = useGamification();

  const [activeNav, setActiveNav] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // Fetch orders when billing tab is open
  useEffect(() => {
    if (activeNav === 'billing') {
      const fetchOrders = async () => {
        const stored = localStorage.getItem('skillorbit_tokens');
        if (!stored) return;
        const tokens = JSON.parse(stored);
        try {
          const res = await fetch(`http://localhost:8000/api/payments/orders/`, {
            headers: { Authorization: `Bearer ${tokens.access}` }
          });
          const data = await res.json();
          if (data.success) setOrders(data.orders);
        } catch (err) { console.error('Failed to load orders'); }
      };
      fetchOrders();
    }
    if (activeNav === 'achievements') {
      fetchProfile();
      const fetchLeaderboard = async () => {
        setLeaderboardLoading(true);
        try {
          const res = await fetch('http://localhost:8000/api/gamification/leaderboard/');
          const data = await res.json();
          if (data.success) setLeaderboard(data.leaderboard);
        } catch { }
        setLeaderboardLoading(false);
      };
      fetchLeaderboard();
    }
  }, [activeNav, fetchProfile]);
  const displayName = user?.name || 'Learner';
  const firstName = displayName.split(' ')[0];

  const pageRef = useScrollAnimation();

  // Map backend enrollments to the UI structure
  const myCourses = enrollments.map(e => {
    const c = courses.find(course => course.id === e.course_id) || {};
    return {
      id: e.course_id,
      icon: c.thumbnail || '🎓',
      cat: c.level || 'Course',
      title: c.title || 'Unknown Course',
      instructor: c.instructor,
      progress: e.progress || 0,
      lastLesson: 'Continue Learning',
      color: '#0056D2'
    };
  });

  const enrolledCount = myCourses.length;
  const avgProgress = enrolledCount > 0 
    ? Math.round(myCourses.reduce((s, c) => s + c.progress, 0) / enrolledCount) 
    : 0;

  return (
    <div className="dashboard-page" ref={pageRef}>
      {/* Banner */}
      <div className="dashboard-banner">
        <div className="container dashboard-banner-inner">
          <div className="dashboard-greeting">
            <h1>Welcome back, {firstName}! 👋</h1>
            <p>You're on a 5-day learning streak. Keep it up!</p>
          </div>
          <div className="dashboard-banner-stats">
            <div className="db-stat"><div className="db-stat-num">{enrolledCount}</div><div className="db-stat-label">Courses</div></div>
            <div className="db-stat"><div className="db-stat-num">{CERTS.length}</div><div className="db-stat-label">Certificates</div></div>
            <div className="db-stat"><div className="db-stat-num">127h</div><div className="db-stat-label">Hours Learned</div></div>
            <div className="db-stat"><div className="db-stat-num">5🔥</div><div className="db-stat-label">Day Streak</div></div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-layout">
          {/* Sidebar */}
          <aside className="dash-sidebar animate-left">
            {/* User card */}
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#0056D2,#00BFA5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.4rem', margin: '0 auto 0.75rem' }}>
                {displayName[0]?.toUpperCase()}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{displayName}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.15rem 0 0.75rem' }}>{user?.email}</div>
              <button onClick={logout} className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>Log Out</button>
            </div>

            <div className="dash-nav-card">
              {NAV_ITEMS.map(n => (
                <div key={n.key} className={`dash-nav-item ${activeNav === n.key ? 'active' : ''}`} onClick={() => setActiveNav(n.key)}>
                  <span className="dash-nav-icon">{n.icon}</span>
                  {n.label}
                </div>
              ))}
            </div>
          </aside>

          {/* Main */}
          <div className="dash-main animate-right">

            {/* ══ ACHIEVEMENTS TAB ══ */}
            {activeNav === 'achievements' && (() => {
              const xp = profile.xp || 0;
              const level = profile.level || 1;
              const nextLvlXP = profile.next_level_xp || LEVEL_XP_THRESHOLDS[level] || 100;
              const curLvlXP  = profile.current_level_xp || LEVEL_XP_THRESHOLDS[level - 1] || 0;
              const range = Math.max(nextLvlXP - curLvlXP, 1);
              const pct   = Math.min(((xp - curLvlXP) / range) * 100, 100);
              const badges = profile.badges_full || [];
              const earned = badges.filter(b => b.earned);
              const locked = badges.filter(b => !b.earned);

              return (
                <div className="dash-achievements">
                  {/* Level card */}
                  <div className="ach-level-card">
                    <div className="ach-level-left">
                      <div className="ach-level-num">Level {level}</div>
                      <div className="ach-level-title">
                        {level < 5 ? '🌱 Beginner' : level < 10 ? '⚡ Intermediate' : level < 15 ? '🔥 Advanced' : level < 20 ? '💎 Expert' : '🏅 Legend'}
                      </div>
                      <div className="ach-xp-bar-track">
                        <div className="ach-xp-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="ach-xp-label">{xp} / {nextLvlXP} XP to Level {Math.min(level + 1, 20)}</div>
                    </div>
                    <div className="ach-stats-row">
                      <div className="ach-stat">
                        <div className="ach-stat-val">{profile.streak || 0}🔥</div>
                        <div className="ach-stat-lbl">Streak</div>
                      </div>
                      <div className="ach-stat">
                        <div className="ach-stat-val">{profile.total_lessons_completed || 0}</div>
                        <div className="ach-stat-lbl">Lessons Done</div>
                      </div>
                      <div className="ach-stat">
                        <div className="ach-stat-val">{earned.length}</div>
                        <div className="ach-stat-lbl">Badges Earned</div>
                      </div>
                      <div className="ach-stat">
                        <div className="ach-stat-val">{xp}</div>
                        <div className="ach-stat-lbl">Total XP</div>
                      </div>
                    </div>
                  </div>

                  {/* Earned badges */}
                  {earned.length > 0 && (
                    <>
                      <div className="dash-section-header" style={{ marginTop: '1.5rem' }}>
                        <h2>🏅 Earned Badges ({earned.length})</h2>
                      </div>
                      <div className="ach-badge-grid">
                        {earned.map(b => <BadgeCard key={b.id} badge={b} />)}
                      </div>
                    </>
                  )}

                  {/* Locked badges */}
                  {locked.length > 0 && (
                    <>
                      <div className="dash-section-header" style={{ marginTop: '1.5rem' }}>
                        <h2>🔒 Locked Badges ({locked.length})</h2>
                      </div>
                      <div className="ach-badge-grid">
                        {locked.map(b => <BadgeCard key={b.id} badge={b} />)}
                      </div>
                    </>
                  )}

                  {/* No badges yet fallback */}
                  {badges.length === 0 && (
                    <div className="ach-empty">
                      <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎯</div>
                      <h3>Start Earning Badges!</h3>
                      <p>Complete lessons, maintain streaks, and reach new levels to unlock badges.</p>
                      <Link to="/courses" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>Explore Courses</Link>
                    </div>
                  )}

                  {/* Leaderboard */}
                  <div className="dash-section-header" style={{ marginTop: '2rem' }}>
                    <h2>🌍 Leaderboard</h2>
                  </div>
                  <div className="ach-leaderboard">
                    {leaderboardLoading ? (
                      <div className="ach-lb-loading">Loading leaderboard…</div>
                    ) : leaderboard.length === 0 ? (
                      <div className="ach-lb-loading">No data yet. Be the first to earn XP!</div>
                    ) : leaderboard.map((entry, i) => (
                      <div key={i} className={`ach-lb-row ${i < 3 ? 'top3' : ''}`}>
                        <div className="ach-lb-rank">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                        </div>
                        <div className="ach-lb-avatar">{entry.name?.[0]?.toUpperCase() || '?'}</div>
                        <div className="ach-lb-info">
                          <div className="ach-lb-name">{entry.name}</div>
                          <div className="ach-lb-meta">Lv {entry.level} · {entry.badges_count} badges · {entry.streak}🔥</div>
                        </div>
                        <div className="ach-lb-xp">{entry.xp} XP</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {activeNav === 'billing' ? (
              <div className="dash-billing-section">
                <div className="dash-section-header">
                  <h2>Billing & Invoices</h2>
                </div>
                <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'var(--bg-light)' }}>
                      <tr>
                        <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Date</th>
                        <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Course</th>
                        <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Amount</th>
                        <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Status</th>
                        <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No purchases found.</td>
                        </tr>
                      ) : orders.map(o => (
                        <tr key={o.order_id}>
                          <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)' }}>{o.date}</td>
                          <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)', fontWeight: 500 }}>{o.course_title}</td>
                          <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)' }}>{o.currency} {o.amount_paid.toFixed(2)}</td>
                          <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                            <span className={`badge ${o.status === 'paid' ? 'badge-green' : 'badge-navy'}`}>{o.status.toUpperCase()}</span>
                          </td>
                          <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                            {o.status === 'paid' && (
                              <button 
                                className="btn btn-sm btn-outline"
                                onClick={async () => {
                                  // Download PDF blob
                                  const stored = localStorage.getItem('skillorbit_tokens');
                                  if (!stored) return;
                                  const tokens = JSON.parse(stored);
                                  const res = await fetch(`http://localhost:8000/api/payments/invoice/${o.order_id}/`, {
                                    headers: { Authorization: `Bearer ${tokens.access}` }
                                  });
                                  if (!res.ok) alert('Failed to download invoice');
                                  const blob = await res.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `${o.invoice_number}.pdf`;
                                  document.body.appendChild(a);
                                  a.click();
                                  a.remove();
                                }}
                              >⬇ Download</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <>
            {/* Widgets */}
            <div className="dash-widgets stagger-children">
              {[
                { icon: '📚', color: 'blue', num: enrolledCount, label: 'Enrolled Courses' },
                { icon: '✅', color: 'green', num: avgProgress + '%', label: 'Avg Progress' },
                { icon: '🏆', color: 'gold', num: CERTS.length, label: 'Certificates' },
                { icon: '⏱️', color: 'teal', num: '127h', label: 'Total Hours' },
              ].map(w => (
                <div key={w.label} className="widget-card">
                  <div className={`widget-icon ${w.color}`}>{w.icon}</div>
                  <div>
                    <div className="widget-num">{w.num}</div>
                    <div className="widget-label">{w.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* In-progress courses */}
            <div className="dash-section-header">
              <h2>Continue Learning</h2>
              <Link to="/courses" className="btn btn-outline btn-sm">Browse More</Link>
            </div>
            <div className="enrolled-grid stagger-children">
              {myCourses.length === 0 ? (
                <div style={{ padding: '2rem', background: '#fff', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center', width: '100%' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
                  <h3 style={{ marginBottom: '0.5rem' }}>No Courses Yet</h3>
                  <p style={{ color: 'var(--text-muted)' }}>You haven't enrolled in any courses. Browse the catalog to start learning!</p>
                  <Link to="/courses" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>Explore Courses</Link>
                </div>
              ) : myCourses.map(c => (
                <Link to={`/learn/${c.id}`} key={c.id} className="enrolled-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="enrolled-thumb" style={{ background: `linear-gradient(135deg, ${c.color}33, ${c.color}66)` }}>
                    <span style={{ fontSize: '2.75rem' }}>{c.icon}</span>
                  </div>
                  <div className="enrolled-body">
                    <div className="enrolled-cat">{c.cat}</div>
                    <div className="enrolled-title">{c.title}</div>
                    <div className="enrolled-progress-bar">
                      <div className="enrolled-progress-fill" style={{ width: `${c.progress}%` }} />
                    </div>
                    <div className="enrolled-progress-row">
                      <span>Next: {c.lastLesson}</span>
                      <span>{c.progress}%</span>
                    </div>
                  </div>
                  <div className="enrolled-footer">
                    <span className="enrolled-instructor">by {c.instructor}</span>
                    <button className="btn btn-primary btn-sm" onClick={e => e.preventDefault()}>Continue ▶</button>
                  </div>
                </Link>
              ))}
            </div>

            {/* Certificates */}
            <div className="dash-section-header">
              <h2>My Certificates</h2>
              <a href="#" className="btn btn-outline btn-sm">View All</a>
            </div>
            {CERTS.map(c => (
              <div key={c.title} className="cert-card">
                <div className="cert-icon">{c.icon}</div>
                <div>
                  <div className="cert-title">{c.title}</div>
                  <div className="cert-date">{c.date}</div>
                </div>
                <div className="cert-badge">✓ Verified</div>
              </div>
            ))}

            {/* Recommended */}
            <div className="dash-section-header" style={{ marginTop: '2rem' }}>
              <h2>Recommended For You</h2>
              <Link to="/courses" className="btn btn-outline btn-sm">See All</Link>
            </div>
            <div className="recommended-grid stagger-children">
              {RECOMMENDED.map(c => (
                <Link to={`/courses/${c.id}`} key={c.id} className="course-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="course-thumb">{c.icon}</div>
                  <div className="course-body">
                    <div className="course-category">{c.cat}</div>
                    <div className="course-title">{c.title}</div>
                    <div className="course-meta">
                      <span className="course-price">{c.price}</span>
                      <span className="badge badge-blue">⭐ {c.rating}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Activity */}
            <div className="dash-section-header" style={{ marginTop: '2rem' }}>
              <h2>Recent Activity</h2>
            </div>
            <div className="activity-feed stagger-children">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="activity-item">
                  <div className={`activity-dot ${a.type}`}>{a.icon}</div>
                  <div>
                    <div className="activity-text">{a.text}</div>
                    <div className="activity-time">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
            </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
