import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Company from "@/models/Company"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("id")

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return NextResponse.json({ error: "Invalid company ID" }, { status: 400 })
    }

    const company = await Company.findById(companyId).select("-adminUser.password")

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    return NextResponse.json({
      company: company.toObject(),
    })
  } catch (error) {
    console.error("Company fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
