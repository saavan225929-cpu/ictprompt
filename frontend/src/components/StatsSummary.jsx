import React from 'react';

const StatsSummary = ({ counts = {}, selectedStatus, onSelectStatus }) => {
  const cards = [
    { key: 'All', label: 'Total', count: counts.total || 0, color: 'blue' },
    { key: 'Applied', label: 'Applied', count: counts.Applied || 0, color: 'sky' },
    { key: 'Interview', label: 'Interview', count: counts.Interview || 0, color: 'amber' },
    { key: 'Offer', label: 'Offer', count: counts.Offer || 0, color: 'purple' },
    { key: 'Accepted', label: 'Accepted', count: counts.Accepted || 0, color: 'emerald' },
    { key: 'Declined', label: 'Declined', count: counts.Declined || 0, color: 'slate' },
    { key: 'Rejected', label: 'Rejected', count: counts.Rejected || 0, color: 'rose' }
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => {
        const isCurrent =
          (selectedStatus === '' && card.key === 'All') ||
          selectedStatus === card.key;

        return (
          <button
            key={card.key}
            type="button"
            className={`stat-card stat-${card.color} ${isCurrent ? 'selected' : ''}`}
            onClick={() => onSelectStatus(card.key === 'All' ? '' : card.key)}
            title={`Filter by ${card.label}`}
          >
            <div className="stat-card-header">
              <span className="stat-label">{card.label}</span>
              <span className="stat-indicator"></span>
            </div>
            <div className="stat-number">{card.count}</div>
          </button>
        );
      })}
    </div>
  );
};

export default StatsSummary;
