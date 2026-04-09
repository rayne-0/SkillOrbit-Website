import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useScrollAnimation from '../hooks/useScrollAnimation';
import './Home.css';

/* ── Data ─────────────────────────────────────────────────────── */
const CATEGORIES = [
  { icon: '💻', name: 'Programming', count: '1,200+ courses' },
  { icon: '📊', name: 'Data Science', count: '850+ courses' },
  { icon: '🎨', name: 'Design', count: '640+ courses' },
  { icon: '📈', name: 'Business', count: '720+ courses' },
  { icon: '🔐', name: 'Cybersecurity', count: '310+ courses' },
  { icon: '🤖', name: 'AI & ML', count: '480+ courses' },
  { icon: '📱', name: 'Mobile Dev', count: '290+ courses' },
  { icon: '☁️', name: 'Cloud', count: '360+ courses' },
];

const COURSES = [
  {
    id: 1, icon: '💻', category: 'Programming',
    title: 'The Complete Python Bootcamp: Zero to Expert',
    instructor: 'Dr. Sarah Chen', rating: 4.8, reviews: 42810,
    price: '$14.99', level: 'Beginner', bestseller: true,
  },
  {
    id: 2, icon: '🤖', category: 'AI & Machine Learning',
    title: 'Machine Learning A-Z: AI, Python & R in Data Science',
    instructor: 'Prof. James Liu', rating: 4.7, reviews: 38540,
    price: '$18.99', level: 'Intermediate', bestseller: true,
  },
  {
    id: 3, icon: '🎨', category: 'Design',
    title: 'UI/UX Design Masterclass: Figma, Prototyping & Research',
    instructor: 'Maria Rosetti', rating: 4.9, reviews: 21340,
    price: 'Free', level: 'All Levels', bestseller: false,
  },
  {
    id: 4, icon: '🌐', category: 'Web Development',
    title: 'The Modern React Development Course 2025',
    instructor: 'Alex Perkins', rating: 4.8, reviews: 58900,
    price: '$12.99', level: 'Intermediate', bestseller: true,
  },
  {
    id: 5, icon: '📊', category: 'Data Science',
    title: 'Data Analysis with Python & Pandas: A Practical Guide',
    instructor: 'Dr. Priya Sharma', rating: 4.6, reviews: 19230,
    price: '$15.99', level: 'Beginner', bestseller: false,
  },
  {
    id: 6, icon: '☁️', category: 'Cloud Computing',
    title: 'AWS Certified Solutions Architect — Associate 2025',
    instructor: 'Ryan O\'Brien', rating: 4.7, reviews: 32100,
    price: '$19.99', level: 'Advanced', bestseller: false,
  },
];

const PATHS = [
  {
    icon: '🚀', title: 'Full-Stack Developer',
    desc: 'Master both frontend and backend development with modern tools and frameworks.',
    courses: '12 courses', duration: '6 months',
  },
  {
    icon: '🧪', title: 'Data Scientist',
    desc: 'From statistics to machine learning — become a data-driven decision maker.',
    courses: '10 courses', duration: '5 months',
  },
  {
    icon: '🛡️', title: 'Cybersecurity Expert',
    desc: 'Protect systems and networks with cutting-edge security skills.',
    courses: '8 courses', duration: '4 months',
  },
];

const TESTIMONIALS = [
  {
    quote: 'SkillOrbit completely changed my career. I went from working retail to a $95k software engineering role in 9 months.',
    name: 'Marcus Williams', role: 'Software Engineer at Google', color: '#0056D2', initials: 'MW',
  },
  {
    quote: 'The quality of instruction here rivals any university. The projects gave me real portfolio pieces I could show in interviews.',
    name: 'Yuki Tanaka', role: 'UX Designer at Spotify', color: '#7c3aed', initials: 'YT',
  },
  {
    quote: 'I earned my AWS certification in 6 weeks using only SkillOrbit courses. The practice exams were spot-on.',
    name: 'Aisha Okonkwo', role: 'Cloud Architect at Amazon', color: '#00BFA5', initials: 'AO',
  },
];

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="stars">
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
}

/* ── Component ─────────────────────────────────────────────────── */
export default function Home() {
  const [searchQ, setSearchQ] = useState('');
  const pageRef = useScrollAnimation();

  return (
    <div ref={pageRef}>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <div className="hero-content">
              <div className="hero-tag">🎓 Trusted by 5M+ learners globally</div>
              <h1>Unlock Your <span>Full Potential</span> with Expert-Led Courses</h1>
              <p>
                Learn in-demand skills from world-class instructors. Earn recognized certificates
                and land the career you've always wanted — on your schedule.
              </p>

              <div className="hero-search">
                <input
                  type="text"
                  placeholder="What do you want to learn today?"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                />
                <button onClick={() => {}}>Search</button>
              </div>

              <div className="hero-cta">
                <Link to="/courses" className="btn btn-primary btn-lg">Browse Courses</Link>
                <Link to="/about" className="btn btn-white btn-lg">How It Works</Link>
              </div>

              <div className="hero-stats">
                <div className="hero-stat"><strong>5M+</strong>Active Learners</div>
                <div className="hero-stat"><strong>15K+</strong>Expert Courses</div>
                <div className="hero-stat"><strong>92%</strong>Completion Rate</div>
              </div>
            </div>

            {/* Floating card visual */}
            <div className="hero-visual">
              <div className="hero-card-stack">
                <div className="hcard hcard-main">
                  <div className="hcard-label">Currently Learning</div>
                  <div className="hcard-title">React & TypeScript Masterclass</div>
                  <div className="hcard-progress-bar">
                    <div className="hcard-progress-fill" style={{ width: '68%' }} />
                  </div>
                  <div className="hcard-progress-text"><span>Progress</span><span>68%</span></div>
                </div>
                <div className="hcard hcard-mini">
                  <div className="hcard-label">New Courses</div>
                  <div className="hcard-number">342</div>
                  <div className="hcard-sub">Added this month</div>
                </div>
                <div className="hcard hcard-mini2">
                  <div className="hcard-label">Certificate Earned</div>
                  <div className="hcard-title" style={{ fontSize: '0.85rem' }}>🏆 Python Developer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="stats-bar">
        <div className="container stats-bar-inner">
          {[
            { n: '15,000+', l: 'Online Courses' },
            { n: '5M+', l: 'Active Students' },
            { n: '1,200+', l: 'Expert Instructors' },
            { n: '180+', l: 'Countries' },
            { n: '4.8★', l: 'Average Rating' },
          ].map(s => (
            <div key={s.l} className="stat-item">
              <span className="stat-number">{s.n}</span>
              <span className="stat-label">{s.l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="section categories">
        <div className="container">
          <div className="section-header animate">
            <h2>Explore Top Categories</h2>
            <p>Discover expertise in high-demand fields</p>
          </div>
          <div className="categories-grid stagger-children">
            {CATEGORIES.map(c => (
              <Link to="/courses" key={c.name} className="cat-card">
                <div className="cat-icon">{c.icon}</div>
                <div className="cat-name">{c.name}</div>
                <div className="cat-count">{c.count}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Courses ── */}
      <section className="section featured-courses">
        <div className="container">
          <div className="section-header animate" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <h2>Most Popular Courses</h2>
              <p>Handpicked by our instructional experts</p>
            </div>
            <Link to="/courses" className="btn btn-outline">View All Courses →</Link>
          </div>
          <div className="courses-grid stagger-children">
            {COURSES.map(c => (
              <Link to={`/courses/${c.id}`} key={c.id} className="course-card">
                <div className="course-thumb" style={{ fontSize: '3.5rem' }}>
                  {c.icon}
                </div>
                <div className="course-body">
                  <div className="course-category">{c.category}</div>
                  <div className="course-title">{c.title}</div>
                  <div className="course-instructor">by {c.instructor}</div>
                  <div className="course-rating">
                    <span className="rating-score">{c.rating}</span>
                    <StarRating rating={c.rating} />
                    <span className="rating-count">({c.reviews.toLocaleString()})</span>
                  </div>
                  <div className="course-meta">
                    <span className={`course-price ${c.price === 'Free' ? 'free' : ''}`}>{c.price}</span>
                    <div className="course-badges">
                      {c.bestseller && <span className="badge badge-gold">Bestseller</span>}
                      <span className="badge badge-blue">{c.level}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partners ── */}
      <section className="partners">
        <div className="container">
          <h3>Trusted by learners at top companies & universities</h3>
          <div className="partners-strip">
            {['Google', 'Microsoft', 'Amazon', 'Meta', 'Stanford', 'MIT', 'IBM', 'Netflix'].map(p => (
              <div key={p} className="partner-logo">{p}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Learning Paths ── */}
      <section className="section paths">
        <div className="container">
          <div className="section-header animate">
            <h2>Structured Learning Paths</h2>
            <p>Curated roadmaps to take you from beginner to job-ready</p>
          </div>
          <div className="paths-grid stagger-children">
            {PATHS.map(p => (
              <div key={p.title} className="path-card">
                <div className="path-icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <div className="path-meta">
                  <span>{p.courses}</span>
                  <span>{p.duration}</span>
                </div>
                <Link to="/courses" className="btn btn-outline" style={{ marginTop: '1rem', borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
                  Explore Path →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section testimonials">
        <div className="container">
          <div className="section-header animate" style={{ textAlign: 'center' }}>
            <h2>Learners Love SkillOrbit</h2>
            <p>Real stories from students who transformed their careers</p>
          </div>
          <div className="testimonials-grid stagger-children">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="testimonial-card">
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar" style={{ background: t.color }}>{t.initials}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-banner">
        <div className="container">
          <h2>Start Learning for Free Today</h2>
          <p>Join over 5 million learners already advancing their careers on SkillOrbit.</p>
          <div>
            <Link to="/login" className="btn btn-white btn-lg">Get Started — It's Free</Link>
            <Link to="/courses" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.5)', color: '#fff' }}>
              Browse All Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
