import mongoose from "mongoose";

const Schema = mongoose.Schema;

const pingResultSchema = new Schema(
  {
    ipAddress: {
      type: String,
      required: true,
    },
    pingOutput: {
      type: String,
      required: true,
    },
    success: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

const Ping = mongoose.model("PingResult", pingResultSchema);
module.exports = Ping;
