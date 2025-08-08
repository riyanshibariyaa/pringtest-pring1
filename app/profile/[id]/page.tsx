// STEP 1: Update your app/profile/[id]/page.tsx with this COMPLETE replacement

"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase,
  Calendar,
  Globe,
  Linkedin,
  Instagram,
  Facebook,
  Twitter,
  ExternalLink,
  User
} from "lucide-react"
import ContactRequestForm from "@/components/ContactRequestForm"
import { useToast } from "@/hooks/use-toast"

interface Profile {
  _id: string
  name: string
  email?: string
  mobile?: string
  dateOfBirth?: string
  gender?: string
  typeOfWork: string
  bio?: string
  profilePicture?: string
  department?: string
  position?: string
  socialLinks?: {
    linkedin?: string
    instagram?: string
    facebook?: string
    twitter?: string
    website?: string
  }
  customLinks?: Array<{
    name: string
    url: string
  }>
}

type AccessStatus = "loading" | "need_request" | "pending" | "approved" | "denied" | "expired"

export default function ProfilePage() {
  const { toast } = useToast()
  const params = useParams()
  const searchParams = useSearchParams()
  const profileId = params.id as string
  const token = searchParams.get("token")
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [accessStatus, setAccessStatus] = useState<AccessStatus>("loading")
  const [showContactForm, setShowContactForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    checkAccess()
  }, [profileId, token])

  const checkAccess = async () => {
    try {
      setLoading(true)
      
      if (token) {
        // User has a token, verify it
        const response = await fetch(`/api/profile/view?id=${profileId}&token=${token}`)
        const data = await response.json()

        if (response.ok) {
          setProfile(data.profile)
          setAccessStatus("approved")
        } else if (response.status === 403) {
          setAccessStatus("expired")
        } else {
          setAccessStatus("need_request")
        }
      } else {
        // NO TOKEN = ALWAYS REQUIRE REQUEST
        // This forces ALL profiles to be private
        setAccessStatus("need_request")
      }
    } catch (err) {
      console.error("Error checking access:", err)
      setError("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleRequestAccess = () => {
    setShowContactForm(true)
  }

  const handleRequestSubmitted = () => {
    setShowContactForm(false)
    setAccessStatus("pending")
    toast({
      title: "Request Sent",
      description: "The profile owner will receive an email notification about your request.",
    })
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "linkedin": return <Linkedin className="h-5 w-5" />
      case "instagram": return <Instagram className="h-5 w-5" />
      case "facebook": return <Facebook className="h-5 w-5" />
      case "twitter": return <Twitter className="h-5 w-5" />
      case "website": return <Globe className="h-5 w-5" />
      default: return <ExternalLink className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <Card className="text-center max-w-md">
          <CardHeader>
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {accessStatus === "approved" && profile && (
            <ProfileView profile={profile} />
          )}
          
          {accessStatus === "need_request" && (
            <RequestAccessView onRequestAccess={handleRequestAccess} />
          )}
          
          {accessStatus === "pending" && (
            <PendingAccessView />
          )}
          
          {accessStatus === "denied" && (
            <DeniedAccessView />
          )}
          
          {accessStatus === "expired" && (
            <ExpiredAccessView onRequestAccess={handleRequestAccess} />
          )}
        </div>
      </div>

      {showContactForm && (
        <ContactRequestForm
          profileId={profileId}
          profileOwnerName={profile?.name}
          onRequestSubmitted={handleRequestSubmitted}
          onCancel={() => setShowContactForm(false)}
        />
      )}
    </div>
  )
}

function ProfileView({ profile }: { profile: Profile }) {
  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "linkedin": return <Linkedin className="h-5 w-5" />
      case "instagram": return <Instagram className="h-5 w-5" />
      case "facebook": return <Facebook className="h-5 w-5" />
      case "twitter": return <Twitter className="h-5 w-5" />
      case "website": return <Globe className="h-5 w-5" />
      default: return <ExternalLink className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="overflow-hidden shadow-xl border-0">
        <div className="bg-gradient-to-r from-brand-blue to-indigo-600 p-8 text-white">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={profile.profilePicture || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl bg-white text-brand-blue">
                {profile.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
              <p className="text-blue-100 text-lg mb-2">{profile.typeOfWork}</p>
              {profile.department && profile.position && (
                <p className="text-blue-200">
                  {profile.position} • {profile.department}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Bio Section */}
      {profile.bio && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.email && (
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-brand-blue" />
              <a href={`mailto:${profile.email}`} className="text-brand-blue hover:underline">
                {profile.email}
              </a>
            </div>
          )}
          
          {profile.mobile && (
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-brand-blue" />
              <a href={`tel:${profile.mobile}`} className="text-brand-blue hover:underline">
                {profile.mobile}
              </a>
            </div>
          )}

          {profile.dateOfBirth && (
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-brand-blue" />
              <span className="text-gray-700">
                {new Date(profile.dateOfBirth).toLocaleDateString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Links */}
      {profile.socialLinks && Object.values(profile.socialLinks).some(link => link) && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Social Media & Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="flex-1 min-w-0">
                      <span className="capitalize font-semibold text-brand-dark block">
                        {platform === "website" ? "Website" : platform}
                      </span>
                      <p className="text-sm text-gray-600 truncate">{url}</p>
                    </div>
                  </a>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Links */}
      {profile.customLinks && profile.customLinks.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Other Useful Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.customLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-xl hover:border-brand-blue hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="p-3 bg-gray-100 text-gray-600 rounded-lg group-hover:bg-brand-blue group-hover:text-white transition-colors">
                    <ExternalLink className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-brand-dark block">{link.name}</span>
                    <p className="text-sm text-gray-600 truncate">{link.url}</p>
                  </div>
                </a>
              ))}
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

function RequestAccessView({ onRequestAccess }: { onRequestAccess: () => void }) {
  return (
    <Card className="text-center shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-brand-blue to-blue-600 text-white">
        <Shield className="h-16 w-16 mx-auto mb-4" />
        <CardTitle className="text-2xl">🔒 Protected Profile</CardTitle>
        <CardDescription className="text-blue-100">
          This profile is protected. You need permission from the owner to view their information.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <p className="text-brand-dark font-medium mb-4">
              To request access, you'll need to provide your contact information so the profile owner can approve your request.
            </p>
            <ul className="text-sm text-gray-600 space-y-2 text-left max-w-md mx-auto">
              <li>✅ Your contact info is shared only with the profile owner</li>
              <li>✅ The owner will receive an email notification</li>
              <li>✅ Access expires automatically after 24 hours</li>
              <li>✅ You'll be notified when your request is approved</li>
            </ul>
          </div>
          
          <Button 
            onClick={onRequestAccess}
            size="lg"
            className="bg-brand-blue hover:bg-blue-700 text-white px-8 py-3"
          >
            🔓 Request Access
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function PendingAccessView() {
  return (
    <Card className="text-center shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
        <Clock className="h-16 w-16 mx-auto mb-4" />
        <CardTitle className="text-2xl">⏳ Access Request Pending</CardTitle>
        <CardDescription className="text-yellow-100">
          Your request to view this profile has been sent to the owner.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6">
          <p className="text-brand-dark font-medium">
            The profile owner will receive an email notification about your request. Please wait for their approval.
          </p>
          <p className="text-sm text-gray-600 mt-3">
            You'll receive an email with an access link once your request is approved.
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
        <CardTitle className="text-2xl">❌ Access Denied</CardTitle>
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

function ExpiredAccessView({ onRequestAccess }: { onRequestAccess: () => void }) {
  return (
    <Card className="text-center shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
        <Clock className="h-16 w-16 mx-auto mb-4" />
        <CardTitle className="text-2xl">⏰ Access Expired</CardTitle>
        <CardDescription className="text-gray-100">
          Your access to this profile has expired for security reasons.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <div className="bg-gradient-to-r from-gray-50 to-gray-50 border-2 border-gray-200 rounded-xl p-6">
          <p className="text-brand-dark font-medium mb-4">
            Profile access automatically expires after 24 hours. You can request access again if needed.
          </p>
          <Button 
            onClick={onRequestAccess}
            className="bg-brand-blue hover:bg-blue-700 text-white"
          >
            🔓 Request New Access
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
// // app/profile/[id]/page.tsx
// "use client"

// import { useEffect, useState } from "react"
// import { useParams, useSearchParams } from "next/navigation"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { 
//   Shield, 
//   Clock, 
//   CheckCircle, 
//   XCircle, 
//   Mail, 
//   Phone, 
//   MapPin, 
//   Briefcase,
//   Calendar,
//   Globe,
//   Linkedin,
//   Instagram,
//   Facebook,
//   Twitter,
//   ExternalLink
// } from "lucide-react"
// import ContactRequestForm from "@/components/ContactRequestForm"

// interface Profile {
//   _id: string
//   name: string
//   email?: string
//   mobile?: string
//   dateOfBirth?: string
//   gender?: string
//   typeOfWork: string
//   bio?: string
//   profilePicture?: string
//   department?: string
//   position?: string
//   socialLinks?: {
//     linkedin?: string
//     instagram?: string
//     facebook?: string
//     twitter?: string
//     website?: string
//   }
//   customLinks?: Array<{
//     name: string
//     url: string
//   }>
// }

// type AccessStatus = "loading" | "need_request" | "pending" | "approved" | "denied" | "expired"

// export default function ProfilePage() {
//   const params = useParams()
//   const searchParams = useSearchParams()
//   const profileId = params.id as string
//   const token = searchParams.get("token")
  
//   const [profile, setProfile] = useState<Profile | null>(null)
//   const [accessStatus, setAccessStatus] = useState<AccessStatus>("loading")
//   const [showContactForm, setShowContactForm] = useState(false)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState("")

//   useEffect(() => {
//     checkAccess()
//   }, [profileId, token])

//   const checkAccess = async () => {
//     try {
//       setLoading(true)
      
//       if (token) {
//         // User has a token, verify it
//         const response = await fetch(`/api/profile/view?id=${profileId}&token=${token}`)
//         const data = await response.json()

//         if (response.ok) {
//           setProfile(data.profile)
//           setAccessStatus("approved")
//         } else if (response.status === 403) {
//           setAccessStatus("expired")
//         } else {
//           setAccessStatus("need_request")
//         }
//       } else {
//         // No token, check if profile is public or needs request
//         const response = await fetch(`/api/profile/public?id=${profileId}`)
        
//         if (response.ok) {
//           const data = await response.json()
//           if (data.isPublic) {
//             setProfile(data.profile)
//             setAccessStatus("approved")
//           } else {
//             setAccessStatus("need_request")
//           }
//         } else {
//           setError("Profile not found")
//         }
//       }
//     } catch (err) {
//       console.error("Error checking access:", err)
//       setError("Failed to load profile")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleRequestAccess = () => {
//     setShowContactForm(true)
//   }

//   const handleRequestSubmitted = () => {
//     setShowContactForm(false)
//     setAccessStatus("pending")
//   }

//   const getSocialIcon = (platform: string) => {
//     switch (platform) {
//       case "linkedin": return <Linkedin className="h-5 w-5" />
//       case "instagram": return <Instagram className="h-5 w-5" />
//       case "facebook": return <Facebook className="h-5 w-5" />
//       case "twitter": return <Twitter className="h-5 w-5" />
//       case "website": return <Globe className="h-5 w-5" />
//       default: return <ExternalLink className="h-5 w-5" />
//     }
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
//         <Card className="text-center max-w-md">
//           <CardHeader>
//             <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
//             <CardTitle>Error</CardTitle>
//             <CardDescription>{error}</CardDescription>
//           </CardHeader>
//         </Card>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-4xl mx-auto">
//           {accessStatus === "approved" && profile && (
//             <ProfileView profile={profile} />
//           )}
          
//           {accessStatus === "need_request" && (
//             <RequestAccessView onRequestAccess={handleRequestAccess} />
//           )}
          
//           {accessStatus === "pending" && (
//             <PendingAccessView />
//           )}
          
//           {accessStatus === "denied" && (
//             <DeniedAccessView />
//           )}
          
//           {accessStatus === "expired" && (
//             <ExpiredAccessView />
//           )}
//         </div>
//       </div>

//       {showContactForm && (
//         <ContactRequestForm
//           profileId={profileId}
//           profileOwnerName={profile?.name}
//           onRequestSubmitted={handleRequestSubmitted}
//           onCancel={() => setShowContactForm(false)}
//         />
//       )}
//     </div>
//   )
// }

// function ProfileView({ profile }: { profile: Profile }) {
//   return (
//     <div className="space-y-6">
//       {/* Header Card */}
//       <Card className="overflow-hidden shadow-xl border-0">
//         <div className="bg-gradient-to-r from-brand-blue to-indigo-600 p-8 text-white">
//           <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
//             <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
//               <AvatarImage src={profile.profilePicture || "/placeholder.svg"} />
//               <AvatarFallback className="text-2xl bg-white text-brand-blue">
//                 {profile.name?.charAt(0)?.toUpperCase() || "U"}
//               </AvatarFallback>
//             </Avatar>
            
//             <div className="text-center md:text-left flex-1">
//               <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
//               <p className="text-blue-100 text-lg mb-2">{profile.typeOfWork}</p>
//               {profile.department && profile.position && (
//                 <p className="text-blue-200">
//                   {profile.position} • {profile.department}
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//       </Card>

//       {/* Bio Section */}
//       {profile.bio && (
//         <Card className="shadow-lg">
//           <CardHeader>
//             <CardTitle>About</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
//           </CardContent>
//         </Card>
//       )}

//       {/* Contact Information */}
//       <Card className="shadow-lg">
//         <CardHeader>
//           <CardTitle>Contact Information</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {profile.email && (
//             <div className="flex items-center space-x-3">
//               <Mail className="h-5 w-5 text-brand-blue" />
//               <a href={`mailto:${profile.email}`} className="text-brand-blue hover:underline">
//                 {profile.email}
//               </a>
//             </div>
//           )}
          
//           {profile.mobile && (
//             <div className="flex items-center space-x-3">
//               <Phone className="h-5 w-5 text-brand-blue" />
//               <a href={`tel:${profile.mobile}`} className="text-brand-blue hover:underline">
//                 {profile.mobile}
//               </a>
//             </div>
//           )}

//           {profile.dateOfBirth && (
//             <div className="flex items-center space-x-3">
//               <Calendar className="h-5 w-5 text-brand-blue" />
//               <span className="text-gray-700">
//                 {new Date(profile.dateOfBirth).toLocaleDateString()}
//               </span>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Social Links */}
//       {profile.socialLinks && Object.values(profile.socialLinks).some(link => link) && (
//         <Card className="shadow-lg">
//           <CardHeader>
//             <CardTitle>Social Media & Links</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {Object.entries(profile.socialLinks).map(([platform, url]) => {
//                 if (!url) return null
//                 return (
//                   <a
//                     key={platform}
//                     href={url}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-xl hover:border-brand-blue hover:bg-blue-50 transition-all duration-200 group"
//                   >
//                     <div className="p-3 bg-brand-blue text-white rounded-lg group-hover:bg-blue-600 transition-colors">
//                       {getSocialIcon(platform)}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <span className="capitalize font-semibold text-brand-dark block">
//                         {platform === "website" ? "Website" : platform}
//                       </span>
//                       <p className="text-sm text-gray-600 truncate">{url}</p>
//                     </div>
//                   </a>
//                 )
//               })}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Custom Links */}
//       {profile.customLinks && profile.customLinks.length > 0 && (
//         <Card className="shadow-lg">
//           <CardHeader>
//             <CardTitle>Other Useful Links</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {profile.customLinks.map((link, index) => (
//                 <a
//                   key={index}
//                   href={link.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-xl hover:border-brand-blue hover:bg-blue-50 transition-all duration-200 group"
//                 >
//                   <div className="p-3 bg-gray-100 text-gray-600 rounded-lg group-hover:bg-brand-blue group-hover:text-white transition-colors">
//                     <ExternalLink className="h-5 w-5" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <span className="font-semibold text-brand-dark block">{link.name}</span>
//                     <p className="text-sm text-gray-600 truncate">{link.url}</p>
//                   </div>
//                 </a>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Access Status */}
//       <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
//         <div className="flex items-center space-x-3">
//           <CheckCircle className="h-6 w-6" />
//           <div>
//             <h3 className="font-semibold text-lg">Access Granted</h3>
//             <p className="text-green-100">
//               You have been granted access to view this profile. Access expires in 24 hours.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// function RequestAccessView({ onRequestAccess }: { onRequestAccess: () => void }) {
//   return (
//     <Card className="text-center shadow-xl border-0">
//       <CardHeader className="bg-gradient-to-r from-brand-blue to-blue-600 text-white">
//         <Shield className="h-16 w-16 mx-auto mb-4" />
//         <CardTitle className="text-2xl">Protected Profile</CardTitle>
//         <CardDescription className="text-blue-100">
//           This profile is protected. You need permission from the owner to view their information.
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="p-8">
//         <div className="space-y-6">
//           <div className="bg-gradient-to-r from-blue-50 to-blue-50 border-2 border-blue-200 rounded-xl p-6">
//             <p className="text-brand-dark font-medium mb-4">
//               To request access, you'll need to provide your contact information so the profile owner can approve your request.
//             </p>
//             <ul className="text-sm text-gray-600 space-y-2 text-left max-w-md mx-auto">
//               <li>✅ Your contact info is shared only with the profile owner</li>
//               <li>✅ The owner will receive an email notification</li>
//               <li>✅ Access expires automatically after 24 hours</li>
//               <li>✅ You'll be notified when your request is approved</li>
//             </ul>
//           </div>
          
//           <Button 
//             onClick={onRequestAccess}
//             size="lg"
//             className="bg-brand-blue hover:bg-blue-700"
//           >
//             Request Access
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// function PendingAccessView() {
//   return (
//     <Card className="text-center shadow-xl border-0">
//       <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
//         <Clock className="h-16 w-16 mx-auto mb-4" />
//         <CardTitle className="text-2xl">Access Request Pending</CardTitle>
//         <CardDescription className="text-yellow-100">
//           Your request to view this profile has been sent to the owner.
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="p-8">
//         <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6">
//           <p className="text-brand-dark font-medium">
//             The profile owner will receive an email notification about your request. Please wait for their approval.
//           </p>
//           <p className="text-sm text-gray-600 mt-3">
//             You'll receive an email with an access link once your request is approved.
//           </p>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// function DeniedAccessView() {
//   return (
//     <Card className="text-center shadow-xl border-0">
//       <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
//         <XCircle className="h-16 w-16 mx-auto mb-4" />
//         <CardTitle className="text-2xl">Access Denied</CardTitle>
//         <CardDescription className="text-red-100">
//           Your request to view this profile has been denied or the access link has expired.
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="p-8">
//         <div className="bg-gradient-to-r from-red-50 to-red-50 border-2 border-red-200 rounded-xl p-6">
//           <p className="text-brand-dark font-medium">
//             The profile owner has not approved your request or the access token is invalid.
//           </p>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// function ExpiredAccessView() {
//   return (
//     <Card className="text-center shadow-xl border-0">
//       <CardHeader className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
//         <Clock className="h-16 w-16 mx-auto mb-4" />
//         <CardTitle className="text-2xl">Access Expired</CardTitle>
//         <CardDescription className="text-gray-100">
//           Your access to this profile has expired for security reasons.
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="p-8">
//         <div className="bg-gradient-to-r from-gray-50 to-gray-50 border-2 border-gray-200 rounded-xl p-6">
//           <p className="text-brand-dark font-medium mb-4">
//             Profile access automatically expires after 24 hours. You can request access again if needed.
//           </p>
//           <Button 
//             onClick={() => window.location.reload()}
//             className="bg-brand-blue hover:bg-blue-700"
//           >
//             Request New Access
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }
// // "use client"

// // import { useState, useEffect } from "react"
// // import { useParams, useSearchParams } from "next/navigation"
// // import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// // import { Button } from "@/components/ui/button"
// // import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// // import { Badge } from "@/components/ui/badge"
// // import {
// //   QrCode,
// //   Shield,
// //   Clock,
// //   CheckCircle,
// //   XCircle,
// //   Linkedin,
// //   Instagram,
// //   Facebook,
// //   Twitter,
// //   Mail,
// //   Phone,
// //   Calendar,
// //   User,
// // } from "lucide-react"
// // import { toast } from "@/hooks/use-toast"

// // interface ProfileData {
// //   _id: string
// //   email: string
// //   mobile: string
// //   typeOfWork: string
// //   dateOfBirth: string
// //   gender: string
// //   profilePicture?: string
// //   socialLinks?: {
// //     linkedin?: string
// //     instagram?: string
// //     facebook?: string
// //     twitter?: string
// //   }
// // }

// // export default function ProfileViewPage() {
// //   const params = useParams()
// //   const searchParams = useSearchParams()
// //   const [profile, setProfile] = useState<ProfileData | null>(null)
// //   const [loading, setLoading] = useState(true)
// //   const [accessStatus, setAccessStatus] = useState<"pending" | "approved" | "denied" | null>(null)
// //   const [requestSent, setRequestSent] = useState(false)

// //   const profileId = params.id as string
// //   const token = searchParams.get("token")

// //   useEffect(() => {
// //     if (token) {
// //       // Direct access with approval token
// //       loadProfileWithToken()
// //     } else {
// //       // Request access
// //       checkAccessStatus()
// //     }
// //   }, [profileId, token])

// //   const loadProfileWithToken = async () => {
// //     try {
// //       const response = await fetch(`/api/profile/view?id=${profileId}&token=${token}`)
// //       const data = await response.json()

// //       if (response.ok) {
// //         setProfile(data.profile)
// //         setAccessStatus("approved")
// //       } else {
// //         setAccessStatus("denied")
// //         toast({
// //           title: "Access Denied",
// //           description: data.error || "Invalid or expired access token",
// //           variant: "destructive",
// //         })
// //       }
// //     } catch (error) {
// //       setAccessStatus("denied")
// //       toast({
// //         title: "Error",
// //         description: "Failed to load profile",
// //         variant: "destructive",
// //       })
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   const checkAccessStatus = async () => {
// //     try {
// //       const response = await fetch(`/api/profile/access-status?id=${profileId}`)
// //       const data = await response.json()

// //       if (response.ok) {
// //         setAccessStatus(data.status)
// //         if (data.status === "approved") {
// //           setProfile(data.profile)
// //         }
// //       }
// //     } catch (error) {
// //       console.error("Error checking access status:", error)
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   const requestAccess = async () => {
// //     setLoading(true)
// //     try {
// //       const response = await fetch("/api/profile/request-access", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({ profileId }),
// //       })

// //       const data = await response.json()

// //       if (response.ok) {
// //         setRequestSent(true)
// //         setAccessStatus("pending")
// //         toast({
// //           title: "Request Sent",
// //           description: "Access request has been sent to the profile owner",
// //         })
// //       } else {
// //         toast({
// //           title: "Error",
// //           description: data.error || "Failed to send access request",
// //           variant: "destructive",
// //         })
// //       }
// //     } catch (error) {
// //       toast({
// //         title: "Error",
// //         description: "Something went wrong. Please try again.",
// //         variant: "destructive",
// //       })
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
// //         <div className="text-center">
// //           <QrCode className="h-12 w-12 text-brand-blue mx-auto mb-4 animate-pulse" />
// //           <p className="text-brand-dark">Loading profile...</p>
// //         </div>
// //       </div>
// //     )
// //   }

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
// //       {/* Header */}
// //       <header className="bg-brand-dark shadow-lg">
// //         <div className="container mx-auto px-4 py-4">
// //           <div className="flex items-center space-x-3">
// //             <div className="bg-brand-blue p-2 rounded-lg">
// //               <QrCode className="h-6 w-6 text-white" />
// //             </div>
// //             <div>
// //               <h1 className="text-xl font-bold text-white">Pring</h1>
// //               <p className="text-gray-300 text-sm">Professional Networking</p>
// //             </div>
// //           </div>
// //         </div>
// //       </header>

// //       <div className="container mx-auto px-4 py-8 max-w-4xl">
// //         {accessStatus === "approved" && profile ? (
// //           <ApprovedProfileView profile={profile} />
// //         ) : accessStatus === "pending" ? (
// //           <PendingAccessView />
// //         ) : accessStatus === "denied" ? (
// //           <DeniedAccessView />
// //         ) : (
// //           <RequestAccessView onRequestAccess={requestAccess} requestSent={requestSent} />
// //         )}
// //       </div>
// //     </div>
// //   )
// // }

// // function ApprovedProfileView({ profile }: { profile: ProfileData }) {
// //   const getSocialIcon = (platform: string) => {
// //     switch (platform) {
// //       case "linkedin":
// //         return <Linkedin className="h-5 w-5" />
// //       case "instagram":
// //         return <Instagram className="h-5 w-5" />
// //       case "facebook":
// //         return <Facebook className="h-5 w-5" />
// //       case "twitter":
// //         return <Twitter className="h-5 w-5" />
// //       default:
// //         return null
// //     }
// //   }

// //   return (
// //     <div className="space-y-8">
// //       {/* Profile Header */}
// //       <Card className="overflow-hidden border-0 shadow-xl">
// //         <div className="bg-gradient-to-r from-brand-blue to-blue-600 p-8 text-white">
// //           <div className="flex flex-col md:flex-row items-center gap-8">
// //             <Avatar className="h-40 w-40 border-4 border-white shadow-lg">
// //               <AvatarImage src={profile.profilePicture || "/placeholder.svg"} />
// //               <AvatarFallback className="text-5xl bg-brand-dark text-white">
// //                 {profile.email?.charAt(0).toUpperCase() || "U"}
// //               </AvatarFallback>
// //             </Avatar>
// //             <div className="text-center md:text-left flex-1">
// //               <h1 className="text-4xl font-bold mb-3">{profile.typeOfWork}</h1>
// //               <div className="space-y-2 text-blue-100">
// //                 {profile.email && (
// //                   <div className="flex items-center justify-center md:justify-start gap-2">
// //                     <Mail className="h-4 w-4" />
// //                     <span>{profile.email}</span>
// //                   </div>
// //                 )}
// //                 {profile.mobile && (
// //                   <div className="flex items-center justify-center md:justify-start gap-2">
// //                     <Phone className="h-4 w-4" />
// //                     <span>{profile.mobile}</span>
// //                   </div>
// //                 )}
// //                 <div className="flex items-center justify-center md:justify-start gap-2">
// //                   <Calendar className="h-4 w-4" />
// //                   <span>Born: {new Date(profile.dateOfBirth).toLocaleDateString()}</span>
// //                 </div>
// //                 <div className="flex items-center justify-center md:justify-start gap-2">
// //                   <User className="h-4 w-4" />
// //                   <span>{profile.gender}</span>
// //                 </div>
// //               </div>
// //               <Badge className="mt-4 bg-white/20 hover:bg-white/30 text-white border-0">
// //                 <CheckCircle className="h-4 w-4 mr-2" />
// //                 Verified Profile
// //               </Badge>
// //             </div>
// //           </div>
// //         </div>
// //       </Card>

// //       {/* Social Media Links */}
// //       {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
// //         <Card className="shadow-xl border-0">
// //           <CardHeader className="bg-gradient-to-r from-brand-dark to-gray-700 text-white">
// //             <CardTitle className="flex items-center">
// //               <User className="h-5 w-5 mr-2" />
// //               Social Media Profiles
// //             </CardTitle>
// //           </CardHeader>
// //           <CardContent className="p-8">
// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //               {Object.entries(profile.socialLinks).map(([platform, url]) => {
// //                 if (!url) return null
// //                 return (
// //                   <a
// //                     key={platform}
// //                     href={url}
// //                     target="_blank"
// //                     rel="noopener noreferrer"
// //                     className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-xl hover:border-brand-blue hover:bg-blue-50 transition-all duration-200 group"
// //                   >
// //                     <div className="p-3 bg-brand-blue text-white rounded-lg group-hover:bg-blue-600 transition-colors">
// //                       {getSocialIcon(platform)}
// //                     </div>
// //                     <div>
// //                       <span className="capitalize font-semibold text-brand-dark">{platform}</span>
// //                       <p className="text-sm text-gray-600 truncate max-w-48">{url}</p>
// //                     </div>
// //                   </a>
// //                 )
// //               })}
// //             </div>
// //           </CardContent>
// //         </Card>
// //       )}

// //       {/* Access Status */}
// //       <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
// //         <div className="flex items-center space-x-3">
// //           <CheckCircle className="h-6 w-6" />
// //           <div>
// //             <h3 className="font-semibold text-lg">Access Granted</h3>
// //             <p className="text-green-100">
// //               You have been granted access to view this profile. Access expires in 24 hours.
// //             </p>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }

// // function PendingAccessView() {
// //   return (
// //     <Card className="text-center shadow-xl border-0">
// //       <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
// //         <Clock className="h-16 w-16 mx-auto mb-4" />
// //         <CardTitle className="text-2xl">Access Request Pending</CardTitle>
// //         <CardDescription className="text-yellow-100">
// //           Your request to view this profile has been sent to the owner.
// //         </CardDescription>
// //       </CardHeader>
// //       <CardContent className="p-8">
// //         <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6">
// //           <p className="text-brand-dark font-medium">
// //             The profile owner will receive an email and SMS notification about your request. Please wait for their
// //             approval.
// //           </p>
// //         </div>
// //       </CardContent>
// //     </Card>
// //   )
// // }

// // function DeniedAccessView() {
// //   return (
// //     <Card className="text-center shadow-xl border-0">
// //       <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
// //         <XCircle className="h-16 w-16 mx-auto mb-4" />
// //         <CardTitle className="text-2xl">Access Denied</CardTitle>
// //         <CardDescription className="text-red-100">
// //           Your request to view this profile has been denied or the access link has expired.
// //         </CardDescription>
// //       </CardHeader>
// //       <CardContent className="p-8">
// //         <div className="bg-gradient-to-r from-red-50 to-red-50 border-2 border-red-200 rounded-xl p-6">
// //           <p className="text-brand-dark font-medium">
// //             The profile owner has not approved your request or the access token is invalid.
// //           </p>
// //         </div>
// //       </CardContent>
// //     </Card>
// //   )
// // }

// // function RequestAccessView({ onRequestAccess, requestSent }: { onRequestAccess: () => void; requestSent: boolean }) {
// //   return (
// //     <Card className="text-center shadow-xl border-0">
// //       <CardHeader className="bg-gradient-to-r from-brand-blue to-blue-600 text-white">
// //         <Shield className="h-16 w-16 mx-auto mb-4" />
// //         <CardTitle className="text-2xl">Protected Profile</CardTitle>
// //         <CardDescription className="text-blue-100">
// //           This profile is protected. You need permission from the owner to view their information.
// //         </CardDescription>
// //       </CardHeader>
// //       <CardContent className="p-8 space-y-8">
// //         <div className="bg-gradient-to-r from-brand-blue to-blue-600 text-white p-6 rounded-xl">
// //           <h4 className="font-semibold mb-4 flex items-center justify-center">
// //             <Shield className="h-5 w-5 mr-2" />
// //             How it works:
// //           </h4>
// //           <ul className="space-y-3 text-blue-100">
// //             <li className="flex items-start">
// //               <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
// //                 1
// //               </span>
// //               Click "Request Access" below
// //             </li>
// //             <li className="flex items-start">
// //               <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
// //                 2
// //               </span>
// //               The profile owner will receive a notification
// //             </li>
// //             <li className="flex items-start">
// //               <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
// //                 3
// //               </span>
// //               If approved, you'll get access for 24 hours
// //             </li>
// //             <li className="flex items-start">
// //               <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
// //                 4
// //               </span>
// //               You'll receive an email with the access link
// //             </li>
// //           </ul>
// //         </div>

// //         {!requestSent ? (
// //           <Button onClick={onRequestAccess} size="lg" className="b-style px-12 py-4 text-lg">
// //             Request Access to Profile
// //           </Button>
// //         ) : (
// //           <div className="space-y-4">
// //             <Button disabled size="lg" className="b-style px-12 py-4 text-lg">
// //               Request Sent ✓
// //             </Button>
// //             <p className="text-brand-dark font-medium">Check your email for updates on your request</p>
// //           </div>
// //         )}
// //       </CardContent>
// //     </Card>
// //   )
// // }
