import React from 'react';

function Sidebar({
	className = '',
	favoriteLinks,
	sidebarCollections,
	activeView,
	viewableDashboards,
	onDashboardSelect,
	onLogsSelect,
	onSettingsSelect,
	isDarkMode,
	onToggleTheme,
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

			<div className="sidebar-tabs" role="tablist" aria-label="Sidebar shortcuts">
				<button className="tab active" type="button" tabIndex={-1} aria-current="true">
					Favorites
				</button>
				<button className="tab" type="button" tabIndex={-1} disabled>
					Recently
				</button>
			</div>

			<ul className="favorites-list">
				{favoriteLinks.map((link) => (
					<li key={link}>{link}</li>
				))}
			</ul>

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
								const isSettingsShortcut = isPagesSection && item.label === 'Settings';
								const isActiveItem =
									(isDashboardSection || isLogsShortcut || isSettingsShortcut) && item.label === activeView;
								const isSelectable =
									(isDashboardSection && viewableDashboards.has(item.label)) || isLogsShortcut || isSettingsShortcut;
								const classNames = [isActiveItem ? 'active' : '', isSelectable ? 'actionable' : '']
									.filter(Boolean)
									.join(' ');
								const clickHandler = isDashboardSection
									? () => onDashboardSelect(item.label)
									: isLogsShortcut
									? onLogsSelect
									: isSettingsShortcut
									? onSettingsSelect
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
