import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiInfo, FiExternalLink } from 'react-icons/fi';

function PressureTrendPanel({ data, formatTimestamp, detailPayload, onOpenDetails, chartConfig = {} }) {
  const title = chartConfig.panelTitle || 'Daily Pressure Trend';
  const subtitle = chartConfig.panelSubtitle || 'Distribution manifold checks';
  const infoLabel = chartConfig.infoLabel || 'Info about daily pressure trend';
  const openLabel = chartConfig.openLabel || 'Open detailed daily pressure data';
  const description = chartConfig.detailDescription || detailPayload?.description;
  const chartId = chartConfig.id || 'pressure';
  return (
    <article className="panel">
      <div className="panel-header">
        <div>
          <p className="panel-title">{title}</p>
          <span>{subtitle}</span>
        </div>
        <div className="panel-controls">
          <div className="panel-actions">
            <button
              className="icon-chip info"
              type="button"
              title={description}
              aria-label={infoLabel}
            >
              <FiInfo aria-hidden="true" />
            </button>
            <button
              className="icon-chip"
              type="button"
              aria-label={openLabel}
              onClick={() => onOpenDetails(chartId)}
            >
              <FiExternalLink aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTimestamp}
            tickLine={false}
            axisLine={false}
            stroke="rgba(255,255,255,0.5)"
          />
          <YAxis tickLine={false} axisLine={false} stroke="rgba(255,255,255,0.5)" />
          <Tooltip
            labelFormatter={formatTimestamp}
            contentStyle={{
              background: '#0b1329',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#fff'
            }}
          />
          <Line type="monotone" dataKey="pressure" stroke="#38bdf8" strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </article>
  );
}

export default PressureTrendPanel;
