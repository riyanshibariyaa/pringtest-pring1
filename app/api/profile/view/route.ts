import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import AccessRequest from "@/models/AccessRequest"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get("id")
    const token = searchParams.get("token")

    if (!profileId || !token) {
      return NextResponse.json({ error: "Profile ID and token are required" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      return NextResponse.json({ error: "Invalid profile ID" }, { status: 400 })
    }

    // Verify access token
    const accessRequest = await AccessRequest.findOne({
      profileId: new mongoose.Types.ObjectId(profileId),
      accessToken: token,
      status: "approved",
    })

    if (!accessRequest) {
      return NextResponse.json({ error: "Invalid or expired access token" }, { status: 403 })
    }

    // Check if token is expired
    const now = new Date()
    if (now > accessRequest.expiresAt) {
      // Update status to expired
      await AccessRequest.findByIdAndUpdate(accessRequest._id, { status: "expired" })
      return NextResponse.json({ error: "Access token has expired" }, { status: 403 })
    }

    // Get profile data
    const profile = await User.findById(profileId).select("email mobile typeOfWork profilePicture socialLinks")

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json({
      profile: profile.toObject(),
    })
  } catch (error) {
    console.error("Profile view error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
