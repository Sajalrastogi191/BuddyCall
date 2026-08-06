const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },           // user-chosen unique ID
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true },
    friends: [{ type: String }],                                  // array of user `id` strings
    pendingReceived: [{ type: String }],                          // incoming requests
    pendingSent: [{ type: String }],                              // outgoing requests
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
