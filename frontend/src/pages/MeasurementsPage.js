import React, { useEffect, useState } from "react";
import { useMeasurementContext } from "../context/MeasurementContext";

function MeasurementsPage() {
  const {
    measurements,
    loading,
    error,
    pagination,
    fetchMeasurements,
    getLatestMeasurement,
    latestMeasurement,
    clearError,
  } = useMeasurementContext();

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    dataSource: "",
  });

  useEffect(() => {
    fetchMeasurements({ page: 1 });
    getLatestMeasurement();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const params = { page: 1 };
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.dataSource) params.dataSource = filters.dataSource;
    fetchMeasurements(params);
  };

  const handlePageChange = (page) => {
    const params = { page };
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.dataSource) params.dataSource = filters.dataSource;
    fetchMeasurements(params);
  };

  const handleClearFilters = () => {
    setFilters({ startDate: "", endDate: "", dataSource: "" });
    fetchMeasurements({ page: 1 });
  };

  return (
    <div className="page measurements-page">
      <div className="page-header">
        <h2>Measurements</h2>
        <p className="page-subtitle">View and filter oxygen system measurements</p>
      </div>

      {latestMeasurement && (
        <div className="latest-measurement-banner">
          <span className="banner-label">Latest reading:</span>
          <span>
            O₂ Purity: <strong>{latestMeasurement.oxygenPurity ?? latestMeasurement.purity ?? "—"}%</strong>
          </span>
          <span>
            Flow Rate: <strong>{latestMeasurement.flowRate ?? "—"} L/min</strong>
          </span>
          <span>
            Pressure: <strong>{latestMeasurement.pressure ?? "—"} bar</strong>
          </span>
        </div>
      )}

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
          <button onClick={clearError} className="alert-close">×</button>
        </div>
      )}

      <form className="filter-bar" onSubmit={handleFilterSubmit}>
        <div className="form-group inline">
          <label htmlFor="startDate">From</label>
          <input
            id="startDate"
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
        </div>
        <div className="form-group inline">
          <label htmlFor="endDate">To</label>
          <input
            id="endDate"
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
        </div>
        <div className="form-group inline">
          <label htmlFor="dataSource">Source</label>
          <input
            id="dataSource"
            type="text"
            value={filters.dataSource}
            placeholder="e.g. sensor-1"
            onChange={(e) => setFilters({ ...filters, dataSource: e.target.value })}
          />
        </div>
        <button type="submit" className="btn btn-primary">Apply</button>
        <button type="button" className="btn btn-secondary" onClick={handleClearFilters}>
          Clear
        </button>
      </form>

      {loading ? (
        <div className="loading-state">Loading measurements…</div>
      ) : measurements.length === 0 ? (
        <div className="empty-state">
          <p>No measurements found.</p>
        </div>
      ) : (
        <>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>O₂ Purity (%)</th>
                  <th>Flow Rate (L/min)</th>
                  <th>Pressure (bar)</th>
                  <th>Storage Level (%)</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m) => (
                  <tr key={m._id}>
                    <td>
                      {m.timestamp || m.createdAt
                        ? new Date(m.timestamp || m.createdAt).toLocaleString()
                        : "—"}
                    </td>
                    <td>{m.oxygenPurity ?? m.purity ?? "—"}</td>
                    <td>{m.flowRate ?? "—"}</td>
                    <td>{m.pressure ?? "—"}</td>
                    <td>{m.storageLevel ?? "—"}</td>
                    <td>{m.dataSource ?? m.source ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.total > pagination.limit && (
            <div className="pagination">
              <button
                className="btn btn-secondary"
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Previous
              </button>
              <span className="page-info">
                Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
              </span>
              <button
                className="btn btn-secondary"
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MeasurementsPage;
