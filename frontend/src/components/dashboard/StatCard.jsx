import React from 'react';
import { FiInfo, FiExternalLink, FiArrowUpRight } from 'react-icons/fi';

function StatCard({ card, openMetricDetails }) {
  const positive = !card.delta.startsWith('-');
  return (
    <article className={`metric-card ${card.tone}`}>
      <div className="metric-header">
        <button className="metric-link" type="button">
          {card.label}
        </button>
        <div className="metric-actions">
          <button className="icon-chip info" type="button" title={card.description} aria-label={`Info about ${card.label}`}>
            <FiInfo aria-hidden="true" />
          </button>
          <button
            className="icon-chip"
            type="button"
            aria-label={`View full details for ${card.label}`}
            onClick={() => openMetricDetails(card)}
          >
            <FiExternalLink aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="metric-value-row">
        <span className="metric-value">{card.value}</span>
        <span className={`metric-trend ${positive ? 'up' : 'down'}`}>
          <FiArrowUpRight aria-hidden="true" />
          {card.delta}
        </span>
      </div>
      <p className="metric-caption">{card.helper}</p>
    </article>
  );
}

export default StatCard;
