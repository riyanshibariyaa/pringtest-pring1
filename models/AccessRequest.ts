import mongoose, { type Document, Schema } from "mongoose"

export interface IAccessRequest extends Document {
  _id: string
  profileId: mongoose.Types.ObjectId
  requesterName?: string
  requesterEmail?: string
  requesterMobile?: string
  accessToken: string
  status: "pending" | "approved" | "denied" | "expired"
  expiresAt: Date
  respondedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const AccessRequestSchema = new Schema<IAccessRequest>(
  {
    profileId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requesterName: {
      type: String,
      trim: true,
    },
    requesterEmail: {
      type: String,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(this: IAccessRequest) {
          // Either email or mobile must be provided
          return !!(this.requesterEmail || this.requesterMobile);
        },
        message: "Either email or mobile number is required"
      }
    },
    requesterMobile: {
      type: String,
      trim: true,
      validate: {
        validator: function(this: IAccessRequest) {
          // Either email or mobile must be provided
          return !!(this.requesterEmail || this.requesterMobile);
        },
        message: "Either email or mobile number is required"
      }
    },
    accessToken: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "denied", "expired"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Create indexes
AccessRequestSchema.index({ accessToken: 1 })
AccessRequestSchema.index({ profileId: 1 })
AccessRequestSchema.index({ status: 1 })
AccessRequestSchema.index({ expiresAt: 1 })
AccessRequestSchema.index({ requesterEmail: 1 })
AccessRequestSchema.index({ requesterMobile: 1 })

export default mongoose.models.AccessRequest || mongoose.model<IAccessRequest>("AccessRequest", AccessRequestSchema)
// import mongoose, { type Document, Schema } from "mongoose"

// export interface IAccessRequest extends Document {
//   _id: string
//   profileId: mongoose.Types.ObjectId
//   accessToken: string
//   status: "pending" | "approved" | "denied" | "expired"
//   expiresAt: Date
//   respondedAt?: Date
//   createdAt: Date
//   updatedAt: Date
// }

// const AccessRequestSchema = new Schema<IAccessRequest>(
//   {
//     profileId: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     accessToken: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     status: {
//       type: String,
//       enum: ["pending", "approved", "denied", "expired"],
//       default: "pending",
//     },
//     expiresAt: {
//       type: Date,
//       required: true,
//     },
//     respondedAt: {
//       type: Date,
//     },
//   },
//   {
//     timestamps: true,
//   },
// )

// // Create indexes
// AccessRequestSchema.index({ accessToken: 1 })
// AccessRequestSchema.index({ profileId: 1 })
// AccessRequestSchema.index({ status: 1 })
// AccessRequestSchema.index({ expiresAt: 1 })

// export default mongoose.models.AccessRequest || mongoose.model<IAccessRequest>("AccessRequest", AccessRequestSchema)
