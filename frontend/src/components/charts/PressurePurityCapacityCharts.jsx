import React, { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FiInfo } from "react-icons/fi";
import { pressurePurityCapacityService } from "../../services";
import { hotellingStablePoint as hotellingStablePointData, hotellingT2Data } from "../../data/hotellingT2Data";
import { o2PurityLimits, o2PurityStablePoint } from "../../data/o2PurityLimits";
import { rechartsAxisTickProps, rechartsTooltipContentStyle } from "../../config/chartTheme";

function formatNumber(value, digits = 6) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(digits) : "-";
}

function formatHotellingMeanVector(meanVector) {
  if (!meanVector) {
    return "-";
  }
  return `[${formatNumber(meanVector.pressure, 8)}, ${formatNumber(meanVector.capacity, 4)}, ${formatNumber(meanVector.purity, 8)}]`;
}

function ChartSummary({ items }) {
  return (
    <div className="control-chart-summary">
      {items.map((item) => (
        <span key={item.label} className="control-chart-summary__item">
          {item.label} <strong>{item.value}</strong>
        </span>
      ))}
    </div>
  );
}

function ControlChartPanel({ title, subtitle, infoTooltip, children }) {
  return (
    <article className="panel quality-chart-panel">
      <div className="panel-header">
        <div>
          <p className="panel-title">{title}</p>
          {subtitle ? <span>{subtitle}</span> : null}
        </div>
        <div className="panel-controls">
          <button className="icon-chip info" type="button" data-tooltip={infoTooltip} aria-label={`${title} info`}>
            <FiInfo aria-hidden="true" />
          </button>
        </div>
      </div>
      {children}
    </article>
  );
}

function PressurePurityCapacityCharts() {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadCharts = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await pressurePurityCapacityService.getCharts();
        if (active) {
          setPayload(result);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError?.response?.data?.message ||
              requestError?.message ||
              "Failed to load pressure, purity, and capacity charts.",
          );
          setPayload(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCharts();

    return () => {
      active = false;
    };
  }, []);

  const observations = Array.isArray(payload?.observations) ? payload.observations : [];

  const imrLimits = o2PurityLimits;
  const hotellingLimits = hotellingT2Data;
  const imrStablePoint = o2PurityStablePoint;
  const hotellingStablePoint = hotellingStablePointData;

  const imrChartData = observations.map((point) => ({
    observation: point.observation,
    o2_purity: Number(point.o2_purity),
    CL: o2PurityLimits.CL,
    UCL: o2PurityLimits.UCL,
    LCL: o2PurityLimits.LCL,
    MR_CL: o2PurityLimits.MR_CL,
    MR_UCL: o2PurityLimits.MR_UCL,
    MR_LCL: o2PurityLimits.MR_LCL,
  }));

  const hotellingChartData = observations.map((point, index) => ({
    observation: point.observation,
    pressure: Number(point.pressure_bar),
    capacity: Number(point.o2_capacity_nm3h),
    purity: Number(point.o2_purity),
    t2: hotellingT2Data.t2_values[index],
    ucl: hotellingT2Data.ucl,
  }));

  const hasData = imrChartData.length > 0 && hotellingChartData.length > 0;

  if (loading) {
    return (
      <div className="quality-charts-grid">
        <ControlChartPanel
          title="I-MR Chart - O2 Purity"
          subtitle="Individuals chart with moving-range limits"
          infoTooltip="Loading chart data..."
        >
          <p className="control-chart-status">Loading pressure, purity, and capacity records...</p>
        </ControlChartPanel>
        <ControlChartPanel
          title="Hotelling’s T² Chart"
          subtitle="Multivariate control chart for pressure, purity, and capacity"
          infoTooltip="Loading chart data..."
        >
          <p className="control-chart-status">Loading pressure, purity, and capacity records...</p>
        </ControlChartPanel>
      </div>
    );
  }

  if (error || !hasData) {
    return (
      <div className="quality-charts-grid">
        <ControlChartPanel
          title="I-MR Chart - O2 Purity"
          subtitle="Individuals chart with moving-range limits"
          infoTooltip={error || "No control-chart data available."}
        >
          <p className="control-chart-status error">{error || "No pressure-purity-capacity data found."}</p>
        </ControlChartPanel>
        <ControlChartPanel
          title="Hotelling’s T² Chart"
          subtitle="Multivariate control chart for pressure, purity, and capacity"
          infoTooltip={error || "No control-chart data available."}
        >
          <p className="control-chart-status error">{error || "No pressure-purity-capacity data found."}</p>
        </ControlChartPanel>
      </div>
    );
  }

  const imrTooltip = ({ active, payload: tooltipPayload, label }) => {
    if (!active || !tooltipPayload || tooltipPayload.length === 0) {
      return null;
    }
    const row = tooltipPayload[0].payload;
    return (
      <div className="recharts-default-tooltip">
        <p className="recharts-tooltip-label">Observation {label}</p>
        <p>O2 purity: {formatNumber(row.o2_purity)}</p>
        <p>CL: {formatNumber(row.CL)}</p>
        <p>UCL: {formatNumber(row.UCL)}</p>
        <p>LCL: {formatNumber(row.LCL)}</p>
        <p>MR CL: {formatNumber(row.MR_CL, 6)}</p>
        <p>MR UCL: {formatNumber(row.MR_UCL, 6)}</p>
      </div>
    );
  };

  const hotellingTooltip = ({ active, payload: tooltipPayload, label }) => {
    if (!active || !tooltipPayload || tooltipPayload.length === 0) {
      return null;
    }
    const row = tooltipPayload[0].payload;
    return (
      <div className="recharts-default-tooltip">
        <p className="recharts-tooltip-label">Observation {label}</p>
        <p>T²: {formatNumber(row.t2)}</p>
        <p>Pressure: {formatNumber(row.pressure, 3)} bar</p>
        <p>Capacity: {formatNumber(row.capacity, 3)} nm3/h</p>
        <p>O2 purity: {formatNumber(row.purity)}</p>
        <p>UCL: {formatNumber(row.ucl)}</p>
      </div>
    );
  };

  return (
    <div className="quality-charts-grid">
      <ControlChartPanel
        title="I-MR Chart - O2 Purity"
        subtitle="Individuals chart and moving-range limits from sorted pressure data"
        infoTooltip="O2 purity plotted against observation order after sorting by pressure_bar ascending."
      >
        <ChartSummary
          items={[
            { label: "CL", value: formatNumber(imrLimits.CL) },
            { label: "UCL", value: formatNumber(imrLimits.UCL) },
            { label: "LCL", value: formatNumber(imrLimits.LCL) },
          ]}
        />
        <ResponsiveContainer width="100%" height={430}>
          <LineChart data={imrChartData} margin={{ top: 10, right: 18, left: 4, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis
              dataKey="observation"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickLine={false}
              axisLine={false}
              stroke="var(--chart-axis)"
              tick={rechartsAxisTickProps}
              label={{ value: "Observation", position: "bottom", offset: 12, fill: "var(--chart-tick)" }}
            />
            <YAxis
              width={84}
              tickLine={false}
              axisLine={false}
              stroke="var(--chart-axis)"
              tick={rechartsAxisTickProps}
              label={{
                value: "O2 Purity",
                angle: -90,
                position: "insideLeft",
                fill: "var(--chart-tick)",
                style: { textAnchor: "middle" },
                dx: 12,
              }}
            />
            <Tooltip content={imrTooltip} contentStyle={rechartsTooltipContentStyle} />
            <Legend verticalAlign="top" align="left" wrapperStyle={{ paddingBottom: 12 }} />
            <Line type="monotone" dataKey="o2_purity" name="Observed" stroke="#3b82f6" strokeWidth={2.6} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="CL" name="CL" stroke="#22c55e" strokeDasharray="5 4" strokeWidth={1.8} dot={false} />
            <Line type="monotone" dataKey="UCL" name="UCL" stroke="#f59e0b" strokeDasharray="5 4" strokeWidth={1.8} dot={false} />
            <Line type="monotone" dataKey="LCL" name="LCL" stroke="#ef4444" strokeDasharray="5 4" strokeWidth={1.8} dot={false} />
            {imrStablePoint ? (
              <ReferenceDot
                x={imrStablePoint.observation}
                y={imrChartData[imrStablePoint.observation - 1]?.o2_purity}
                r={6}
                fill="#f97316"
                stroke="#f97316"
                label={{ value: `Max stable point (Obs.${imrStablePoint.observation})`, position: "top", fill: "var(--text)" }}
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
        <div className="control-chart-stats">
          <div className="control-chart-stat">
            <span>MR CL</span>
            <strong>{formatNumber(imrLimits.MR_CL, 6)}</strong>
          </div>
          <div className="control-chart-stat">
            <span>MR UCL</span>
            <strong>{formatNumber(imrLimits.MR_UCL, 6)}</strong>
          </div>
          <div className="control-chart-stat">
            <span>Stable point</span>
            <strong>{imrStablePoint ? `Obs. ${imrStablePoint.observation}` : "-"}</strong>
          </div>
        </div>
      </ControlChartPanel>

      <ControlChartPanel
        title="Hotelling’s T² Chart"
        subtitle="Multivariate control chart for pressure, capacity, and O2 purity"
        infoTooltip="Hotelling's T² is computed from pressure_bar, o2_capacity_nm3h, and o2_purity after sorting by pressure_bar ascending."
      >
        <ChartSummary
          items={[
            { label: "UCL", value: formatNumber(hotellingLimits.ucl) },
            { label: "Mean vector", value: formatHotellingMeanVector(hotellingLimits.mean_vector) },
            { label: "Obs.", value: String(observations.length || "-") },
          ]}
        />
        <ResponsiveContainer width="100%" height={430}>
          <LineChart data={hotellingChartData} margin={{ top: 10, right: 18, left: 4, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis
              dataKey="observation"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickLine={false}
              axisLine={false}
              stroke="var(--chart-axis)"
              tick={rechartsAxisTickProps}
              label={{ value: "Observation", position: "bottom", offset: 12, fill: "var(--chart-tick)" }}
            />
            <YAxis
              width={84}
              tickLine={false}
              axisLine={false}
              stroke="var(--chart-axis)"
              tick={rechartsAxisTickProps}
              label={{
                value: "T²",
                angle: -90,
                position: "insideLeft",
                fill: "var(--chart-tick)",
                style: { textAnchor: "middle" },
                dx: 12,
              }}
            />
            <Tooltip content={hotellingTooltip} contentStyle={rechartsTooltipContentStyle} />
            <Legend verticalAlign="top" align="left" wrapperStyle={{ paddingBottom: 12 }} />
            <Line type="monotone" dataKey="t2" name="Hotelling’s T²" stroke="#38bdf8" strokeWidth={2.6} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="ucl" name="UCL" stroke="#f59e0b" strokeDasharray="5 4" strokeWidth={1.8} dot={false} />
            {hotellingStablePoint ? (
              <ReferenceDot
                x={hotellingStablePoint.observation}
                y={hotellingChartData[hotellingStablePoint.observation - 1]?.t2}
                r={6}
                fill="#f97316"
                stroke="#f97316"
                label={{ value: `Max stable point (Obs.${hotellingStablePoint.observation})`, position: "top", fill: "var(--text)" }}
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
        <div className="control-chart-stats">
          <div className="control-chart-stat">
            <span>UCL</span>
            <strong>{formatNumber(hotellingLimits.ucl)}</strong>
          </div>
          <div className="control-chart-stat">
            <span>Stable point</span>
            <strong>{hotellingStablePoint ? `Obs. ${hotellingStablePoint.observation}` : "-"}</strong>
          </div>
          <div className="control-chart-stat">
            <span>Mean vector</span>
            <strong>{formatHotellingMeanVector(hotellingLimits.mean_vector)}</strong>
          </div>
        </div>
      </ControlChartPanel>
    </div>
  );
}

export default PressurePurityCapacityCharts;