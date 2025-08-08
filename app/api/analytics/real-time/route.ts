import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import QRScan from "@/models/QRScan"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("companyId")
    const timeRange = searchParams.get("timeRange") || "24h"

    if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
      return NextResponse.json({ error: "Valid company ID is required" }, { status: 400 })
    }

    const companyObjectId = new mongoose.Types.ObjectId(companyId)

    // Calculate time range
    const now = new Date()
    const startTime = new Date()

    switch (timeRange) {
      case "1h":
        startTime.setHours(now.getHours() - 1)
        break
      case "24h":
        startTime.setDate(now.getDate() - 1)
        break
      case "7d":
        startTime.setDate(now.getDate() - 7)
        break
      case "30d":
        startTime.setDate(now.getDate() - 30)
        break
      default:
        startTime.setDate(now.getDate() - 1)
    }

    // Real-time scan data
    const recentScans = await QRScan.aggregate([
      {
        $match: {
          companyId: companyObjectId,
          scannedAt: { $gte: startTime },
        },
      },
      {
        $group: {
          _id: {
            hour: { $hour: "$scannedAt" },
            day: { $dayOfMonth: "$scannedAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.day": 1, "_id.hour": 1 } },
    ])

    // Top performing employees
    const topEmployees = await QRScan.aggregate([
      {
        $match: {
          companyId: companyObjectId,
          scannedAt: { $gte: startTime },
        },
      },
      {
        $group: {
          _id: "$employeeId",
          scanCount: { $sum: 1 },
        },
      },
      { $sort: { scanCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "_id",
          as: "employee",
        },
      },
      {
        $project: {
          scanCount: 1,
          employeeName: {
            $concat: [
              { $arrayElemAt: ["$employee.personalInfo.firstName", 0] },
              " ",
              { $arrayElemAt: ["$employee.personalInfo.lastName", 0] },
            ],
          },
          department: { $arrayElemAt: ["$employee.workInfo.department", 0] },
        },
      },
    ])

    // Geographic distribution
    const geoDistribution = await QRScan.aggregate([
      {
        $match: {
          companyId: companyObjectId,
          scannedAt: { $gte: startTime },
          "scannerInfo.location.country": { $exists: true },
        },
      },
      {
        $group: {
          _id: "$scannerInfo.location.country",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])

    // Device/Browser analytics
    const deviceAnalytics = await QRScan.aggregate([
      {
        $match: {
          companyId: companyObjectId,
          scannedAt: { $gte: startTime },
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $regexMatch: { input: "$scannerInfo.userAgent", regex: /Mobile|Android|iPhone/i } },
              "Mobile",
              "Desktop",
            ],
          },
          count: { $sum: 1 },
        },
      },
    ])

    // Current active sessions (scans in last 5 minutes)
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
    const activeSessions = await QRScan.countDocuments({
      companyId: companyObjectId,
      scannedAt: { $gte: fiveMinutesAgo },
    })

    const analytics = {
      timeRange,
      recentScans: recentScans.map((scan) => ({
        time: `${scan._id.day}/${scan._id.hour}:00`,
        count: scan.count,
      })),
      topEmployees,
      geoDistribution: geoDistribution.map((geo) => ({
        country: geo._id || "Unknown",
        count: geo.count,
      })),
      deviceAnalytics: deviceAnalytics.map((device) => ({
        type: device._id,
        count: device.count,
      })),
      activeSessions,
      lastUpdated: now.toISOString(),
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error("Real-time analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
