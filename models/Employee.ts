import mongoose from "mongoose"

const EmployeeSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
    },
    personalInfo: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      mobile: { type: String, required: true, trim: true },
      dateOfBirth: { type: Date, required: true },
      gender: {
        type: String,
        enum: ["male", "female", "other", "prefer-not-to-say"],
        required: true,
      },
      profilePicture: { type: String, default: "" },
    },
    workInfo: {
      department: { type: String, required: true, trim: true },
      position: { type: String, required: true, trim: true },
      employeeType: {
        type: String,
        enum: ["full-time", "part-time", "contractor", "intern"],
        required: true,
      },
      startDate: { type: Date, required: true },
      endDate: { type: Date },
      manager: { type: String, trim: true },
      salary: { type: Number },
    },
    qrCode: {
      type: String,
      required: true,
    },
    linkedEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    qrCodeStats: {
      totalScans: { type: Number, default: 0 },
      uniqueScans: { type: Number, default: 0 },
      lastScanned: { type: Date },
      scanHistory: [
        {
          scannedAt: { type: Date, default: Date.now },
          scannedBy: { type: String },
          location: { type: String },
          device: { type: String },
        },
      ],
    },
    socialLinks: {
      linkedin: { type: String, default: "" },
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
    },
    customLinks: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    permissions: {
      canEditProfile: { type: Boolean, default: true },
      canViewAnalytics: { type: Boolean, default: false },
      canDownloadQR: { type: Boolean, default: true },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "terminated"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
)

// Compound index to ensure unique employee ID per company
EmployeeSchema.index({ companyId: 1, employeeId: 1 }, { unique: true })
// Index for email linking
EmployeeSchema.index({ companyId: 1, linkedEmail: 1 }, { unique: true })
// Index for searching
EmployeeSchema.index({ "personalInfo.firstName": 1, "personalInfo.lastName": 1 })
EmployeeSchema.index({ "workInfo.department": 1 })
EmployeeSchema.index({ "workInfo.position": 1 })

export default mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema)
