// Mole-fraction compositions for each numbered stream (UI labels).
const streamCompositions = [
  { stream: 1, label: "Feed", o2: 0.21, n2: 0.78, ar: 0.01 },
  { stream: 3, label: "Membrane Feed", o2: 0.21, n2: 0.78, ar: 0.01 },
  { stream: 5, label: "Membrane Permeate", o2: 0.4239, n2: 0.5725, ar: 0.0037 },
  {
    stream: 6,
    label: "Membrane Retentate",
    o2: 0.1299,
    n2: 0.8577,
    ar: 0.0124,
  },
  { stream: 7, label: "PSA Product", o2: 0.9332, n2: 0.0663, ar: 0.0004 },
  { stream: 8, label: "PSA Off-Gas", o2: 0.0373, n2: 0.9566, ar: 0.0061 },
];

export default streamCompositions;
