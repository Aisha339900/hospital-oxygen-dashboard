// Core KPI definitions used to build dashboard stat cards.
const kpiDefinitions = [
  {
    id: "purity",
    label: "Oxygen purity %",
    valueKey: "purity",
    valueSuffix: "%",
    deltaKey: "purity",
    deltaSuffix: "",
    helper: "vs previous stream",
    iconKey: "droplet",
    tone: "mint",
    description:
      "Indicates oxygen quality. Must stay within safe medical range (93-99%) to ensure patient safety.",
    range: {
      min: 0,
      max: 100,
      optimalMin: 93,
      optimalMax: 99,
      unit: "%",
      caption: "Target 93–99%",
    },
  },
  {
    id: "molarFlow",
    label: "Molar flow kmol/h",
    valueKey: "molarFlow",
    valueSuffix: "kmol/h",
    deltaKey: "molarFlow",
    deltaSuffix: "",
    helper: "vs previous stream",
    iconKey: "layers",
    tone: "amber",
    description:
      "Shows molar oxygen production flow from Aspen stream data.",
    range: {
      min: 0,
      max: 60,
      optimalMin: 43.054,
      optimalMax: 52.622,
      unit: "",
      caption: "Per-stream normal band",
    },
  },
  {
    id: "pressure",
    label: "Delivery pressure bar",
    valueKey: "pressure",
    valueSuffix: "bar",
    deltaKey: "pressure",
    deltaSuffix: "",
    helper: "vs previous stream",
    iconKey: "target",
    tone: "rose",
    description:
      "Must remain stable (4-6 bar) for safe and reliable supply.",
    range: {
      min: 0,
      max: 10,
      optimalMin: 4,
      optimalMax: 6,
      unit: "",
      caption: "Typical 4–6 bar",
    },
  },
  {
    id: "coverage",
    label: "Demand coverage %",
    valueKey: "demandCoverage",
    valueSuffix: "%",
    deltaKey: "demandCoverage",
    deltaSuffix: "%",
    helper: "Capacity reserved",
    iconKey: "trendingUp",
    tone: "gold",
    description:
      "Shows what percentage of current oxygen demand is covered by available supply. 100% means demand is fully covered.",
    range: {
      min: 0,
      max: 100,
      optimalMin: 95,
      optimalMax: 100,
      unit: "%",
      caption: "Healthy ≥95%",
    },
  },
];

export default kpiDefinitions;
