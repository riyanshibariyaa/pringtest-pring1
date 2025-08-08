// app/approve-access/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Clock, Mail, Phone, Shield, User, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AccessRequestData {
  _id: string
  profileOwner: {
    name: string
    email?: string
    mobile?: string
    typeOfWork: string
  }
  requesterName?: string
  requesterEmail?: string
  requesterMobile?: string
  status: string
  expiresAt: string
  createdAt: string
}

type PageState = "loading" | "pending" | "approved" | "denied" | "expired" | "invalid"

export default function ApproveAccessPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const [state, setState] = useState<PageState>("loading")
  const [requestData, setRequestData] = useState<AccessRequestData | null>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (token) {
      fetchRequestDetails()
    } else {
      setState("invalid")
    }
  }, [token])

  const fetchRequestDetails = async () => {
    try {
      const response = await fetch(`/api/access-request/details?token=${token}`)
      const data = await response.json()

      if (response.ok) {
        setRequestData(data.request)
        setState(data.request.status)
      } else {
        setState("invalid")
        setError(data.error || "Invalid request")
      }
    } catch (err) {
      console.error("Error fetching request details:", err)
      setState("invalid")
      setError("Failed to load request details")
    }
  }

  const handleApprove = async () => {
    if (!token) return
    
    setProcessing(true)
    setError("")

    try {
      const response = await fetch("/api/access-request/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, approve: true }),
      })

      const data = await response.json()

      if (response.ok) {
        setState("approved")
      } else {
        setError(data.error || "Failed to approve request")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const handleDeny = async () => {
    if (!token) return
    
    setProcessing(true)
    setError("")

    try {
      const response = await fetch("/api/access-request/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, approve: false }),
      })

      const data = await response.json()

      if (response.ok) {
        setState("denied")
      } else {
        setError(data.error || "Failed to deny request")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime()
    const expiry = new Date(expiresAt).getTime()
    const diff = expiry - now
    
    if (diff <= 0) return "Expired"
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`
    }
    return `${minutes}m remaining`
  }

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          {state === "pending" && requestData && (
            <PendingRequestView 
              requestData={requestData} 
              onApprove={handleApprove}
              onDeny={handleDeny}
              processing={processing}
              error={error}
              getTimeRemaining={getTimeRemaining}
              formatDate={formatDate}
            />
          )}
          
          {state === "approved" && <ApprovedView />}
          {state === "denied" && <DeniedView />}
          {state === "expired" && <ExpiredView />}
          {state === "invalid" && <InvalidView error={error} />}
        </div>
      </div>
    </div>
  )
}

function PendingRequestView({ 
  requestData, 
  onApprove, 
  onDeny, 
  processing, 
  error,
  getTimeRemaining,
  formatDate
}: {
  requestData: AccessRequestData
  onApprove: () => void
  onDeny: () => void
  processing: boolean
  error: string
  getTimeRemaining: (date: string) => string
  formatDate: (date: string) => string
}) {
  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-brand-blue to-blue-600 text-white">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Shield className="h-8 w-8" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Profile Access Request</CardTitle>
        <CardDescription className="text-blue-100 text-center">
          Someone wants to view your professional profile
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Profile Info */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-brand-blue" />
              Your Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Name:</span>
                <p className="text-brand-dark">{requestData.profileOwner.name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Profile Type:</span>
                <p className="text-brand-dark">{requestData.profileOwner.typeOfWork}</p>
              </div>
            </div>
          </div>

          {/* Requester Info */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-50 border-2 border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-gray-600" />
              Requester Information
            </h3>
            <div className="space-y-3">
              {requestData.requesterName && (
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="font-medium text-gray-600">Name:</span>
                    <span className="ml-2 text-brand-dark">{requestData.requesterName}</span>
                  </div>
                </div>
              )}
              
              {requestData.requesterEmail && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="font-medium text-gray-600">Email:</span>
                    <span className="ml-2 text-brand-dark">{requestData.requesterEmail}</span>
                  </div>
                </div>
              )}
              
              {requestData.requesterMobile && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="font-medium text-gray-600">Mobile:</span>
                    <span className="ml-2 text-brand-dark">{requestData.requesterMobile}</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="font-medium text-gray-600">Requested:</span>
                  <span className="ml-2 text-brand-dark">{formatDate(requestData.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Time Remaining */}
          <div className="flex items-center justify-center">
            <Badge variant="outline" className="px-4 py-2 text-sm">
              <Clock className="h-4 w-4 mr-2" />
              {getTimeRemaining(requestData.expiresAt)}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <Button
              onClick={onApprove}
              disabled={processing}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3"
              size="lg"
            >
              {processing ? "Processing..." : "✅ Approve Access"}
            </Button>
            <Button 
              onClick={onDeny} 
              disabled={processing} 
              variant="outline"
              className="flex-1 py-3"
              size="lg"
            >
              ❌ Deny Access
            </Button>
          </div>

          {/* Security Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <Shield className="inline h-4 w-4 mr-2" />
              <strong>Security Note:</strong> If you approve, the requester will receive an email with a secure link to view your
              profile. The access will automatically expire after 24 hours.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ApprovedView() {
  return (
    <Card className="text-center shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CheckCircle className="h-16 w-16 mx-auto mb-4" />
        <CardTitle className="text-2xl">Access Approved</CardTitle>
        <CardDescription className="text-green-100">
          You have successfully approved the profile access request
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <p className="text-green-800 font-medium">
            ✅ The requester has been notified and can now view your profile for the next 24 hours.
          </p>
          <p className="text-green-700 text-sm mt-2">
            They will receive an email with a secure access link that expires automatically.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function DeniedView() {
  return (
    <Card className="text-center shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
        <XCircle className="h-16 w-16 mx-auto mb-4" />
        <CardTitle className="text-2xl">Access Denied</CardTitle>
        <CardDescription className="text-red-100">
          You have denied the profile access request
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 font-medium">
            ❌ The requester will not be able to view your profile information.
          </p>
          <p className="text-red-700 text-sm mt-2">
            No notification will be sent to the requester about the denial.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function ExpiredView() {
  return (
    <Card className="text-center shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
        <Clock className="h-16 w-16 mx-auto mb-4" />
        <CardTitle className="text-2xl">Request Expired</CardTitle>
        <CardDescription className="text-gray-100">
          This access request has expired and is no longer valid
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <p className="text-gray-600 font-medium">
            ⏰ Access requests expire after 24 hours for security reasons.
          </p>
          <p className="text-gray-600 text-sm mt-2">
            If someone needs access to your profile, they'll need to submit a new request.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function InvalidView({ error }: { error: string }) {
  return (
    <Card className="text-center shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
        <XCircle className="h-16 w-16 mx-auto mb-4" />
        <CardTitle className="text-2xl">Invalid Request</CardTitle>
        <CardDescription className="text-red-100">
          This access request link is invalid or has been tampered with
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 font-medium mb-2">
            🚫 {error || "The request link is invalid"}
          </p>
          <p className="text-red-700 text-sm">
            Please make sure you're using the correct link from the notification email.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// "use client"

// import { useState, useEffect } from "react"
// import { useSearchParams } from "next/navigation"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { CheckCircle, XCircle, Clock, QrCode } from "lucide-react"
// import { toast } from "@/hooks/use-toast"

// interface AccessRequest {
//   id: string
//   profile_id: string
//   status: string
//   created_at: string
//   profileOwner?: {
//     type_of_work: string
//     email: string
//     mobile: string
//   }
// }

// export default function ApproveAccessPage() {
//   const searchParams = useSearchParams()
//   const [loading, setLoading] = useState(true)
//   const [processing, setProcessing] = useState(false)
//   const [accessRequest, setAccessRequest] = useState<AccessRequest | null>(null)
//   const [status, setStatus] = useState<"pending" | "approved" | "denied" | "expired" | "invalid">("pending")

//   const token = searchParams.get("token")

//   useEffect(() => {
//     if (token) {
//       loadAccessRequest()
//     } else {
//       setStatus("invalid")
//       setLoading(false)
//     }
//   }, [token])

//   const loadAccessRequest = async () => {
//     try {
//       const response = await fetch(`/api/access-request/details?token=${token}`)
//       const data = await response.json()

//       if (response.ok) {
//         setAccessRequest(data.request)
//         setStatus(data.request.status)
//       } else {
//         setStatus("invalid")
//         toast({
//           title: "Error",
//           description: data.error || "Invalid access request",
//           variant: "destructive",
//         })
//       }
//     } catch (error) {
//       setStatus("invalid")
//       toast({
//         title: "Error",
//         description: "Failed to load access request",
//         variant: "destructive",
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleApproval = async (approve: boolean) => {
//     if (!token) return

//     setProcessing(true)
//     try {
//       const response = await fetch("/api/access-request/respond", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           token,
//           approve,
//         }),
//       })

//       const data = await response.json()

//       if (response.ok) {
//         setStatus(approve ? "approved" : "denied")
//         toast({
//           title: "Success",
//           description: approve ? "Access approved successfully" : "Access denied",
//         })
//       } else {
//         toast({
//           title: "Error",
//           description: data.error || "Failed to process request",
//           variant: "destructive",
//         })
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Something went wrong. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setProcessing(false)
//     }
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
//           <p>Loading access request...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white border-b">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex items-center space-x-2">
//             <QrCode className="h-8 w-8 text-blue-600" />
//             <span className="text-2xl font-bold">Pring</span>
//           </div>
//         </div>
//       </header>

//       <div className="container mx-auto px-4 py-8 max-w-2xl">
//         {status === "pending" && accessRequest ? (
//           <PendingApprovalView
//             accessRequest={accessRequest}
//             onApprove={() => handleApproval(true)}
//             onDeny={() => handleApproval(false)}
//             processing={processing}
//           />
//         ) : status === "approved" ? (
//           <ApprovedView />
//         ) : status === "denied" ? (
//           <DeniedView />
//         ) : status === "expired" ? (
//           <ExpiredView />
//         ) : (
//           <InvalidView />
//         )}
//       </div>
//     </div>
//   )
// }

// function PendingApprovalView({
//   accessRequest,
//   onApprove,
//   onDeny,
//   processing,
// }: {
//   accessRequest: AccessRequest
//   onApprove: () => void
//   onDeny: () => void
//   processing: boolean
// }) {
//   return (
//     <Card>
//       <CardHeader className="text-center">
//         <Clock className="h-16 w-16 text-blue-500 mx-auto mb-4" />
//         <CardTitle>Profile Access Request</CardTitle>
//         <CardDescription>Someone wants to view your professional profile</CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <h4 className="font-medium text-blue-900 mb-2">Request Details:</h4>
//           <ul className="text-sm text-blue-800 space-y-1">
//             <li>• Profile: {accessRequest.profileOwner?.type_of_work}</li>
//             <li>• Requested: {new Date(accessRequest.created_at).toLocaleString()}</li>
//             <li>• Access Duration: 24 hours (if approved)</li>
//           </ul>
//         </div>

//         <div className="text-center space-y-4">
//           <p className="text-gray-600">Do you want to allow this person to view your profile information?</p>

//           <div className="flex space-x-4 justify-center">
//             <Button onClick={onApprove} disabled={processing} className="px-8">
//               {processing ? "Processing..." : "Approve Access"}
//             </Button>
//             <Button variant="outline" onClick={onDeny} disabled={processing} className="px-8">
//               Deny Access
//             </Button>
//           </div>
//         </div>

//         <div className="bg-gray-50 border rounded-lg p-4">
//           <p className="text-sm text-gray-600">
//             <strong>Note:</strong> If you approve, the requester will receive an email with a secure link to view your
//             profile. The access will automatically expire after 24 hours.
//           </p>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// function ApprovedView() {
//   return (
//     <Card className="text-center">
//       <CardHeader>
//         <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
//         <CardTitle>Access Approved</CardTitle>
//         <CardDescription>You have successfully approved the profile access request</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//           <p className="text-green-800 text-sm">
//             The requester has been notified and can now view your profile for the next 24 hours.
//           </p>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// function DeniedView() {
//   return (
//     <Card className="text-center">
//       <CardHeader>
//         <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
//         <CardTitle>Access Denied</CardTitle>
//         <CardDescription>You have denied the profile access request</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <p className="text-red-800 text-sm">The requester will not be able to view your profile information.</p>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// function ExpiredView() {
//   return (
//     <Card className="text-center">
//       <CardHeader>
//         <Clock className="h-16 w-16 text-gray-500 mx-auto mb-4" />
//         <CardTitle>Request Expired</CardTitle>
//         <CardDescription>This access request has expired and is no longer valid</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
//           <p className="text-gray-600 text-sm">Access requests expire after 24 hours for security reasons.</p>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// function InvalidView() {
//   return (
//     <Card className="text-center">
//       <CardHeader>
//         <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
//         <CardTitle>Invalid Request</CardTitle>
//         <CardDescription>This access request link is invalid or has been tampered with</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <p className="text-red-800 text-sm">
//             Please make sure you're using the correct link from the notification email.
//           </p>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }
