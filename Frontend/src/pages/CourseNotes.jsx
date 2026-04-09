import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { COURSE_DATA, getAllLessons } from '../data/courseData';
import './CourseNotes.css';

const SAMPLE_NOTES = [
  { id: 1, moduleId: 'm1', lessonId: 'l1', lessonTitle: 'Welcome & Course Overview', ts: '1:20', text: 'Course uses Python 3.12. Download from python.org. VS Code is the recommended editor.' },
  { id: 2, moduleId: 'm1', lessonId: 'l3', lessonTitle: 'Your First Python Program', ts: '5:44', text: 'print() is a function. Remember the parentheses! print("Hello World")' },
  { id: 3, moduleId: 'm1', lessonId: 'l3', lessonTitle: 'Your First Python Program', ts: '11:02', text: 'Python is interpreted — no compilation step needed. Just run: python main.py' },
  { id: 4, moduleId: 'm2', lessonId: 'l6', lessonTitle: 'Data Types & Type Casting', ts: '2:15', text: 'Main types: int, float, str, bool, list, tuple, dict, set. Use type() to check.' },
  { id: 5, moduleId: 'm2', lessonId: 'l7', lessonTitle: 'Strings & String Methods', ts: '9:30', text: 'f-strings are the cleanest way: f"Hello {name}" — much better than .format()' },
  { id: 6, moduleId: 'm2', lessonId: 'l7', lessonTitle: 'Strings & String Methods', ts: '14:05', text: 'Key methods: .upper() .lower() .strip() .split() .replace() .startswith() .endswith()' },
  { id: 7, moduleId: 'm2', lessonId: 'l10', lessonTitle: 'Control Flow: if / elif / else', ts: '3:45', text: 'Remember: use elif not else if — Python syntax is cleaner this way.' },
  { id: 8, moduleId: 'm2', lessonId: 'l10', lessonTitle: 'Control Flow: if / elif / else', ts: '7:12', text: 'Truthy values: any non-zero, non-empty value. Falsy: 0, "", None, False, [], {}' },
];

export default function CourseNotes() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const course = COURSE_DATA[courseId] || COURSE_DATA[1];
  const allLessons = getAllLessons(courseId || '1');

  const [notes, setNotes] = useState(SAMPLE_NOTES);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const deleteNote = id => setNotes(prev => prev.filter(n => n.id !== id));
  const startEdit = n => { setEditingId(n.id); setEditText(n.text); };
  const saveEdit = id => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, text: editText } : n));
    setEditingId(null);
  };

  // Filter notes
  const filtered = notes
    .filter(n => activeFilter === 'all' || n.moduleId === activeFilter)
    .filter(n => !search || n.text.toLowerCase().includes(search.toLowerCase()) || n.lessonTitle.toLowerCase().includes(search.toLowerCase()));

  // Group by module
  const grouped = course.modules.map(mod => ({
    mod,
    notes: filtered.filter(n => n.moduleId === mod.id),
  })).filter(g => g.notes.length > 0);

  // Count notes per module
  const countPerModule = id => notes.filter(n => n.moduleId === id).length;

  return (
    <div className="notes-page">
      {/* Header */}
      <div className="notes-page-header">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem' }}>
                <Link to="/dashboard" style={{ color: 'rgba(255,255,255,0.4)' }}>My Learning</Link> ›{' '}
                <Link to={`/learn/${courseId}`} style={{ color: 'rgba(255,255,255,0.4)' }}>{course.title}</Link> › Notes
              </div>
              <h1>My Notes</h1>
              <p>{notes.length} notes across {course.modules.filter(m => notes.some(n => n.moduleId === m.id)).length} modules</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to={`/learn/${courseId}`} className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
                Course Home
              </Link>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const lesson = allLessons.find(l => l.current) || allLessons[0];
                  navigate(`/learn/${courseId}/lecture/${lesson.id}`);
                }}
              >
                ▶ Resume Learning
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="notes-layout">
          {/* Filter sidebar */}
          <aside className="notes-filter-sidebar">
            <div className="notes-filter-card">
              <h3>Filter by Module</h3>
              <div className="notes-module-filter">
                <div
                  className={`nf-item ${activeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('all')}
                >
                  All Modules
                  <span className="nf-count">{notes.length}</span>
                </div>
                {course.modules.map((mod, i) => (
                  <div
                    key={mod.id}
                    className={`nf-item ${activeFilter === mod.id ? 'active' : ''}`}
                    onClick={() => setActiveFilter(mod.id)}
                  >
                    <span style={{ flex: 1, fontSize: '0.82rem' }}>Module {i + 1}: {mod.title.split(' ').slice(0, 3).join(' ')}…</span>
                    <span className="nf-count">{countPerModule(mod.id)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>Study Tips</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-mid)', lineHeight: 1.65 }}>
                Notes with timestamps let you jump back to exact moments in the lecture. Click any timestamp to resume from that point.
              </p>
            </div>
          </aside>

          {/* Main */}
          <div className="notes-main">
            {/* Search */}
            <div className="notes-search-bar">
              <input
                type="text"
                placeholder="Search your notes…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button>🔍</button>
            </div>

            {grouped.length === 0 ? (
              <div className="notes-empty">
                <div className="empty-icon">📝</div>
                <h3>{search ? 'No notes match your search' : 'No notes yet'}</h3>
                <p>{search ? 'Try different keywords.' : 'Start watching lectures and jot down key insights.'}</p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const lesson = allLessons.find(l => l.current) || allLessons[0];
                    navigate(`/learn/${courseId}/lecture/${lesson.id}`);
                  }}
                >
                  ▶ Start Taking Notes
                </button>
              </div>
            ) : (
              <>
                {grouped.map(({ mod, notes: mNotes }, gi) => (
                  <div key={mod.id} className="note-group">
                    <div className="note-group-header">
                      <div className="note-group-num">{course.modules.indexOf(mod) + 1}</div>
                      <div className="note-group-title">{mod.title}</div>
                      <span className="badge badge-blue">{mNotes.length} notes</span>
                    </div>

                    {mNotes.map(note => (
                      <div key={note.id} className="full-note-card">
                        <div className="fnc-header" onClick={() => navigate(`/learn/${courseId}/lecture/${note.lessonId}`)}>
                          <div className="fnc-lesson-name">▶ {note.lessonTitle}</div>
                          <div className="fnc-timestamp">⏱ {note.ts}</div>
                        </div>
                        <div className="fnc-body">
                          {editingId === note.id ? (
                            <div>
                              <textarea
                                style={{ width: '100%', minHeight: 80, padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--primary)', fontFamily: 'var(--font)', fontSize: '0.875rem', outline: 'none', resize: 'vertical' }}
                                value={editText}
                                onChange={e => setEditText(e.target.value)}
                                autoFocus
                              />
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                <button className="fnc-btn" onClick={() => setEditingId(null)}>Cancel</button>
                                <button className="btn btn-primary btn-sm" onClick={() => saveEdit(note.id)}>Save</button>
                              </div>
                            </div>
                          ) : (
                            <div className="fnc-note-text">{note.text}</div>
                          )}
                        </div>
                        {editingId !== note.id && (
                          <div className="fnc-footer">
                            <button className="fnc-btn" onClick={() => startEdit(note)}>✏️ Edit</button>
                            <button className="fnc-btn danger" onClick={() => deleteNote(note.id)}>🗑 Delete</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Showing {filtered.length} of {notes.length} notes
                  {search && <button className="btn btn-outline btn-sm" style={{ marginLeft: '0.75rem' }} onClick={() => setSearch('')}>Clear search</button>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
