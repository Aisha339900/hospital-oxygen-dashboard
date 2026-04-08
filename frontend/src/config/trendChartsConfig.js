// Configuration for dashboard trend charts and their detail payload metadata.
const trendCharts = {
  oxygenProductFlowVsFeedFlow: {
    id: "oxygenProductFlowVsFeedFlow",
    panelTitle: "Oxygen Product Flow vs Feed Flow",
    panelSubtitle: "",
    infoLabel: "Info about oxygen product flow versus feed flow",
    openLabel: "Open oxygen product flow versus feed flow data",
    detailTitle: "Oxygen Product Flow vs Feed Flow",
    detailDescription:
      "Shows how oxygen output changes with feed flow. Used to control supply and understand system capacity.",
    detailMeta: [
      { label: "Data points", source: "trendDataLength" },
      { label: "Feed flow range", source: "trendFeedRange" },
    ],
    dataset: { source: "trendData" },
  },
  oxygenPurityVsFeedFlow: {
    id: "oxygenPurityVsFeedFlow",
    panelTitle: "Oxygen Purity vs Feed Flow",
    panelSubtitle: "",
    infoLabel: "Info about oxygen purity versus feed flow",
    openLabel: "Open oxygen purity versus feed flow data",
    detailTitle: "Oxygen Purity vs Feed Flow",
    detailDescription:
      "Shows how oxygen purity changes with feed. Ensures it stays within safe medical limits (93-99%).",
    detailMeta: [
      { label: "Data points", source: "trendDataLength" },
      { label: "Feed flow range", source: "trendFeedRange" },
    ],
    dataset: { source: "trendData" },
  },
};

export default trendCharts;
