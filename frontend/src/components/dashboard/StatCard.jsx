import React from 'react';
import { FiInfo, FiExternalLink, FiArrowUpRight } from 'react-icons/fi';

function StatCard({ card, isTrendsView, openMetricDetails }) {
  const positive = !card.delta.startsWith('-');
  return (
    <article className={`metric-card ${card.tone} ${isTrendsView ? 'placeholder-card' : ''}`}>
      <div className="metric-header">
        {isTrendsView ? (
          <span className="placeholder-bar medium" aria-hidden="true"></span>
        ) : (
          <button className="metric-link" type="button">
            {card.label}
          </button>
        )}
        <div className="metric-actions">
          {isTrendsView ? (
            <>
              <span className="placeholder-circle" aria-hidden="true"></span>
              <span className="placeholder-circle" aria-hidden="true"></span>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
      <div className="metric-value-row">
        {isTrendsView ? (
          <>
            <span className="placeholder-value" aria-hidden="true"></span>
            <span className="placeholder-pill small" aria-hidden="true"></span>
          </>
        ) : (
          <>
            <span className="metric-value">{card.value}</span>
            <span className={`metric-trend ${positive ? 'up' : 'down'}`}>
              <FiArrowUpRight aria-hidden="true" />
              {card.delta}
            </span>
          </>
        )}
      </div>
      <p className="metric-caption">
        {isTrendsView ? <span className="placeholder-bar tiny" aria-hidden="true"></span> : card.helper}
      </p>
    </article>
  );
}

export default StatCard;
