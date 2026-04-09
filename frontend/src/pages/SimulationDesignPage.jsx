import React, { useEffect, useState } from "react";
import ProcessFlowDiagram from "../components/simulation/ProcessFlowDiagram";

const DEFAULT_LEDE = "This diagram represents the oxygen production system based on the Aspen Plus model. It is used for training and understanding process behavior. Highlighted steps guide you through how each unit contributes to oxygen purity, flow, and system performance.";

const SIMULATION_TRAINING_STEPS = [
  {
    title: "Process overview",
    description:
      "This diagram represents the oxygen production system based on the Aspen Plus model. The flow follows: Feed → Compression → Cooling → Membrane → PSA → Final compression → Product. Blue lines are material streams; red dashed lines represent energy (heat duty Q or shaft work W).",
    nodeIds: [],
    edgeIds: [],
  },
  {
    title: "Feed stream (Stream 1)",
    description:
      "The system starts with the feed air entering at ambient conditions. This stream defines the baseline flow rate and composition entering the process. In real systems, this is influenced by demand forecasts from the hospital.",
    nodeIds: ["s1", "comp"],
    edgeIds: ["e1"],
  },
  {
    title: "Primary compression (COMP)",
    description:
      "The compressor increases the pressure of the feed air to enable efficient separation downstream. This step consumes mechanical power (W), which is a key performance and energy KPI in the dashboard.",
    nodeIds: ["comp", "wComp"],
    edgeIds: ["e1", "e2", "ew1"],
  },
  {
    title: "Cooling before separation",
    description:
      "After compression, the air is cooled to optimal conditions before entering the membrane. The cooler removes excess heat (Q), which improves separation efficiency and protects downstream units.",
    nodeIds: ["cooler", "qCooler"],
    edgeIds: ["e2", "e3", "eq1"],
  },
  {
    title: "Membrane separation",
    description:
      "The membrane performs the first stage of oxygen enrichment. It splits the flow into permeate (oxygen-enriched, sent to PSA) and retentate (remaining gases). Monitoring this split is critical for mass balance and efficiency.",
    nodeIds: ["memb", "out5"],
    edgeIds: ["e4", "e5"],
  },
  {
    title: "PSA purification",
    description:
      "The PSA unit further purifies oxygen by adsorbing unwanted gases. The top stream continues toward product processing, while the bottom stream is rejected as off-gas. This step determines final oxygen purity.",
    nodeIds: ["psa", "out7", "comp2"],
    edgeIds: ["e6", "e7"],
  },
  {
    title: "Final compression and cooling",
    description:
      "The purified oxygen is compressed again and cooled to meet delivery conditions. This ensures the product stream satisfies required pressure and temperature specifications before storage or distribution.",
    nodeIds: ["comp2", "wComp2", "cooler2", "qCooler2", "out9"],
    edgeIds: ["e8", "e9", "ew2", "eq2"],
  },
];

const ENTRY_CONFIG = {
  training: {
    title: "Process flow (simulation)",
    lede:
      "Walk through the oxygen system layout step by step. Highlighting focuses one part of the PFD at a time; it does not change any stored or displayed dashboard metrics.",
  },
};


export default function SimulationDesignPage({
  isDarkMode,
  onToggleTheme,
  entryMode = null,
}) {
  const entry = entryMode && ENTRY_CONFIG[entryMode] ? ENTRY_CONFIG[entryMode] : null;
  const title = entry ? entry.title : "Process flow (simulation)";
  const lede = entry ? entry.lede : DEFAULT_LEDE;

  const [trainingStep, setTrainingStep] = useState(0);

  const diagramVariant =
    entryMode === "training" ? "training" : "default";

  useEffect(() => {
    if (entryMode === "training") {
      setTrainingStep(0);
    }
  }, [entryMode]);

  const trainingMax = SIMULATION_TRAINING_STEPS.length - 1;

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
            trainingStepIndex={trainingStep}
            trainingSteps={SIMULATION_TRAINING_STEPS}
          />
        </div>
      </section>

      <section className="panel simulation-assumptions" aria-label="System context and limitations">
  <h2 className="simulation-assumptions__title">System context and limitations</h2>
  <ul className="simulation-assumptions__list">
    <li>
      This visualization is based on a <strong>steady-state Aspen Plus simulation</strong> of the oxygen production process. 
      It represents expected operating conditions rather than real-time plant behavior.
    </li>
    <li>
      Displayed values (e.g., purity, flow rate, pressure) are used to <strong>evaluate system performance against predefined thresholds</strong>, 
      supporting alert generation and compliance checks.
    </li>
    <li>
      The dashboard focuses on <strong>decision support and system awareness</strong>, helping stakeholders identify potential issues 
      such as low purity, abnormal pressure, or insufficient backup supply.
    </li>
    <li>
      This interface does not directly control equipment; it provides a <strong>digital supervisory layer</strong> 
      that complements physical plant operations.
    </li>
  </ul>
</section>
    </div>
  );
}
