// Configuration for dashboard trend charts and their detail payload metadata.
const trendCharts = {
	purity: {
		id: 'purity',
		panelTitle: 'Daily Oxygen Purity',
		panelSubtitle: 'Last 14 days',
		infoLabel: 'Info about daily oxygen purity',
		openLabel: 'Open detailed daily purity data',
		detailTitle: 'Daily Oxygen Purity',
		detailDescription:
			'Daily comparison between oxygen purity, flow rate, and pressure metrics for the latest reporting window.',
		detailMeta: [
			{ label: 'Date range', source: 'timelineRange' },
			{ label: 'Data points', source: 'dataLength' }
		],
		dataset: { source: 'data', limit: 8 }
	},
	storage: {
		id: 'storage',
		panelTitle: 'Storage Level by Month',
		panelSubtitle: 'Last month vs this month',
		infoLabel: 'Info about storage level by month',
		openLabel: 'Open detailed monthly storage data',
		detailTitle: 'Storage Level by Month',
		detailDescription: 'Contrasts reserve storage levels month-over-month to highlight seasonal dips.',
		detailMeta: [
			{ label: 'Months tracked', source: 'storageCount' },
			{ label: 'Latest month', source: 'storageLatestLabel' }
		],
		dataset: { source: 'storageLevels' }
	},
	flow: {
		id: 'flow',
		panelTitle: 'Daily Flow Rate',
		panelSubtitle: 'Daily patient demand',
		infoLabel: 'Info about daily flow rate',
		openLabel: 'Open detailed daily flow rate data',
		detailTitle: 'Daily Flow Rate',
		detailDescription: 'Highlights daily patient consumption trends and sudden surges in oxygen flow.',
		detailMeta: [
			{ label: 'Latest reading', source: 'latestFlowRate', precision: 1, suffix: ' m³/h' },
			{ label: 'Date range', source: 'timelineRange' }
		],
		dataset: { source: 'data', map: 'flowRate', limit: 8 }
	},
	pressure: {
		id: 'pressure',
		panelTitle: 'Daily Pressure Trend',
		panelSubtitle: 'Distribution manifold checks',
		infoLabel: 'Info about daily pressure trend',
		openLabel: 'Open detailed daily pressure data',
		detailTitle: 'Daily Pressure Trend',
		detailDescription:
			'Monitors distribution manifold pressure day over day to surface fluctuations before alarms fire.',
		detailMeta: [
			{ label: 'Latest reading', source: 'latestPressure', precision: 1, suffix: ' bar' },
			{ label: 'Date range', source: 'timelineRange' }
		],
		dataset: { source: 'data', map: 'pressure', limit: 8 }
	}
};

export default trendCharts;
