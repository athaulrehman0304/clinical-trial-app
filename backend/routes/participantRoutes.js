const express = require("express");
const router = express.Router();
const Participant = require("../models/Participant");
const protect = require("../middleware/authMiddleware");



router.post("/", protect, async (req, res) => {

  try {
    const participant = new Participant(req.body);
    const savedParticipant = await participant.save();
    res.status(201).json(savedParticipant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.get("/", protect, async (req, res) => {

  try {
    const participants = await Participant.find();
    res.json(participants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id);

    if (!participant) {
      return res.status(404).json({ error: "Participant not found" });
    }

    res.json(participant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const updatedParticipant = await Participant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedParticipant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.patch("/:id", protect, async (req, res) => {

  try {
    const updatedParticipant = await Participant.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },   
      { new: true, runValidators: true }
    );

    if (!updatedParticipant) {
      return res.status(404).json({ error: "Participant not found" });
    }

    res.json(updatedParticipant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.delete("/:id", protect, async (req, res) => {

  try {
    await Participant.findByIdAndDelete(req.params.id);
    res.json({ message: "Participant deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
