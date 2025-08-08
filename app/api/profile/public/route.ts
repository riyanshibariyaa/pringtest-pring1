// app/api/profile/public/route.ts
import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get("id")

    if (!profileId) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      return NextResponse.json({ error: "Invalid profile ID" }, { status: 400 })
    }

    // Get profile with privacy settings
    const profile = await User.findById(profileId).select(
      "name email mobile typeOfWork profilePicture socialLinks customLinks bio department position privacy isPublic"
    )

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Check if profile is public (default behavior can be changed based on your requirements)
    // For now, we'll assume all profiles require approval by default
    const isPublic = profile.privacy?.isPublic === true || profile.isPublic === true

    if (isPublic) {
      // Apply privacy filters based on user preferences
      const filteredProfile = {
        _id: profile._id,
        name: profile.name,
        typeOfWork: profile.typeOfWork,
        profilePicture: profile.profilePicture,
        bio: profile.bio,
        department: profile.department,
        position: profile.position,
        socialLinks: profile.socialLinks,
        customLinks: profile.customLinks,
        // Only include contact info if privacy settings allow
        email: profile.privacy?.showEmail ? profile.email : undefined,
        mobile: profile.privacy?.showMobile ? profile.mobile : undefined,
      }

      return NextResponse.json({
        isPublic: true,
        profile: filteredProfile,
      })
    }

    // Profile is private, return minimal info for request form
    return NextResponse.json({
      isPublic: false,
      profileName: profile.name,
      profileType: profile.typeOfWork,
    })
  } catch (error) {
    console.error("Public profile check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}