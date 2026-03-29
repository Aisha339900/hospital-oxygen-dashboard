import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiInfo, FiExternalLink } from 'react-icons/fi';
import { rechartsAxisTickProps, rechartsTooltipContentStyle } from '../../config/chartTheme';

function FlowRatePanel({ data, formatTimestamp, detailPayload, onOpenDetails, chartConfig = {} }) {
  const title = chartConfig.panelTitle || 'Daily Flow Rate';
  const subtitle = chartConfig.panelSubtitle || 'Daily patient demand';
  const infoLabel = chartConfig.infoLabel || 'Info about daily flow rate';
  const openLabel = chartConfig.openLabel || 'Open detailed daily flow rate data';
  const description = chartConfig.detailDescription || detailPayload?.description;
  const chartId = chartConfig.id || 'flow';
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
          <Line type="monotone" dataKey="flowRate" stroke="#fb7185" strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </article>
  );
}

export default FlowRatePanel;
