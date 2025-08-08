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
      "typeOfWork email mobile",
    )

    if (!accessRequest) {
      return NextResponse.json({ error: "Invalid access request token" }, { status: 404 })
    }

    // Check if request is expired
    const now = new Date()
    if (now > accessRequest.expiresAt) {
      // Update status to expired
      await AccessRequest.findByIdAndUpdate(accessRequest._id, { status: "expired" })

      return NextResponse.json({
        request: { ...accessRequest.toObject(), status: "expired" },
      })
    }

    return NextResponse.json({
      request: {
        ...accessRequest.toObject(),
        profileOwner: accessRequest.profileId,
      },
    })
  } catch (error) {
    console.error("Access request details error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
