import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/mongodb"
import Company from "@/models/Company"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const {
      companyName,
      companyEmail,
      companyPhone,
      industry,
      companySize,
      website,
      address,
      adminUser,
      subscription,
    } = body

    // Validation
    if (!companyName || !companyEmail || !companyPhone || !industry || !companySize) {
      return NextResponse.json({ error: "Required company fields are missing" }, { status: 400 })
    }

    if (!address || !address.street || !address.city || !address.state || !address.zipCode || !address.country) {
      return NextResponse.json({ error: "Complete address is required" }, { status: 400 })
    }

    if (!adminUser || !adminUser.name || !adminUser.email || !adminUser.password) {
      return NextResponse.json({ error: "Admin user information is required" }, { status: 400 })
    }

    if (!subscription || !subscription.plan) {
      return NextResponse.json({ error: "Subscription plan is required" }, { status: 400 })
    }

    // Check if company already exists
    const existingCompany = await Company.findOne({
      $or: [{ companyEmail: companyEmail.toLowerCase() }, { companyName }],
    })

    if (existingCompany) {
      return NextResponse.json({ error: "Company with this name or email already exists" }, { status: 409 })
    }

    // Hash admin password
    const hashedPassword = await bcrypt.hash(adminUser.password, 12)

    // Create company
    const company = new Company({
      companyName,
      companyEmail: companyEmail.toLowerCase(),
      companyPhone,
      industry,
      companySize,
      website: website || "",
      address: {
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
      },
      adminUser: {
        name: adminUser.name,
        email: adminUser.email.toLowerCase(),
        password: hashedPassword,
      },
      subscription: {
        plan: subscription.plan,
        status: subscription.plan === "free" ? "active" : "pending",
        employeeLimit: subscription.employeeLimit,
        qrCodeLimit: subscription.qrCodeLimit,
        price: subscription.price,
        qrCodesGenerated: 0,
        employeesAdded: 0,
        startDate: new Date(),
        endDate: subscription.plan === "free" ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      branding: {
        primaryColor: "#0077C0",
        secondaryColor: "#FFFFFF",
        logo: "",
        companyDescription: "",
      },
      isActive: true,
    })

    await company.save()

    // Remove password from response
    const companyResponse = company.toObject()
    delete companyResponse.adminUser.password

    return NextResponse.json({
      message: "Company registered successfully",
      company: companyResponse,
    })
  } catch (error: any) {
    console.error("Corporate registration error:", error)

    // Handle MongoDB validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: errors.join(", ") }, { status: 400 })
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json({ error: "Company with this information already exists" }, { status: 409 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
