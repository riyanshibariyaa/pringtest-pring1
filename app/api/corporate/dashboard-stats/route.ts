import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Employee from "@/models/Employee"
import QRScan from "@/models/QRScan"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("companyId")

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return NextResponse.json({ error: "Invalid company ID" }, { status: 400 })
    }

    const companyObjectId = new mongoose.Types.ObjectId(companyId)

    // Get basic employee stats
    const totalEmployees = await Employee.countDocuments({ companyId: companyObjectId })
    const activeEmployees = await Employee.countDocuments({
      companyId: companyObjectId,
      status: "active",
    })

    // Get total scans
    const totalScans = await QRScan.countDocuments({ companyId: companyObjectId })

    // Get recent scans (last 7 days)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const recentScans = await QRScan.countDocuments({
      companyId: companyObjectId,
      scannedAt: { $gte: weekAgo },
    })

    // Get top departments
    const departmentStats = await Employee.aggregate([
      { $match: { companyId: companyObjectId } },
      { $group: { _id: "$workInfo.department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { department: "$_id", count: 1, _id: 0 } },
    ])

    const stats = {
      totalEmployees,
      activeEmployees,
      totalScans,
      recentScans,
      topDepartments: departmentStats,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
