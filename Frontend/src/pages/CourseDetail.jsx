import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useScrollAnimation from '../hooks/useScrollAnimation';
import { useCourses } from '../context/CourseContext';
import './CourseDetail.css';

const COURSES_DB = {
  1: {
    icon: '💻', category: 'Programming', title: 'The Complete Python Bootcamp: Zero to Expert',
    tagline: 'Go from absolute beginner to expert Python developer with 42 hours of project-based learning.',
    instructor: { name: 'Dr. Sarah Chen', title: 'Senior Software Engineer & Educator', initials: 'SC', bio: 'Dr. Sarah Chen has 12+ years of industry experience at companies like Google and Stripe. She has taught Python to over 180,000 students worldwide and holds a PhD in Computer Science from MIT.' },
    rating: 4.8, reviews: 42810, students: '180K', duration: '42 hours', lectures: 312, level: 'Beginner', language: 'English', price: '$14.99',
    lastUpdated: 'March 2025', bestseller: true,
    outcomes: ['Write clean, professional Python code', 'Build real-world projects from scratch', 'Master OOP, decorators, generators', 'Use Python for data science & automation', 'Understand algorithms & data structures', 'Publish Python packages to PyPI'],
    curriculum: [
      { section: 'Getting Started', duration: '1h 20m', items: ['Course Introduction', 'Installing Python & VS Code', 'Your First Python Program', 'Understanding Variables'] },
      { section: 'Python Fundamentals', duration: '4h 45m', items: ['Data Types & Operators', 'Control Flow & Loops', 'Functions & Scope', 'Error Handling'] },
      { section: 'Object-Oriented Python', duration: '5h 10m', items: ['Classes & Objects', 'Inheritance & Polymorphism', 'Magic Methods', 'Decorators Deep Dive'] },
      { section: 'Advanced Topics', duration: '6h 30m', items: ['Generators & Iterators', 'Async Programming', 'File Handling & I/O', 'Working with APIs'] },
      { section: 'Capstone Projects', duration: '8h', items: ['Project 1: CLI Task Manager', 'Project 2: Web Scraper', 'Project 3: REST API with FastAPI', 'Project 4: Data Dashboard'] },
    ],
    reviewsList: [
      { name: 'Tom S.', rating: 5, date: 'Feb 2025', text: 'Best Python course I\'ve ever taken. The projects make it click in a way that other courses don\'t.' },
      { name: 'Anika P.', rating: 5, date: 'Jan 2025', text: 'Dr. Chen explains everything so clearly. I went from zero coding knowledge to building real apps.' },
      { name: 'Marcus L.', rating: 4, date: 'Mar 2025', text: 'Excellent content. Some sections could be more concise but overall incredibly valuable.' },
    ],
    reviewDist: [45, 38, 10, 5, 2],
    includes: ['42 hours on-demand video', '25 coding exercises', '15 downloadable resources', 'Full lifetime access', 'Certificate of completion', 'Access on mobile & desktop'],
  },
};

const DEFAULT_COURSE = COURSES_DB[1];

function Stars({ r }) {
  return <span className="stars">{'★'.repeat(Math.floor(r))}{r % 1 >= 0.5 ? '½' : ''}{'☆'.repeat(5 - Math.floor(r) - (r % 1 >= 0.5 ? 1 : 0))}</span>;
}

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { courses, enrollments, enrollUser, purchaseCourse } = useCourses();
  
  const [tab, setTab] = useState('overview');
  const [openSection, setOpenSection] = useState(0);
  const [enrolling, setEnrolling] = useState(false);

  // Find course from DB or fallback
  const dbCourse = courses.find(c => String(c.id) === String(id));
  
  // Hydrate missing fields so UI doesn't break
  const course = dbCourse ? {
    ...dbCourse,
    category: dbCourse.category || 'Programming',
    rating: dbCourse.rating || 4.8,
    reviews: dbCourse.reviews || 12850,
    students: dbCourse.students || '45K',
    icon: dbCourse.thumbnail || '🎓',
    bestseller: dbCourse.bestseller || false,
    tagline: dbCourse.description || DEFAULT_COURSE.tagline,
    instructor: {
      name: dbCourse.instructor || DEFAULT_COURSE.instructor.name,
      title: 'Senior Educator',
      initials: dbCourse.instructor ? dbCourse.instructor[0] : 'IN',
      bio: 'Instructor details...'
    },
    lectures: dbCourse.modules ? dbCourse.modules.reduce((a, m) => a + (m.lessons?.length || 0), 0) : DEFAULT_COURSE.lectures,
    price: dbCourse.price || 'Free',
    duration: dbCourse.duration || '10 hours',
    language: 'English',
    lastUpdated: new Date().toLocaleDateString(),
    outcomes: DEFAULT_COURSE.outcomes,
    curriculum: dbCourse.modules ? dbCourse.modules.map(m => ({
      section: m.title,
      duration: '1h',
      items: m.lessons ? m.lessons.map(l => l.title) : []
    })) : DEFAULT_COURSE.curriculum,
    reviewsList: DEFAULT_COURSE.reviewsList,
    reviewDist: DEFAULT_COURSE.reviewDist,
    includes: DEFAULT_COURSE.includes,
  } : DEFAULT_COURSE;

  const isEnrolled = enrollments.some(e => String(e.course_id) === String(id));

  const handleEnroll = async () => {
    if (isEnrolled) {
      navigate(`/learn/${id}`);
      return;
    }
    try {
      setEnrolling(true);
      if (String(course.price).toLowerCase() === 'free') {
        await enrollUser(id);
      } else {
        await purchaseCourse(id);
      }
      navigate(`/learn/${id}`);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Payment failed or was cancelled.');
    } finally {
      setEnrolling(false);
    }
  };

  const pageRef = useScrollAnimation();

  return (
    <div ref={pageRef}>
      {/* ── Hero ── */}
      <div className="detail-hero">
        <div className="container">
          <div className="detail-hero-inner">
            <div className="animate-left">
              <div className="detail-breadcrumb">
                <Link to="/">Home</Link> › <Link to="/courses">Courses</Link> › {course.category}
              </div>

              <h1>{course.title}</h1>
              <p className="lead">{course.tagline}</p>

              <div className="detail-hero-meta">
                {course.bestseller && <span className="badge badge-gold">🏆 Bestseller</span>}
                <span className="badge badge-navy">{course.level}</span>
                <span className="rating-score">{course.rating}</span>
                <Stars r={course.rating} />
                <span>({course.reviews.toLocaleString()} ratings)</span>
                <span>·</span>
                <span>{course.students} students</span>
              </div>

              <div className="detail-hero-instructor">
                Created by <a href="#">{course.instructor.name}</a>
              </div>

              <div className="detail-hero-meta" style={{ marginTop: '0.75rem' }}>
                <span>🕐 Last updated {course.lastUpdated}</span>
                <span>🌐 {course.language}</span>
                <span>📚 {course.lectures} lectures</span>
                <span>⏱ {course.duration}</span>
              </div>
            </div>

            {/* Sidebar (shown here in hero for mobile, sticky on desktop) */}
            <div className="detail-sidebar animate-right">
              <div className="detail-sidebar-preview">
                <div style={{ fontSize: '4rem', zIndex: 1 }}>{course.icon}</div>
                <div className="play-btn">▶</div>
              </div>
              <div className="detail-sidebar-body">
                <div className="detail-price">{course.price}</div>
                <button
                  className={`btn ${isEnrolled ? 'btn-accent' : 'btn-primary'}`}
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? 'Enrolling...' : (isEnrolled ? '✓ Enrolled (Continue Learning)' : 'Enroll Now')}
                </button>
                <button className="btn btn-outline">Add to Wishlist ♡</button>
                <p className="detail-guarantee">🔒 30-Day Money-Back Guarantee</p>

                <div className="detail-includes">
                  <h4>This course includes:</h4>
                  <ul>
                    {course.includes.map(i => <li key={i}>✓ {i}</li>)}
                  </ul>
                </div>

                <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Share</button>
                  <button className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Gift</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="detail-body">
        <div className="container">
          <div className="detail-body-inner">
            <div>
              {/* Tabs */}
              <div className="detail-tabs animate">
                {['overview', 'curriculum', 'instructor', 'reviews'].map(t => (
                  <button key={t} className={`detail-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              {/* Overview */}
              {tab === 'overview' && (
                <div className="detail-panel animate">
                  <h3>What You'll Learn</h3>
                  <ul>
                    {course.outcomes.map(o => <li key={o}>{o}</li>)}
                  </ul>
                  <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'var(--bg-light)', borderRadius: 'var(--radius-md)' }}>
                    <h3 style={{ marginBottom: '0.6rem' }}>Requirements</h3>
                    <ul>
                      <li>No prior programming experience needed</li>
                      <li>A computer with internet access (Windows, Mac, or Linux)</li>
                      <li>Willingness to learn and practice</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Curriculum */}
              {tab === 'curriculum' && (
                <div className="detail-panel animate">
                  <h3>Course Curriculum</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '1.25rem' }}>
                    {course.curriculum.reduce((a, s) => a + s.items.length, 0)} lectures · {course.duration} total
                  </p>
                  {course.curriculum.map((sec, i) => (
                    <div key={i} className="curriculum-section">
                      <div className="curriculum-section-header" onClick={() => setOpenSection(openSection === i ? -1 : i)}>
                        <span>{sec.section}</span>
                        <span>{sec.items.length} lectures · {sec.duration}</span>
                      </div>
                      {openSection === i && sec.items.map((item, j) => (
                        <div key={j} className="curriculum-item">
                          <span className="curriculum-icon">▶</span> {item}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Instructor */}
              {tab === 'instructor' && (
                <div className="detail-panel animate">
                  <h3>Your Instructor</h3>
                  <div className="instructor-card">
                    <div className="instructor-avatar-lg">{course.instructor.initials}</div>
                    <div className="instructor-info">
                      <h4>{course.instructor.name}</h4>
                      <div className="instructor-title">{course.instructor.title}</div>
                      <div className="instructor-stats">
                        <span>⭐ {course.rating} Instructor Rating</span>
                        <span>📝 {course.reviews.toLocaleString()} Reviews</span>
                        <span>👥 {course.students} Students</span>
                      </div>
                      <p className="instructor-bio">{course.instructor.bio}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews */}
              {tab === 'reviews' && (
                <div className="detail-panel animate">
                  <h3>Student Reviews</h3>
                  <div className="reviews-summary">
                    <div className="review-score-big">
                      <div className="score">{course.rating}</div>
                      <Stars r={course.rating} />
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Course Rating</div>
                    </div>
                    <div className="review-bars">
                      {course.reviewDist.map((pct, i) => (
                        <div key={i} className="review-bar-row">
                          <div className="review-bar"><div className="review-bar-fill" style={{ width: `${pct}%` }} /></div>
                          <Stars r={5 - i} />
                          <span>{pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {course.reviewsList.map((r, i) => (
                    <div key={i} className="review-item">
                      <div className="review-header">
                        <div className="review-avatar">{r.name[0]}</div>
                        <div>
                          <div className="review-name">{r.name}</div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <Stars r={r.rating} />
                            <span className="review-date">{r.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="review-text">{r.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop sidebar is sticky — replicate a placeholder for layout */}
            <div style={{ display: 'none' }} aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}
