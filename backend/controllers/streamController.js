const Stream = require("../models/stream");

// Get all streams
exports.getAllStreams = async (req, res) => {
  try {
    const streams = await Stream.find();
    res.json(streams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single stream
exports.getStreamById = async (req, res) => {
  try {
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
