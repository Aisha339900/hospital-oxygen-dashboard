import React from 'react';
import { FiInfo, FiExternalLink, FiArrowUpRight } from 'react-icons/fi';
import KpiRangeBar from './KpiRangeBar';

function StatCard({ card, openMetricDetails }) {
  const numericDelta = card.delta
    ? Number(String(card.delta).replace(/[^0-9.-]/g, ''))
    : null;
  const isNeutral = numericDelta === 0;
  const positive = card.delta && !card.delta.startsWith('-') && !isNeutral;
  const infoTooltip =
    card.description || `Shows what ${card.label} currently reports.`;
  return (
    <article className={`metric-card ${card.tone}`}>
      <div className="metric-header">
        <button className="metric-link" type="button">
          {card.label}
        </button>
        <div className="metric-actions">
          <button
            className="icon-chip info"
            type="button"
            data-tooltip={infoTooltip}
            aria-label={`Info about ${card.label}`}
          >
            <FiInfo aria-hidden="true" />
          </button>
          <button
            className="icon-chip info"
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
      </div>
      {card.range && card.rangeValue != null && Number.isFinite(card.rangeValue) ? (
        <KpiRangeBar
          min={card.range.min}
          max={card.range.max}
          optimalMin={card.range.optimalMin ?? null}
          optimalMax={card.range.optimalMax ?? null}
          value={card.rangeValue}
          unit={card.range.unit ?? ''}
          caption={card.range.caption ?? ''}
        />
      ) : null}
      <div className="metric-footer">
        <p className="metric-caption">{card.helper}</p>
        {card.delta && (
          <span className={`metric-trend ${isNeutral ? 'neutral' : positive ? 'up' : 'down'}`}>
            <FiArrowUpRight aria-hidden="true" />
            {card.delta}
          </span>
        )}
      </div>
    </article>
  );
}

export default StatCard;
