import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiInfo, FiExternalLink } from 'react-icons/fi';
import { rechartsAxisTickProps, rechartsTooltipContentStyle } from '../../config/chartTheme';

function OxygenPurityVsFeedFlowPanel({ data = [], detailPayload, onOpenDetails, chartConfig = {} }) {
  const title = chartConfig.panelTitle || 'Oxygen Purity vs Feed Flow';
  const subtitle = chartConfig.panelSubtitle || '';
  const infoLabel = chartConfig.infoLabel || 'Info about oxygen purity versus feed flow';
  const openLabel = chartConfig.openLabel || 'Open detailed oxygen purity versus feed flow data';
  const description = chartConfig.detailDescription || detailPayload?.description;
  const infoTooltip =
    description ||
    'Shows oxygen purity percentage versus feed flow.';
  const chartId = chartConfig.id || 'oxygenPurityVsFeedFlow';

  return (
    <article className="panel">
      <div className="panel-header">
        <div>
          <p className="panel-title">{title}</p>
          {subtitle ? <span>{subtitle}</span> : null}
        </div>
        <div className="panel-controls">
          <div className="panel-actions">
            <button
              className="icon-chip info"
              type="button"
              data-tooltip={infoTooltip}
              aria-label={infoLabel}
            >
              <FiInfo aria-hidden="true" />
            </button>
            <button
              className="icon-chip info"
              type="button"
              aria-label={openLabel}
              onClick={() => onOpenDetails(chartId)}
            >
              <FiExternalLink aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 6, right: 10, left: 6, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis
            dataKey="feed_flow_kmol_h"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickLine={false}
            axisLine={false}
            stroke="var(--chart-axis)"
            tick={rechartsAxisTickProps}
            label={{ value: 'Feed Flow (kmol/h)', position: 'insideBottom', offset: -16, fill: 'var(--chart-tick)' }}
          />
          <YAxis
            width={82}
            tickLine={false}
            axisLine={false}
            stroke="var(--chart-axis)"
            tick={rechartsAxisTickProps}
            label={{
              value: 'Oxygen Purity (%)',
              angle: -90,
              position: 'insideLeft',
              fill: 'var(--chart-tick)',
              style: { textAnchor: 'middle' },
              dx: 10,
            }}
          />
          <Tooltip
            contentStyle={rechartsTooltipContentStyle}
            formatter={(value, name) => {
              if (name === 'oxygen_purity_percent') {
                return [`${Number(value).toFixed(2)}%`, 'Oxygen Purity'];
              }
              return [value, name];
            }}
            labelFormatter={(value) => `Feed Flow: ${Number(value).toFixed(2)} kmol/h`}
          />
          <Line type="monotone" dataKey="oxygen_purity_percent" stroke="#7c6cfa" strokeWidth={2.5} dot />
        </LineChart>
      </ResponsiveContainer>
    </article>
  );
}

export default OxygenPurityVsFeedFlowPanel;
