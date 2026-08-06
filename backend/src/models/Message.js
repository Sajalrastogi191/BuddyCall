const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },       // user id
    to:   { type: String, required: true },       // user id
    text: { type: String, required: true },
    timestamp: { type: Number, default: () => Date.now() },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
