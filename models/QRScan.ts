import mongoose, { type Document, Schema } from "mongoose"

export interface IQRScan extends Document {
  _id: string
  employeeId: mongoose.Types.ObjectId
  companyId: mongoose.Types.ObjectId
  scannerInfo: {
    ipAddress: string
    userAgent: string
    location?: {
      country?: string
      city?: string
      latitude?: number
      longitude?: number
    }
  }
  scanType: "individual" | "corporate"
  accessGranted: boolean
  scannedAt: Date
}

const QRScanSchema = new Schema<IQRScan>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    scannerInfo: {
      ipAddress: { type: String, required: true },
      userAgent: { type: String, required: true },
      location: {
        country: String,
        city: String,
        latitude: Number,
        longitude: Number,
      },
    },
    scanType: {
      type: String,
      enum: ["individual", "corporate"],
      default: "corporate",
    },
    accessGranted: {
      type: Boolean,
      default: false,
    },
    scannedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for analytics
QRScanSchema.index({ companyId: 1, scannedAt: -1 })
QRScanSchema.index({ employeeId: 1, scannedAt: -1 })

export default mongoose.models.QRScan || mongoose.model<IQRScan>("QRScan", QRScanSchema)
