
function AlertsPanel({ alarms, formatTimeAgo, alarmPanelPulse }) {
  return (
    <section className={`right-card alarm-panel ${alarmPanelPulse ? 'pulse' : ''}`}>
      <h4>Alarm & Alert</h4>
      {alarms.length === 0 ? (
        <p className="empty-state">All systems stable.</p>
      ) : (
        <ul className="alarm-list">
          {alarms.map((alarm) => (
            <li key={alarm.id}>
              <div>
                <p>{alarm.message}</p>
                <span>{formatTimeAgo(alarm.timestamp)}</span>
              </div>
              <span className={`badge ${alarm.severity}`}>{alarm.severity}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default AlertsPanel;
