import React from 'react';

function Sidebar({
	className = '',
	sidebarCollections,
	activeView,
	viewableDashboards,
	onDashboardSelect,
	onLogsSelect,
	onBackupDemandSelect,
	onSettingsSelect,
	onSimulationDesignSelect,
	onPredictiveAnalyticsSelect,

}) {
	return (
		<aside className={`sidebar ${className}`.trim()}>
			<div className="sidebar-brand">
				<div className="logo-mark">O₂</div>
				<div>
					<p className="brand-sub">By009</p>
					<strong>Oxygen Ops</strong>
				</div>
			</div>

			<nav className="sidebar-menu" aria-label="Primary">
				{sidebarCollections.map((section) => (
					<div key={section.title} className="sidebar-section">
						<p className="sidebar-section-title">{section.title}</p>
						<ul>
							{section.items.map((item) => {
								const Icon = item.icon;
								const isDashboardSection = section.title === 'Dashboards';
								const isPagesSection = section.title === 'Pages';
								const isLogsShortcut = isPagesSection && item.label === 'Logs';
								const isBackupDemandShortcut = isPagesSection && item.label === 'Backup & Demand';
								const isSettingsShortcut = isPagesSection && item.label === 'Settings';
								const isSimulationShortcut = isPagesSection && item.label === 'Simulation Design';
								const isPredictiveShortcut = isPagesSection && item.label === 'Predictive Analytics';
								const isActiveItem =
								(isDashboardSection ||
									isLogsShortcut ||
									isBackupDemandShortcut ||
									isSettingsShortcut ||
									isSimulationShortcut ||
									isPredictiveShortcut) &&
								item.label === activeView;
							const isSelectable =
								(isDashboardSection && viewableDashboards.has(item.label)) ||
								isLogsShortcut ||
								isBackupDemandShortcut ||
								isSettingsShortcut ||
								isSimulationShortcut ||
								isPredictiveShortcut;
								const classNames = [isActiveItem ? 'active' : '', isSelectable ? 'actionable' : '']
									.filter(Boolean)
									.join(' ');
								const clickHandler = isDashboardSection
									? () => onDashboardSelect(item.label)
									: isLogsShortcut
									? onLogsSelect
									: isBackupDemandShortcut
									? onBackupDemandSelect
									: isPredictiveShortcut
									? onPredictiveAnalyticsSelect
									: isSettingsShortcut
									? onSettingsSelect
									: isSimulationShortcut
									? onSimulationDesignSelect
									: undefined;
								return (
									<li
										key={item.label}
										className={classNames}
										onClick={clickHandler}
										onKeyDown={
											clickHandler
												? (event) => {
														if (event.key === 'Enter' || event.key === ' ') {
															event.preventDefault();
															clickHandler();
														}
													}
												: undefined
										}
										role={clickHandler ? 'button' : undefined}
										tabIndex={clickHandler ? 0 : undefined}
									>
										<div className="nav-left">
											<Icon aria-hidden="true" />
											<span>{item.label}</span>
										</div>
										{item.badge && <span className="nav-badge">{item.badge}</span>}
									</li>
								);
							})}
						</ul>
					</div>
				))}
			</nav>

			<div className="sidebar-footer">
				<p className="footer-label">Senior Design</p>
				<span>Powering medical data</span>
			</div>
		</aside>
	);
}

export default Sidebar;
