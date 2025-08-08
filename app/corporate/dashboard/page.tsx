"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Users,
  QrCode,
  BarChart3,
  Settings,
  Plus,
  Download,
  Eye,
  LogOut,
  TrendingUp,
  Scan,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Company {
  _id: string
  companyName: string
  companyEmail: string
  industry: string
  companySize: string
  subscription: {
    plan: string
    employeeLimit: number
    qrCodesGenerated: number
    qrCodeLimit: number
  }
  adminUser: {
    name: string
    email: string
  }
}

interface Employee {
  _id: string
  employeeId: string
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    mobile: string
  }
  workInfo: {
    department: string
    position: string
  }
  status: string
  qrCodeStats: {
    totalScans: number
    uniqueScans: number
  }
}

interface DashboardStats {
  totalEmployees: number
  activeEmployees: number
  totalQRCodes: number
  totalScans: number
  recentScans: number
  topDepartments: Array<{ department: string; count: number }>
}

export default function CorporateDashboardPage() {
  const router = useRouter()
  const [company, setCompany] = useState<Company | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if corporate user is logged in
    const corporateData = localStorage.getItem("corporateUser")
    if (!corporateData) {
      router.push("/corporate/login")
      return
    }

    const parsedCompany = JSON.parse(corporateData)
    setCompany(parsedCompany)
    loadDashboardData(parsedCompany._id)
  }, [router])

  const loadDashboardData = async (companyId: string) => {
    try {
      // Load company details
      const companyResponse = await fetch(`/api/corporate/company?id=${companyId}`)
      const companyData = await companyResponse.json()
      if (companyResponse.ok) {
        setCompany(companyData.company)
      }

      // Load employees
      const employeesResponse = await fetch(`/api/corporate/employees?companyId=${companyId}`)
      const employeesData = await employeesResponse.json()
      if (employeesResponse.ok) {
        setEmployees(employeesData.employees)
      }

      // Load dashboard stats
      const statsResponse = await fetch(`/api/corporate/dashboard-stats?companyId=${companyId}`)
      const statsData = await statsResponse.json()
      if (statsResponse.ok) {
        setStats(statsData.stats)
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("corporateUser")
    router.push("/corporate/login")
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "free":
        return "bg-gray-800 text-gray-300"
      case "basic":
        return "bg-blue-900 text-blue-300"
      case "premium":
        return "bg-brand-blue text-white"
      case "enterprise":
        return "bg-blue-600 text-white"
      default:
        return "bg-gray-800 text-gray-300"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-brand-blue mx-auto mb-4 animate-pulse" />
          <p className="text-white">Loading corporate dashboard...</p>
        </div>
      </div>
    )
  }

  if (!company) {
    return null
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-brand-blue p-2 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{company.companyName}</h1>
              <p className="text-gray-400 text-sm">Corporate Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className={getPlanColor(company.subscription.plan)}>
              {company.subscription.plan.toUpperCase()} Plan
            </Badge>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="b-style text-base flex items-center rounded-full "
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className=" border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Employees</p>
                <p className="text-3xl font-bold text-white">{stats?.totalEmployees || 0}</p>
              </div>
              <div className="bg-brand-blue p-3 rounded-full">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{stats?.activeEmployees || 0} active</p>
          </div>

          <div className=" border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">QR Codes Generated</p>
                <p className="text-3xl font-bold text-white">{company.subscription.qrCodesGenerated}</p>
              </div>
              <div className="bg-green-600 p-3 rounded-full">
                <QrCode className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {company.subscription.qrCodeLimit - company.subscription.qrCodesGenerated} remaining
            </p>
          </div>

          <div className=" border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Scans</p>
                <p className="text-3xl font-bold text-white">{stats?.totalScans || 0}</p>
              </div>
              <div className="bg-brand-blue p-3 rounded-full">
                <Scan className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">+{stats?.recentScans || 0} this week</p>
          </div>

          <div className=" border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Engagement Rate</p>
                <p className="text-3xl font-bold text-white">
                  {stats?.totalEmployees ? Math.round((stats.totalScans / stats.totalEmployees) * 100) / 100 : 0}
                </p>
              </div>
              <div className="bg-blue-600 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Scans per employee</p>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="employees" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900 border-gray-800">
            <TabsTrigger
              value="employees"
              className="data-[state=active]:bg-brand-blue data-[state=active]:text-white text-gray-300"
            >
              <Users className="h-4 w-4 mr-2" />
              Employees
            </TabsTrigger>
            <TabsTrigger
              value="qr-codes"
              className="data-[state=active]:bg-brand-blue data-[state=active]:text-white text-gray-300"
            >
              <QrCode className="h-4 w-4 mr-2" />
              QR Codes
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-brand-blue data-[state=active]:text-white text-gray-300"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-brand-blue data-[state=active]:text-white text-gray-300"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            <EmployeesTab
              employees={employees}
              companyId={company._id}
              onRefresh={() => loadDashboardData(company._id)}
            />
          </TabsContent>

          <TabsContent value="qr-codes">
            <QRCodesTab employees={employees} company={company} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab stats={stats} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab company={company} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function EmployeesTab({
  employees,
  companyId,
  onRefresh,
}: { employees: Employee[]; companyId: string; onRefresh: () => void }) {
  const router = useRouter()

  return (
    <div className=" border border-gray-800 rounded-lg">
      <div className=" text-white p-6 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Employee Management
            </h3>
            <p className="text-blue-100 mt-1">Manage your team members and their QR profiles</p>
          </div>
          <Button
            onClick={() => router.push("/corporate/employees/add")}
            className="b-style px-6 py-2.5 text-base flex items-center rounded-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>
      <div className="p-8">
        {employees.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Employees Yet</h3>
            <p className="text-gray-400 mb-6">Start by adding your first team member</p>
            <Button onClick={() => router.push("/corporate/employees/add")} className="b-style text-base  rounded-full">
              <Plus className="h-4 w-4 mr-2" />
              Add First Employee
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {employees.map((employee) => (
              <div
                key={employee._id}
                className="flex items-center justify-between p-4 border border-gray-700 rounded-xl hover:border-brand-blue transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-brand-blue text-white w-12 h-12 rounded-full flex items-center justify-center font-semibold">
                    {employee.personalInfo.firstName.charAt(0)}
                    {employee.personalInfo.lastName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">
                      {employee.personalInfo.firstName} {employee.personalInfo.lastName}
                    </h4>
                    <p className="text-sm text-gray-400">{employee.workInfo.position}</p>
                    <p className="text-sm text-gray-500">{employee.workInfo.department}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{employee.qrCodeStats.totalScans} scans</p>
                    <Badge
                      className={employee.status === "active" ? "bg-green-600 text-white" : "bg-gray-600 text-gray-300"}
                    >
                      {employee.status}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/corporate/employees/${employee._id}`)}
                      className="b-style text-base flex items-center rounded-full"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => router.push(`/corporate/employees/${employee._id}/edit`)}
                      className="b-style  text-base flex items-center rounded-full"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function QRCodesTab({ employees, company }: { employees: Employee[]; company: Company }) {
  const handleBulkDownload = async () => {
    try {
      const response = await fetch(`/api/corporate/bulk-qr-download?companyId=${company._id}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${company.companyName}-qr-codes.zip`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download QR codes",
        variant: "destructive",
      })
    }
  }

  return (
    <div className=" border border-gray-800 rounded-lg">
      <div className="bg-gradient-to-r from-black to-gray-800 text-white p-6 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold flex items-center">
              <QrCode className="h-5 w-5 mr-2" />
              QR Code Management
            </h3>
            <p className="text-gray-300 mt-1">Generate and manage QR codes for your employees</p>
          </div>
          <Button onClick={handleBulkDownload} className="b-style  text-base flex items-center rounded-full">
            <Download className="h-4 w-4 mr-2" />
            Download All
          </Button>
        </div>
      </div>
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <div
              key={employee._id}
              className="border border-gray-700 hover:border-brand-blue transition-colors rounded-lg"
            >
              <div className="p-6 text-center">
                <div className="bg-gray-800 p-4 rounded-lg border mb-4">
                  <div className="w-32 h-32 bg-gray-700 rounded-lg mx-auto flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-gray-500" />
                  </div>
                </div>
                <h4 className="font-semibold text-white mb-1">
                  {employee.personalInfo.firstName} {employee.personalInfo.lastName}
                </h4>
                <p className="text-sm text-gray-400 mb-4">{employee.workInfo.position}</p>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 b-style text-base flex items-center rounded-full"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" className="flex-1 b-style">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AnalyticsTab({ stats }: { stats: DashboardStats | null }) {
  return (
    <div className=" border border-gray-800 rounded-lg">
      <div className=" text-white p-6 rounded-t-lg">
        <h3 className="text-xl font-bold flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Analytics & Reports
        </h3>
        <p className="text-blue-100 mt-1">Insights into your team's QR code usage and engagement</p>
      </div>
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Department Breakdown */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Top Departments</h3>
            <div className="space-y-3">
              {stats?.topDepartments?.map((dept, index) => (
                <div key={dept.department} className="flex items-center justify-between p-3  rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-brand-blue text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <span className="font-medium text-white">{dept.department}</span>
                  </div>
                  <Badge className="bg-brand-blue text-white">{dept.count} employees</Badge>
                </div>
              )) || <p className="text-gray-500 text-center py-8">No department data available</p>}
            </div>
          </div>

          {/* Engagement Metrics */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Engagement Metrics</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-900/50 to-green-800/50 rounded-lg border border-green-700">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-green-300">Active Employees</span>
                  <span className="text-2xl font-bold text-green-400">{stats?.activeEmployees || 0}</span>
                </div>
                <p className="text-sm text-green-400 mt-1">
                  {stats?.totalEmployees ? Math.round((stats.activeEmployees / stats.totalEmployees) * 100) : 0}% of
                  total
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-900/50 to-blue-800/50 rounded-lg border border-blue-700">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-300">Average Scans</span>
                  <span className="text-2xl font-bold text-blue-400">
                    {stats?.totalEmployees ? Math.round((stats.totalScans / stats.totalEmployees) * 10) / 10 : 0}
                  </span>
                </div>
                <p className="text-sm text-blue-400 mt-1">Per employee</p>
              </div>

              <div className="p-4 bg-gradient-to-r from-brand-blue/50 to-blue-700/50 rounded-lg border border-blue-600">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-300">Recent Activity</span>
                  <span className="text-2xl font-bold text-blue-400">{stats?.recentScans || 0}</span>
                </div>
                <p className="text-sm text-blue-400 mt-1">Scans this week</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsTab({ company }: { company: Company }) {
  return (
    <div className=" border border-gray-800 rounded-lg">
      <div className="bg-gradient-to-r from-black to-gray-800 text-white p-6 rounded-t-lg">
        <h3 className="text-xl font-bold flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Company Settings
        </h3>
        <p className="text-gray-300 mt-1">Manage your company profile and preferences</p>
      </div>
      <div className="p-8">
        <div className="space-y-8">
          {/* Company Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-white font-medium">Company Name</Label>
                <p className="text-gray-400 mt-1">{company.companyName}</p>
              </div>
              <div>
                <Label className="text-white font-medium">Industry</Label>
                <p className="text-gray-400 mt-1 capitalize">{company.industry}</p>
              </div>
              <div>
                <Label className="text-white font-medium">Company Size</Label>
                <p className="text-gray-400 mt-1">{company.companySize} employees</p>
              </div>
              <div>
                <Label className="text-white font-medium">Admin Email</Label>
                <p className="text-gray-400 mt-1">{company.adminUser.email}</p>
              </div>
            </div>
          </div>

          {/* Subscription Details */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">
              Subscription Details
            </h3>
            <div className=" text-white p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-semibold capitalize">{company.subscription.plan} Plan</h4>
                <Button className="b-style text-base flex items-center rounded-full">Upgrade Plan</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-blue-100 text-sm">Employee Limit</p>
                  <p className="text-2xl font-bold">{company.subscription.employeeLimit}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">QR Codes Used</p>
                  <p className="text-2xl font-bold">
                    {company.subscription.qrCodesGenerated} / {company.subscription.qrCodeLimit}
                  </p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Remaining</p>
                  <p className="text-2xl font-bold">
                    {company.subscription.qrCodeLimit - company.subscription.qrCodesGenerated}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button className="b-style text-base flex items-center rounded-full">
              <Settings className="h-4 w-4 mr-2" />
              Edit Company Profile
            </Button>
            <Button
              variant="outline"
              className="b-style text-base flex items-center rounded-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
