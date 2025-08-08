"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, UserPlus, Mail, User, Phone, Briefcase, Building2, Calendar, Users } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function AddEmployeePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [company, setCompany] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    bio: "",
    linkedIn: "",
    twitter: "",
    website: "",
    dateOfBirth: "",
    gender: "",
    employeeType: "",
    startDate: "",
    manager: "",
  })

  useEffect(() => {
    const corporateUser = localStorage.getItem("corporateUser")
    if (!corporateUser) {
      router.push("/corporate/login")
      return
    }
    setCompany(JSON.parse(corporateUser))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validation
      if (!formData.name || !formData.email || !formData.department || !formData.position) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      // Additional validation for required fields based on Employee schema
      if (!formData.phone || !formData.dateOfBirth || !formData.gender || !formData.employeeType || !formData.startDate) {
        toast({
          title: "Error",
          description: "Please fill in all required fields including phone, date of birth, gender, employee type, and start date",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/corporate/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          companyId: company._id,
          // Link QR code to official email for security
          qrCodeEmail: formData.email,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Employee added successfully! QR code has been generated and linked to their official email.",
        })
        router.push("/corporate/dashboard")
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add employee",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/corporate/dashboard">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="bg-brand-blue p-2 rounded-lg">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Add New Employee</h1>
                <p className="text-brand-blue text-sm">Create a new employee profile with QR code</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-white/70">
            <Building2 className="h-4 w-4" />
            <span className="text-sm">{company.companyName}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Employee Information</CardTitle>
              <CardDescription className="text-white/70">
                Fill in the employee details. The QR code will be automatically linked to their official email address
                for security.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="border-b border-white/10 pb-6">
                  <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-brand-blue" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white font-medium">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Employee full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                        className="bg-black/50 border-white/20 text-white placeholder:text-white/50 focus:border-brand-blue"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white font-medium flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-brand-blue" />
                        Official Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="employee@company.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                        className="bg-black/50 border-white/20 text-white placeholder:text-white/50 focus:border-brand-blue"
                      />
                      <p className="text-xs text-white/50">QR code will be linked to this email for security</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white font-medium flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-brand-blue" />
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1234567890"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                        className="bg-black/50 border-white/20 text-white placeholder:text-white/50 focus:border-brand-blue"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="text-white font-medium flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-brand-blue" />
                        Date of Birth *
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                        required
                        className="bg-black/50 border-white/20 text-white placeholder:text-white/50 focus:border-brand-blue"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-white font-medium">
                        Gender *
                      </Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => handleInputChange("gender", value)}
                      >
                        <SelectTrigger className="bg-black/50 border-white/20 text-white focus:border-brand-blue">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-white/20">
                          <SelectItem value="male" className="text-white hover:bg-gray-800">Male</SelectItem>
                          <SelectItem value="female" className="text-white hover:bg-gray-800">Female</SelectItem>
                          <SelectItem value="other" className="text-white hover:bg-gray-800">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say" className="text-white hover:bg-gray-800">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Work Information */}
                <div className="border-b border-white/10 pb-6">
                  <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-brand-blue" />
                    Work Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-white font-medium flex items-center">
                        <Building2 className="h-4 w-4 mr-2 text-brand-blue" />
                        Department *
                      </Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => handleInputChange("department", value)}
                      >
                        <SelectTrigger className="bg-black/50 border-white/20 text-white focus:border-brand-blue">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-white/20">
                          <SelectItem value="engineering" className="text-white hover:bg-gray-800">Engineering</SelectItem>
                          <SelectItem value="marketing" className="text-white hover:bg-gray-800">Marketing</SelectItem>
                          <SelectItem value="sales" className="text-white hover:bg-gray-800">Sales</SelectItem>
                          <SelectItem value="hr" className="text-white hover:bg-gray-800">Human Resources</SelectItem>
                          <SelectItem value="finance" className="text-white hover:bg-gray-800">Finance</SelectItem>
                          <SelectItem value="operations" className="text-white hover:bg-gray-800">Operations</SelectItem>
                          <SelectItem value="design" className="text-white hover:bg-gray-800">Design</SelectItem>
                          <SelectItem value="other" className="text-white hover:bg-gray-800">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position" className="text-white font-medium">
                        Position *
                      </Label>
                      <Input
                        id="position"
                        type="text"
                        placeholder="Job title/position"
                        value={formData.position}
                        onChange={(e) => handleInputChange("position", e.target.value)}
                        required
                        className="bg-black/50 border-white/20 text-white placeholder:text-white/50 focus:border-brand-blue"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employeeType" className="text-white font-medium flex items-center">
                        <Users className="h-4 w-4 mr-2 text-brand-blue" />
                        Employee Type *
                      </Label>
                      <Select
                        value={formData.employeeType}
                        onValueChange={(value) => handleInputChange("employeeType", value)}
                      >
                        <SelectTrigger className="bg-black/50 border-white/20 text-white focus:border-brand-blue">
                          <SelectValue placeholder="Select employee type" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-white/20">
                          <SelectItem value="full-time" className="text-white hover:bg-gray-800">Full-time</SelectItem>
                          <SelectItem value="part-time" className="text-white hover:bg-gray-800">Part-time</SelectItem>
                          <SelectItem value="contractor" className="text-white hover:bg-gray-800">Contractor</SelectItem>
                          <SelectItem value="intern" className="text-white hover:bg-gray-800">Intern</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-white font-medium flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-brand-blue" />
                        Start Date *
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange("startDate", e.target.value)}
                        required
                        className="bg-black/50 border-white/20 text-white placeholder:text-white/50 focus:border-brand-blue"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="manager" className="text-white font-medium">
                        Manager (Optional)
                      </Label>
                      <Input
                        id="manager"
                        type="text"
                        placeholder="Manager name"
                        value={formData.manager}
                        onChange={(e) => handleInputChange("manager", e.target.value)}
                        className="bg-black/50 border-white/20 text-white placeholder:text-white/50 focus:border-brand-blue"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-white text-lg font-semibold mb-4">Social Media & Links (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="linkedIn" className="text-white font-medium">
                        LinkedIn
                      </Label>
                      <Input
                        id="linkedIn"
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={formData.linkedIn}
                        onChange={(e) => handleInputChange("linkedIn", e.target.value)}
                        className="bg-black/50 border-white/20 text-white placeholder:text-white/50 focus:border-brand-blue"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitter" className="text-white font-medium">
                        Twitter
                      </Label>
                      <Input
                        id="twitter"
                        type="url"
                        placeholder="https://twitter.com/username"
                        value={formData.twitter}
                        onChange={(e) => handleInputChange("twitter", e.target.value)}
                        className="bg-black/50 border-white/20 text-white placeholder:text-white/50 focus:border-brand-blue"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-white font-medium">
                        Personal Website
                      </Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://yourwebsite.com"
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        className="bg-black/50 border-white/20 text-white placeholder:text-white/50 focus:border-brand-blue"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-brand-blue hover:bg-blue-700 py-3 text-lg font-medium relative overflow-hidden group"
                  >
                    <span className="relative z-10 transition-transform duration-300 group-hover:translate-y-[-100%] flex items-center justify-center">
                      {loading ? "Adding Employee..." : "Add Employee"}
                      {!loading && <UserPlus className="ml-2 h-5 w-5" />}
                    </span>
                    <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 translate-y-full group-hover:translate-y-0">
                      {loading ? "Adding Employee..." : "Add Employee"}
                      {!loading && <UserPlus className="ml-2 h-5 w-5" />}
                    </span>
                  </Button>
                  <Link href="/corporate/dashboard">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 py-3 px-6 bg-transparent"
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}