import React, { useState, useRef, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { COURSE_DATA, LESSON_CONTENT, getNextLesson, getPrevLesson, getAllLessons } from '../data/courseData';
import AIMentor from '../components/AIMentor';
import LessonCompleteModal from '../components/LessonCompleteModal';
import XPBar from '../components/XPBar';
import { useGamification } from '../context/GamificationContext';
import { useAuth } from '../context/AuthContext';
import './LecturePage.css';

const TYPE_ICONS = { video: '▶', quiz: '📝', assignment: '📋' };
const API_BASE = 'http://localhost:8000';

function fmtTime(secs) {
  const m = Math.floor(secs / 60); const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function LecturePage() {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { profile, awardXP } = useGamification();

  const course = COURSE_DATA[courseId] || COURSE_DATA[1];
  const allLessons = getAllLessons(courseId || '1');

  const currentLesson = allLessons.find(l => l.id === lectureId) || allLessons[4];
  const content = LESSON_CONTENT[currentLesson.id] || LESSON_CONTENT['l1'];

  const nextLess = getNextLesson(courseId || '1', currentLesson.id);
  const prevLess = getPrevLesson(courseId || '1', currentLesson.id);

  const [sidebarOpen, setSidebarOpen]       = useState(true);
  const [openModule, setOpenModule]         = useState(course.modules.find(m => m.lessons.some(l => l.id === currentLesson.id))?.id);
  const [activeTab, setActiveTab]           = useState('overview');
  const [isPlaying, setIsPlaying]           = useState(false);
  const [completed, setCompleted]           = useState(currentLesson.done);
  const [showModal, setShowModal]           = useState(false);
  const [modalData, setModalData]           = useState(null);
  const [xpFlash, setXpFlash]              = useState(null);
  const [loadingComplete, setLoadingComplete] = useState(false);

  // Notes
  const [notes, setNotes] = useState([
    { id: 1, ts: '3:45', text: 'Remember: use elif not else if — Python syntax is cleaner this way.' },
    { id: 2, ts: '7:12', text: 'Truthy values: any non-zero, non-empty value. Falsy: 0, "", None, False, [], {}' },
  ]);
  const [noteInput, setNoteInput] = useState('');
  const [currentTime] = useState(214);

  const addNote = () => {
    if (!noteInput.trim()) return;
    setNotes(prev => [...prev, { id: Date.now(), ts: fmtTime(currentTime), text: noteInput.trim() }]);
    setNoteInput('');
  };
  const deleteNote = id => setNotes(prev => prev.filter(n => n.id !== id));

  const [qaInput, setQaInput] = useState('');

  // ── Mark Complete ────────────────────────────────────────────
  const handleMarkComplete = useCallback(async () => {
    if (completed || loadingComplete) return;
    setLoadingComplete(true);

    let gamResult = null;

    // Try to persist progress to backend
    if (isAuthenticated) {
      try {
        const stored = localStorage.getItem('skillorbit_tokens');
        const tokens = stored ? JSON.parse(stored) : null;
        if (tokens?.access) {
          const res = await fetch(`${API_BASE}/api/courses/${courseId}/progress/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokens.access}`,
            },
            body: JSON.stringify({ lesson_id: currentLesson.id }),
          });
          const data = await res.json();
          if (data.success) gamResult = data.gamification;
        }
      } catch (e) {
        console.warn('Progress sync failed, continuing optimistically');
      }

      // Award XP via context if not already done by backend
      if (!gamResult) {
        gamResult = await awardXP(50, 'lesson');
      }
    }

    setCompleted(true);
    setLoadingComplete(false);

    // Show XP flash notification
    const xpGained = gamResult?.xp_gained ?? 50;
    setXpFlash(`+${xpGained} XP`);
    setTimeout(() => setXpFlash(null), 2500);

    // Show celebration modal
    setModalData({
      xpEarned:  gamResult?.xp_gained  ?? xpGained,
      newLevel:  gamResult?.new_level  ?? profile.level,
      oldLevel:  gamResult?.old_level  ?? profile.level,
      totalXP:   gamResult?.new_xp     ?? (profile.xp + xpGained),
      streak:    gamResult?.streak     ?? profile.streak,
      newBadges: gamResult?.new_badges_full ?? [],
    });
    setShowModal(true);
  }, [completed, loadingComplete, isAuthenticated, courseId, currentLesson.id, awardXP, profile]);

  const handleNextLesson = useCallback(() => {
    setShowModal(false);
    if (nextLess) navigate(`/learn/${courseId}/lecture/${nextLess.id}`);
  }, [nextLess, navigate, courseId]);

  const handleStayHere = useCallback(() => {
    setShowModal(false);
  }, []);

  return (
    <div className="lecture-page">
      {/* ── XP gain flash popup ── */}
      {xpFlash && <div className="xp-gain-flash">{xpFlash}</div>}

      {/* ── Celebration Modal ── */}
      {showModal && modalData && (
        <LessonCompleteModal
          lessonTitle={currentLesson.title}
          xpEarned={modalData.xpEarned}
          newLevel={modalData.newLevel}
          oldLevel={modalData.oldLevel}
          totalXP={modalData.totalXP}
          streak={modalData.streak}
          newBadges={modalData.newBadges}
          onNext={nextLess ? handleNextLesson : null}
          onStay={handleStayHere}
        />
      )}

      {/* ── Top bar ── */}
      <div className="lecture-topbar">
        <Link to="/" className="lecture-topbar-logo">
          <div className="lecture-topbar-logo-icon">◎</div>
          <span className="lecture-topbar-logo-text">Skill<span>Orbit</span></span>
        </Link>
        <div className="topbar-divider" />
        <div className="lecture-course-title">{course.title}</div>
        <div className="lecture-topbar-actions">
          {/* XP bar */}
          {isAuthenticated && <XPBar />}
          <button className="topbar-btn" onClick={() => setSidebarOpen(p => !p)}>
            {sidebarOpen ? '◀ Hide' : '▶ Outline'}
          </button>
          <Link to={`/learn/${courseId}/notes`} className="topbar-btn">📝 Notes</Link>
          <Link to={`/learn/${courseId}`} className="topbar-btn">Course Home</Link>
          {nextLess && (
            <button className="topbar-btn primary" onClick={() => navigate(`/learn/${courseId}/lecture/${nextLess.id}`)}>
              Next →
            </button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="lecture-body">
        {/* Left sidebar */}
        <div className={`lecture-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
          <div className="lecture-sidebar-header">
            <span>Course Content</span>
            <span className="sidebar-progress-mini">{allLessons.filter(l => l.done).length}/{allLessons.length}</span>
          </div>
          <div className="lecture-sidebar-scroll">
            {course.modules.map(mod => {
              const isOpen = openModule === mod.id;
              const modDone = mod.lessons.filter(l => l.done).length;
              const pct = Math.round((modDone / mod.lessons.length) * 100);
              return (
                <div key={mod.id} className="lsb-module">
                  <div className="lsb-module-header" onClick={() => setOpenModule(isOpen ? null : mod.id)}>
                    <div className="lsb-module-title">{mod.title}</div>
                    <div className="lsb-module-meta">
                      <span>{modDone}/{mod.lessons.length}</span>
                      <span>·</span>
                      <span>{mod.duration}</span>
                    </div>
                    <div className="lsb-prog-bar"><div className="lsb-prog-fill" style={{ width: `${pct}%` }} /></div>
                  </div>
                  {isOpen && mod.lessons.map(lesson => (
                    <div
                      key={lesson.id}
                      className={`lsb-lesson ${lesson.id === currentLesson.id ? 'active' : ''}`}
                      onClick={() => navigate(`/learn/${courseId}/lecture/${lesson.id}`)}
                    >
                      <div className={`lsb-check ${lesson.done ? 'done' : lesson.id === currentLesson.id ? 'current' : ''}`}>
                        {lesson.done ? '✓' : ''}
                      </div>
                      <span className="lsb-icon">{TYPE_ICONS[lesson.type]}</span>
                      <span className={`lsb-name ${lesson.done ? 'done' : ''} ${lesson.id === currentLesson.id ? 'active-name' : ''}`}>
                        {lesson.title}
                      </span>
                      <span className="lsb-dur">{lesson.type === 'video' ? lesson.duration : ''}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main player area */}
        <div className="lecture-main">
          {/* Video player */}
          <div className="video-container">
            <div className="video-placeholder">
              <div className="big-icon">💻</div>
              <div className="video-title">{currentLesson.title}</div>
              <div className="video-sub">{currentLesson.type === 'video' ? `Duration: ${currentLesson.duration}` : currentLesson.type.charAt(0).toUpperCase() + currentLesson.type.slice(1)}</div>
            </div>
            {currentLesson.type === 'video' && (
              <div className="video-controls">
                <div className="video-progress">
                  <div className="video-progress-fill" />
                  <div className="video-progress-thumb" />
                </div>
                <div className="video-ctrl-row">
                  <button className="ctrl-btn ctrl-play" onClick={() => setIsPlaying(p => !p)}>
                    {isPlaying ? '⏸' : '▶'}
                  </button>
                  <button className="ctrl-btn">⏮</button>
                  <button className="ctrl-btn">⏭</button>
                  <button className="ctrl-btn">🔊</button>
                  <span className="ctrl-time">3:34 / {currentLesson.duration}</span>
                  <div className="ctrl-spacer" />
                  <div className="ctrl-settings">
                    <span className="ctrl-quality">1080p</span>
                    <button className="ctrl-btn">⚙️</button>
                    <button className="ctrl-btn">⛶</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Panel */}
          <div className="lecture-content-panel">
            {/* Lesson header */}
            <div className="lesson-header-bar">
              <div>
                <div className="lesson-header-title">{currentLesson.title}</div>
                <div className="lesson-header-meta">{currentLesson.moduleTitle} · {currentLesson.type} · {currentLesson.duration}</div>
              </div>
              <div className="lesson-nav-btns">
                {prevLess && (
                  <button className="topbar-btn" onClick={() => navigate(`/learn/${courseId}/lecture/${prevLess.id}`)}>← Prev</button>
                )}
                {nextLess && (
                  <button className="topbar-btn primary" onClick={() => navigate(`/learn/${courseId}/lecture/${nextLess.id}`)}>Next →</button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="panel-tabs">
              {['overview', 'notes', 'q&a', 'resources'].map(t => (
                <button key={t} className={`panel-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                  {t === 'q&a' ? 'Q&A' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <div className="panel-content">
              {/* Overview */}
              {activeTab === 'overview' && (
                <div className="lesson-overview-body">
                  <h3>About This Lesson</h3>
                  <p>{content.overview}</p>
                  <h3>What You'll Learn</h3>
                  <ul>{content.points.map(p => <li key={p}>{p}</li>)}</ul>
                </div>
              )}

              {/* Notes */}
              {activeTab === 'notes' && (
                <div>
                  <div className="notes-add-area">
                    <div className="notes-timestamp">📍 At {fmtTime(currentTime)} — click a note timestamp to jump to that moment</div>
                    <textarea
                      className="notes-input"
                      placeholder="Take a note at the current timestamp…"
                      value={noteInput}
                      onChange={e => setNoteInput(e.target.value)}
                    />
                    <div className="notes-add-footer">
                      <button className="topbar-btn" onClick={() => setNoteInput('')}>Cancel</button>
                      <button className="topbar-btn primary" onClick={addNote}>Save Note</button>
                    </div>
                  </div>
                  {notes.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.3)' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                      <p>No notes yet. Jot something down while watching!</p>
                    </div>
                  )}
                  {notes.map(n => (
                    <div key={n.id} className="note-item">
                      <div className="note-item-header">
                        <span className="note-item-ts">⏱ {n.ts}</span>
                        <div className="note-item-actions">
                          <button className="note-action-btn" title="Edit">✏️</button>
                          <button className="note-action-btn" title="Delete" onClick={() => deleteNote(n.id)}>🗑</button>
                        </div>
                      </div>
                      <div className="note-item-text">{n.text}</div>
                    </div>
                  ))}
                  <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                    <Link to={`/learn/${courseId}/notes`} className="topbar-btn" style={{ display: 'inline-flex' }}>
                      View All Course Notes →
                    </Link>
                  </div>
                </div>
              )}

              {/* Q&A */}
              {activeTab === 'q&a' && (
                <div>
                  <div className="qa-input-row" style={{ marginBottom: '1.5rem' }}>
                    <input className="qa-input" placeholder="Ask a question about this lecture…" value={qaInput} onChange={e => setQaInput(e.target.value)} />
                    <button className="topbar-btn primary" onClick={() => setQaInput('')}>Post</button>
                  </div>
                  {content.qa.map((q, i) => (
                    <div key={i} className="qa-item">
                      <div className="qa-question">Q: {q.q}</div>
                      <div className="qa-meta">{q.meta}</div>
                      <div className="qa-answer">A: {q.a}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Resources */}
              {activeTab === 'resources' && (
                <div>
                  {content.resources.map((r, i) => (
                    <div key={i} className="resource-item">
                      <div className="resource-icon">{r.type === 'pdf' ? '📄' : r.type === 'zip' ? '🗜' : '📁'}</div>
                      <div>
                        <div className="resource-name">{r.name}</div>
                        <div className="resource-size">{r.size}</div>
                      </div>
                      <div className="resource-download">⬇</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mark complete bar */}
          <div className="complete-bar">
            <span className="complete-bar-left">
              {prevLess && (
                <button className="topbar-btn" onClick={() => navigate(`/learn/${courseId}/lecture/${prevLess.id}`)}>← Previous</button>
              )}
            </span>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                className={`topbar-btn ${completed ? 'primary' : ''}`}
                onClick={handleMarkComplete}
                disabled={completed || loadingComplete}
                style={{ minWidth: 160 }}
              >
                {loadingComplete ? '⏳ Saving…' : completed ? '✓ Completed' : 'Mark as Complete'}
              </button>
              {nextLess && (
                <button className="topbar-btn primary" onClick={() => navigate(`/learn/${courseId}/lecture/${nextLess.id}`)}>
                  Next Lesson →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── AI Mentor (floating) ── */}
      <AIMentor
        lessonTitle={currentLesson.title}
        lessonOverview={content.overview}
      />
    </div>
  );
}
