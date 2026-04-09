import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { GamificationProvider } from './context/GamificationContext';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import LoginSignup from './pages/LoginSignup';
import CourseHome from './pages/CourseHome';
import LecturePage from './pages/LecturePage';
import CourseNotes from './pages/CourseNotes';
import AdminDashboard from './pages/admin/AdminDashboard';
import './App.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'REPLACE_WITH_YOUR_GOOGLE_CLIENT_ID';

function ProtectedRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.is_admin) return <Navigate to="/admin" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.is_admin) return <Navigate to="/dashboard" replace />;
  return children;
}

/* ─── Scroll to top on route change ────────────────────────────── */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

/* ─── Navbar ────────────────────────────────────────────────────── */
function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // Close drawer on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const NAV_LINKS = [
    { to: '/', label: 'Home', icon: '🏠', end: true },
    { to: '/courses', label: 'Courses', icon: '📚' },
    { to: '/about', label: 'About', icon: 'ℹ️' },
    { to: '/contact', label: 'Contact', icon: '✉️' },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="navbar-logo-icon">◎</div>
            <span className="navbar-logo-text">Skill<span>Orbit</span></span>
          </Link>

          {/* Desktop nav links */}
          <div className="navbar-links">
            {NAV_LINKS.map(l => (
              <NavLink key={l.to} to={l.to} end={l.end}
                className={({ isActive }) => isActive ? 'active' : ''}>
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop search */}
          <div className="navbar-search">
            <span className="navbar-search-icon">🔍</span>
            <input type="text" placeholder="Search for courses…" aria-label="Search courses" />
          </div>

          {/* Auth + theme */}
          <div className="navbar-auth">
            {/* Theme toggle */}
            <button className="theme-toggle" onClick={toggle} aria-label="Toggle dark mode" title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {isAuthenticated ? (
              <>
                <Link to={user?.is_admin ? "/admin" : "/dashboard"} className="btn btn-sm btn-outline">
                  {user?.is_admin ? "Admin Panel" : "My Dashboard"}
                </Link>
                <div className="navbar-user">
                  <div className="navbar-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
                  <span>{user?.name?.split(' ')[0]}</span>
                </div>
                <button className="btn btn-sm btn-outline" onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-sm btn-outline">Log In</Link>
                <Link to="/login" className="btn btn-sm btn-primary">Sign Up Free</Link>
              </>
            )}

            {/* Hamburger */}
            <button
              className={`navbar-hamburger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(p => !p)}
              aria-label="Toggle menu"
            >
              <div className="hamburger-line" />
              <div className="hamburger-line" />
              <div className="hamburger-line" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`mobile-drawer ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <div className="mobile-search">
          <input type="text" placeholder="🔍  Search for courses…" />
        </div>
        <nav className="mobile-drawer-nav">
          {NAV_LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => `mobile-drawer-link ${isActive ? 'active' : ''}`}>
              <span className="mobile-drawer-icon">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
          {isAuthenticated && (
            <NavLink to={user?.is_admin ? "/admin" : "/dashboard"} className={({ isActive }) => `mobile-drawer-link ${isActive ? 'active' : ''}`}>
              <span className="mobile-drawer-icon">📊</span>
              {user?.is_admin ? "Admin Panel" : "My Dashboard"}
            </NavLink>
          )}
        </nav>
        <div className="mobile-drawer-divider" />
        <div className="mobile-drawer-auth">
          {isAuthenticated ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                <div className="navbar-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
                <span>{user?.name}</span>
              </div>
              <button className="btn btn-outline" onClick={logout}>Log Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>Log In</Link>
              <Link to="/login" className="btn btn-primary">Sign Up Free →</Link>
            </>
          )}
          <button onClick={toggle} className="btn" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)', justifyContent: 'center' }}>
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Footer ────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="navbar-logo">
              <div className="navbar-logo-icon">◎</div>
              <span className="navbar-logo-text">Skill<span>Orbit</span></span>
            </Link>
            <p>Empowering learners worldwide with world-class online education. Join millions advancing their careers.</p>
            <div className="footer-socials">
              <a href="#" aria-label="Twitter">𝕏</a>
              <a href="#" aria-label="LinkedIn">in</a>
              <a href="#" aria-label="YouTube">▶</a>
              <a href="#" aria-label="Facebook">f</a>
              <a href="#" aria-label="Instagram">◈</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Learn</h4>
            <ul>
              <li><Link to="/courses">All Courses</Link></li>
              <li><a href="#">Certificates</a></li>
              <li><a href="#">Degrees</a></li>
              <li><a href="#">For Business</a></li>
              <li><a href="#">For Universities</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Blog</a></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><a href="#">Press</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Community</a></li>
              <li><a href="#">Accessibility</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} SkillOrbit, Inc. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Layout wrapper ────────────────────────────────────────────── */
function Layout({ children }) {
  const { pathname } = useLocation();
  return (
    <div className="page-root">
      <Navbar />
      <main key={pathname} className="page-enter">{children}</main>
      <Footer />
    </div>
  );
}

/* ─── App ───────────────────────────────────────────────────────── */
function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <CourseProvider>
          <ThemeProvider>
            <GamificationProvider>
              <Router>
                <ScrollToTop />
                <Routes>
                  {/* Auth page — no shared layout */}
                  <Route path="/login" element={<LoginSignup />} />

                  {/* Public pages */}
                  <Route path="/" element={<Layout><Home /></Layout>} />
                  <Route path="/courses" element={<Layout><Courses /></Layout>} />
                  <Route path="/courses/:id" element={<Layout><CourseDetail /></Layout>} />
                  <Route path="/about" element={<Layout><About /></Layout>} />
                  <Route path="/contact" element={<Layout><Contact /></Layout>} />

                  {/* Protected pages */}
                  <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />

                  {/* Admin pages */}
                  <Route path="/admin" element={<AdminRoute><Layout><AdminDashboard /></Layout></AdminRoute>} />

                  {/* In-course pages */}
                  <Route path="/learn/:courseId" element={<ProtectedRoute><Layout><CourseHome /></Layout></ProtectedRoute>} />
                  <Route path="/learn/:courseId/lecture/:lectureId" element={<ProtectedRoute><LecturePage /></ProtectedRoute>} />
                  <Route path="/learn/:courseId/notes" element={<ProtectedRoute><Layout><CourseNotes /></Layout></ProtectedRoute>} />
                </Routes>
              </Router>
            </GamificationProvider>
          </ThemeProvider>
        </CourseProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
