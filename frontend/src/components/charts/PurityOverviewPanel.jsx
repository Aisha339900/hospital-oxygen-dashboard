import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiInfo, FiExternalLink } from 'react-icons/fi';
import { rechartsAxisTickProps, rechartsTooltipContentStyle } from '../../config/chartTheme';

function PurityOverviewPanel({ data, formatTimestamp, detailPayload, onOpenDetails, chartConfig = {} }) {
  const title = chartConfig.panelTitle || 'Daily Oxygen Purity';
  const subtitle = chartConfig.panelSubtitle || 'Last 14 days';
  const infoLabel = chartConfig.infoLabel || 'Info about daily oxygen purity';
  const openLabel = chartConfig.openLabel || 'Open detailed daily purity data';
  const description = chartConfig.detailDescription || detailPayload?.description;
  const chartId = chartConfig.id || 'purity';
  return (
    <article className="panel large-panel">
      <div className="panel-header">
        <div>
          <p className="panel-title">{title}</p>
          <span>{subtitle}</span>
        </div>
        <div className="panel-controls">
          <div className="panel-tabs">
            <button className="active">Oxygen Purity</button>
            <button>Total Projects</button>
            <button>Operating Status</button>
          </div>
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
      <div
        className="chart-accessible-region"
        role="img"
        aria-label="Line chart of oxygen purity, flow rate, and pressure over the displayed time range."
      >
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTimestamp}
            tickLine={false}
            axisLine={false}
            stroke="var(--chart-axis)"
            tick={rechartsAxisTickProps}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            stroke="var(--chart-axis)"
            tick={rechartsAxisTickProps}
          />
          <Tooltip labelFormatter={formatTimestamp} contentStyle={rechartsTooltipContentStyle} />
          <Legend wrapperStyle={{ color: 'var(--chart-legend)' }} />
          <Line type="monotone" dataKey="purity" stroke="#7c6cfa" strokeWidth={3} dot={false} name="Purity %" />
          <Line type="monotone" dataKey="flowRate" stroke="#2dd4bf" strokeWidth={2} dot={false} name="Flow rate" />
          <Line type="monotone" dataKey="pressure" stroke="#f472b6" strokeWidth={2} dot={false} name="Pressure" />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </article>
  );
}

export default PurityOverviewPanel;
