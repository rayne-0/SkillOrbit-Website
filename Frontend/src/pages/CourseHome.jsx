import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';
import './CourseHome.css';

const LESSON_ICONS = { video: '▶', quiz: '📝', assignment: '📋' };

export default function CourseHome() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses, enrollments } = useCourses();
  
  const [openModules, setOpenModules] = useState(['m1', 'm2']);
  const [activeTab, setActiveTab] = useState('modules');

  const dbCourse = courses.find(c => String(c.id) === String(courseId));
  
  if (!dbCourse) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
        <h2>Loading Course Content...</h2>
      </div>
    );
  }

  const enrollment = enrollments.find(e => String(e.course_id) === String(courseId));
  const completedLessons = enrollment ? (enrollment.completed_lessons || []) : [];

  const course = {
    ...dbCourse,
    instructor: dbCourse.instructor || 'Unknown',
    totalDuration: dbCourse.duration || '0h',
    modules: (dbCourse.modules || []).map((m, mIdx) => ({
      id: m.module_id || `m${mIdx}`,
      title: m.title,
      duration: '1h',
      lessons: (m.lessons || []).map((l, lIdx) => ({
        id: l.lesson_id || `l${mIdx}-${lIdx}`,
        title: l.title,
        duration: l.duration || '10m',
        type: 'video',
        done: completedLessons.includes(l.lesson_id),
        current: enrollment?.last_accessed_lesson_id === l.lesson_id
      }))
    }))
  };

  const toggleModule = id => setOpenModules(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const totalLessons = course.modules.reduce((s, m) => s + (m.lessons?.length || 0), 0);
  const doneLessons = course.modules.reduce((s, m) => s + (m.lessons || []).filter(l => l.done).length, 0);
  const progress = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;
  
  const allLessons = course.modules.flatMap(m => m.lessons || []);
  const currentLesson = allLessons.find(l => l.current) || allLessons[0] || { id: 'l1' };

  // Find module completion
  const moduleProgress = m => {
    const done = m.lessons.filter(l => l.done).length;
    return { done, total: m.lessons.length, pct: Math.round((done / m.lessons.length) * 100) };
  };

  return (
    <div className="course-home">
      {/* Banner */}
      <div className="course-home-banner">
        <div className="container">
          <div className="course-home-banner-inner">
            <div>
              <div className="course-home-breadcrumb">
                <Link to="/dashboard">My Learning</Link>›<span>{course.title}</span>
              </div>
              <h1>{course.title}</h1>
              <div className="course-home-meta">
                <span>👨‍🏫 {course.instructor}</span>
                <span>·</span>
                <span>📚 {totalLessons} lessons</span>
                <span>·</span>
                <span>⏱ {course.totalDuration}</span>
                <span>·</span>
                <span>✅ {doneLessons} completed</span>
              </div>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate(`/learn/${courseId}/lecture/${currentLesson.id}`)}
              >
                {doneLessons > 0 ? '▶ Resume Learning' : '▶ Start Course'}
              </button>
              <Link to={`/learn/${courseId}/notes`} className="btn btn-outline btn-lg" style={{ marginLeft: '0.75rem', borderColor: 'rgba(255,255,255,0.35)', color: '#fff' }}>
                📝 My Notes
              </Link>
            </div>

            {/* Progress panel */}
            <div className="course-home-progress-card">
              <div className="chp-label">Your Progress</div>
              <div className="chp-pct">{progress}%</div>
              <div className="chp-bar"><div className="chp-fill" style={{ width: `${progress}%` }} /></div>
              <div className="chp-sub">{doneLessons} of {totalLessons} lessons complete</div>
              {progress >= 80
                ? <button className="btn btn-accent" style={{ width: '100%', justifyContent: 'center' }}>🏆 Claim Certificate</button>
                : <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>Complete 80% to unlock certificate</div>
              }
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="course-home-tabs">
        <div className="container course-home-tabs-inner">
          {[
            { key: 'modules', label: 'Course Content' },
            { key: 'overview', label: 'Overview' },
            { key: 'grades', label: 'Grades' },
            { key: 'discussion', label: 'Discussion' },
          ].map(t => (
            <button key={t.key} className={`ch-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="container">
        <div className="course-home-layout">
          {/* Modules */}
          <div>
            {activeTab === 'modules' && (
              <div className="modules-list">
                {course.modules.map((mod, mi) => {
                  const { done, total, pct } = moduleProgress(mod);
                  const isOpen = openModules.includes(mod.id);
                  const modDone = done === total;
                  return (
                    <div key={mod.id} className="module-card">
                      <div className="module-header" onClick={() => toggleModule(mod.id)}>
                        <div className={`module-num ${modDone ? 'done' : ''}`}>
                          {modDone ? '✓' : mi + 1}
                        </div>
                        <div className="module-info">
                          <div className="module-title">{mod.title}</div>
                          <div className="module-meta-row">
                            <span>{total} lessons</span>
                            <span>·</span>
                            <span>{mod.duration}</span>
                            <span>·</span>
                            <span style={{ color: pct > 0 ? 'var(--accent)' : 'inherit' }}>{done}/{total} done</span>
                          </div>
                        </div>
                        <span className={`module-chevron ${isOpen ? 'open' : ''}`}>▼</span>
                      </div>

                      {/* Progress strip */}
                      <div className="module-progress-mini">
                        <div className="module-progress-mini-fill" style={{ width: `${pct}%` }} />
                      </div>

                      {/* Lessons */}
                      {isOpen && (
                        <div className="module-lessons">
                          {mod.lessons.map(lesson => {
                            const isCurrent = lesson.current;
                            return (
                              <Link
                                key={lesson.id}
                                to={`/learn/${courseId}/lecture/${lesson.id}`}
                                className={`lesson-row ${isCurrent ? 'active-lesson' : ''}`}
                              >
                                <div className={`lesson-check ${lesson.done ? 'done' : isCurrent ? 'current' : ''}`}>
                                  {lesson.done ? '✓' : ''}
                                </div>
                                <span className="lesson-type-icon">{LESSON_ICONS[lesson.type]}</span>
                                <div className="lesson-info">
                                  <div className={`lesson-name ${lesson.done ? 'done' : ''}`}>
                                    {lesson.title}
                                    {isCurrent && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700 }}>▶ Continue here</span>}
                                  </div>
                                  <div className="lesson-dur">{lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)} · {lesson.duration}</div>
                                </div>
                                {mi === 0 && (
                                  <span className="lesson-preview-badge">Preview</span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'overview' && (
              <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '1.75rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>About This Course</h2>
                <p style={{ color: 'var(--text-mid)', lineHeight: 1.75, marginBottom: '1rem' }}>
                  This comprehensive Python course takes you from absolute zero to a confident, job-ready Python developer through hands-on projects and practical examples. You'll build real applications that you can showcase in your portfolio.
                </p>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>What You'll Learn</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {['Write clean, professional Python code', 'Master OOP and design patterns', 'Build REST APIs with FastAPI', 'Work with databases and ORMs', 'Automate tasks and scripts', 'Deploy Python applications'].map(p => (
                    <div key={p} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-mid)' }}>
                      <span style={{ color: 'var(--accent)', fontWeight: 700 }}>✓</span>{p}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'grades' && (
              <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '1.75rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Your Grades</h2>
                {[
                  { name: 'Module 1 Quiz', score: 95, max: 100, type: 'Quiz' },
                  { name: 'Practice Assignment 1', score: null, max: 100, type: 'Assignment' },
                  { name: 'Module 3 Quiz', score: null, max: 100, type: 'Quiz' },
                  { name: 'Final Capstone Project', score: null, max: 100, type: 'Assignment' },
                ].map((g, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 0', borderBottom: '1px solid var(--border-light)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{g.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{g.type}</div>
                    </div>
                    {g.score !== null
                      ? <span className="badge badge-green" style={{ fontSize: '0.875rem', padding: '0.3rem 0.75rem' }}>{g.score}/{g.max}</span>
                      : <span className="badge" style={{ background: 'var(--bg-light)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Not submitted</span>
                    }
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'discussion' && (
              <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '1.75rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💬</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Course Discussion</h3>
                <p>Ask questions, share insights, and connect with fellow learners.</p>
                <Link to={`/learn/${courseId}/lecture/l1`} className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
                  Go to Q&amp;A in Lectures
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="course-home-sidebar">
            <div className="sidebar-card">
              <h3>Course Stats</h3>
              {[
                { label: 'Total Duration', value: course.totalDuration },
                { label: 'Lectures', value: `${totalLessons}` },
                { label: 'Completed', value: `${doneLessons}` },
                { label: 'Remaining', value: `${totalLessons - doneLessons}` },
                { label: 'Quizzes', value: '2' },
                { label: 'Assignments', value: '2' },
              ].map(s => (
                <div key={s.label} className="sidebar-stat-row">
                  <span className="sidebar-stat-label">{s.label}</span>
                  <span className="sidebar-stat-value">{s.value}</span>
                </div>
              ))}
            </div>

            <div className="cert-banner">
              <div className="emoji">🏆</div>
              <h4>Earn Your Certificate</h4>
              <p>Complete {80 - progress > 0 ? `${80 - progress}% more` : 'the remaining lessons'} to unlock your certificate of completion.</p>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: '#00BFA5', borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>{progress}% complete</div>
            </div>

            <div className="sidebar-card">
              <h3>Quick Navigation</h3>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '0.5rem' }}
                onClick={() => navigate(`/learn/${courseId}/lecture/${currentLesson.id}`)}>
                ▶ Resume Learning
              </button>
              <Link to={`/learn/${courseId}/notes`} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                📝 All Notes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
