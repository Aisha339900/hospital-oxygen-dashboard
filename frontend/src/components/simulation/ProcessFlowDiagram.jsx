import React, { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

function ProcessUnitNode({ data }) {
  const { title, abbr, heatOut, bottomOut, topOut, splitOutlet, scenarioLine } = data;
  return (
    <div className="process-unit-node" title={data.tooltip || title}>
      <Handle type="target" position={Position.Left} />
      {!splitOutlet ? (
        <Handle type="source" position={Position.Right} id="material" />
      ) : null}
      {heatOut ? (
        <Handle type="source" position={Position.Top} id="heat" />
      ) : null}
      {bottomOut ? (
        <Handle type="source" position={Position.Bottom} id="bottom" />
      ) : null}
      {topOut ? (
        <Handle type="source" position={Position.Top} id="top" />
      ) : null}
      <span className="process-unit-node__abbr">{abbr}</span>
      <span className="process-unit-node__title">{title}</span>
      {scenarioLine ? (
        <span className="process-unit-node__scenario">{scenarioLine}</span>
      ) : null}
    </div>
  );
}

function StreamTagNode({ data }) {
  const withValue = Boolean(data.scenarioValue);
  return (
    <div
      className={`stream-tag-node${withValue ? " stream-tag-node--with-value" : ""}`}
      title={data.tooltip}
    >
      <Handle type="source" position={Position.Right} />
      <span className="stream-tag-node__n">{data.n}</span>
      {data.scenarioValue ? (
        <span className="stream-tag-node__scenario">{data.scenarioValue}</span>
      ) : null}
    </div>
  );
}

function OutletNode({ data }) {
  return (
    <div className="outlet-node" title={data.tooltip}>
      <Handle type="target" position={Position.Left} id="in" />
      <span className="outlet-node__n">{data.n}</span>
      {data.sub ? <span className="outlet-node__sub">{data.sub}</span> : null}
      {data.scenarioLine ? (
        <span className="outlet-node__scenario">{data.scenarioLine}</span>
      ) : null}
    </div>
  );
}

function EnergyNode({ data }) {
  return (
    <div className="energy-node" title={data.tooltip}>
      <Handle type="target" position={Position.Bottom} id="in" />
      <span className="energy-node__label">{data.label}</span>
    </div>
  );
}

const nodeTypes = {
  processUnit: ProcessUnitNode,
  streamTag: StreamTagNode,
  outlet: OutletNode,
  energy: EnergyNode,
};

const materialEdge = {
  style: { stroke: "var(--flow-material, #3b82f6)" },
  labelStyle: { fill: "var(--text-muted, #94a3b8)", fontWeight: 600 },
};

const heatEdge = {
  style: {
    stroke: "var(--flow-heat, #ef4444)",
    strokeDasharray: "6 4",
  },
  labelStyle: { fill: "var(--flow-heat, #ef4444)", fontWeight: 600 },
};

const initialNodes = [
  {
    id: "s1",
    type: "streamTag",
    position: { x: 0, y: 188 },
    data: {
      n: "1",
      tooltip: "Feed stream into the compressor.",
    },
  },
  {
    id: "comp",
    type: "processUnit",
    position: { x: 100, y: 160 },
    data: {
      abbr: "Comp",
      title: "Compressor",
      heatOut: true,
      tooltip: "Raises feed pressure for downstream separation.",
    },
  },
  {
    id: "q100",
    type: "energy",
    position: { x: 108, y: 0 },
    data: {
      label: "Q-100",
      tooltip: "Shaft work / energy stream associated with compression.",
    },
  },
  {
    id: "cooler",
    type: "processUnit",
    position: { x: 300, y: 160 },
    data: {
      abbr: "Cooler",
      title: "Cooler",
      heatOut: true,
      tooltip: "Removes heat before membrane separation.",
    },
  },
  {
    id: "heat4",
    type: "energy",
    position: { x: 308, y: 0 },
    data: {
      label: "4",
      tooltip: "Heat rejected from the cooler (energy stream).",
    },
  },
  {
    id: "memb",
    type: "processUnit",
    position: { x: 500, y: 160 },
    data: {
      abbr: "Memb",
      title: "Membrane",
      bottomOut: true,
      tooltip: "Membrane unit: permeate toward PSA, retentate as side draw.",
    },
  },
  {
    id: "psa",
    type: "processUnit",
    position: { x: 700, y: 160 },
    data: {
      abbr: "PSA",
      title: "Pressure swing adsorption",
      splitOutlet: true,
      bottomOut: true,
      topOut: true,
      tooltip: "PSA polishes the permeate to product oxygen specifications.",
    },
  },
  {
    id: "out6",
    type: "outlet",
    position: { x: 520, y: 360 },
    data: {
      n: "6",
      sub: "Membrane retentate",
      tooltip: "Membrane bottom outlet stream.",
    },
  },
  {
    id: "out7",
    type: "outlet",
    position: { x: 920, y: 32 },
    data: {
      n: "7",
      sub: "Product",
      tooltip: "PSA overhead product stream.",
    },
  },
  {
    id: "out8",
    type: "outlet",
    position: { x: 920, y: 360 },
    data: {
      n: "8",
      sub: "PSA offgas",
      tooltip: "PSA bottom outlet stream.",
    },
  },
];

const initialEdges = [
  {
    id: "e1",
    source: "s1",
    target: "comp",
    label: "1",
    ...materialEdge,
  },
  {
    id: "e2",
    source: "comp",
    target: "cooler",
    sourceHandle: "material",
    label: "2",
    ...materialEdge,
  },
  {
    id: "eq100",
    source: "comp",
    target: "q100",
    sourceHandle: "heat",
    label: "Q-100",
    ...heatEdge,
  },
  {
    id: "e3",
    source: "cooler",
    target: "memb",
    sourceHandle: "material",
    label: "3",
    ...materialEdge,
  },
  {
    id: "e4",
    source: "cooler",
    target: "heat4",
    sourceHandle: "heat",
    label: "4",
    ...heatEdge,
  },
  {
    id: "e5",
    source: "memb",
    target: "psa",
    sourceHandle: "material",
    label: "5",
    ...materialEdge,
  },
  {
    id: "e6",
    source: "memb",
    target: "out6",
    sourceHandle: "bottom",
    label: "6",
    ...materialEdge,
  },
  {
    id: "e7",
    source: "psa",
    target: "out7",
    sourceHandle: "top",
    label: "7",
    ...materialEdge,
  },
  {
    id: "e8",
    source: "psa",
    target: "out8",
    sourceHandle: "bottom",
    label: "8",
    ...materialEdge,
  },
];

const stripTrainingClass = (cls) =>
  (cls || "")
    .replace(/\s*process-flow-node--training-(dim|focus)\s*/g, " ")
    .replace(/\s*process-flow-edge--training-(dim|focus)\s*/g, " ")
    .trim();

function buildFlowState(variant, whatIf, trainingStepIndex, trainingSteps) {
  let nodes = initialNodes.map((n) => ({
    ...n,
    data: { ...n.data },
    className: stripTrainingClass(n.className),
  }));
  let edges = initialEdges.map((e) => ({
    ...e,
    className: stripTrainingClass(e.className),
  }));

  if (variant === "whatif" && whatIf) {
    nodes = nodes.map((n) => {
      const data = { ...n.data };
      if (n.id === "s1") data.scenarioValue = `${whatIf.feedFlow} Nm³/h`;
      if (n.id === "comp") data.scenarioLine = `${whatIf.compressorWork} kW`;
      if (n.id === "cooler") data.scenarioLine = `${whatIf.coolerDuty} kW`;
      if (n.id === "memb") data.scenarioLine = `${whatIf.permeateSplit}% → PSA`;
      if (n.id === "out7") data.scenarioLine = `${whatIf.productPurity}% O₂`;
      if (n.id === "out8") data.scenarioLine = `${whatIf.offgasFlow} Nm³/h`;
      return { ...n, data };
    });
  }

  if (variant === "training" && trainingSteps.length) {
    const step = trainingSteps[trainingStepIndex];
    if (step) {
      const focusN = new Set(step.nodeIds || []);
      const focusE = new Set(step.edgeIds || []);
      const overview = focusN.size === 0 && focusE.size === 0;
      if (!overview) {
        nodes = nodes.map((n) => ({
          ...n,
          className: `${stripTrainingClass(n.className)} ${
            focusN.has(n.id)
              ? "process-flow-node--training-focus"
              : "process-flow-node--training-dim"
          }`.trim(),
        }));
        edges = edges.map((e) => ({
          ...e,
          className: `${stripTrainingClass(e.className)} ${
            focusE.has(e.id)
              ? "process-flow-edge--training-focus"
              : "process-flow-edge--training-dim"
          }`.trim(),
        }));
      }
    }
  }

  return { nodes, edges };
}

function FlowCanvas({
  variant = "default",
  whatIf = null,
  trainingStepIndex = 0,
  trainingSteps = [],
}) {
  const { nodes: mergedNodes, edges: mergedEdges } = useMemo(
    () => buildFlowState(variant, whatIf, trainingStepIndex, trainingSteps),
    [variant, whatIf, trainingStepIndex, trainingSteps],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(mergedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(mergedEdges);
  const { fitView } = useReactFlow();

  useEffect(() => {
    setNodes(mergedNodes);
  }, [mergedNodes, setNodes]);

  useEffect(() => {
    setEdges(mergedEdges);
  }, [mergedEdges, setEdges]);

  useEffect(() => {
    const t = requestAnimationFrame(() => {
      fitView({ padding: 0.2, maxZoom: 1.2 });
    });
    return () => cancelAnimationFrame(t);
  }, [fitView, variant]);

  const onInit = useCallback(
    (instance) => {
      instance.fitView({ padding: 0.2, maxZoom: 1.2 });
    },
    [],
  );

  const defaultEdgeOptions = useMemo(
    () => ({
      type: "smoothstep",
    }),
    [],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      onInit={onInit}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnScroll
      zoomOnScroll
      minZoom={0.4}
      maxZoom={1.5}
      proOptions={{ hideAttribution: true }}
      fitView
    >
      <Background gap={20} color="var(--flow-bg-dot, rgba(148,163,184,0.25))" />
      <Controls showInteractive={false} className="process-flow-controls" />
    </ReactFlow>
  );
}

export default function ProcessFlowDiagram({
  variant = "default",
  whatIf = null,
  trainingStepIndex = 0,
  trainingSteps = [],
}) {
  return (
    <div className="process-flow-diagram">
      <ReactFlowProvider>
        <FlowCanvas
          variant={variant}
          whatIf={whatIf}
          trainingStepIndex={trainingStepIndex}
          trainingSteps={trainingSteps}
        />
      </ReactFlowProvider>
    </div>
  );
}
