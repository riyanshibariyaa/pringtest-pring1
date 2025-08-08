// app/api/profile/request-access/route.ts
import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import AccessRequest from "@/models/AccessRequest"
import mongoose from "mongoose"
import crypto from "crypto"
import { sendAccessRequestNotification } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { profileId, requesterName, requesterEmail, requesterMobile } = body

    // Validation
    if (!profileId) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 })
    }

    if (!requesterEmail && !requesterMobile) {
      return NextResponse.json({ error: "Either email or mobile number is required" }, { status: 400 })
    }

    if (requesterEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(requesterEmail)) {
        return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
      }
    }

    if (requesterMobile) {
      const mobileRegex = /^[+]?[\d\s\-\(\)]{10,15}$/
      if (!mobileRegex.test(requesterMobile.replace(/\s/g, ''))) {
        return NextResponse.json({ error: "Please enter a valid mobile number" }, { status: 400 })
      }
    }

    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      return NextResponse.json({ error: "Invalid profile ID" }, { status: 400 })
    }

    // Get profile owner details
    const profileOwner = await User.findById(profileId).select("name email mobile typeOfWork")

    if (!profileOwner) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Check if there's already a pending request from this requester for this profile
    const existingRequest = await AccessRequest.findOne({
      profileId: new mongoose.Types.ObjectId(profileId),
      $or: [
        ...(requesterEmail ? [{ requesterEmail }] : []),
        ...(requesterMobile ? [{ requesterMobile }] : []),
      ],
      status: "pending",
      expiresAt: { $gt: new Date() }
    })

    if (existingRequest) {
      return NextResponse.json({ 
        error: "You already have a pending request for this profile. Please wait for the owner's response." 
      }, { status: 409 })
    }

    // Generate access token
    const accessToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create access request record
    const accessRequest = new AccessRequest({
      profileId: new mongoose.Types.ObjectId(profileId),
      requesterName: requesterName?.trim(),
      requesterEmail: requesterEmail?.toLowerCase().trim(),
      requesterMobile: requesterMobile?.trim(),
      accessToken,
      expiresAt,
      status: "pending",
    })

    await accessRequest.save()

    // Send notification email to profile owner
    if (profileOwner.email) {
      try {
        await sendAccessRequestNotification({
          profileOwnerEmail: profileOwner.email,
          profileOwnerName: profileOwner.name,
          profileType: profileOwner.typeOfWork || "Professional Profile",
          requesterName: requesterName,
          requesterContact: requesterEmail || requesterMobile,
          approvalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/approve-access?token=${accessToken}`,
          expiresAt,
        })
      } catch (emailError) {
        console.error("Failed to send notification email:", emailError)
        // Don't fail the request if email fails, but log it
        // In production, you might want to queue this for retry
      }
    }

    return NextResponse.json({
      message: "Access request sent successfully. The profile owner will be notified.",
      requestId: accessRequest._id,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error("Access request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
// import { type NextRequest, NextResponse } from "next/server"
// import connectDB from "@/lib/mongodb"
// import User from "@/models/User"
// import AccessRequest from "@/models/AccessRequest"
// import mongoose from "mongoose"
// import crypto from "crypto"

// export async function POST(request: NextRequest) {
//   try {
//     await connectDB()

//     const body = await request.json()
//     const { profileId } = body

//     if (!profileId) {
//       return NextResponse.json({ error: "Profile ID is required" }, { status: 400 })
//     }

//     if (!mongoose.Types.ObjectId.isValid(profileId)) {
//       return NextResponse.json({ error: "Invalid profile ID" }, { status: 400 })
//     }

//     // Get profile owner details
//     const profileOwner = await User.findById(profileId).select("email mobile typeOfWork")

//     if (!profileOwner) {
//       return NextResponse.json({ error: "Profile not found" }, { status: 404 })
//     }

//     // Generate access token
//     const accessToken = crypto.randomBytes(32).toString("hex")
//     const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

//     // Create access request record
//     const accessRequest = new AccessRequest({
//       profileId: new mongoose.Types.ObjectId(profileId),
//       accessToken,
//       expiresAt,
//       status: "pending",
//     })

//     await accessRequest.save()

//     // Send notification email/SMS (mock implementation)
//     await sendAccessRequestNotification(profileOwner, accessToken)

//     return NextResponse.json({
//       message: "Access request sent successfully",
//       requestId: accessRequest._id,
//     })
//   } catch (error) {
//     console.error("Access request error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// async function sendAccessRequestNotification(profileOwner: any, accessToken: string) {
//   // Mock email/SMS sending
//   // In production, integrate with email service (SendGrid, AWS SES) and SMS service (Twilio)

//   const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/approve-access?token=${accessToken}`

//   console.log(`
//     Sending notification to ${profileOwner.email || profileOwner.mobile}:
    
//     Subject: Someone wants to view your QRProfile
    
//     Someone has requested access to view your professional profile.
    
//     Profile: ${profileOwner.typeOfWork}
    
//     To approve this request, click the link below:
//     ${approvalUrl}
    
//     This request will expire in 24 hours.
    
//     If you don't recognize this request, you can safely ignore this message.
//   `)

//   // TODO: Implement actual email/SMS sending
//   // Example with SendGrid:
//   // await sendEmail({
//   //   to: profileOwner.email,
//   //   subject: "Someone wants to view your QRProfile",
//   //   html: emailTemplate
//   // })
// }
