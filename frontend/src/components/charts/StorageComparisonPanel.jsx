import React from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiInfo, FiExternalLink } from 'react-icons/fi';

function StorageComparisonPanel({ storageLevels, detailPayload, onOpenDetails, chartConfig = {} }) {
  const title = chartConfig.panelTitle || 'Storage Level by Month';
  const subtitle = chartConfig.panelSubtitle || 'Last month vs this month';
  const infoLabel = chartConfig.infoLabel || 'Info about storage level by month';
  const openLabel = chartConfig.openLabel || 'Open detailed monthly storage data';
  const description = chartConfig.detailDescription || detailPayload?.description;
  const chartId = chartConfig.id || 'storage';
  return (
    <article className="panel storage-panel">
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
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={storageLevels}>
          <defs>
            <linearGradient id="storagePrev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="storageCurrent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="rgba(255,255,255,0.5)" />
          <YAxis hide domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              background: '#0b1329',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#fff'
            }}
          />
          <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ color: '#cbd5ff' }} />
          <Area type="monotone" dataKey="lastMonth" stroke="#60a5fa" fill="url(#storagePrev)" name="Last Month" />
          <Area type="monotone" dataKey="thisMonth" stroke="#a855f7" fill="url(#storageCurrent)" name="This Month" />
        </AreaChart>
      </ResponsiveContainer>
    </article>
  );
}

export default StorageComparisonPanel;
