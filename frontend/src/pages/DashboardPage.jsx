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
  isTrendsView,
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
  currentStreamProcess
}) {
  return (
    <>
      <div className="main-column">
        <StatusHeader
          isTrendsView={isTrendsView}
          unacknowledgedAlarms={unacknowledgedAlarms}
          lastUpdated={lastUpdated}
          currentStreamLabel={currentStreamLabel}
        />

        <TodayRow
          isTrendsView={isTrendsView}
          streamOptions={streamOptions}
          activeStream={activeStream}
          onStreamChange={onStreamChange}
          currentStreamProfile={currentStreamProfile}
          currentStreamProcess={currentStreamProcess}
        />

        <StatGrid statCards={statCards} isTrendsView={isTrendsView} openMetricDetails={openMetricDetails} />

        <section className="panel-row primary">
          <PurityOverviewPanel
            data={data}
            formatTimestamp={formatTimestamp}
            detailPayload={detailPayloads.purity}
            onOpenDetails={openChartDetails}
          />
          <StorageComparisonPanel
            storageLevels={storageLevels}
            detailPayload={detailPayloads.storage}
            onOpenDetails={openChartDetails}
          />
        </section>

        <section className="panel-row">
          <FlowRatePanel
            data={data}
            formatTimestamp={formatTimestamp}
            detailPayload={detailPayloads.flow}
            onOpenDetails={openChartDetails}
          />
          <PressureTrendPanel
            data={data}
            formatTimestamp={formatTimestamp}
            detailPayload={detailPayloads.pressure}
            onOpenDetails={openChartDetails}
          />
        </section>
      </div>

      <aside className="right-rail">
        <AlertsPanel
          isTrendsView={isTrendsView}
          alarms={alarms}
          formatTimeAgo={formatTimeAgo}
          alarmPanelPulse={alarmPanelPulse}
        />
        <BackupPanel
          isTrendsView={isTrendsView}
          backup={backup}
          formatTimeAgo={formatTimeAgo}
          backupPanelPulse={backupPanelPulse}
        />
        <DemandPanel
          isTrendsView={isTrendsView}
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
