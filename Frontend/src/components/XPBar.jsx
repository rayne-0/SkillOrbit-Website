/**
 * XPBar.jsx
 * Compact XP progress bar for the LecturePage topbar.
 * Shows current level, fill bar, and total XP.
 */
import React from 'react';
import { useGamification, LEVEL_XP_THRESHOLDS } from '../context/GamificationContext';
import './XPBar.css';

export default function XPBar() {
  const { profile } = useGamification();
  const { xp = 0, level = 1, next_level_xp, current_level_xp } = profile;

  const levelXP = current_level_xp ?? LEVEL_XP_THRESHOLDS[level - 1] ?? 0;
  const nextXP  = next_level_xp  ?? LEVEL_XP_THRESHOLDS[level]       ?? 100;
  const range   = Math.max(nextXP - levelXP, 1);
  const pct     = Math.min(((xp - levelXP) / range) * 100, 100);

  return (
    <div className="xp-bar-wrap" title={`${xp} XP total — Level ${level}`}>
      <div className="xp-level-badge">Lv {level}</div>
      <div className="xp-bar-track">
        <div className="xp-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="xp-text">{xp} XP</div>
    </div>
  );
}
