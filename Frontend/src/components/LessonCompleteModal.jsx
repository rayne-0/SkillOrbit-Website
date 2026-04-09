/**
 * LessonCompleteModal.jsx
 * Celebration modal shown when a lesson is marked complete.
 * Shows XP earned, level-up notification, new badges, and a
 * 5-second auto-advance countdown to the next lesson.
 */
import React, { useEffect, useState, useRef } from 'react';
import './LessonCompleteModal.css';

// ── CSS Confetti generator ──────────────────────────────────────
const CONFETTI_COLORS = [
  '#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#34D399',
  '#F472B6', '#60A5FA', '#FB923C', '#FBBF24',
];

function generateConfetti(count = 40) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: `${(i / count) * 100 + Math.random() * 2}%`,
    width: `${6 + Math.random() * 8}px`,
    height: `${8 + Math.random() * 10}px`,
    delay: `${Math.random() * 2}s`,
    duration: `${2 + Math.random() * 2}s`,
    borderRadius: Math.random() > 0.5 ? '50%' : '2px',
  }));
}

const CONFETTI_PIECES = generateConfetti(45);

export default function LessonCompleteModal({
  onNext = null,       // () => void — navigate to next lesson
  onStay = null,       // () => void — close modal, stay on page
  lessonTitle = 'Lesson',
  xpEarned = 50,
  newLevel = null,     // number | null (if leveled up)
  oldLevel = null,
  newBadges = [],      // array of badge objects { icon, name }
  totalXP = 0,
  streak = 0,
}) {
  const COUNTDOWN_SECS = 5;
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECS);
  const [cancelled, setCancelled] = useState(!onNext);
  const timerRef = useRef(null);

  useEffect(() => {
    if (cancelled || !onNext) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          onNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [cancelled, onNext]);

  const handleStay = () => {
    clearInterval(timerRef.current);
    setCancelled(true);
    onStay?.();
  };

  const leveledUp = newLevel && oldLevel && newLevel > oldLevel;
  const pct = ((COUNTDOWN_SECS - secondsLeft) / COUNTDOWN_SECS) * 100;

  return (
    <div className="lesson-complete-overlay" role="dialog" aria-modal="true" aria-label="Lesson complete">
      {/* Confetti */}
      <div className="confetti-container" aria-hidden="true">
        {CONFETTI_PIECES.map(p => (
          <div
            key={p.id}
            className="confetti-piece"
            style={{
              left: p.left,
              width: p.width,
              height: p.height,
              background: p.color,
              borderRadius: p.borderRadius,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      <div className="lesson-complete-modal">
        {/* Trophy */}
        <span className="lc-trophy" aria-hidden="true">🏆</span>
        <h2 className="lc-title">Lesson Complete!</h2>
        <p className="lc-subtitle">"{lessonTitle}" — well done! 🎉</p>

        {/* XP / Streak stats */}
        <div className="lc-stats-row">
          <div className="lc-stat-pill">
            <div className="lc-stat-value xp">+{xpEarned} XP</div>
            <div className="lc-stat-label">Earned</div>
          </div>
          <div className="lc-stat-pill">
            <div className="lc-stat-value green">{totalXP} XP</div>
            <div className="lc-stat-label">Total XP</div>
          </div>
          <div className="lc-stat-pill">
            <div className="lc-stat-value">{streak}🔥</div>
            <div className="lc-stat-label">Day Streak</div>
          </div>
        </div>

        {/* Level up banner */}
        {leveledUp && (
          <div className="lc-levelup-banner">
            🌟 Level Up! You reached <strong>Level {newLevel}</strong>!
          </div>
        )}

        {/* New badges */}
        {newBadges.length > 0 && (
          <div className="lc-new-badges">
            {newBadges.map((b, i) => (
              <div key={i} className="lc-badge-chip">
                <span>{b.icon}</span>
                <span>{b.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Countdown */}
        {onNext && !cancelled && (
          <div className="lc-countdown-wrap">
            <div className="lc-countdown-label">
              Next lesson in {secondsLeft}s…
            </div>
            <div className="lc-countdown-bar-track">
              <div className="lc-countdown-bar-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="lc-actions">
          {cancelled ? (
            <button className="lc-btn lc-btn-secondary" onClick={onStay}>
              Continue Studying
            </button>
          ) : (
            <button className="lc-btn lc-btn-secondary" onClick={handleStay}>
              Stay Here
            </button>
          )}
          {onNext && (
            <button className="lc-btn lc-btn-primary" onClick={onNext}>
              Next Lesson →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
