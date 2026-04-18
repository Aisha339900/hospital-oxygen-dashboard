const mongoose = require("mongoose");

const ASPEN_DB_NAME = "oxygen_dashboard";
const ASPEN_COLLECTION = "aspen_all_streams";

const STREAM_LABELS = {
  "1": "FEED",
  "2": "OUT COMP 1",
  "3": "Membrane Feed",
  "4": "Membrane Permeate",
  "5": "Membrane Retentate",
  "6": "PSA Product",
  "7": "PSA Off-Gas",
  "8": "OUT COMP 2",
  "9": "OUT Cooler 2",
};

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const getAspenCollection = () =>
  mongoose.connection.useDb(ASPEN_DB_NAME).collection(ASPEN_COLLECTION);

const mapAspenStream = (stream) => {
  const streamId = String(stream?.stream_id ?? "");
  return {
    id: streamId,
    stream_id: streamId,
    stream_name: stream?.stream_name ?? streamId,
    label: STREAM_LABELS[streamId] || `Stream ${streamId}`,
    oxygen_purity_percent: toNumberOrNull(stream?.oxygen_purity_percent),
    flow_rate_m3h: toNumberOrNull(stream?.flow_rate_m3h),
    delivery_pressure_bar: toNumberOrNull(stream?.delivery_pressure_bar),
    temperature_out: toNumberOrNull(stream?.temperature_out),
    molar_flow: toNumberOrNull(stream?.molar_flow),
    mass_flow: toNumberOrNull(stream?.mass_flow),
  };
};

async function loadLatestAspenStreams() {
  const doc = await getAspenCollection().findOne(
    { "streams.0": { $exists: true } },
    { sort: { timestamp: -1, createdAt: -1, _id: -1 } },
  );
  const rows = Array.isArray(doc?.streams) ? doc.streams : [];
  return rows
    .map(mapAspenStream)
    .sort((a, b) => Number(a.stream_id) - Number(b.stream_id));
}

/**
 * @param {string|number} streamId
 */
async function findAspenStreamById(streamId) {
  if (streamId === undefined || streamId === null || streamId === "") {
    return null;
  }
  const id = String(streamId);
  const streams = await loadLatestAspenStreams();
  return streams.find((s) => String(s.stream_id) === id) || null;
}

module.exports = {
  loadLatestAspenStreams,
  findAspenStreamById,
  mapAspenStream,
};