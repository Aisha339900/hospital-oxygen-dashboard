import React from 'react';
import StatusHeader from '../components/dashboard/StatusHeader';
import TodayRow from '../components/dashboard/TodayRow';
import StatGrid from '../components/dashboard/StatGrid';
import PurityOverviewPanel from '../components/charts/PurityOverviewPanel';
import StorageComparisonPanel from '../components/charts/StorageComparisonPanel';
import FlowRatePanel from '../components/charts/FlowRatePanel';
import PressureTrendPanel from '../components/charts/PressureTrendPanel';
import AlertsPanel from '../components/rightRail/AlertsPanel';
import BackupPanel from '../components/rightRail/BackupPanel';
import DemandPanel from '../components/rightRail/DemandPanel';

function DashboardPage({
  statCards,
  detailPayloads,
  openMetricDetails,
  openChartDetails,
  formatTimestamp,
  formatTimeAgo,
  alarmPanelPulse,
  backupPanelPulse,
  demandPanelPulse,
  lastUpdated,
  streamOptions,
  activeStream,
  onStreamChange,
  currentStreamProfile,
  currentStreamLabel,
  currentStreamProcess,
  trendChartConfig = {}
}) {
  return (
    <>
      <div className="main-column">
        <StatusHeader
          lastUpdated={lastUpdated}
          currentStreamLabel={currentStreamLabel}
        />

        <TodayRow
          streamOptions={streamOptions}
          activeStream={activeStream}
          onStreamChange={onStreamChange}
          currentStreamProfile={currentStreamProfile}
          currentStreamProcess={currentStreamProcess}
        />

        <StatGrid statCards={statCards} openMetricDetails={openMetricDetails} />

        {/* Chart panels now fetch their own data via hooks */}
        <section className="panel-row primary">
          <PurityOverviewPanel
            formatTimestamp={formatTimestamp}
            detailPayload={detailPayloads.purity}
            onOpenDetails={openChartDetails}
            chartConfig={trendChartConfig?.purity}
          />
          <StorageComparisonPanel
            detailPayload={detailPayloads.storage}
            onOpenDetails={openChartDetails}
            chartConfig={trendChartConfig?.storage}
          />
        </section>

        <section className="panel-row">
          <FlowRatePanel
            formatTimestamp={formatTimestamp}
            detailPayload={detailPayloads.flow}
            onOpenDetails={openChartDetails}
            chartConfig={trendChartConfig?.flow}
          />
          <PressureTrendPanel
            formatTimestamp={formatTimestamp}
            detailPayload={detailPayloads.pressure}
            onOpenDetails={openChartDetails}
            chartConfig={trendChartConfig?.pressure}
          />
        </section>
      </div>

      <aside className="right-rail">
  <AlertsPanel alarmPanelPulse={alarmPanelPulse} />
  <BackupPanel backupPanelPulse={backupPanelPulse} />
  <DemandPanel demandPanelPulse={demandPanelPulse} />
</aside>
    </>
  );
}

export default DashboardPage;