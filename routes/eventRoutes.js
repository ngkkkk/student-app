const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const filePath = path.join(__dirname, "../data/events.json");

// Helper: safely read events.json
const readEvents = () => {
  try {
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, "utf8");
    return raw.trim() ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Error reading events.json:", err);
    return [];
  }
};

// Helper: write events.json
const writeEvents = (events) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(events, null, 2));
  } catch (err) {
    console.error("Error writing events.json:", err);
  }
};

// POST /api/events
router.post("/", (req, res) => {
  let { title, description, date, location, maxAttendees } = req.body;

  // Validation
  if (!title || !date || !location || maxAttendees === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  maxAttendees = Number(maxAttendees);
  if (!Number.isInteger(maxAttendees) || maxAttendees <= 0) {
    return res.status(400).json({ error: "maxAttendees must be a positive integer" });
  }

  const newEvent = {
    eventId: "EVT-" + Date.now(),
    title,
    description: description || "",
    date,
    location,
    maxAttendees,
    currentAttendees: 0,
    status: "upcoming"
  };

  const events = readEvents();
  events.push(newEvent);
  writeEvents(events);

  res.status(201).json(newEvent);
});

// GET /api/events
router.get("/", (req, res) => {
  try {
    const events = readEvents();
    res.json(events);
  } catch (err) {
    console.error("Error reading events:", err);
    res.status(500).json({ error: "Error reading events file" });
  }
});

module.exports = router;
