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
  const onPick = typeof data.onStreamSelect === "function" ? data.onStreamSelect : null;
  const selected = Boolean(data.streamInspectorSelected);
  return (
    <div
      className={`stream-tag-node${withValue ? " stream-tag-node--with-value" : ""}${onPick ? " stream-tag-node--selectable" : ""}${selected ? " stream-tag-node--inspector-selected" : ""}`}
      title={data.tooltip}
      role={onPick ? "button" : undefined}
      tabIndex={onPick ? 0 : undefined}
      onClick={
        onPick
          ? (e) => {
              e.stopPropagation();
              onPick(String(data.n));
            }
          : undefined
      }
      onKeyDown={
        onPick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onPick(String(data.n));
              }
            }
          : undefined
      }
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
  const onPick = typeof data.onStreamSelect === "function" ? data.onStreamSelect : null;
  const selected = Boolean(data.streamInspectorSelected);
  return (
    <div
      className={`outlet-node${onPick ? " outlet-node--selectable" : ""}${selected ? " outlet-node--inspector-selected" : ""}`}
      title={data.tooltip}
      role={onPick ? "button" : undefined}
      tabIndex={onPick ? 0 : undefined}
      onClick={
        onPick
          ? (e) => {
              e.stopPropagation();
              onPick(String(data.n));
            }
          : undefined
      }
      onKeyDown={
        onPick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onPick(String(data.n));
              }
            }
          : undefined
      }
    >
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
    position: { x: 0, y: 198 },
    data: {
      n: "1",
      scenarioValue: "19754 l/min",
      tooltip: "Stream 1: 25 °C, 1 bar, 19754 l/min (Aspen reference case).",
    },
  },
  {
    id: "comp",
    type: "processUnit",
    position: { x: 100, y: 170 },
    data: {
      abbr: "COMP",
      title: "Compressor",
      heatOut: true,
      scenarioLine: "W = 107 kW",
      tooltip: "Raises feed pressure for downstream separation.",
    },
  },
  {
    id: "wComp",
    type: "energy",
    position: { x: 108, y: 0 },
    data: {
      label: "W",
      tooltip: "Mechanical power (shaft work) for COMP.",
    },
  },
  {
    id: "cooler",
    type: "processUnit",
    position: { x: 300, y: 170 },
    data: {
      abbr: "COOLER",
      title: "Cooler",
      heatOut: true,
      scenarioLine: "Q = −25 877 cal/s",
      tooltip: "Intercooler before the membrane.",
    },
  },
  {
    id: "qCooler",
    type: "energy",
    position: { x: 308, y: 0 },
    data: {
      label: "Q",
      tooltip: "Heat duty rejected from COOLER.",
    },
  },
  {
    id: "memb",
    type: "processUnit",
    position: { x: 500, y: 170 },
    data: {
      abbr: "MEMBRANE",
      title: "Membrane",
      bottomOut: true,
      scenarioLine: "Permeate → PSA",
      tooltip: "Stream 4 to PSA; stream 5 is the bottom (retentate) draw.",
    },
  },
  {
    id: "psa",
    type: "processUnit",
    position: { x: 720, y: 248 },
    data: {
      abbr: "PSA",
      title: "Pressure swing adsorption",
      splitOutlet: true,
      bottomOut: true,
      topOut: true,
      scenarioLine: "Q = 0",
      tooltip: "Stream 6 (top) to COMP2; stream 7 (bottom) vent.",
    },
  },
  {
    id: "comp2",
    type: "processUnit",
    position: { x: 860, y: 96 },
    data: {
      abbr: "COMP2",
      title: "Compressor",
      heatOut: true,
      scenarioLine: "W = 3 kW",
      tooltip: "Second-stage compression of PSA overhead.",
    },
  },
  {
    id: "wComp2",
    type: "energy",
    position: { x: 868, y: 0 },
    data: {
      label: "W",
      tooltip: "Mechanical power for COMP2.",
    },
  },
  {
    id: "cooler2",
    type: "processUnit",
    position: { x: 1020, y: 96 },
    data: {
      abbr: "COOLER2",
      title: "Cooler",
      heatOut: true,
      scenarioLine: "Q = −778 cal/s",
      tooltip: "Product cooler after second compression.",
    },
  },
  {
    id: "qCooler2",
    type: "energy",
    position: { x: 1028, y: 0 },
    data: {
      label: "Q",
      tooltip: "Heat duty from COOLER2.",
    },
  },
  {
    id: "out5",
    type: "outlet",
    position: { x: 520, y: 400 },
    data: {
      n: "5",
      sub: "Membrane retentate",
      tooltip: "Bottom outlet from the membrane unit.",
    },
  },
  {
    id: "out7",
    type: "outlet",
    position: { x: 900, y: 420 },
    data: {
      n: "7",
      sub: "PSA bottom",
      tooltip: "PSA bottom outlet (vent / offgas leg).",
    },
  },
  {
    id: "out9",
    type: "outlet",
    position: { x: 1160, y: 96 },
    data: {
      n: "9",
      sub: "Product O₂",
      tooltip: "Final conditioned oxygen product stream.",
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
    id: "ew1",
    source: "comp",
    target: "wComp",
    sourceHandle: "heat",
    label: "W",
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
    id: "eq1",
    source: "cooler",
    target: "qCooler",
    sourceHandle: "heat",
    label: "Q",
    ...heatEdge,
  },
  {
    id: "e4",
    source: "memb",
    target: "psa",
    sourceHandle: "material",
    label: "4",
    ...materialEdge,
  },
  {
    id: "e5",
    source: "memb",
    target: "out5",
    sourceHandle: "bottom",
    label: "5",
    ...materialEdge,
  },
  {
    id: "e6",
    source: "psa",
    target: "comp2",
    sourceHandle: "top",
    label: "6",
    ...materialEdge,
  },
  {
    id: "e7",
    source: "psa",
    target: "out7",
    sourceHandle: "bottom",
    label: "7",
    ...materialEdge,
  },
  {
    id: "e8",
    source: "comp2",
    target: "cooler2",
    sourceHandle: "material",
    label: "8",
    ...materialEdge,
  },
  {
    id: "ew2",
    source: "comp2",
    target: "wComp2",
    sourceHandle: "heat",
    label: "W",
    ...heatEdge,
  },
  {
    id: "eq2",
    source: "cooler2",
    target: "qCooler2",
    sourceHandle: "heat",
    label: "Q",
    ...heatEdge,
  },
  {
    id: "e9",
    source: "cooler2",
    target: "out9",
    sourceHandle: "material",
    label: "9",
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
      if (n.id === "s1") data.scenarioValue = `${whatIf.feedFlow} l/min`;
      if (n.id === "comp") data.scenarioLine = `${whatIf.compressorWork} kW`;
      if (n.id === "cooler") data.scenarioLine = `${whatIf.coolerDuty} kW`;
      if (n.id === "memb") data.scenarioLine = `${whatIf.permeateSplit}% → PSA`;
      if (n.id === "comp2") data.scenarioLine = `${whatIf.compressor2Work} kW`;
      if (n.id === "cooler2") data.scenarioLine = `${whatIf.cooler2Duty} kW`;
      if (n.id === "out7") data.scenarioLine = `${whatIf.offgasFlow} l/min`;
      if (n.id === "out9") data.scenarioLine = `${whatIf.productPurity}% O₂ · ${whatIf.productFlow} l/min`;
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
  selectedStreamId = null,
  onStreamSelect,
}) {
  const { nodes: mergedNodes, edges: mergedEdges } = useMemo(
    () => buildFlowState(variant, whatIf, trainingStepIndex, trainingSteps),
    [variant, whatIf, trainingStepIndex, trainingSteps],
  );

  const nodesWithInspector = useMemo(
    () =>
      mergedNodes.map((n) => {
        const sel =
          selectedStreamId &&
          (n.type === "streamTag" || n.type === "outlet") &&
          String(n.data?.n) === String(selectedStreamId);
        const extra = sel ? " process-flow-node--inspector-selected" : "";
        return {
          ...n,
          selectable: false,
          className: `${n.className || ""}${extra}`.trim(),
          data: {
            ...n.data,
            onStreamSelect,
            streamInspectorSelected: Boolean(sel),
          },
        };
      }),
    [mergedNodes, onStreamSelect, selectedStreamId],
  );

  const edgesWithInspector = useMemo(
    () =>
      mergedEdges.map((e) => {
        const label = String(e.label ?? "");
        const mat = /^[1-9]$/.test(label);
        const sel = Boolean(selectedStreamId && mat && label === String(selectedStreamId));
        const extra = sel ? " process-flow-edge--inspector-selected" : "";
        return {
          ...e,
          selectable: mat,
          className: `${e.className || ""}${extra}`.trim(),
          interactionWidth: mat ? 28 : e.interactionWidth,
        };
      }),
    [mergedEdges, selectedStreamId],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(nodesWithInspector);
  const [edges, setEdges, onEdgesChange] = useEdgesState(edgesWithInspector);
  const { fitView } = useReactFlow();

  useEffect(() => {
    setNodes(nodesWithInspector);
  }, [nodesWithInspector, setNodes]);

  useEffect(() => {
    setEdges(edgesWithInspector);
  }, [edgesWithInspector, setEdges]);

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

  const onEdgeClick = useCallback(
    (_evt, edge) => {
      const id = String(edge?.label ?? "").trim();
      if (/^[1-9]$/.test(id)) {
        onStreamSelect?.(id);
      }
      setEdges((eds) => eds.map((e) => ({ ...e, selected: false })));
    },
    [onStreamSelect, setEdges],
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
      onEdgeClick={onEdgeClick}
      nodeTypes={nodeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      onInit={onInit}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable
      selectNodesOnDrag={false}
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
  trainingStepIndex = 0,
  trainingSteps = [],
  selectedStreamId = null,
  onStreamSelect,
}) {
  return (
    <div className="process-flow-diagram">
      <ReactFlowProvider>
        <FlowCanvas
          variant={variant}
          trainingStepIndex={trainingStepIndex}
          trainingSteps={trainingSteps}
          selectedStreamId={selectedStreamId}
          onStreamSelect={onStreamSelect}
        />
      </ReactFlowProvider>
    </div>
  );
}
