import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Employee from "@/models/Employee"
import Company from "@/models/Company"
import mongoose from "mongoose"
import QRCode from "qrcode"

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

    // Find employees using the Employee model
    const employees = await Employee.find({
      companyId: new mongoose.Types.ObjectId(companyId),
    }).sort({ createdAt: -1 })

    return NextResponse.json({
      employees: employees.map((emp) => emp.toObject()),
    })
  } catch (error) {
    console.error("Employees fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { 
      companyId, 
      name, 
      email, 
      phone, 
      department, 
      position, 
      bio, 
      linkedIn, 
      twitter, 
      website, 
      qrCodeEmail,
      dateOfBirth,
      gender,
      employeeType,
      startDate,
      manager
    } = body

    // Validation
    if (!companyId || !name || !email || !department || !position || !phone || !dateOfBirth || !gender || !employeeType || !startDate) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return NextResponse.json({ error: "Invalid company ID" }, { status: 400 })
    }

    // Check if company exists and has capacity
    const company = await Company.findById(companyId)
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Check employee limit
    const currentEmployeeCount = await Employee.countDocuments({
      companyId: new mongoose.Types.ObjectId(companyId),
    })

    if (company.subscription.employeeLimit !== -1 && currentEmployeeCount >= company.subscription.employeeLimit) {
      return NextResponse.json(
        {
          error: `Employee limit reached. Current plan allows ${company.subscription.employeeLimit} employees.`,
        },
        { status: 400 },
      )
    }

    // Check if email already exists for this company
    const existingEmployee = await Employee.findOne({
      companyId: new mongoose.Types.ObjectId(companyId),
      "personalInfo.email": email.toLowerCase(),
    })

    if (existingEmployee) {
      return NextResponse.json({ error: "Employee with this email already exists" }, { status: 409 })
    }

    // Generate unique employee ID
    const employeeCount = await Employee.countDocuments({ companyId: new mongoose.Types.ObjectId(companyId) })
    const employeeId = `EMP${String(employeeCount + 1).padStart(4, '0')}`

    // Generate QR code for employee - linked to official email
    const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/profile/${companyId}-${employeeId}?email=${encodeURIComponent(email)}`
    const qrCodeDataUrl = await QRCode.toDataURL(profileUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: company.branding?.primaryColor || "#0077C0",
        light: "#FFFFFF",
      },
    })

    // Parse the name into first and last name
    const nameParts = name.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Prepare employee data according to Employee schema
    const employeeData = {
      companyId: new mongoose.Types.ObjectId(companyId),
      employeeId,
      
      personalInfo: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        mobile: phone,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        profilePicture: '',
      },

      workInfo: {
        department,
        position,
        employeeType,
        startDate: new Date(startDate),
        manager: manager || '',
      },

      qrCode: qrCodeDataUrl,
      linkedEmail: qrCodeEmail || email.toLowerCase(),
      
      qrCodeStats: {
        totalScans: 0,
        uniqueScans: 0,
      },

      socialLinks: {
        linkedin: linkedIn || '',
        twitter: twitter || '',
        instagram: '',
        facebook: '',
      },

      customLinks: [],

      permissions: {
        canEditProfile: true,
        canViewAnalytics: false,
        canDownloadQR: true,
      },

      status: 'active',
    }

    // Create employee using the Employee model
    const employee = new Employee(employeeData)
    await employee.save()

    // Update company QR codes generated count
    await Company.findByIdAndUpdate(companyId, {
      $inc: { "subscription.qrCodesGenerated": 1 },
    })

    return NextResponse.json({
      message: "Employee added successfully. QR code is linked to official email address.",
      employee: employee.toObject(),
    })
  } catch (error: any) {
    console.error("Employee creation error:", error)

    // Handle MongoDB validation errors
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      if (error.keyPattern?.linkedEmail) {
        return NextResponse.json({ error: "An employee with this email is already linked to a QR code" }, { status: 409 })
      }
      if (error.keyPattern?.employeeId) {
        return NextResponse.json({ error: "Employee ID conflict occurred" }, { status: 409 })
      }
      return NextResponse.json({ error: "Duplicate employee data found" }, { status: 409 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}