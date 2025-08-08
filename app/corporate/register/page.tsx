"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, QrCode, Check, Star, Crown } from "lucide-react"
import { toast } from "@/hooks/use-toast"

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    description: "Perfect for small teams getting started",
    features: ["Up to 5 employees", "Basic QR codes", "Email support", "Basic analytics", "Standard templates"],
    employeeLimit: 5,
    qrCodeLimit: 5,
    popular: false,
    icon: Users,
    color: "bg-gray-600",
  },
  {
    id: "basic",
    name: "Basic",
    price: 29,
    period: "month",
    description: "Great for growing teams",
    features: [
      "Up to 25 employees",
      "Custom QR codes",
      "Priority email support",
      "Advanced analytics",
      "Custom branding",
      "Bulk operations",
    ],
    employeeLimit: 25,
    qrCodeLimit: 25,
    popular: false,
    icon: Building2,
    color: "bg-blue-600",
  },
  {
    id: "premium",
    name: "Premium",
    price: 79,
    period: "month",
    description: "Perfect for established companies",
    features: [
      "Up to 100 employees",
      "Premium QR codes",
      "24/7 phone support",
      "Real-time analytics",
      "Advanced branding",
      "API access",
      "Custom integrations",
    ],
    employeeLimit: 100,
    qrCodeLimit: 100,
    popular: true,
    icon: Star,
    color: "bg-brand-blue",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    period: "month",
    description: "For large organizations",
    features: [
      "Unlimited employees",
      "Enterprise QR codes",
      "Dedicated support",
      "Custom analytics",
      "White-label solution",
      "Advanced API",
      "Custom development",
      "SLA guarantee",
    ],
    employeeLimit: -1,
    qrCodeLimit: -1,
    popular: false,
    icon: Crown,
    color: "bg-gradient-to-r from-yellow-500 to-orange-500",
  },
]

export default function CorporateRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("free")
  const [formData, setFormData] = useState({
    // Company Information
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    industry: "",
    companySize: "",
    website: "",

    // Address Information
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",

    // Admin User Information
    adminName: "",
    adminEmail: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        })
        return
      }

      if (formData.password.length < 6) {
        toast({
          title: "Error",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        })
        return
      }

      const selectedPlanData = plans.find((p) => p.id === selectedPlan)

      const response = await fetch("/api/corporate/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Company Information
          companyName: formData.companyName,
          companyEmail: formData.companyEmail,
          companyPhone: formData.companyPhone,
          industry: formData.industry,
          companySize: formData.companySize,
          website: formData.website,

          // Address Information
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country,
          },

          // Admin User Information
          adminUser: {
            name: formData.adminName,
            email: formData.adminEmail,
            password: formData.password,
          },

          // Subscription Plan
          subscription: {
            plan: selectedPlan,
            employeeLimit: selectedPlanData?.employeeLimit || 5,
            qrCodeLimit: selectedPlanData?.qrCodeLimit || 5,
            price: selectedPlanData?.price || 0,
          },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Company registered successfully!",
        })

        localStorage.setItem("corporateUser", JSON.stringify(data.company))


        // If it's a paid plan, redirect to payment
        if (selectedPlan !== "free") {
          router.push(`/corporate/payment?plan=${selectedPlan}&companyId=${data.company._id}`)
        } else {
          router.push(`/corporate/dashboard?autoLogin=true&email=${formData.adminEmail}&token=${data.token}`)
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Registration failed",
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

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-brand-blue p-2 rounded-lg">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Pring</span>
          </Link>
          <Link href="/corporate/login">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Register Your Company</h1>
          <p className="text-xl text-white/70">
            Create a corporate account to manage your team's professional QR codes
          </p>
        </div>

        {/* Plan Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Choose Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon
              return (
                <Card
                  key={plan.id}
                  className={`relative cursor-pointer transition-all duration-300 ${
                    selectedPlan === plan.id
                      ? "bg-brand-blue/20 border-brand-blue scale-105"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-brand-blue text-white">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <div className={`w-12 h-12 ${plan.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold text-white">
                      ${plan.price}
                      <span className="text-sm text-white/70">/{plan.period}</span>
                    </div>
                    <CardDescription className="text-white/70">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-white/80">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Registration Form */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Company Information</CardTitle>
              <CardDescription className="text-white/70">Fill in your company details to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Company Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Company Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName" className="text-white font-medium">
                        Company Name *
                      </Label>
                      <Input
                        id="companyName"
                        type="text"
                        placeholder="Your Company Name"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange("companyName", e.target.value)}
                        required
                        className="bg-black/50 border-white/20 text-white placeholder:text-white/50 focus:border-brand-blue"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyEmail" className="text-white font-medium">
                        Company Email *
                      </Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        placeholder="company@example.com"
                        value={formData.companyEmail}
                        onChange={(e) => handleInputChange("companyEmail", e.target.value)}
                        required
                        className="bg-black/50 border-white/20 text-white placeholder:text-white/50 focus:border-brand-blue"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyPhone" className="text-white font-medium">
                        Phone Number *
                      </Label>
                      <Input
                        id="companyPhone"
                        type="tel"
                        placeholder="+1234567890"
                        value={formData.companyPhone}
                        onChange={(e) => handleInputChange("companyPhone", e.target.value)}
                        required
                        className="bg-black/50 border-white/20 text-white placeholder:text-white/50 focus:border-brand-blue"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry" className="text-white font-medium">
                        Industry *
                      </Label>
                      <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                        <SelectTrigger className="bg-black/50 border-white/20 text-white focus:border-brand-blue">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-white/20">
                          <SelectItem value="technology" className="text-white hover:bg-gray-800">
                            Technology
                          </SelectItem>
                          <SelectItem value="healthcare" className="text-white hover:bg-gray-800">
                            Healthcare
                          </SelectItem>
                          <SelectItem value="finance" className="text-white hover:bg-gray-800">
                            Finance
                          </SelectItem>
                          <SelectItem value="education" className="text-white hover:bg-gray-800">
                            Education
                          </SelectItem>
                          <SelectItem value="retail" className="text-white hover:bg-gray-800">
                            Retail
                          </SelectItem>
                          <SelectItem value="manufacturing" className="text-white hover:bg-gray-800">
                            Manufacturing
                          </SelectItem>
                          <SelectItem value="other" className="text-white hover:bg-gray-800">
                            Other
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companySize" className="text-white font-medium">
                        Company Size *
                      </Label>
                      <Select
                        value={formData.companySize}
                        onValueChange={(value) => handleInputChange("companySize", value)}
                      >
                        <SelectTrigger className="bg-black/50 border-white/20 text-white focus:border-brand-blue">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-white/20">
                          <SelectItem value="1-10" className="text-white hover:bg-gray-800">
                            1-10 employees
                          </SelectItem>
                          <SelectItem value="11-50" className="text-white hover:bg-gray-800">
                            11-50 employees
                          </SelectItem>
                          <SelectItem value="51-200" className="text-white hover:bg-gray-800">
                            51-200 employees
                          </SelectItem>
                          <SelectItem value="201-500" className="text-white hover:bg-gray-800">
                            201-500 employees
                          </SelectItem>
                          <SelectItem value="500+" className="text-white hover:bg-gray-800">
                            500+ employees
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-white font-medium">
                      Website (Optional)
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://yourcompany.com"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      className="bg-black/50 border-white/20 text-white placeholder:text-white/50 focus:border-brand-blue"
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Company Address</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="street" className="text-white font-medium">
                        Street Address *
                      </Label>
                      <Input
                        id="street"
                        type="text"
                        placeholder="Company address"
                        value={formData.street}
                        onChange={(e) => handleInputChange("street", e.target.value)}
                        required
                        className="bg-black/50 border-white/20 text-white placeholder:text-white/50 focus:border-brand-blue"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-white font-medium">
                          City *
                        </Label>
                        <Input
                          id="city"
                          type="text"
                          placeholder="City"
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          required
                          className="bg-black/50 border-white/20 text-white placeholder:text-white/50 focus:border-brand-blue"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-white font-medium">
                          State *
                        </Label>
                        <Input
                          id="state"
                          type="text"
                          placeholder="State"
                          value={formData.state}
                          onChange={(e) => handleInputChange("state", e.target.value)}
                          required
                          className="bg-black/50 border-white/20 text-white placeholder:text-white/50 focus:border-brand-blue"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zipCode" className="text-white font-medium">
                          ZIP Code *
                        </Label>
                        <Input
                          id="zipCode"
                          type="text"
                          placeholder="ZIP Code"
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange("zipCode", e.target.value)}
                          required
                          className="bg-black/50 border-white/20 text-white placeholder:text-white/50 focus:border-brand-blue"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-white font-medium">
                          Country *
                        </Label>
                        <Input
                          id="country"
                          type="text"
                          placeholder="Country"
                          value={formData.country}
                          onChange={(e) => handleInputChange("country", e.target.value)}
                          required
                          className="bg-black/50 border-white/20 text-white placeholder:text-white/50 focus:border-brand-blue"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin User Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                    Administrator Account
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="adminName" className="text-white font-medium">
                        Admin Name *
                      </Label>
                      <Input
                        id="adminName"
                        type="text"
                        placeholder="Administrator full name"
                        value={formData.adminName}
                        onChange={(e) => handleInputChange("adminName", e.target.value)}
                        required
                        className="bg-black/50 border-white/20 text-white placeholder:text-white/50 focus:border-brand-blue"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adminEmail" className="text-white font-medium">
                        Admin Email *
                      </Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        placeholder="admin@company.com"
                        value={formData.adminEmail}
                        onChange={(e) => handleInputChange("adminEmail", e.target.value)}
                        required
                        className="bg-black/50 border-white/20 text-white placeholder:text-white/50 focus:border-brand-blue"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white font-medium">
                        Password *
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        required
                        className="bg-black/50 border-white/20 text-white placeholder:text-white/50 focus:border-brand-blue"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white font-medium">
                        Confirm Password *
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        required
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
                      {loading ? "Creating Account..." : "Create Company Account"}
                      {!loading && <Building2 className="ml-2 h-5 w-5" />}
                    </span>
                    <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 translate-y-full group-hover:translate-y-0">
                      {loading ? "Creating Account..." : "Create Company Account"}
                      {!loading && <Building2 className="ml-2 h-5 w-5" />}
                    </span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
