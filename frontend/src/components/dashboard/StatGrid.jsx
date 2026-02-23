import React from 'react';
import StatCard from './StatCard';

function StatGrid({ statCards, openMetricDetails }) {
  return (
    <section className="stat-grid">
      {statCards.map((card) => (
        <StatCard key={card.id} card={card} openMetricDetails={openMetricDetails} />
      ))}
    </section>
  );
}

export default StatGrid;
