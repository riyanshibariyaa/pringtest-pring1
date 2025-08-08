// components/ContactRequestForm.tsx
// Create this new file in your components folder

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Mail, Phone, Shield, User, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ContactRequestFormProps {
  profileId: string
  profileOwnerName?: string
  onRequestSubmitted: () => void
  onCancel: () => void
}

export default function ContactRequestForm({
  profileId,
  profileOwnerName,
  onRequestSubmitted,
  onCancel,
}: ContactRequestFormProps) {
  const [activeTab, setActiveTab] = useState("email")
  const [formData, setFormData] = useState({
    requesterName: "",
    requesterEmail: "",
    requesterMobile: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  const validateForm = () => {
    if (!formData.requesterName.trim()) {
      setError("Please enter your name")
      return false
    }

    if (activeTab === "email") {
      if (!formData.requesterEmail.trim()) {
        setError("Please enter your email address")
        return false
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.requesterEmail)) {
        setError("Please enter a valid email address")
        return false
      }
    } else {
      if (!formData.requesterMobile.trim()) {
        setError("Please enter your mobile number")
        return false
      }
      const mobileRegex = /^[+]?[\d\s\-\(\)]{10,15}$/
      if (!mobileRegex.test(formData.requesterMobile.replace(/\s/g, ''))) {
        setError("Please enter a valid mobile number")
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/profile/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          requesterName: formData.requesterName.trim(),
          requesterEmail: activeTab === "email" ? formData.requesterEmail.trim() : undefined,
          requesterMobile: activeTab === "mobile" ? formData.requesterMobile.trim() : undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onRequestSubmitted()
      } else {
        setError(data.error || "Failed to submit request")
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl animate-in fade-in duration-300 relative">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="absolute top-4 right-4 h-8 w-8 rounded-full"
          disabled={loading}
        >
          <X className="h-4 w-4" />
        </Button>

        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-xl">Request Profile Access</CardTitle>
          <CardDescription>
            {profileOwnerName 
              ? `Request permission to view ${profileOwnerName}'s profile`
              : "Request permission to view this protected profile"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Your Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.requesterName}
                  onChange={(e) => handleInputChange("requesterName", e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Contact Method Selection */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="mobile" className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Mobile
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="email" className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.requesterEmail}
                    onChange={(e) => handleInputChange("requesterEmail", e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  The profile owner will contact you via email
                </p>
              </TabsContent>
              
              <TabsContent value="mobile" className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.requesterMobile}
                    onChange={(e) => handleInputChange("requesterMobile", e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  The profile owner will contact you via SMS
                </p>
              </TabsContent>
            </Tabs>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <Shield className="inline h-4 w-4 mr-1" />
                Your contact information will only be shared with the profile owner for approval purposes.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-brand-blue hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}