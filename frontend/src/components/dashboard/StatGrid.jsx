import React from 'react';
import StatCard from './StatCard';

function StatGrid({ statCards, isTrendsView, openMetricDetails }) {
  return (
    <section className="stat-grid">
      {statCards.map((card) => (
        <StatCard
          key={card.id}
          card={card}
          isTrendsView={isTrendsView}
          openMetricDetails={openMetricDetails}
        />
      ))}
    </section>
  );
}

export default StatGrid;
