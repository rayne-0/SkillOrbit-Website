/**
 * BadgeCard.jsx
 * Displays a single gamification badge — earned or locked.
 */
import React from 'react';
import './BadgeCard.css';

export default function BadgeCard({ badge }) {
  const { icon, name, description, earned } = badge;
  return (
    <div className={`badge-card ${earned ? 'earned' : 'locked'}`} title={description}>
      {earned && <div className="badge-earned-mark">✓</div>}
      {!earned && <div className="badge-lock-icon">🔒</div>}
      <span className="badge-icon">{icon}</span>
      <div className="badge-name">{name}</div>
      <div className="badge-desc">{description}</div>
    </div>
  );
}
