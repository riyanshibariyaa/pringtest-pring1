// app/api/access-request/details/route.ts
import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import AccessRequest from "@/models/AccessRequest"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Get access request with profile owner details
    const accessRequest = await AccessRequest.findOne({ accessToken: token }).populate(
      "profileId",
      "name email mobile typeOfWork",
    )

    if (!accessRequest) {
      return NextResponse.json({ error: "Invalid access request token" }, { status: 404 })
    }

    // Check if request is expired
    const now = new Date()
    if (now > accessRequest.expiresAt && accessRequest.status === "pending") {
      // Update status to expired
      await AccessRequest.findByIdAndUpdate(accessRequest._id, { status: "expired" })
      accessRequest.status = "expired"
    }

    return NextResponse.json({
      request: {
        _id: accessRequest._id,
        profileOwner: {
          name: (accessRequest.profileId as any).name,
          email: (accessRequest.profileId as any).email,
          mobile: (accessRequest.profileId as any).mobile,
          typeOfWork: (accessRequest.profileId as any).typeOfWork,
        },
        requesterName: accessRequest.requesterName,
        requesterEmail: accessRequest.requesterEmail,
        requesterMobile: accessRequest.requesterMobile,
        status: accessRequest.status,
        expiresAt: accessRequest.expiresAt,
        createdAt: accessRequest.createdAt,
        respondedAt: accessRequest.respondedAt,
      },
    })
  } catch (error) {
    console.error("Access request details error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
// import { type NextRequest, NextResponse } from "next/server"
// import connectDB from "@/lib/mongodb"
// import AccessRequest from "@/models/AccessRequest"

// export async function GET(request: NextRequest) {
//   try {
//     await connectDB()

//     const { searchParams } = new URL(request.url)
//     const token = searchParams.get("token")

//     if (!token) {
//       return NextResponse.json({ error: "Token is required" }, { status: 400 })
//     }

//     // Get access request with profile owner details
//     const accessRequest = await AccessRequest.findOne({ accessToken: token }).populate(
//       "profileId",
//       "typeOfWork email mobile",
//     )

//     if (!accessRequest) {
//       return NextResponse.json({ error: "Invalid access request token" }, { status: 404 })
//     }

//     // Check if request is expired
//     const now = new Date()
//     if (now > accessRequest.expiresAt) {
//       // Update status to expired
//       await AccessRequest.findByIdAndUpdate(accessRequest._id, { status: "expired" })

//       return NextResponse.json({
//         request: { ...accessRequest.toObject(), status: "expired" },
//       })
//     }

//     return NextResponse.json({
//       request: {
//         ...accessRequest.toObject(),
//         profileOwner: accessRequest.profileId,
//       },
//     })
//   } catch (error) {
//     console.error("Access request details error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }
