// app/api/access-request/respond/route.ts
import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import AccessRequest from "@/models/AccessRequest"
import User from "@/models/User"
import { sendApprovalNotification } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { token, approve } = body

    if (!token || typeof approve !== "boolean") {
      return NextResponse.json({ error: "Token and approval status are required" }, { status: 400 })
    }

    // Get access request with profile owner details
    const accessRequest = await AccessRequest.findOne({
      accessToken: token,
      status: "pending",
    }).populate('profileId', 'name email typeOfWork')

    if (!accessRequest) {
      return NextResponse.json({ error: "Invalid or expired access request" }, { status: 404 })
    }

    // Check if request is expired
    const now = new Date()
    if (now > accessRequest.expiresAt) {
      await AccessRequest.findByIdAndUpdate(accessRequest._id, { status: "expired" })
      return NextResponse.json({ error: "Access request has expired" }, { status: 400 })
    }

    // Update request status
    const newStatus = approve ? "approved" : "denied"
    await AccessRequest.findByIdAndUpdate(accessRequest._id, {
      status: newStatus,
      respondedAt: new Date(),
    })

    // If approved, send notification to requester
    if (approve && accessRequest.requesterEmail) {
      try {
        const accessUrl = `${process.env.NEXT_PUBLIC_APP_URL}/profile/${accessRequest.profileId._id}?token=${accessRequest.accessToken}`
        
        await sendApprovalNotification({
          requesterEmail: accessRequest.requesterEmail,
          requesterName: accessRequest.requesterName,
          accessUrl,
          profileOwnerName: (accessRequest.profileId as any).name,
          expiresAt: accessRequest.expiresAt,
        })
      } catch (emailError) {
        console.error("Failed to send approval notification:", emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      message: approve ? "Access approved successfully" : "Access denied",
      status: newStatus,
    })
  } catch (error) {
    console.error("Access request response error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
// import { type NextRequest, NextResponse } from "next/server"
// import connectDB from "@/lib/mongodb"
// import AccessRequest from "@/models/AccessRequest"

// export async function POST(request: NextRequest) {
//   try {
//     await connectDB()

//     const body = await request.json()
//     const { token, approve } = body

//     if (!token || typeof approve !== "boolean") {
//       return NextResponse.json({ error: "Token and approval status are required" }, { status: 400 })
//     }

//     // Get access request
//     const accessRequest = await AccessRequest.findOne({
//       accessToken: token,
//       status: "pending",
//     })

//     if (!accessRequest) {
//       return NextResponse.json({ error: "Invalid or expired access request" }, { status: 404 })
//     }

//     // Check if request is expired
//     const now = new Date()
//     if (now > accessRequest.expiresAt) {
//       await AccessRequest.findByIdAndUpdate(accessRequest._id, { status: "expired" })
//       return NextResponse.json({ error: "Access request has expired" }, { status: 400 })
//     }

//     // Update request status
//     const newStatus = approve ? "approved" : "denied"
//     await AccessRequest.findByIdAndUpdate(accessRequest._id, {
//       status: newStatus,
//       respondedAt: new Date(),
//     })

//     if (approve) {
//       // Send approval notification (mock implementation)
//       await sendApprovalNotification(accessRequest)
//     }

//     return NextResponse.json({
//       message: approve ? "Access approved successfully" : "Access denied",
//       status: newStatus,
//     })
//   } catch (error) {
//     console.error("Access request response error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// async function sendApprovalNotification(accessRequest: any) {
//   // Mock notification sending
//   // In production, send email/SMS to the requester with the access link

//   const accessUrl = `${process.env.NEXT_PUBLIC_APP_URL}/profile/${accessRequest.profileId}?token=${accessRequest.accessToken}`

//   console.log(`
//     Sending approval notification:
    
//     Subject: Your profile access request has been approved
    
//     Great news! Your request to view a professional profile has been approved.
    
//     You can now access the profile using the link below:
//     ${accessUrl}
    
//     This access will expire in 24 hours.
    
//     Thank you for using Pring!
//   `)

//   // TODO: Implement actual email/SMS sending
// }
