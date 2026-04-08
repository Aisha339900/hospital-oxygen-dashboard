import React, { useEffect, useState } from "react";
import { FiBookOpen, FiLayers, FiSliders } from "react-icons/fi";
import ProcessFlowDiagram from "../components/simulation/ProcessFlowDiagram";

const DEFAULT_LEDE =
  "Topology from the senior design simulation model (compressor, cooler, membrane, PSA). Stream numbers match the PFD; material streams are shown in blue, energy / heat streams in red. This is not live plant piping—it explains what the dashboard metrics are meant to represent.";

const DEFAULT_WHAT_IF = {
  feedFlow: 118,
  compressorWork: 420,
  coolerDuty: 185,
  permeateSplit: 72,
  productPurity: 93.5,
  offgasFlow: 24,
};

/** Step 0 = overview (no dimming). Later steps highlight a path through the PFD. */
const SIMULATION_TRAINING_STEPS = [
  {
    title: "PFD overview",
    description:
      "Material streams are blue; heat and shaft work are red dashed. Stream numbers match labels you can correlate with the main dashboard. Use Next to walk the flow from feed to products.",
    nodeIds: [],
    edgeIds: [],
  },
  {
    title: "Feed — stream 1",
    description:
      "Fresh feed enters the train here. On the dashboard, changing the active stream profile only re-labels metrics—it does not rewrite this teaching diagram.",
    nodeIds: ["s1", "comp"],
    edgeIds: ["e1"],
  },
  {
    title: "Compression & energy",
    description:
      "The compressor raises pressure for downstream separation. Q-100 is the energy stream (shaft work) leaving the block—parallel to how you might track utility load in operations.",
    nodeIds: ["comp", "q100"],
    edgeIds: ["e1", "e2", "eq100"],
  },
  {
    title: "Intercooling",
    description:
      "The cooler knocks down temperature before the membrane. Stream 4 is heat rejected—another red energy leg, distinct from material streams 2 and 3.",
    nodeIds: ["cooler", "heat4"],
    edgeIds: ["e2", "e3", "e4"],
  },
  {
    title: "Membrane split",
    description:
      "The membrane sends permeate toward PSA polishing while stream 6 takes retentate as a side draw. Follow both legs when reconciling mass balance stories.",
    nodeIds: ["memb", "out6"],
    edgeIds: ["e5", "e6"],
  },
  {
    title: "PSA products",
    description:
      "PSA yields overhead product oxygen (7) and a bottom offgas (8). Purity and flow on the dashboard refer to this kind of split—not to values edited in What-if mode.",
    nodeIds: ["psa", "out7", "out8"],
    edgeIds: ["e7", "e8"],
  },
];

const ENTRY_CONFIG = {
  training: {
    title: "Process flow (simulation)",
    lede:
      "Walk through the oxygen system layout step by step. Highlighting focuses one part of the PFD at a time; it does not change any stored or displayed dashboard metrics.",
  },
};

const WHAT_IF_FIELDS = [
  { key: "feedFlow", label: "Feed (stream 1)", unit: "Nm³/h", min: 0, max: 500, step: 1 },
  { key: "compressorWork", label: "Compressor work", unit: "kW", min: 0, max: 2000, step: 5 },
  { key: "coolerDuty", label: "Cooler duty", unit: "kW", min: 0, max: 800, step: 5 },
  { key: "permeateSplit", label: "Permeate to PSA", unit: "%", min: 0, max: 100, step: 1 },
  { key: "productPurity", label: "Product O₂ (stream 7)", unit: "%", min: 85, max: 99.9, step: 0.1 },
  { key: "offgasFlow", label: "Offgas (stream 8)", unit: "Nm³/h", min: 0, max: 200, step: 1 },
];

export default function SimulationDesignPage({
  isDarkMode,
  onToggleTheme,
  entryMode = null,
}) {
  const entry = entryMode && ENTRY_CONFIG[entryMode] ? ENTRY_CONFIG[entryMode] : null;
  const title = entry ? entry.title : "Process flow (simulation)";
  const lede = entry ? entry.lede : DEFAULT_LEDE;
  const pillClass = entry ? "status-pill accent" : "status-pill neutral";

  const [whatIf, setWhatIf] = useState(() => ({ ...DEFAULT_WHAT_IF }));
  const [trainingStep, setTrainingStep] = useState(0);

  const diagramVariant =
    entryMode === "whatif" ? "whatif" : entryMode === "training" ? "training" : "default";

  useEffect(() => {
    if (entryMode === "training") {
      setTrainingStep(0);
    }
  }, [entryMode]);

  const trainingMax = SIMULATION_TRAINING_STEPS.length - 1;

  const updateWhatIf = (key, raw) => {
    const n = parseFloat(raw);
    if (Number.isNaN(n)) return;
    const field = WHAT_IF_FIELDS.find((f) => f.key === key);
    const clamped = field
      ? Math.min(field.max, Math.max(field.min, n))
      : n;
    setWhatIf((prev) => ({ ...prev, [key]: clamped }));
  };

  return (
    <div className="main-column simulation-design-page">
      <header className="simulation-design-header">
        <div>
          <h1>{title}</h1>
          <p className="simulation-design-lede">{lede}</p>
        </div>
        <button
          type="button"
          className="auth-theme-toggle simulation-design-theme"
          onClick={onToggleTheme}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? "Light mode" : "Dark mode"}
        </button>
      </header>

      {entryMode === "whatif" ? (
        <section className="panel simulation-whatif-panel" aria-label="Local what-if parameters">
          <p className="simulation-whatif-panel__hint">
            <strong>Session-only.</strong> These values drive labels on the diagram below. They are not
            saved, not sent to the server, and do not alter simulated dashboard time series or alarms.
          </p>
          <div className="simulation-whatif-grid">
            {WHAT_IF_FIELDS.map((f) => (
              <label key={f.key} className="simulation-whatif-field">
                <span className="simulation-whatif-field__label">
                  {f.label} <span className="simulation-whatif-field__unit">({f.unit})</span>
                </span>
                <input
                  type="number"
                  className="simulation-whatif-field__input"
                  value={whatIf[f.key]}
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  onChange={(e) => updateWhatIf(f.key, e.target.value)}
                />
              </label>
            ))}
          </div>
          <div className="simulation-whatif-actions">
            <button
              type="button"
              className="simulation-whatif-reset"
              onClick={() => setWhatIf({ ...DEFAULT_WHAT_IF })}
            >
              Reset to defaults
            </button>
          </div>
        </section>
      ) : null}

      {entryMode === "training" ? (
        <section className="panel simulation-training-panel" aria-label="Training walkthrough">
          <div className="simulation-training-panel__head">
            <span className="simulation-training-panel__step">
              Step {trainingStep + 1} of {SIMULATION_TRAINING_STEPS.length}
            </span>
            <h2 className="simulation-training-panel__title">
              {SIMULATION_TRAINING_STEPS[trainingStep].title}
            </h2>
            <p className="simulation-training-panel__body">
              {SIMULATION_TRAINING_STEPS[trainingStep].description}
            </p>
          </div>
          <div className="simulation-training-panel__nav">
            <button
              type="button"
              className="simulation-training-nav-btn"
              disabled={trainingStep <= 0}
              onClick={() => setTrainingStep((s) => Math.max(0, s - 1))}
            >
              Back
            </button>
            <button
              type="button"
              className="simulation-training-nav-btn simulation-training-nav-btn--primary"
              disabled={trainingStep >= trainingMax}
              onClick={() => setTrainingStep((s) => Math.min(trainingMax, s + 1))}
            >
              Next
            </button>
          </div>
        </section>
      ) : null}

      <section className="panel simulation-flow-panel" aria-label="Interactive process diagram">
        <div className="simulation-flow-panel__inner">
          <ProcessFlowDiagram
            variant={diagramVariant}
            whatIf={entryMode === "whatif" ? whatIf : null}
            trainingStepIndex={trainingStep}
            trainingSteps={SIMULATION_TRAINING_STEPS}
          />
        </div>
      </section>

      <section className="panel simulation-assumptions" aria-label="Assumptions and limitations">
        <h2 className="simulation-assumptions__title">Assumptions and limitations</h2>
        <ul className="simulation-assumptions__list">
          <li>
            Steady-state or campaign results from a process simulator (e.g. Aspen HYSYS,
            UniSim) informed the expected ranges used in this demo—not continuous hospital
            SCADA data.
          </li>
          <li>
            Trend charts on the main dashboard use <strong>simulated time series</strong>{" "}
            when the history API is unavailable; they illustrate dynamics, not measured
            ward-by-ward consumption.
          </li>
          <li>
            Alarm and backup panels combine the same illustrative logic; treat values as
            placeholders for integration testing and stakeholder review.
          </li>
        </ul>
      </section>
    </div>
  );
}
