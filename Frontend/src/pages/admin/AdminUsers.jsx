import React, { useState } from 'react';

export default function AdminUsers() {
  const [users] = useState([
    { id: 1, name: 'Alice Walker', email: 'alice@example.com', role: 'Learner', joined: '2026-03-12', courses: 4, status: 'Active' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Learner', joined: '2026-04-01', courses: 1, status: 'Active' },
    { id: 3, name: 'Dr. Sarah Chen', email: 'sarah@skillorbit.com', role: 'Admin', joined: '2025-11-20', courses: 0, status: 'Active' },
    { id: 4, name: 'Michael Doe', email: 'michael.doe@example.com', role: 'Learner', joined: '2026-04-18', courses: 2, status: 'Inactive' }
  ]);

  return (
    <div className="admin-courses-container animate-fade">
      <div className="admin-section-header">
        <h2>Manage Users</h2>
        <button className="btn btn-primary">+ Invite User</button>
      </div>

      <div className="admin-widgets stagger-children" style={{ marginBottom: '2rem' }}>
        <div className="admin-widget">
          <div className="aw-icon aw-blue">👥</div>
          <div className="aw-content">
            <div className="aw-value">4</div>
            <div className="aw-label">Total Users</div>
          </div>
        </div>
        <div className="admin-widget">
          <div className="aw-icon aw-green">🛡️</div>
          <div className="aw-content">
            <div className="aw-value">1</div>
            <div className="aw-label">Admins</div>
          </div>
        </div>
        <div className="admin-widget">
          <div className="aw-icon aw-teal">📈</div>
          <div className="aw-content">
            <div className="aw-value">3</div>
            <div className="aw-label">Active Learners</div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User Details</th>
              <th>Role</th>
              <th>Joined Date</th>
              <th>Enrolled Courses</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {user.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{user.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ 
                    padding: '0.4rem 1rem', 
                    borderRadius: '24px', 
                    fontSize: '0.75rem', 
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    background: user.role === 'Admin' ? 'linear-gradient(135deg, #fcd34d, #f59e0b)' : 'linear-gradient(135deg, #60a5fa, #3b82f6)', 
                    color: '#fff',
                    boxShadow: user.role === 'Admin' ? '0 4px 10px rgba(245, 158, 11, 0.3)' : '0 4px 10px rgba(59, 130, 246, 0.3)'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ fontWeight: 500, color: 'var(--text-muted)' }}>{user.joined}</td>
                <td style={{ fontWeight: 600 }}>{user.courses}</td>
                <td>
                  <span style={{ 
                    color: user.status === 'Active' ? '#10b981' : '#9ca3af',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <div style={{width: 8, height: 8, borderRadius: '50%', background: user.status === 'Active' ? '#10b981' : '#9ca3af'}}></div>
                    {user.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button className="btn btn-sm btn-outline" style={{ borderRadius: '8px', padding: '0.4rem 0.8rem' }}>View Profile</button>
                  <button className="btn btn-sm btn-outline ac-btn-danger" style={{ borderRadius: '8px', padding: '0.4rem 0.8rem' }}>Restrict</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
