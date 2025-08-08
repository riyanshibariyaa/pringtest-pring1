import mongoose, { type Document, Schema } from "mongoose"

export interface ICompany extends Document {
  _id: string
  companyName: string
  companyEmail: string
  companyPhone: string
  industry: string
  companySize: string
  website?: string // Added this field
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  branding: {
    logo?: string
    primaryColor: string
    secondaryColor: string
    companyDescription?: string // Added this field
  }
  subscription: {
    plan: "free" | "basic" | "premium" | "enterprise"
    status: "active" | "pending" | "cancelled" | "expired" // Added this field
    employeeLimit: number
    qrCodesGenerated: number
    employeesAdded: number // Added this field
    qrCodeLimit: number
    price: number // Added this field
    startDate: Date // Added this field
    endDate?: Date // Added this field
  }
  adminUser: {
    name: string
    email: string
    password: string
    role: "super_admin" | "admin"
  }
  paymentInfo?: {
    provider: "razorpay" | "stripe" | "payu"
    paymentId: string
    orderId: string
    amount: number
    currency: string
    status: "pending" | "completed" | "failed" | "refunded"
    paidAt?: Date
  }
  settings: {
    requireApproval: boolean
    emailNotifications: boolean
    smsNotifications: boolean
    analyticsEnabled: boolean
  }
  isActive: boolean // Added this field
  createdAt: Date
  updatedAt: Date
}

const CompanySchema = new Schema<ICompany>(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    companyPhone: {
      type: String,
      required: true,
      trim: true,
    },
    industry: {
      type: String,
      required: true,
      enum: [
        "technology",
        "healthcare",
        "finance",
        "education",
        "retail",
        "manufacturing",
        "construction",
        "hospitality",
        "other",
      ],
    },
    companySize: {
      type: String,
      required: true,
      enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
    },
    website: {
      type: String,
      trim: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    branding: {
      logo: String,
      primaryColor: { type: String, default: "#0077C0" },
      secondaryColor: { type: String, default: "#FFFFFF" },
      companyDescription: String,
    },
    subscription: {
      plan: {
        type: String,
        enum: ["free", "basic", "premium", "enterprise"],
        default: "free",
      },
      status: {
        type: String,
        enum: ["active", "pending", "cancelled", "expired"],
        default: "active",
      },
      employeeLimit: { type: Number, default: 5 },
      qrCodesGenerated: { type: Number, default: 0 },
      employeesAdded: { type: Number, default: 0 },
      qrCodeLimit: { type: Number, default: 5 },
      price: { type: Number, default: 0 },
      startDate: { type: Date, default: Date.now },
      endDate: Date,
    },
    adminUser: {
      name: { type: String, required: true },
      email: { type: String, required: true, lowercase: true },
      password: { type: String, required: true },
      role: {
        type: String,
        enum: ["super_admin", "admin"],
        default: "admin",
      },
    },
    paymentInfo: {
      provider: {
        type: String,
        enum: ["razorpay", "stripe", "payu"],
      },
      paymentId: String,
      orderId: String,
      amount: Number,
      currency: String,
      status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending",
      },
      paidAt: Date,
    },
    settings: {
      requireApproval: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      analyticsEnabled: { type: Boolean, default: true },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Company || mongoose.model<ICompany>("Company", CompanySchema)