import type { NextRequest } from "next/server"
import connectDB from "@/lib/mongodb"
import Company from "@/models/Company"

// Server-Sent Events for real-time notifications
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const companyId = searchParams.get("companyId")
  const apiKey = searchParams.get("apiKey")

  if (!companyId || !apiKey) {
    return new Response("Missing required parameters", { status: 400 })
  }

  try {
    await connectDB()

    // Verify API key
    const company = await Company.findOne({
      _id: companyId,
      "apiSettings.apiKey": apiKey,
    })

    if (!company) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Set up Server-Sent Events
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        const data = `data: ${JSON.stringify({
          type: "connection",
          message: "Connected to real-time notifications",
          timestamp: new Date().toISOString(),
        })}\n\n`
        controller.enqueue(encoder.encode(data))

        // Set up periodic updates (every 30 seconds)
        const interval = setInterval(async () => {
          try {
            // Get recent notifications
            const notifications = await getRecentNotifications(companyId)

            const data = `data: ${JSON.stringify({
              type: "notifications",
              data: notifications,
              timestamp: new Date().toISOString(),
            })}\n\n`

            controller.enqueue(encoder.encode(data))
          } catch (error) {
            console.error("SSE error:", error)
          }
        }, 30000)

        // Clean up on close
        return () => {
          clearInterval(interval)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      },
    })
  } catch (error) {
    console.error("Real-time notifications error:", error)
    return new Response("Internal server error", { status: 500 })
  }
}

async function getRecentNotifications(companyId: string) {
  // This would typically fetch from a notifications collection
  // For now, we'll return mock data
  return [
    {
      id: "1",
      type: "qr_scan",
      title: "New QR Code Scan",
      message: "John Doe's profile was scanned",
      timestamp: new Date(),
      read: false,
    },
    {
      id: "2",
      type: "employee_added",
      title: "New Employee Added",
      message: "Jane Smith was added to the team",
      timestamp: new Date(),
      read: false,
    },
  ]
}
