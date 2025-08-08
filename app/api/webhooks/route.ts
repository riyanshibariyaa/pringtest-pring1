import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Company from "@/models/Company"
import QRScan from "@/models/QRScan"

// Webhook endpoint for third-party integrations
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { event, data, companyId, apiKey } = body

    // Verify API key
    const company = await Company.findOne({
      _id: companyId,
      "apiSettings.apiKey": apiKey,
    })

    if (!company) {
      return NextResponse.json({ error: "Invalid API key or company" }, { status: 401 })
    }

    // Handle different webhook events
    switch (event) {
      case "employee.created":
        await handleEmployeeCreated(data, companyId)
        break
      case "qr.scanned":
        await handleQRScanned(data, companyId)
        break
      case "profile.updated":
        await handleProfileUpdated(data, companyId)
        break
      default:
        return NextResponse.json({ error: "Unknown event type" }, { status: 400 })
    }

    // Send webhook to company's configured endpoint
    if (company.webhookSettings?.enabled && company.webhookSettings?.url) {
      await sendWebhook(company.webhookSettings.url, {
        event,
        data,
        timestamp: new Date().toISOString(),
        companyId,
      })
    }

    return NextResponse.json({ success: true, message: "Webhook processed successfully" })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function handleEmployeeCreated(data: any, companyId: string) {
  // Custom logic for employee creation webhook
  console.log(`Employee created in company ${companyId}:`, data)
}

async function handleQRScanned(data: any, companyId: string) {
  // Log QR scan event
  const scanRecord = new QRScan({
    employeeId: data.employeeId,
    companyId,
    scannerInfo: {
      ipAddress: data.ipAddress || "unknown",
      userAgent: data.userAgent || "unknown",
      location: data.location,
    },
    scanType: "corporate",
    accessGranted: data.accessGranted || false,
    scannedAt: new Date(),
  })

  await scanRecord.save()
}

async function handleProfileUpdated(data: any, companyId: string) {
  // Handle profile update webhook
  console.log(`Profile updated in company ${companyId}:`, data)
}

async function sendWebhook(url: string, payload: any) {
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "QRProfile-Webhook/1.0",
      },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    console.error("Failed to send webhook:", error)
  }
}
