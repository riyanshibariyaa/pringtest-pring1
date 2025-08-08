"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  QrCode,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Linkedin,
  Instagram,
  Facebook,
  Twitter,
  Mail,
  Phone,
  Calendar,
  User,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ProfileData {
  _id: string
  email: string
  mobile: string
  typeOfWork: string
  dateOfBirth: string
  gender: string
  profilePicture?: string
  socialLinks?: {
    linkedin?: string
    instagram?: string
    facebook?: string
    twitter?: string
  }
}

export default function ProfileViewPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessStatus, setAccessStatus] = useState<"pending" | "approved" | "denied" | null>(null)
  const [requestSent, setRequestSent] = useState(false)

  const profileId = params.id as string
  const token = searchParams.get("token")

  useEffect(() => {
    if (token) {
      // Direct access with approval token
      loadProfileWithToken()
    } else {
      // Request access
      checkAccessStatus()
    }
  }, [profileId, token])

  const loadProfileWithToken = async () => {
    try {
      const response = await fetch(`/api/profile/view?id=${profileId}&token=${token}`)
      const data = await response.json()

      if (response.ok) {
        setProfile(data.profile)
        setAccessStatus("approved")
      } else {
        setAccessStatus("denied")
        toast({
          title: "Access Denied",
          description: data.error || "Invalid or expired access token",
          variant: "destructive",
        })
      }
    } catch (error) {
      setAccessStatus("denied")
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const checkAccessStatus = async () => {
    try {
      const response = await fetch(`/api/profile/access-status?id=${profileId}`)
      const data = await response.json()

      if (response.ok) {
        setAccessStatus(data.status)
        if (data.status === "approved") {
          setProfile(data.profile)
        }
      }
    } catch (error) {
      console.error("Error checking access status:", error)
    } finally {
      setLoading(false)
    }
  }

  const requestAccess = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/profile/request-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profileId }),
      })

      const data = await response.json()

      if (response.ok) {
        setRequestSent(true)
        setAccessStatus("pending")
        toast({
          title: "Request Sent",
          description: "Access request has been sent to the profile owner",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send access request",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <QrCode className="h-12 w-12 text-brand-blue mx-auto mb-4 animate-pulse" />
          <p className="text-brand-dark">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-brand-dark shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-brand-blue p-2 rounded-lg">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Pring</h1>
              <p className="text-gray-300 text-sm">Professional Networking</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {accessStatus === "approved" && profile ? (
          <ApprovedProfileView profile={profile} />
        ) : accessStatus === "pending" ? (
          <PendingAccessView />
        ) : accessStatus === "denied" ? (
          <DeniedAccessView />
        ) : (
          <RequestAccessView onRequestAccess={requestAccess} requestSent={requestSent} />
        )}
      </div>
    </div>
  )
}

function ApprovedProfileView({ profile }: { profile: ProfileData }) {
  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "linkedin":
        return <Linkedin className="h-5 w-5" />
      case "instagram":
        return <Instagram className="h-5 w-5" />
      case "facebook":
        return <Facebook className="h-5 w-5" />
      case "twitter":
        return <Twitter className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card className="overflow-hidden border-0 shadow-xl">
        <div className="bg-gradient-to-r from-brand-blue to-blue-600 p-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <Avatar className="h-40 w-40 border-4 border-white shadow-lg">
              <AvatarImage src={profile.profilePicture || "/placeholder.svg"} />
              <AvatarFallback className="text-5xl bg-brand-dark text-white">
                {profile.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl font-bold mb-3">{profile.typeOfWork}</h1>
              <div className="space-y-2 text-blue-100">
                {profile.email && (
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{profile.email}</span>
                  </div>
                )}
                {profile.mobile && (
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{profile.mobile}</span>
                  </div>
                )}
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Born: {new Date(profile.dateOfBirth).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <User className="h-4 w-4" />
                  <span>{profile.gender}</span>
                </div>
              </div>
              <Badge className="mt-4 bg-white/20 hover:bg-white/30 text-white border-0">
                <CheckCircle className="h-4 w-4 mr-2" />
                Verified Profile
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Social Media Links */}
      {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-brand-dark to-gray-700 text-white">
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Social Media Profiles
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(profile.socialLinks).map(([platform, url]) => {
                if (!url) return null
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-xl hover:border-brand-blue hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <div className="p-3 bg-brand-blue text-white rounded-lg group-hover:bg-blue-600 transition-colors">
                      {getSocialIcon(platform)}
                    </div>
                    <div>
                      <span className="capitalize font-semibold text-brand-dark">{platform}</span>
                      <p className="text-sm text-gray-600 truncate max-w-48">{url}</p>
                    </div>
                  </a>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Access Status */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-6 w-6" />
          <div>
            <h3 className="font-semibold text-lg">Access Granted</h3>
            <p className="text-green-100">
              You have been granted access to view this profile. Access expires in 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PendingAccessView() {
  return (
    <Card className="text-center shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
        <Clock className="h-16 w-16 mx-auto mb-4" />
        <CardTitle className="text-2xl">Access Request Pending</CardTitle>
        <CardDescription className="text-yellow-100">
          Your request to view this profile has been sent to the owner.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6">
          <p className="text-brand-dark font-medium">
            The profile owner will receive an email and SMS notification about your request. Please wait for their
            approval.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function DeniedAccessView() {
  return (
    <Card className="text-center shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
        <XCircle className="h-16 w-16 mx-auto mb-4" />
        <CardTitle className="text-2xl">Access Denied</CardTitle>
        <CardDescription className="text-red-100">
          Your request to view this profile has been denied or the access link has expired.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <div className="bg-gradient-to-r from-red-50 to-red-50 border-2 border-red-200 rounded-xl p-6">
          <p className="text-brand-dark font-medium">
            The profile owner has not approved your request or the access token is invalid.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function RequestAccessView({ onRequestAccess, requestSent }: { onRequestAccess: () => void; requestSent: boolean }) {
  return (
    <Card className="text-center shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-brand-blue to-blue-600 text-white">
        <Shield className="h-16 w-16 mx-auto mb-4" />
        <CardTitle className="text-2xl">Protected Profile</CardTitle>
        <CardDescription className="text-blue-100">
          This profile is protected. You need permission from the owner to view their information.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="bg-gradient-to-r from-brand-blue to-blue-600 text-white p-6 rounded-xl">
          <h4 className="font-semibold mb-4 flex items-center justify-center">
            <Shield className="h-5 w-5 mr-2" />
            How it works:
          </h4>
          <ul className="space-y-3 text-blue-100">
            <li className="flex items-start">
              <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                1
              </span>
              Click "Request Access" below
            </li>
            <li className="flex items-start">
              <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                2
              </span>
              The profile owner will receive a notification
            </li>
            <li className="flex items-start">
              <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                3
              </span>
              If approved, you'll get access for 24 hours
            </li>
            <li className="flex items-start">
              <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                4
              </span>
              You'll receive an email with the access link
            </li>
          </ul>
        </div>

        {!requestSent ? (
          <Button onClick={onRequestAccess} size="lg" className="b-style px-12 py-4 text-lg">
            Request Access to Profile
          </Button>
        ) : (
          <div className="space-y-4">
            <Button disabled size="lg" className="b-style px-12 py-4 text-lg">
              Request Sent ✓
            </Button>
            <p className="text-brand-dark font-medium">Check your email for updates on your request</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
