import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Connection from "@/models/Connection"
import User from "@/models/User"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { targetUserId, message } = body

    // In a real app, you'd get the current user from session/JWT
    // For now, we'll use a placeholder or get from request headers
    const currentUserId = request.headers.get("x-user-id") || "placeholder-user-id"

    if (!targetUserId) {
      return NextResponse.json({ error: "Target user ID is required" }, { status: 400 })
    }

    if (currentUserId === targetUserId) {
      return NextResponse.json({ error: "Cannot send connection request to yourself" }, { status: 400 })
    }

    // Check if target user exists and allows connection requests
    const targetUser = await User.findById(targetUserId)
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (targetUser.privacy?.allowConnectionRequests === false) {
      return NextResponse.json({ error: "This user is not accepting connection requests" }, { status: 403 })
    }

    // Check if connection request already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { requester: currentUserId, recipient: targetUserId },
        { requester: targetUserId, recipient: currentUserId },
      ],
    })

    if (existingConnection) {
      if (existingConnection.status === "pending") {
        return NextResponse.json({ error: "Connection request already sent" }, { status: 409 })
      } else if (existingConnection.status === "accepted") {
        return NextResponse.json({ error: "Already connected with this user" }, { status: 409 })
      }
    }

    // Create new connection request
    const connection = new Connection({
      requester: currentUserId,
      recipient: targetUserId,
      message: message || "",
      status: "pending",
    })

    await connection.save()

    return NextResponse.json({
      message: "Connection request sent successfully",
      connectionId: connection._id,
    })
  } catch (error) {
    console.error("Connection request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "placeholder-user-id"
    const status = searchParams.get("status") || "all"

    const filter: any = {
      $or: [{ requester: userId }, { recipient: userId }],
    }

    if (status !== "all") {
      filter.status = status
    }

    const connections = await Connection.find(filter)
      .populate("requester", "email profileInfo.firstName profileInfo.lastName typeOfWork")
      .populate("recipient", "email profileInfo.firstName profileInfo.lastName typeOfWork")
      .sort({ createdAt: -1 })

    return NextResponse.json({ connections })
  } catch (error) {
    console.error("Get connections error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
