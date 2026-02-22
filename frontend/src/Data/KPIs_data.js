// Core KPI definitions used to build dashboard stat cards.
const kpiDefinitions = [
	{
		id: 'purity',
		label: 'Oxygen purity %',
		valueKey: 'purity',
		valueSuffix: '%',
		deltaKey: 'purity',
		deltaSuffix: '%',
		helper: 'vs previous week',
		iconKey: 'droplet',
		tone: 'mint',
		description: 'Tracks delivered oxygen purity versus the regulatory baseline.'
	},
	{
		id: 'flowRate',
		label: 'Flow rate m³/h',
		valueKey: 'flowRate',
		deltaKey: 'flowRate',
		helper: 'Average department',
		iconKey: 'layers',
		tone: 'amber',
		description: 'Measures total oxygen throughput per hour across wards.'
	},
	{
		id: 'pressure',
		label: 'Delivery pressure bar',
		valueKey: 'pressure',
		deltaKey: 'pressure',
		helper: 'Stable manifold',
		iconKey: 'target',
		tone: 'rose',
		description: 'Shows manifold pressure stability at the main distribution header.'
	},
	{
		id: 'coverage',
		label: 'Demand coverage %',
		valueKey: 'demandCoverage',
		valueSuffix: '%',
		deltaKey: 'demandCoverage',
		deltaSuffix: '%',
		helper: 'Capacity reserved',
		iconKey: 'trendingUp',
		tone: 'gold',
		description: 'Represents how much of current demand is secured by supply commitments.'
	}
];

export default kpiDefinitions;
