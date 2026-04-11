import React, { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FiActivity } from "react-icons/fi";
import { predictiveAnalyticsService } from "../services/predictiveAnalyticsService";
import {
  rechartsAxisTickProps,
  rechartsTooltipContentStyle,
} from "../config/chartTheme";
import "./PredictiveAnalyticsPage.css";

function toFixedOrDash(value, fraction = 2) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(fraction) : "-";
}

function PredictiveAnalyticsPage() {
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadForecast = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await predictiveAnalyticsService.getOxygenPurityForecast(days);
        if (isMounted) {
          setPayload(result);
        }
      } catch (requestError) {
        if (isMounted) {
          const message =
            requestError?.response?.data?.detail ||
            requestError?.message ||
            "Failed to load predictive analytics data.";
          setError(message);
          setPayload(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadForecast();

    return () => {
      isMounted = false;
    };
  }, [days]);

  const chartData = useMemo(() => {
    if (!Array.isArray(payload?.forecast)) {
      return [];
    }

    return payload.forecast.map((point) => ({
      date: point.date || point.ds,
      predicted: Number(point.yhat),
      lower: Number(point.yhat_lower),
      upper: Number(point.yhat_upper),
    }));
  }, [payload]);

  return (
    <div className="main-column predictive-view">
      <section className="panel predictive-hero">
        <div className="predictive-hero__title-wrap">
          <span className="predictive-badge">
            <FiActivity aria-hidden="true" />
            Prophet Model
          </span>
          <h1>Predictive Analytics</h1>
          <p>
            Forecasting oxygen purity using historical data from MongoDB and
            Facebook Prophet.
          </p>
        </div>

        <label className="predictive-control" htmlFor="forecast-days">
          Forecast window
          <select
            id="forecast-days"
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={21}>21 days</option>
          </select>
        </label>
      </section>

      <section className="panel predictive-summary">
        <div className="predictive-summary__item">
          <span>Records used</span>
          <strong>{payload?.training?.records_used ?? "-"}</strong>
        </div>
        <div className="predictive-summary__item">
          <span>Training range</span>
          <strong>
            {payload?.training?.start_date || "-"} to {payload?.training?.end_date || "-"}
          </strong>
        </div>
        <div className="predictive-summary__item">
          <span>Anomalies detected</span>
          <strong>{payload?.anomalies?.length ?? 0}</strong>
        </div>
      </section>

      <section className="panel predictive-chart-panel">
        <div className="panel-header">
          <div>
            <p className="panel-title">Oxygen Purity Forecast</p>
            <span>Predicted values with confidence interval bounds</span>
          </div>
        </div>

        {loading ? <p className="predictive-status">Loading forecast...</p> : null}
        {!loading && error ? <p className="predictive-status error">{error}</p> : null}
        {!loading && !error && chartData.length === 0 ? (
          <p className="predictive-status">No forecast points available.</p>
        ) : null}

        {!loading && !error && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 8, right: 12, left: 8, bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                stroke="var(--chart-axis)"
                tick={rechartsAxisTickProps}
              />
              <YAxis
                width={88}
                tickLine={false}
                axisLine={false}
                stroke="var(--chart-axis)"
                tick={rechartsAxisTickProps}
                label={{
                  value: "Oxygen Purity (%)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "var(--chart-tick)",
                  style: { textAnchor: "middle" },
                  dx: 10,
                }}
              />
              <Tooltip
                contentStyle={rechartsTooltipContentStyle}
                formatter={(value, name) => {
                  const labelMap = {
                    predicted: "Predicted",
                    lower: "Lower Bound",
                    upper: "Upper Bound",
                  };
                  return [`${toFixedOrDash(value)}%`, labelMap[name] || name];
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="upper"
                name="Upper Bound"
                stroke="rgba(45, 212, 191, 0.75)"
                strokeDasharray="4 3"
                dot={false}
                strokeWidth={1.8}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                name="Predicted"
                stroke="var(--accent)"
                dot={false}
                strokeWidth={2.6}
              />
              <Line
                type="monotone"
                dataKey="lower"
                name="Lower Bound"
                stroke="rgba(248, 113, 113, 0.8)"
                strokeDasharray="4 3"
                dot={false}
                strokeWidth={1.8}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : null}
      </section>

      <section className="panel predictive-table-panel">
        <div className="panel-header">
          <div>
            <p className="panel-title">Historical Anomalies</p>
            <span>Actual measurements outside Prophet prediction bounds</span>
          </div>
        </div>

        {Array.isArray(payload?.anomalies) && payload.anomalies.length > 0 ? (
          <div className="predictive-table-wrap">
            <table className="predictive-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Actual</th>
                  <th>Predicted</th>
                  <th>Lower</th>
                  <th>Upper</th>
                </tr>
              </thead>
              <tbody>
                {payload.anomalies.map((point) => (
                  <tr key={`${point.date}-${point.actual_value}`}>
                    <td>{point.date}</td>
                    <td>{toFixedOrDash(point.actual_value)}%</td>
                    <td>{toFixedOrDash(point.predicted_value)}%</td>
                    <td>{toFixedOrDash(point.yhat_lower)}%</td>
                    <td>{toFixedOrDash(point.yhat_upper)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="predictive-status">No anomalies found in the training history.</p>
        )}
      </section>
    </div>
  );
}

export default PredictiveAnalyticsPage;
