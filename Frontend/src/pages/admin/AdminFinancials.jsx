import React from 'react';

export default function AdminFinancials() {
  const transactions = [
    { id: 'TXN-9021', date: '2026-04-19', user: 'Bob Smith', course: 'Advanced React Patterns', amount: '₹1,500', status: 'Success' },
    { id: 'TXN-9020', date: '2026-04-18', user: 'Michael Doe', course: 'Node.js Backend Masterclass', amount: '₹2,200', status: 'Success' },
    { id: 'TXN-9019', date: '2026-04-15', user: 'Alice Walker', course: 'UI/UX Design Fundamentals', amount: '₹1,200', status: 'Refunded' },
  ];

  return (
    <div className="admin-courses-container animate-fade">
      <div className="admin-section-header">
        <h2>Financial Overview</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline">Export CSV</button>
          <button className="btn btn-primary">Generate Report</button>
        </div>
      </div>

      <div className="admin-widgets stagger-children" style={{ marginBottom: '2rem' }}>
        <div className="admin-widget">
          <div className="aw-icon aw-gold">💰</div>
          <div className="aw-content">
            <div className="aw-value">₹45,200</div>
            <div className="aw-label">Net Revenue (30 days)</div>
          </div>
        </div>
        <div className="admin-widget">
          <div className="aw-icon aw-teal">📈</div>
          <div className="aw-content">
            <div className="aw-value">+14%</div>
            <div className="aw-label">MoM Growth</div>
          </div>
        </div>
        <div className="admin-widget">
          <div className="aw-icon aw-blue">🔄</div>
          <div className="aw-content">
            <div className="aw-value">₹1,200</div>
            <div className="aw-label">Refunds Processed</div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h3 style={{ padding: '1.5rem', margin: 0, borderBottom: '1px solid var(--border)' }}>Recent Transactions</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Course</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(txn => (
              <tr key={txn.id}>
                <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{txn.id}</td>
                <td>{txn.date}</td>
                <td>{txn.user}</td>
                <td>{txn.course}</td>
                <td style={{ fontWeight: 'bold' }}>{txn.amount}</td>
                <td>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '20px', 
                    fontSize: '0.85rem', 
                    background: txn.status === 'Success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                    color: txn.status === 'Success' ? 'var(--success)' : 'var(--danger)' 
                  }}>
                    {txn.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
