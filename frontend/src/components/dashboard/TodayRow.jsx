import React from 'react';
import { FiChevronDown } from 'react-icons/fi';

function TodayRow({ isTrendsView }) {
  return (
    <div className="today-row">
      {isTrendsView ? (
        <>
          <div className="today-select placeholder-box" aria-hidden="true"></div>
          <span className="placeholder-bar short" aria-hidden="true"></span>
        </>
      ) : (
        <>
          <div className="today-select">
            Daily view
            <FiChevronDown aria-hidden="true" />
          </div>
          <p className="sync-label">Data refreshed once per day</p>
        </>
      )}
    </div>
  );
}

export default TodayRow;
