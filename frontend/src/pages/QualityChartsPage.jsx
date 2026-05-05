import React from 'react';
import PressurePurityCapacityCharts from '../components/charts/PressurePurityCapacityCharts';

function QualityChartsPage() {
  return (
    <div className="main-column quality-view">
      <section className="panel quality-hero">
        <div className="quality-hero__title-wrap">
          <span className="quality-badge">Quality charts</span>
          <h1>Quality charts</h1>
          <p>
            Control charts for oxygen purity and the multivariate pressure-capacity-purity profile.
          </p>
        </div>
      </section>

      <PressurePurityCapacityCharts />
    </div>
  );
}

export default QualityChartsPage;