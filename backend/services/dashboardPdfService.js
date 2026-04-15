const PDFDocument = require("pdfkit");

const MAX_ALARMS = 35;
const MAX_TREND_ROWS = 24;
const MAX_STREAMS = 16;
const MAX_STRING = 480;

const COLORS = {
  ink: "#10233f",
  subInk: "#48627f",
  muted: "#6b7f95",
  border: "#d9e4ee",
  panel: "#f7fafc",
  mint: "#dff7ee",
  mintInk: "#107a58",
  blue: "#e7f0ff",
  blueInk: "#1d4ed8",
  amber: "#fff3d6",
  amberInk: "#b7791f",
  rose: "#ffe2e7",
  roseInk: "#be123c",
  slate: "#edf3f8",
  deep: "#173056",
};

function clipStr(s, max = MAX_STRING) {
  const t = String(s ?? "");
  return t.length > max ? `${t.slice(0, max - 1)}...` : t;
}

function numOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function sanitizeSupplyDemandBlock(sd) {
  if (!sd || typeof sd !== "object") {
    return null;
  }
  const demand =
    sd.demand && typeof sd.demand === "object"
      ? {
          scenario: clipStr(sd.demand.scenario, 48),
          status: sd.demand.status != null ? clipStr(sd.demand.status, 48) : null,
          generalRequests: numOrNull(sd.demand.generalRequests),
          icuRequests: numOrNull(sd.demand.icuRequests),
          totalRequests: numOrNull(sd.demand.totalRequests),
        }
      : null;
  const supply =
    sd.supply && typeof sd.supply === "object"
      ? {
          scenario: clipStr(sd.supply.scenario, 48),
          status: sd.supply.status != null ? clipStr(sd.supply.status, 48) : null,
          mainUtilizationPercent: numOrNull(sd.supply.mainUtilizationPercent),
          mainRemainingLiters: numOrNull(sd.supply.mainRemainingLiters),
          coveragePercent: numOrNull(sd.supply.coveragePercent),
        }
      : null;
  return {
    status: sd.status != null ? clipStr(sd.status, 200) : null,
    forecast: sd.forecast != null ? clipStr(sd.forecast, 260) : null,
    demand,
    supply,
  };
}

function sanitizeStreams(streams) {
  if (!Array.isArray(streams)) {
    return [];
  }

  return streams.slice(0, MAX_STREAMS).map((stream) => ({
    id: clipStr(stream?.id ?? "", 32),
    label: clipStr(stream?.label ?? "Stream", 80),
    composition:
      stream?.composition && typeof stream.composition === "object"
        ? {
            o2: numOrNull(stream.composition.o2),
            n2: numOrNull(stream.composition.n2),
            ar: numOrNull(stream.composition.ar),
          }
        : null,
    process:
      stream?.process && typeof stream.process === "object"
        ? {
            oxygenPurityPercent: numOrNull(stream.process.oxygenPurityPercent),
            flowRateM3h: numOrNull(stream.process.flowRateM3h),
            deliveryPressureBar: numOrNull(stream.process.deliveryPressureBar),
            temperature: numOrNull(stream.process.temperature),
            molarFlow: numOrNull(stream.process.molarFlow),
            massFlow: numOrNull(stream.process.massFlow),
          }
        : null,
  }));
}

function sanitizeReportOptions(raw) {
  const flag = (key) =>
    raw && typeof raw === "object" && raw[key] === false ? false : true;
  return {
    includeOverview: flag("includeOverview"),
    includeKpis: flag("includeKpis"),
    includeStreams: flag("includeStreams"),
    includeSupplyDemand: flag("includeSupplyDemand"),
    includeTrendSample: flag("includeTrendSample"),
    includeAlarms: flag("includeAlarms"),
  };
}

function sanitizeSnapshot(raw) {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid snapshot");
  }

  const stream = raw.stream && typeof raw.stream === "object" ? raw.stream : {};
  const statCards = Array.isArray(raw.statCards) ? raw.statCards : [];
  const alarms = Array.isArray(raw.alarms) ? raw.alarms.slice(0, MAX_ALARMS) : [];
  const trendSample = Array.isArray(raw.trendSample)
    ? raw.trendSample.slice(-MAX_TREND_ROWS)
    : [];

  return {
    version: Number(raw.version) || 1,
    generatedAt: clipStr(raw.generatedAt || new Date().toISOString(), 64),
    title: clipStr(raw.title || "Oxygen monitoring dashboard", 120),
    stream: {
      id: clipStr(stream.id ?? "", 32),
      label: clipStr(stream.label ?? "-", 120),
    },
    streams: sanitizeStreams(raw.streams),
    lastUpdated: clipStr(raw.lastUpdated ?? "", 80),
    status:
      raw.status && typeof raw.status === "object"
        ? {
            purity: clipStr(raw.status.purity, 24),
            flowRate: clipStr(raw.status.flowRate, 24),
            pressure: clipStr(raw.status.pressure, 24),
            demandCoverage: clipStr(raw.status.demandCoverage, 24),
            specificEnergy: clipStr(raw.status.specificEnergy, 24),
            status: clipStr(raw.status.status, 32),
          }
        : null,
    statCards: statCards.slice(0, 12).map((c) => ({
      id: clipStr(c?.id ?? "", 48),
      label: clipStr(c?.label ?? "", 80),
      value: clipStr(c?.value ?? "", 40),
      delta: clipStr(c?.delta ?? "", 40),
      helper: clipStr(c?.helper ?? "", 120),
    })),
    alarms: alarms.map((a) => ({
      message: clipStr(a?.message ?? "", 220),
      severity: clipStr(a?.severity ?? "", 24),
      timeLabel: clipStr(a?.timeLabel ?? "", 80),
    })),
    backup:
      raw.backup && typeof raw.backup === "object"
        ? {
            mode: clipStr(raw.backup.mode ?? "", 64),
            utilization: numOrNull(raw.backup.utilization),
            remainingLiters: numOrNull(raw.backup.remainingLiters),
          }
        : null,
    supplyDemand: sanitizeSupplyDemandBlock(raw.supplyDemand),
    trendSummary:
      raw.trendSummary && typeof raw.trendSummary === "object"
        ? {
            timelineRange: clipStr(raw.trendSummary.timelineRange ?? "", 120),
            trendFeedRange: clipStr(raw.trendSummary.trendFeedRange ?? "", 120),
            rowCount: Number(raw.trendSummary.rowCount) || 0,
          }
        : null,
    trendSample: trendSample.map((r) => ({
      feed_flow_kmol_h:
        r?.feed_flow_kmol_h === null || r?.feed_flow_kmol_h === undefined
          ? null
          : Number(r.feed_flow_kmol_h),
      product_flow_L_min:
        r?.product_flow_L_min === null || r?.product_flow_L_min === undefined
          ? null
          : Number(r.product_flow_L_min),
      oxygen_purity_percent:
        r?.oxygen_purity_percent === null || r?.oxygen_purity_percent === undefined
          ? null
          : Number(r.oxygen_purity_percent),
    })),
    meta: {
      unacknowledgedAlarms: Number(raw.meta?.unacknowledgedAlarms) || 0,
      trendsAreSimulated: Boolean(raw.meta?.trendsAreSimulated),
      supplyIsHealthy: Boolean(raw.meta?.supplyIsHealthy),
      coveragePercent:
        raw.meta?.coveragePercent === null || raw.meta?.coveragePercent === undefined
          ? null
          : Number(raw.meta.coveragePercent),
      dashboardTestMode: Boolean(raw.meta?.dashboardTestMode),
    },
    reportOptions: sanitizeReportOptions(raw.reportOptions),
  };
}

function formatNumber(value, digits = 1, suffix = "") {
  return Number.isFinite(value) ? `${value.toFixed(digits)}${suffix}` : "--";
}

function formatPercentMaybe(value, digits = 1) {
  if (!Number.isFinite(value)) return "--";
  const normalized = value <= 1 ? value * 100 : value;
  return `${normalized.toFixed(digits)}%`;
}

function drawRoundRect(doc, x, y, width, height, fill, stroke = null, radius = 16) {
  doc.save();
  doc.roundedRect(x, y, width, height, radius);
  if (fill) {
    doc.fillColor(fill).fill();
  }
  if (stroke) {
    doc.roundedRect(x, y, width, height, radius).lineWidth(1).strokeColor(stroke).stroke();
  }
  doc.restore();
}

function ensureSpace(doc, y, needed, drawHeader) {
  const bottom = doc.page.height - doc.page.margins.bottom;
  if (y + needed <= bottom) {
    return y;
  }
  doc.addPage();
  if (typeof drawHeader === "function") {
    const nextY = drawHeader();
    if (Number.isFinite(nextY)) {
      return nextY;
    }
  }
  return doc.page.margins.top;
}

function drawPageChrome(doc, snapshot) {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const top = doc.page.margins.top - 20;
  const innerBottom = doc.page.height - doc.page.margins.bottom;
  const ruleY = innerBottom - 14;
  const footerTextY = innerBottom - 10;

  doc.save();
  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#ffffff");
  doc.moveTo(left, top).lineTo(right, top).lineWidth(1).strokeColor("#e6eef5").stroke();
  doc
    .fontSize(8)
    .fillColor(COLORS.muted)
    .text("Hospital Oxygen Dashboard", left, top - 12, { width: 180 });
  doc
    .fontSize(8)
    .fillColor(COLORS.muted)
    .text(`Generated ${snapshot.generatedAt}`, right - 160, top - 12, {
      width: 160,
      align: "right",
    });
  doc.moveTo(left, ruleY).lineTo(right, ruleY).lineWidth(1).strokeColor("#e6eef5").stroke();
  doc
    .fontSize(8)
    .fillColor(COLORS.muted)
    .text(`Page ${doc.page.pageNumber}`, right - 70, footerTextY, { width: 70, align: "right", lineBreak: false });
  doc.restore();
}

function sectionTitle(doc, text, x, y, width, caption = "") {
  doc.fontSize(14).fillColor(COLORS.ink).text(text, x, y, { width });
  if (caption) {
    doc.fontSize(9).fillColor(COLORS.subInk).text(caption, x, doc.y + 2, { width });
  }
  return doc.y + 12;
}

function drawKpiCard(doc, x, y, width, height, card, color) {
  drawRoundRect(doc, x, y, width, height, "#ffffff", COLORS.border, 18);
  doc.fontSize(8).fillColor(COLORS.muted).text(card.label.toUpperCase(), x + 14, y + 12, {
    width: width - 28,
  });
  doc.fontSize(18).fillColor(COLORS.ink).text(card.value || "--", x + 14, y + 28, {
    width: width - 28,
  });
  drawRoundRect(doc, x + 14, y + height - 30, 70, 18, color.bg, null, 9);
  doc.fontSize(8).fillColor(color.ink).text(card.delta || "Stable", x + 20, y + height - 25, {
    width: 58,
    align: "center",
  });
  if (card.helper) {
    doc.fontSize(8).fillColor(COLORS.subInk).text(card.helper, x + 92, y + height - 24, {
      width: width - 106,
      ellipsis: true,
    });
  }
}

function drawHero(doc, snapshot, x, y, width) {
  let cy = y;
  doc.fontSize(20).fillColor(COLORS.ink).text("Monitoring Report", x, cy, { width });
  cy = doc.y + 4;
  doc.fontSize(10).fillColor(COLORS.subInk).text(snapshot.title, x, cy, { width });
  cy = doc.y + 2;
  doc.fontSize(9).fillColor(COLORS.muted).text(`Primary stream: ${snapshot.stream.label || "--"}`, x, cy, {
    width,
  });
  cy = doc.y + 2;
  doc.fontSize(9).fillColor(COLORS.muted).text(`Last updated: ${snapshot.lastUpdated || "--"}`, x, cy, { width });
  if (snapshot.meta?.dashboardTestMode) {
    cy = doc.y + 6;
    doc
      .fontSize(9)
      .fillColor(COLORS.amberInk)
      .text("Alarm test mode was enabled when this report was generated.", x, cy, { width });
  }

  const coveragePart =
    snapshot.meta.coveragePercent !== null && !Number.isNaN(snapshot.meta.coveragePercent)
      ? `${snapshot.meta.coveragePercent.toFixed(1)}% covered`
      : "Coverage n/a";
  const metaLine = [
    `${snapshot.streams.length || 1} streams`,
    coveragePart,
    `${snapshot.meta.unacknowledgedAlarms} alarms`,
  ].join("   •   ");
  cy = doc.y + 8;
  doc.fontSize(9).fillColor(COLORS.subInk).text(metaLine, x, cy, { width });

  return doc.y + 16;
}

function drawOverviewGrid(doc, snapshot, x, y, width) {
  const cardWidth = (width - 12) / 2;
  const cardHeight = 86;
  const leftItems = [
    ["Active stream", snapshot.stream.label || "--"],
    ["Data source", snapshot.meta.trendsAreSimulated ? "Simulated / offline" : "Live API"],
    ["Report time", snapshot.generatedAt],
  ];
  const rightItems = [
    ["Plant status", snapshot.status?.status || "--"],
    ["Coverage", snapshot.meta.coveragePercent !== null ? `${snapshot.meta.coveragePercent.toFixed(1)}%` : "--"],
    ["Backup mode", snapshot.backup?.mode || "--"],
  ];

  drawRoundRect(doc, x, y, cardWidth, cardHeight, COLORS.panel, COLORS.border, 18);
  drawRoundRect(doc, x + cardWidth + 12, y, cardWidth, cardHeight, COLORS.panel, COLORS.border, 18);

  doc.fontSize(9).fillColor(COLORS.muted).text("Operational summary", x + 14, y + 12);
  let rowY = y + 30;
  leftItems.forEach(([label, value]) => {
    doc.fontSize(8).fillColor(COLORS.muted).text(label, x + 14, rowY, { width: 90 });
    doc.fontSize(9).fillColor(COLORS.ink).text(clipStr(value, 50), x + 104, rowY, { width: cardWidth - 118 });
    rowY += 15;
  });

  doc.fontSize(9).fillColor(COLORS.muted).text("System posture", x + cardWidth + 26, y + 12);
  rowY = y + 30;
  rightItems.forEach(([label, value]) => {
    doc.fontSize(8).fillColor(COLORS.muted).text(label, x + cardWidth + 26, rowY, { width: 90 });
    doc.fontSize(9).fillColor(COLORS.ink).text(clipStr(value, 50), x + cardWidth + 116, rowY, {
      width: cardWidth - 118,
    });
    rowY += 15;
  });

  return y + cardHeight + 18;
}

function drawKpiGrid(doc, snapshot, x, y, width) {
  const cols = 2;
  const gap = 12;
  const cardWidth = (width - gap) / cols;
  const cardHeight = 82;
  const palette = [
    { bg: COLORS.mint, ink: COLORS.mintInk },
    { bg: COLORS.blue, ink: COLORS.blueInk },
    { bg: COLORS.rose, ink: COLORS.roseInk },
    { bg: COLORS.amber, ink: COLORS.amberInk },
  ];

  snapshot.statCards.forEach((card, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const cardX = x + col * (cardWidth + gap);
    const cardY = y + row * (cardHeight + gap);
    drawKpiCard(doc, cardX, cardY, cardWidth, cardHeight, card, palette[index % palette.length]);
  });

  const rows = Math.ceil(snapshot.statCards.length / cols);
  return y + rows * (cardHeight + gap) - gap + 18;
}

function drawStreamCards(doc, snapshot, x, y, width, drawHeader) {
  const streams = snapshot.streams.length
    ? snapshot.streams
    : [
        {
          id: snapshot.stream.id,
          label: snapshot.stream.label,
          process: null,
          composition: null,
        },
      ];

  const gap = 12;
  const cols = 2;
  const cardWidth = (width - gap) / cols;
  const cardHeight = 140;
  
  let cursorY = y;
  streams.forEach((stream, index) => {
    const col = index % cols;
    if (col === 0) {
      cursorY = ensureSpace(doc, cursorY, cardHeight + 16, drawHeader);
    }
    const cardX = x + col * (cardWidth + gap);
    const cardY = cursorY;

    drawRoundRect(doc, cardX, cardY, cardWidth, cardHeight, "#ffffff", COLORS.border, 18);
    drawRoundRect(doc, cardX + 14, cardY + 14, 68, 26, COLORS.slate, null, 13);
    doc.fontSize(8).fillColor(COLORS.ink).text(`STREAM ${stream.id || "--"}`, cardX + 14, cardY + 23, {
      width: 68,
      align: "center",
    });
    doc.fontSize(12).fillColor(COLORS.ink).text(stream.label || "--", cardX + 14, cardY + 46, {
      width: cardWidth - 28,
    });

    const process = stream.process || {};
    const comp = stream.composition || {};
    const items = [
      ["Purity", formatNumber(process.oxygenPurityPercent, 2, "%")],
      ["Flow", formatNumber(process.flowRateM3h, 2, " m3/h")],
      ["Pressure", formatNumber(process.deliveryPressureBar, 2, " bar")],
      ["Temp", formatNumber(process.temperature, 1, " C")],
      ["O2", formatPercentMaybe(comp.o2, 2)],
      ["Molar", formatNumber(process.molarFlow, 2, " kmol/h")],
    ];

    items.forEach(([label, value], itemIndex) => {
      const itemCol = itemIndex % 2;
      const itemRow = Math.floor(itemIndex / 2);
      const itemX = cardX + 14 + itemCol * ((cardWidth - 40) / 2 + 12);
      const itemY = cardY + 68 + itemRow * 16;
      doc.fontSize(7).fillColor(COLORS.muted).text(label.toUpperCase(), itemX, itemY, {
        width: (cardWidth - 40) / 2,
      });
      doc.fontSize(9).fillColor(COLORS.ink).text(value, itemX, itemY + 8, {
        width: (cardWidth - 40) / 2,
      });
    });

    if (col === cols - 1 || index === streams.length - 1) {
      cursorY += cardHeight + gap;
    }
  });

  return cursorY - gap + 18;
}

function drawSupplyDemand(doc, snapshot, x, y, width) {
  if (!snapshot.supplyDemand) {
    return y;
  }
  const cardWidth = (width - 12) / 2;
  const height = 132;
  const sd = snapshot.supplyDemand;

  drawRoundRect(doc, x, y, cardWidth, height, "#ffffff", COLORS.border, 18);
  drawRoundRect(doc, x + cardWidth + 12, y, cardWidth, height, "#ffffff", COLORS.border, 18);

  doc.fontSize(10).fillColor(COLORS.ink).text("Demand outlook", x + 14, y + 14);
  doc.fontSize(8).fillColor(COLORS.subInk).text(sd.status || "--", x + 14, y + 32, { width: cardWidth - 28 });
  const demand = sd.demand || {};
  const demandRows = [
    ["Scenario", demand.scenario || "--"],
    ["General requests", demand.generalRequests ?? "--"],
    ["ICU requests", demand.icuRequests ?? "--"],
    ["Total requests", demand.totalRequests ?? "--"],
  ];
  let rowY = y + 54;
  demandRows.forEach(([label, value]) => {
    doc.fontSize(8).fillColor(COLORS.muted).text(label, x + 14, rowY, { width: 90 });
    doc.fontSize(9).fillColor(COLORS.ink).text(String(value), x + 108, rowY, { width: cardWidth - 122 });
    rowY += 16;
  });

  doc.fontSize(10).fillColor(COLORS.ink).text("Supply resilience", x + cardWidth + 26, y + 14);
  doc.fontSize(8).fillColor(COLORS.subInk).text(sd.forecast || "--", x + cardWidth + 26, y + 32, {
    width: cardWidth - 28,
  });
  const supply = sd.supply || {};
  const supplyRows = [
    ["Scenario", supply.scenario || "--"],
    ["Utilization", Number.isFinite(supply.mainUtilizationPercent) ? `${supply.mainUtilizationPercent}%` : "--"],
    ["Remaining", Number.isFinite(supply.mainRemainingLiters) ? `${supply.mainRemainingLiters} L` : "--"],
    ["Coverage", Number.isFinite(supply.coveragePercent) ? `${supply.coveragePercent}%` : "--"],
  ];
  rowY = y + 54;
  supplyRows.forEach(([label, value]) => {
    doc.fontSize(8).fillColor(COLORS.muted).text(label, x + cardWidth + 26, rowY, { width: 90 });
    doc.fontSize(9).fillColor(COLORS.ink).text(String(value), x + cardWidth + 120, rowY, {
      width: cardWidth - 122,
    });
    rowY += 16;
  });

  return y + height + 18;
}

function drawTrendTable(doc, snapshot, x, y, width, drawHeader) {
  if (!snapshot.trendSample.length) {
    return y;
  }

  const colWidths = [width * 0.28, width * 0.36, width * 0.36];
  const colX = [x, x + colWidths[0], x + colWidths[0] + colWidths[1]];
  const headerHeight = 24;

  y = ensureSpace(doc, y, 110, drawHeader);
  drawRoundRect(doc, x, y, width, headerHeight, COLORS.slate, null, 14);
  ["Feed (kmol/h)", "Product (L/min)", "Purity (%)"].forEach((label, index) => {
    doc.fontSize(8).fillColor(COLORS.ink).text(label, colX[index] + 10, y + 8, {
      width: colWidths[index] - 20,
      align: index === 0 ? "left" : "right",
    });
  });

  let rowY = y + headerHeight;
  snapshot.trendSample.forEach((row, index) => {
    rowY = ensureSpace(doc, rowY, 18, drawHeader);
    if (index % 2 === 0) {
      doc.save();
      doc.rect(x, rowY, width, 18).fill("#fafcfe");
      doc.restore();
    }

    const values = [
      row.feed_flow_kmol_h === null ? "--" : row.feed_flow_kmol_h.toFixed(2),
      row.product_flow_L_min === null ? "--" : row.product_flow_L_min.toFixed(1),
      row.oxygen_purity_percent === null ? "--" : row.oxygen_purity_percent.toFixed(2),
    ];
    values.forEach((value, col) => {
      doc.fontSize(8).fillColor(COLORS.subInk).text(value, colX[col] + 10, rowY + 5, {
        width: colWidths[col] - 20,
        align: col === 0 ? "left" : "right",
      });
    });
    rowY += 18;
  });

  return rowY + 16;
}

function drawAlarms(doc, snapshot, x, y, width, drawHeader) {
  if (!snapshot.alarms.length) {
    drawRoundRect(doc, x, y, width, 42, COLORS.mint, null, 16);
    doc.fontSize(10).fillColor(COLORS.mintInk).text("No active alarms at the time of export.", x + 14, y + 15);
    return y + 58;
  }

  snapshot.alarms.forEach((alarm) => {
    y = ensureSpace(doc, y, 54, drawHeader);
    drawRoundRect(doc, x, y, width, 44, "#ffffff", COLORS.border, 16);
    drawRoundRect(doc, x + 12, y + 12, 70, 18, COLORS.rose, null, 9);
    doc.fontSize(8).fillColor(COLORS.roseInk).text(alarm.severity || "ALARM", x + 12, y + 17, {
      width: 70,
      align: "center",
    });
    doc.fontSize(9).fillColor(COLORS.ink).text(alarm.message || "--", x + 92, y + 10, {
      width: width - 106,
    });
    doc.fontSize(8).fillColor(COLORS.muted).text(alarm.timeLabel || "--", x + 92, y + 26, {
      width: width - 106,
    });
    y += 54;
  });

  return y;
}

function buildDashboardPdfBuffer(snapshot) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 44,
      size: "A4",
      info: {
        Title: snapshot.title,
        Author: "Hospital Oxygen Dashboard",
      },
    });

    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const left = doc.page.margins.left;
    const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const drawHeader = () => drawPageChrome(doc, snapshot);
    drawHeader();

    const ro = snapshot.reportOptions || sanitizeReportOptions();

    let y = doc.page.margins.top;
    y = drawHero(doc, snapshot, left, y, width);
    if (ro.includeOverview) {
      y = drawOverviewGrid(doc, snapshot, left, y, width);
    }

    if (ro.includeKpis && snapshot.statCards.length) {
      y = ensureSpace(doc, y, 200, drawHeader);
      y = sectionTitle(doc, "Key performance indicators", left, y, width, "Core oxygen production metrics in a cleaner summary format.");
      y = drawKpiGrid(doc, snapshot, left, y, width);
    }

    if (ro.includeStreams) {
      y = ensureSpace(doc, y, 180, drawHeader);
      y = sectionTitle(doc, "Stream portfolio", left, y, width, "All available streams are included below, not just the selected one.");
      y = drawStreamCards(doc, snapshot, left, y, width, () => {
        drawHeader();
        const nextY = sectionTitle(doc, "Stream portfolio", left, doc.page.margins.top, width, "Continued multi-stream overview.");
        return nextY;
      });
    }

    if (ro.includeSupplyDemand && snapshot.supplyDemand) {
      y = ensureSpace(doc, y, 170, drawHeader);
      y = sectionTitle(doc, "Demand and backup posture", left, y, width, "Supply readiness and backup coverage at the time of export.");
      y = drawSupplyDemand(doc, snapshot, left, y, width);
    }

    if (ro.includeTrendSample && (snapshot.trendSummary || snapshot.trendSample.length)) {
      y = ensureSpace(doc, y, 180, drawHeader);
      const summaryCaption = snapshot.trendSummary
        ? `${snapshot.trendSummary.timelineRange || ""} | ${snapshot.trendSummary.trendFeedRange || ""}`
        : "Recent sampled trend rows from the dashboard.";
      y = sectionTitle(doc, "Trend sample", left, y, width, summaryCaption);
      if (snapshot.trendSummary) {
        doc.fontSize(9).fillColor(COLORS.subInk).text(
          `Captured chart points: ${snapshot.trendSummary.rowCount}`,
          left,
          y - 2,
          { width },
        );
        y += 10;
      }
      y = drawTrendTable(doc, snapshot, left, y, width, () => {
        drawHeader();
        return sectionTitle(doc, "Trend sample", left, doc.page.margins.top, width, "Continued sampled rows.");
      });
    }

    if (ro.includeAlarms) {
      y = ensureSpace(doc, y, 120, drawHeader);
      y = sectionTitle(doc, "Alarms", left, y, width, "Active alert states and recent timing labels.");
      y = drawAlarms(doc, snapshot, left, y, width, () => {
        drawHeader();
        return sectionTitle(doc, "Alarms", left, doc.page.margins.top, width, "Continued alarm list.");
      });
    }

    doc.end();
  });
}

function pdfFilename(snapshot) {
  const raw = String(snapshot?.generatedAt || new Date().toISOString()).slice(0, 32);
  const base =
    raw
      .replace(/[^\dT:.\-Zz+]/g, "")
      .replace(/[T:]/g, "-")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "export";
  return `oxygen-dashboard-report-${base}.pdf`;
}

module.exports = {
  sanitizeSnapshot,
  buildDashboardPdfBuffer,
  pdfFilename,
};
