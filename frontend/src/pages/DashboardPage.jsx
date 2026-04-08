import React from 'react';
import StatusHeader from '../components/dashboard/StatusHeader';
import TodayRow from '../components/dashboard/TodayRow';
import StatGrid from '../components/dashboard/StatGrid';
import OxygenProductFlowVsFeedFlowPanel from '../components/charts/OxygenProductFlowVsFeedFlowPanel';
import OxygenPurityVsFeedFlowPanel from '../components/charts/OxygenPurityVsFeedFlowPanel';
import AlertsPanel from '../components/rightRail/AlertsPanel';
import BackupPanel from '../components/rightRail/BackupPanel';
import DemandPanel from '../components/rightRail/DemandPanel';


function DashboardPage({
  statCards,
  detailPayloads,
  openMetricDetails,
  openChartDetails,
  trendData,
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
  onOpenSimulationEntry,
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
        <div className="stream-trends-divider" role="presentation" aria-hidden="true" />

        <StatGrid statCards={statCards} openMetricDetails={openMetricDetails} />

        <section className="panel-row">
          <OxygenProductFlowVsFeedFlowPanel
            data={trendData}
            detailPayload={detailPayloads.oxygenProductFlowVsFeedFlow}
            onOpenDetails={openChartDetails}
            chartConfig={trendChartConfig?.oxygenProductFlowVsFeedFlow}
          />
          <OxygenPurityVsFeedFlowPanel
            data={trendData}
            detailPayload={detailPayloads.oxygenPurityVsFeedFlow}
            onOpenDetails={openChartDetails}
            chartConfig={trendChartConfig?.oxygenPurityVsFeedFlow}
          />
        </section>
      </div>

      <aside className="right-rail">
        <AlertsPanel alarms={alarms} formatTimeAgo={formatTimeAgo} alarmPanelPulse={alarmPanelPulse} />
        <BackupPanel backup={backup} backupPanelPulse={backupPanelPulse} />
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
