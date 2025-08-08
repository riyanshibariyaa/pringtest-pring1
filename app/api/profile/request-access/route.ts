import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import AccessRequest from "@/models/AccessRequest"
import mongoose from "mongoose"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { profileId } = body

    if (!profileId) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      return NextResponse.json({ error: "Invalid profile ID" }, { status: 400 })
    }

    // Get profile owner details
    const profileOwner = await User.findById(profileId).select("email mobile typeOfWork")

    if (!profileOwner) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Generate access token
    const accessToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create access request record
    const accessRequest = new AccessRequest({
      profileId: new mongoose.Types.ObjectId(profileId),
      accessToken,
      expiresAt,
      status: "pending",
    })

    await accessRequest.save()

    // Send notification email/SMS (mock implementation)
    await sendAccessRequestNotification(profileOwner, accessToken)

    return NextResponse.json({
      message: "Access request sent successfully",
      requestId: accessRequest._id,
    })
  } catch (error) {
    console.error("Access request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function sendAccessRequestNotification(profileOwner: any, accessToken: string) {
  // Mock email/SMS sending
  // In production, integrate with email service (SendGrid, AWS SES) and SMS service (Twilio)

  const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/approve-access?token=${accessToken}`

  console.log(`
    Sending notification to ${profileOwner.email || profileOwner.mobile}:
    
    Subject: Someone wants to view your QRProfile
    
    Someone has requested access to view your professional profile.
    
    Profile: ${profileOwner.typeOfWork}
    
    To approve this request, click the link below:
    ${approvalUrl}
    
    This request will expire in 24 hours.
    
    If you don't recognize this request, you can safely ignore this message.
  `)

  // TODO: Implement actual email/SMS sending
  // Example with SendGrid:
  // await sendEmail({
  //   to: profileOwner.email,
  //   subject: "Someone wants to view your QRProfile",
  //   html: emailTemplate
  // })
}
