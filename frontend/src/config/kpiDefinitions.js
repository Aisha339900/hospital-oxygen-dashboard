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
  },
  {
    id: "flowRate",
    label: "Flow rate m³/h",
    valueKey: "flowRate",
    valueSuffix: "m³/h",
    deltaKey: "flowRate",
    deltaSuffix: "",
    helper: "vs previous stream",
    iconKey: "layers",
    tone: "amber",
    description:
      "Shows oxygen production rate. Used to verify the system meets hospital demand.",
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
  },
];

export default kpiDefinitions;
