import mongoose, { type Document, Schema } from "mongoose"

export interface INotification extends Document {
  _id: string
  companyId: mongoose.Types.ObjectId
  type: "qr_scan" | "employee_added" | "profile_updated" | "access_request" | "system"
  title: string
  message: string
  data?: any
  read: boolean
  priority: "low" | "medium" | "high" | "urgent"
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    type: {
      type: String,
      enum: ["qr_scan", "employee_added", "profile_updated", "access_request", "system"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      type: Schema.Types.Mixed,
    },
    read: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for performance
NotificationSchema.index({ companyId: 1, createdAt: -1 })
NotificationSchema.index({ companyId: 1, read: 1 })
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema)
