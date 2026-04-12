import React from 'react';
import StatusHeader from '../components/dashboard/StatusHeader';
import TodayRow from '../components/dashboard/TodayRow';
import StatGrid from '../components/dashboard/StatGrid';
import OxygenProductFlowVsFeedFlowPanel from '../components/charts/OxygenProductFlowVsFeedFlowPanel';
import OxygenPurityVsFeedFlowPanel from '../components/charts/OxygenPurityVsFeedFlowPanel';
import AlertsPanel from '../components/rightRail/AlertsPanel';
import BackupPanel from '../components/rightRail/BackupPanel';
import DemandPanel from '../components/rightRail/DemandPanel';
import DashboardReportActions from '../components/dashboard/DashboardReportActions';


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
  streamOptions,
  activeStream,
  onStreamChange,
  currentStreamLabel,
  currentStreamProcess,
  trendChartConfig = {},
  isDarkMode,
  onToggleTheme,
  onOpenSimulationEntry,
  buildReportSnapshot,
  reportDefaultEmail,
  reportEmailEnabled,
}) {
  return (
    <>
      <div className="main-column">
        <StatusHeader
          unacknowledgedAlarms={unacknowledgedAlarms}
          currentStreamLabel={currentStreamLabel}
          isDarkMode={isDarkMode}
          onToggleTheme={onToggleTheme}
          reportActions={
            typeof buildReportSnapshot === "function" ? (
              <DashboardReportActions
                buildSnapshot={buildReportSnapshot}
                defaultEmail={reportDefaultEmail || ""}
                canUseEmail={Boolean(reportEmailEnabled)}
              />
            ) : null
          }
        />

        <TodayRow
          streamOptions={streamOptions}
          activeStream={activeStream}
          onStreamChange={onStreamChange}
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
