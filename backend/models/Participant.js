const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
  participantId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true,
    min: 1,
    max: 120
  },
  gender: {
    type: String,
    required: true
  },
  trialId: {
    type: String,
    required: true
  },
  visitDate: {
    type: Date,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Participant", participantSchema);
