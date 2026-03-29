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
  data,
  storageLevels,
  formatTimestamp,
  alarms,
  formatTimeAgo,
  backup,
  supplyDemand,
  supplyFill,
  supplyIsHealthy,
  alarmPanelPulse,
  backupPanelPulse,
  demandPanelPulse,
  unacknowledgedAlarms,
  lastUpdated,
  streamOptions,
  activeStream,
  onStreamChange,
  currentStreamProfile,
  currentStreamLabel,
  currentStreamProcess,
  trendChartConfig = {},
  isDarkMode,
  onToggleTheme,
}) {
  return (
    <>
      <div className="main-column">
        <StatusHeader
          unacknowledgedAlarms={unacknowledgedAlarms}
          lastUpdated={lastUpdated}
          currentStreamLabel={currentStreamLabel}
          isDarkMode={isDarkMode}
          onToggleTheme={onToggleTheme}
        />

        <TodayRow
          streamOptions={streamOptions}
          activeStream={activeStream}
          onStreamChange={onStreamChange}
          currentStreamProfile={currentStreamProfile}
          currentStreamProcess={currentStreamProcess}
        />

        <StatGrid statCards={statCards} openMetricDetails={openMetricDetails} />

        <section className="panel-row primary">
          <PurityOverviewPanel
            data={data}
            formatTimestamp={formatTimestamp}
            detailPayload={detailPayloads.purity}
            onOpenDetails={openChartDetails}
            chartConfig={trendChartConfig?.purity}
          />
          <StorageComparisonPanel
            storageLevels={storageLevels}
            detailPayload={detailPayloads.storage}
            onOpenDetails={openChartDetails}
            chartConfig={trendChartConfig?.storage}
          />
        </section>

        <section className="panel-row">
          <FlowRatePanel
            data={data}
            formatTimestamp={formatTimestamp}
            detailPayload={detailPayloads.flow}
            onOpenDetails={openChartDetails}
            chartConfig={trendChartConfig?.flow}
          />
          <PressureTrendPanel
            data={data}
            formatTimestamp={formatTimestamp}
            detailPayload={detailPayloads.pressure}
            onOpenDetails={openChartDetails}
            chartConfig={trendChartConfig?.pressure}
          />
        </section>
      </div>

      <aside className="right-rail">
        <AlertsPanel alarms={alarms} formatTimeAgo={formatTimeAgo} alarmPanelPulse={alarmPanelPulse} />
        <BackupPanel backup={backup} formatTimeAgo={formatTimeAgo} backupPanelPulse={backupPanelPulse} />
        <DemandPanel
          supplyDemand={supplyDemand}
          supplyFill={supplyFill}
          supplyIsHealthy={supplyIsHealthy}
          demandPanelPulse={demandPanelPulse}
        />
      </aside>
    </>
  );
}

export default DashboardPage;
