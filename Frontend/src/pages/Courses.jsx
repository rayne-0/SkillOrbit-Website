import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useScrollAnimation from '../hooks/useScrollAnimation';
import './Courses.css';

import { useCourses } from '../context/CourseContext';

const CATEGORIES = ['All', 'Programming', 'Web Dev', 'AI & ML', 'Data Science', 'Design', 'Cloud', 'Cybersecurity', 'Mobile Dev', 'DevOps'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

function Stars({ r }) {
  return <span className="stars">{'★'.repeat(Math.floor(r))}{r % 1 >= 0.5 ? '½' : ''}{'☆'.repeat(5 - Math.floor(r) - (r % 1 >= 0.5 ? 1 : 0))}</span>;
}

export default function Courses() {
  const [activeCat, setActiveCat] = useState('All');
  const [levels, setLevels] = useState([]);
  const [freeOnly, setFreeOnly] = useState(false);
  const [sort, setSort] = useState('popular');
  const [search, setSearch] = useState('');

  const { courses, loading } = useCourses();

  // Map API courses to UI required fields (fill missing)
  const allCoursesMapped = courses.map(c => ({
    ...c,
    category: c.category || 'Programming',
    rating: c.rating || 4.5,
    reviews: c.reviews || Math.floor(Math.random() * 50000),
    students: c.students || '10K',
    icon: c.thumbnail || '🎓',
    bestseller: c.bestseller || false
  }));

  const pageRef = useScrollAnimation();

  const toggleLevel = l => setLevels(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);

  const filtered = allCoursesMapped
    .filter(c => activeCat === 'All' || c.category === activeCat)
    .filter(c => levels.length === 0 || levels.includes(c.level))
    .filter(c => !freeOnly || c.price === 'Free')
    .filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating;
      if (sort === 'newest') return b.id - a.id;
      return b.reviews - a.reviews;
    });

  return (
    <div className="courses-page" ref={pageRef}>
      {/* Header */}
      <div className="courses-page-header">
        <div className="container animate">
          <h1>All Courses</h1>
          <p>{allCoursesMapped.length} courses across {CATEGORIES.length - 1} categories</p>
        </div>
      </div>

      <div className="container">
        {/* Category tabs */}
        <div style={{ padding: '1.5rem 0 0.5rem' }}>
          <div className="category-tabs">
            {CATEGORIES.map(cat => (
              <button key={cat} className={`cat-tab ${activeCat === cat ? 'active' : ''}`} onClick={() => setActiveCat(cat)}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="courses-layout">
          {/* Sidebar */}
          <aside className="filter-sidebar animate-left">
            {/* Search */}
            <div className="filter-card">
              <h3>Search</h3>
              <div className="courses-search">
                <input
                  type="text"
                  placeholder="Keyword..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <button>🔍</button>
              </div>
            </div>

            {/* Level */}
            <div className="filter-card">
              <h3>Level</h3>
              {LEVELS.map(l => (
                <label key={l} className="filter-option">
                  <input type="checkbox" checked={levels.includes(l)} onChange={() => toggleLevel(l)} />
                  {l}
                  <span className="filter-count">{allCoursesMapped.filter(c => c.level === l).length}</span>
                </label>
              ))}
            </div>

            {/* Price */}
            <div className="filter-card">
              <h3>Price</h3>
              <label className="filter-option">
                <input type="checkbox" checked={freeOnly} onChange={() => setFreeOnly(p => !p)} />
                Free only
                <span className="filter-count">{allCoursesMapped.filter(c => c.price === 'Free').length}</span>
              </label>
            </div>

            {/* Rating */}
            <div className="filter-card">
              <h3>Rating</h3>
              {[4.5, 4.0, 3.5].map(r => (
                <div key={r} className="filter-option">
                  <Stars r={r} /> <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>&amp; up</span>
                </div>
              ))}
            </div>
          </aside>

          {/* Main */}
          <div className="courses-main animate-right">
            <div className="courses-toolbar">
              <div className="courses-toolbar-left">
                Showing <strong>{filtered.length}</strong> results
                {activeCat !== 'All' && <> in <strong>{activeCat}</strong></>}
              </div>
              <div className="courses-sort">
                <select value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>Loading courses...</div>
            ) : (
            <div className="course-list stagger-children">
              {filtered.map(c => (
                <Link to={`/courses/${c.id}`} key={c.id} className="course-list-card">
                  <div className="course-list-thumb">{c.icon}</div>
                  <div className="course-list-body">
                    <div>
                      <div className="course-category">{c.category}</div>
                      <div className="course-title" style={{ marginBottom: '0.25rem', fontSize: '1rem' }}>{c.title}</div>
                      <div className="course-instructor">by {c.instructor}</div>
                    </div>
                    <div className="course-list-meta">
                      <div className="course-rating">
                        <span className="rating-score">{c.rating}</span>
                        <Stars r={c.rating} />
                        <span className="rating-count">({c.reviews.toLocaleString()})</span>
                      </div>
                      <span>⏱ {c.duration}</span>
                      <span>👥 {c.students}</span>
                      <span className="badge badge-blue">{c.level}</span>
                      {c.bestseller && <span className="badge badge-gold">Bestseller</span>}
                    </div>
                  </div>
                  <div className="course-list-price-area">
                    <div className={`course-list-price ${c.price === 'Free' ? 'free' : ''}`}>{c.price}</div>
                    <button className="btn btn-primary btn-sm" onClick={e => { e.preventDefault(); }}>Enroll Now</button>
                  </div>
                </Link>
              ))}

              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                  <p>No courses found for your filters. Try adjusting them.</p>
                </div>
              )}
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
