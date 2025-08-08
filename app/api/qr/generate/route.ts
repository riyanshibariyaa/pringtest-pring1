import { type NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import mongoose from "mongoose"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Check if QR code already exists
    const existingUser = await User.findById(userId).select("qrCode")

    if (existingUser?.qrCode) {
      return NextResponse.json({
        qrCode: existingUser.qrCode,
      })
    }

    // Generate QR code URL (points to profile view page)
    const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/profile/${userId}`

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(profileUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })

    // Save QR code to user record
    const user = await User.findByIdAndUpdate(userId, { qrCode: qrCodeDataUrl }, { new: true })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      qrCode: qrCodeDataUrl,
    })
  } catch (error) {
    console.error("QR generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
