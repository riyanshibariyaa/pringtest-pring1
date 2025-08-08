import mongoose from "mongoose"

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      validate: {
        validator: function (this: any, value: string) {
          // If userType is not 'employee', password is required
          if (this.userType !== "employee" && !value) {
            return false;
          }
          return true;
        },
        message: "Password is required unless userType is 'employee'.",
      },
    },
    mobile: {
      type: String,
      required: true, // Make it required to avoid null values
      unique: true,   // Add unique constraint
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other", "prefer-not-to-say"],
    },
    userType: {
      type: String,
      enum: ["individual", "employee"],
      default: "individual",
    },
    typeOfWork: {
      type: String,
      default: "",
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    profilePicture: {
      type: String,
      default: "",
    },

    // Company-related fields for employees
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      validate: {
        validator: function (this: any, value: any) {
          // If userType is 'employee', companyId is required
          if (this.userType === "employee" && !value) {
            return false;
          }
          return true;
        },
        message: "Company ID is required for employees.",
      },
    },
    department: {
      type: String,
      default: "",
      trim: true,
    },
    position: {
      type: String,
      default: "",
      trim: true,
    },

    // Social media links
    socialLinks: {
      linkedin: { type: String, default: "" },
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      website: { type: String, default: "" },
    },

    // Custom links for "Other Useful Links"
    customLinks: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],

    // QR Code
    qrCode: {
      type: String,
      default: "",
    },
    linkedEmail: {
      type: String,
      default: "",
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

    // Employee permissions (for corporate employees)
    permissions: {
      canEditProfile: { type: Boolean, default: true },
      canViewAnalytics: { type: Boolean, default: false },
      canDownloadQR: { type: Boolean, default: true },
    },

    privacy: {
      showEmail: { type: Boolean, default: true },
      showMobile: { type: Boolean, default: true },
      showDateOfBirth: { type: Boolean, default: false },
      allowProfileViews: { type: Boolean, default: true },
      allowConnectionRequests: { type: Boolean, default: true },
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Privacy settings
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes - Remove duplicate email index since it's already unique: true
UserSchema.index({ companyId: 1, userType: 1 })
UserSchema.index({ name: 1 })
UserSchema.index({ department: 1 })
UserSchema.index({ position: 1 })

export default mongoose.models.User || mongoose.model("User", UserSchema)

// import mongoose from "mongoose"

// const UserSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },
//     password: {
//       type: String,
//       required: function () {
//         return this.userType !== "employee"
//       },
//     },
//     mobile: {
//       type: String,
//       required: true, // Make it required to avoid null values
//       unique: true,   // Add unique constraint
//       trim: true,
//     },
//     userType: {
//       type: String,
//       enum: ["individual", "employee"],
//       default: "individual",
//     },
//     typeOfWork: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//     bio: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//     profilePicture: {
//       type: String,
//       default: "",
//     },

//     // Company-related fields for employees
//     companyId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Company",
//       required: function () {
//         return this.userType === "employee"
//       },
//     },
//     department: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//     position: {
//       type: String,
//       default: "",
//       trim: true,
//     },

//     // Social media links
//     socialLinks: {
//       linkedin: { type: String, default: "" },
//       instagram: { type: String, default: "" },
//       facebook: { type: String, default: "" },
//       twitter: { type: String, default: "" },
//       website: { type: String, default: "" },
//     },

//     // Custom links for "Other Useful Links"
//     customLinks: [
//       {
//         name: { type: String, required: true },
//         url: { type: String, required: true },
//       },
//     ],

//     // QR Code
//     qrCode: {
//       type: String,
//       default: "",
//     },
//     linkedEmail: {
//       type: String,
//       default: "",
//       lowercase: true,
//       trim: true,
//     },
//     qrCodeStats: {
//       totalScans: { type: Number, default: 0 },
//       uniqueScans: { type: Number, default: 0 },
//       lastScanned: { type: Date },
//       scanHistory: [
//         {
//           scannedAt: { type: Date, default: Date.now },
//           scannedBy: { type: String },
//           location: { type: String },
//           device: { type: String },
//         },
//       ],
//     },

//     // Employee permissions (for corporate employees)
//     permissions: {
//       canEditProfile: { type: Boolean, default: true },
//       canViewAnalytics: { type: Boolean, default: false },
//       canDownloadQR: { type: Boolean, default: true },
//     },

//     // Status
//     isActive: {
//       type: Boolean,
//       default: true,
//     },

//     // Privacy settings
//     isPublic: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   {
//     timestamps: true,
//   },
// )

// // Indexes - Remove duplicate email index since it's already unique: true
// UserSchema.index({ companyId: 1, userType: 1 })
// UserSchema.index({ name: 1 })
// UserSchema.index({ department: 1 })
// UserSchema.index({ position: 1 })

// export default mongoose.models.User || mongoose.model("User", UserSchema)