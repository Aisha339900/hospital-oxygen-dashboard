const Stream = require("../models/stream");
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
    composition: {
      O2: toNumberOrNull(stream?.oxygen_purity_percent),
      N2: "-",
      Ar: "-",
    },
  };
};

const loadLatestAspenStreams = async () => {
  const doc = await getAspenCollection().findOne(
    { "streams.0": { $exists: true } },
    { sort: { timestamp: -1, createdAt: -1, _id: -1 } },
  );
  const rows = Array.isArray(doc?.streams) ? doc.streams : [];
  return rows
    .map(mapAspenStream)
    .sort((a, b) => Number(a.stream_id) - Number(b.stream_id));
};

// Get all streams
exports.getAllStreams = async (req, res) => {
  try {
    const aspenStreams = await loadLatestAspenStreams();
    if (aspenStreams.length > 0) {
      return res.json(aspenStreams);
    }

    const streams = await Stream.find();
    return res.json(streams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single stream
exports.getStreamById = async (req, res) => {
  try {
    const streamId = String(req.params.id);
    const aspenStreams = await loadLatestAspenStreams();
    if (aspenStreams.length > 0) {
      const aspenStream = aspenStreams.find((s) => s.stream_id === streamId);
      if (!aspenStream) {
        return res.status(404).json({ message: "Stream not found" });
      }
      return res.json(aspenStream);
    }

    const stream = await Stream.findById(req.params.id);
    if (!stream) return res.status(404).json({ message: "Stream not found" });
    res.json(stream);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create stream
exports.createStream = async (req, res) => {
  const stream = new Stream(req.body);
  try {
    const newStream = await stream.save();
    res.status(201).json(newStream);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update stream
exports.updateStream = async (req, res) => {
  try {
    const stream = await Stream.findById(req.params.id);
    if (!stream) return res.status(404).json({ message: "Stream not found" });

    Object.assign(stream, req.body);
    stream.updatedAt = Date.now();
    const updated = await stream.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
