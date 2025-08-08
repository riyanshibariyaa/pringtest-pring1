import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Company from "@/models/Company"
import Employee from "@/models/Employee"
import mongoose from "mongoose"

// CRM Integration endpoint
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { action, companyId, apiKey, data } = body

    // Verify API key
    const company = await Company.findOne({
      _id: companyId,
      "apiSettings.apiKey": apiKey,
    })

    if (!company) {
      return NextResponse.json({ error: "Invalid API key or company" }, { status: 401 })
    }

    switch (action) {
      case "sync_employees":
        return await syncEmployeesToCRM(companyId, data)
      case "get_employee_data":
        return await getEmployeeDataForCRM(companyId, data.employeeId)
      case "update_employee_status":
        return await updateEmployeeStatus(companyId, data.employeeId, data.status)
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    console.error("CRM integration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function syncEmployeesToCRM(companyId: string, crmData: any) {
  const employees = await Employee.find({
    companyId: new mongoose.Types.ObjectId(companyId),
    status: "active",
  })

  const syncedEmployees = employees.map((emp) => ({
    id: emp._id,
    employeeId: emp.employeeId,
    name: `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`,
    email: emp.personalInfo.email,
    department: emp.workInfo.department,
    position: emp.workInfo.position,
    qrCodeStats: emp.qrCodeStats,
    lastUpdated: emp.updatedAt,
  }))

  return NextResponse.json({
    success: true,
    employees: syncedEmployees,
    count: syncedEmployees.length,
  })
}

async function getEmployeeDataForCRM(companyId: string, employeeId: string) {
  const employee = await Employee.findOne({
    companyId: new mongoose.Types.ObjectId(companyId),
    _id: new mongoose.Types.ObjectId(employeeId),
  })

  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    employee: {
      id: employee._id,
      personalInfo: employee.personalInfo,
      workInfo: employee.workInfo,
      qrCodeStats: employee.qrCodeStats,
      status: employee.status,
    },
  })
}

async function updateEmployeeStatus(companyId: string, employeeId: string, status: string) {
  const employee = await Employee.findOneAndUpdate(
    {
      companyId: new mongoose.Types.ObjectId(companyId),
      _id: new mongoose.Types.ObjectId(employeeId),
    },
    { status },
    { new: true },
  )

  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true, employee })
}
