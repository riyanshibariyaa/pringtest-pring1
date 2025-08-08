import mongoose from "mongoose"

const connectionSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "blocked"],
      default: "pending",
    },
    message: {
      type: String,
      maxlength: 500,
    },
    connectedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Ensure unique connection between two users
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true })

const Connection = mongoose.models.Connection || mongoose.model("Connection", connectionSchema)

export default Connection
