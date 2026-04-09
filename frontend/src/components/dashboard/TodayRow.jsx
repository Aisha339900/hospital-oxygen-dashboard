import React from 'react';
import { FiChevronDown } from 'react-icons/fi';

function TodayRow({
  streamOptions = [],
  activeStream,
  onStreamChange,
  currentStreamProcess
}) {
  const processSpecs = [
    { key: 'temperature', label: 'T', unit: 'degC', digits: 2 },
    { key: 'molarFlow', label: 'Molar', unit: 'kmol/h', digits: 3 },
    { key: 'massFlow', label: 'Mass', unit: 'kg/h', digits: 2 }
  ];
  const formatMetric = (value, digits = 2) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return 'N/A';
    }
    const formatted = value.toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
    return formatted;
  };

  const handleChange = (event) => {
    if (onStreamChange) {
      onStreamChange(event.target.value);
    }
  };

  return (
    <div className="today-row">
      <div className="today-select stream-select">
        <label htmlFor="stream-picker" className="stream-label">
          Stream
        </label>
        <div className="select-wrapper">
          <select
            id="stream-picker"
            value={activeStream}
            onChange={handleChange}
            aria-label="Select oxygen production stream"
          >
            {streamOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <FiChevronDown aria-hidden="true" />
        </div>
      </div>
      <div className="stream-meta">
        {currentStreamProcess && (
          <div className="stream-process-panel" role="group" aria-label="Process metrics">
            {processSpecs.map((spec) => (
              <div key={spec.key} className="stream-process-pill">
                <span className="pill-label">{spec.label}</span>
                <span className="pill-value">
                  {formatMetric(currentStreamProcess[spec.key], spec.digits)}
                  <span className="pill-unit">{spec.unit}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TodayRow;
