"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { QrCode, LogOut, Camera, Download, Share2, User, Edit3, Menu, Plus, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface UserProfile {
  _id: string
  name?: string
  email: string
  mobile: string
  dateOfBirth?: string
  gender?: string
  typeOfWork: string
  profilePicture?: string
  socialLinks?: {
    linkedin?: string
    instagram?: string
    facebook?: string
    twitter?: string
  }
  customLinks?: Array<{
    name: string
    url: string
  }>
  qrCode?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [showEditProfile, setShowEditProfile] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    loadUserProfile(parsedUser._id)
  }, [router])

  const loadUserProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/profile?id=${userId}`)
      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        if (data.user.qrCode) {
          setQrCodeUrl(data.user.qrCode)
        } else {
          // Generate QR code if not exists
          generateQRCode(userId)
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user._id);

    try {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast({ title: "Success", description: "Profile picture updated!" });
      } else {
        toast({ title: "Error", description: data.error || "Upload failed", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    }
  };

  const generateQRCode = async (userId: string) => {
    try {
      const response = await fetch("/api/qr/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()
      if (response.ok) {
        setQrCodeUrl(data.qrCode)
        setUser((prev) => (prev ? { ...prev, qrCode: data.qrCode } : null))
      }
    } catch (error) {
      console.error("Error generating QR code:", error)
    }
  }

  const handleProfileUpdate = async (updatedData: Partial<UserProfile>) => {
    if (!user) return

    setUpdating(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user._id, ...updatedData }),
      })

      const data = await response.json()
      if (response.ok) {
        setUser(data.user)
        setShowEditProfile(false)
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update profile",
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
      setUpdating(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement("a")
      link.href = qrCodeUrl
      link.download = `qr-profile-${user?._id}.png`
      link.click()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <QrCode className="h-12 w-12 text-brand-blue mx-auto mb-4 animate-pulse" />
          <p className="text-white">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-brand-blue p-2 rounded-lg">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Pring</h1>
              <p className="text-gray-400 text-sm">Professional Networking</p>
            </div>
          </div>

          {/* Menu with Edit Profile and Logout */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="b-style">
                <Menu className="h-4 w-4 mr-2" />
                
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900 border-gray-700" align="end">
              <DropdownMenuItem
                onClick={() => setShowEditProfile(true)}
                className="text-white hover:bg-gray-800 cursor-pointer"
              >
                <Edit3 className=" b-style h-4 w-4 mr-2" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-white hover:bg-gray-800 cursor-pointer">
                <LogOut className=" b-style h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className=" border border-gray-800 p-8 rounded-lg mb-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl font-bold mb-2 text-white">{user.name || user.typeOfWork}</h2>
              <p className="text-blue-100 text-lg mb-4">{user.email || user.mobile}</p>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {user.gender && (
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm text-white">{user.gender}</span>
                )}
                {user.dateOfBirth && (
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm text-white">
                    DOB: {new Date(user.dateOfBirth).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Profile Picture and QR Code Side by Side */}
            <div className="flex items-center gap-6">
              {/* Profile Picture */}
              <div className="text-center">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage src={user.profilePicture || "/placeholder.svg"} />
                  <AvatarFallback className="text-3xl bg-black text-white">
                    {user.name?.charAt(0).toUpperCase() ||
                      user.email?.charAt(0).toUpperCase() ||
                      user.mobile?.charAt(0) ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <label className="mt-3 inline-block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                  <Button
                    asChild
                    size="sm"
                    variant="secondary"
                    className="b-style cursor-pointer"
                  >
                    <div>
                      <Camera className="h-4 w-4 mr-2" />
                      Change Photo
                    </div>
                  </Button>
                </label>
              </div>

              {/* QR Code with Profile Picture Overlay */}
              {/* {qrCodeUrl && (
                <div className="text-center">
                  <div className="bg-white p-4 rounded-xl shadow-lg relative">
                    <img src={qrCodeUrl || "/placeholder.svg"} alt="Your QR Code" className="w-32 h-32" />
                    
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                      <Avatar className="h-8 w-8 border-2 border-white">
                        <AvatarImage src={user.profilePicture || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs bg-brand-blue text-white">
                          {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={downloadQRCode}
                      className="bg-white/20 hover:bg-white/30 text-white border-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )} */}
            </div>
          </div>
        </div>

        {/* Main QR Code Content */}
        <QRCodeTab user={user} qrCodeUrl={qrCodeUrl} />

        {/* Edit Profile Modal/Overlay */}
        {showEditProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-black border border-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-black to-gray-800 text-white p-6 rounded-t-lg flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Edit Profile Information
                  </h3>
                  <p className="text-gray-300 mt-1">Update your professional information and social media links</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditProfile(false)}
                  className="b-style"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-8">
                <ProfileForm user={user} onUpdate={handleProfileUpdate} updating={updating} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ProfileForm({
  user,
  onUpdate,
  updating,
}: { user: UserProfile; onUpdate: (data: Partial<UserProfile>) => void; updating: boolean }) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    typeOfWork: user.typeOfWork || "",
    socialLinks: user.socialLinks || {},
    customLinks: user.customLinks || [],
  })

  const [newCustomLink, setNewCustomLink] = useState({ name: "", url: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(formData)
  }

  const addCustomLink = () => {
    if (newCustomLink.name && newCustomLink.url) {
      setFormData((prev) => ({
        ...prev,
        customLinks: [...prev.customLinks, { ...newCustomLink }],
      }))
      setNewCustomLink({ name: "", url: "" })
    }
  }

  const removeCustomLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      customLinks: prev.customLinks.filter((_, i) => i !== index),
    }))
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Professional Information</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white font-medium">
              Full Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Your full name"
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-brand-blue"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="typeOfWork" className="text-white font-medium">
              Type of Work
            </Label>
            <Input
              id="typeOfWork"
              value={formData.typeOfWork}
              onChange={(e) => setFormData((prev) => ({ ...prev, typeOfWork: e.target.value }))}
              placeholder="e.g., Software Engineer, Carpenter, Doctor"
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-brand-blue"
            />
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Social Media Profiles</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="linkedin" className="text-white font-medium">
              LinkedIn Profile
            </Label>
            <Input
              id="linkedin"
              value={formData.socialLinks.linkedin || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, linkedin: e.target.value },
                }))
              }
              placeholder="https://linkedin.com/in/username"
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-brand-blue"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram" className="text-white font-medium">
              Instagram Profile
            </Label>
            <Input
              id="instagram"
              value={formData.socialLinks.instagram || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, instagram: e.target.value },
                }))
              }
              placeholder="https://instagram.com/username"
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-brand-blue"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebook" className="text-white font-medium">
              Facebook Profile
            </Label>
            <Input
              id="facebook"
              value={formData.socialLinks.facebook || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, facebook: e.target.value },
                }))
              }
              placeholder="https://facebook.com/username"
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-brand-blue"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter" className="text-white font-medium">
              Twitter Profile
            </Label>
            <Input
              id="twitter"
              value={formData.socialLinks.twitter || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, twitter: e.target.value },
                }))
              }
              placeholder="https://twitter.com/username"
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-brand-blue"
            />
          </div>
        </div>
      </div>

      {/* Custom Links Section */}
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Other Useful Links</h4>

        {/* Existing Custom Links */}
        {formData.customLinks.length > 0 && (
          <div className="space-y-3">
            {formData.customLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <p className="text-white font-medium">{link.name}</p>
                  <p className="text-gray-400 text-sm truncate">{link.url}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeCustomLink(index)}
                  className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white bg-transparent"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Custom Link */}
        <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
          <h5 className="text-white font-medium">Add Other Link</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customLinkName" className="text-white font-medium">
                Link Name
              </Label>
              <Input
                id="customLinkName"
                value={newCustomLink.name}
                onChange={(e) => setNewCustomLink((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Portfolio, GitHub, Website"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-brand-blue"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customLinkUrl" className="text-white font-medium">
                URL
              </Label>
              <Input
                id="customLinkUrl"
                value={newCustomLink.url}
                onChange={(e) => setNewCustomLink((prev) => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-brand-blue"
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={addCustomLink}
            disabled={!newCustomLink.name || !newCustomLink.url}
            className="b-style"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Link
          </Button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={updating}
        className="w-full b-style py-3 text-lg font-medium"
      >
        {updating ? "Updating Profile..." : "Update Profile"}
      </Button>
    </form>
  )
}

function QRCodeTab({ user, qrCodeUrl }: { user: UserProfile; qrCodeUrl: string }) {
  return (
    <div className=" border border-gray-800 rounded-lg">
      <div className="bg-gradient-to-r from-brand-blue to-blue-600 text-white p-6 rounded-t-lg">
        <h3 className="text-xl font-bold flex items-center">
          <QrCode className="h-5 w-5 mr-2" />
          Your Professional QR Code
        </h3>
        <p className="text-blue-100 mt-1">
          This is your permanent QR code. It will never change, even when you update your profile.
        </p>
      </div>
      <div className="p-8 text-center space-y-8">
        {qrCodeUrl ? (
          <>
            <div className=" p-8 rounded-2xl">
              <div className="relative inline-block">
                <img
                  src={qrCodeUrl || "/placeholder.svg"}
                  alt="Your QR Code"
                  className="mx-auto border-4 border-white rounded-xl shadow-lg"
                  style={{ width: "300px", height: "300px" }}
                />
                {/* Profile Picture Overlay on QR Code */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                    <AvatarImage src={user.profilePicture || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg bg-brand-blue text-white">
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-white font-medium">
                Share this QR code to let others request access to your professional profile
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  className="b-style px-8"
                  onClick={() => {
                    const link = document.createElement("a")
                    link.href = qrCodeUrl
                    link.download = `qr-profile-${user._id}.png`
                    link.click()
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download 
                </Button>

                <Button
                  variant="outline"
                  className="b-style px-8"
                  onClick={() => {
                    const profileLink = `${process.env.NEXT_PUBLIC_APP_URL}/profile/${user._id}`
                    navigator.clipboard.writeText(profileLink)
                    toast({
                      title: "Link Copied!",
                      description: "Profile link copied to clipboard",
                    })
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>

              </div>
            </div>
          </>
        ) : (
          <div className="py-16">
            <QrCode className="h-20 w-20 text-gray-400 mx-auto mb-6" />
            <p className="text-gray-400 text-lg">Generating your QR code...</p>
          </div>
        )}
      </div>
    </div>
  )
}