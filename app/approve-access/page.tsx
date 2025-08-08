"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, QrCode } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface AccessRequest {
  id: string
  profile_id: string
  status: string
  created_at: string
  profileOwner?: {
    type_of_work: string
    email: string
    mobile: string
  }
}

export default function ApproveAccessPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [accessRequest, setAccessRequest] = useState<AccessRequest | null>(null)
  const [status, setStatus] = useState<"pending" | "approved" | "denied" | "expired" | "invalid">("pending")

  const token = searchParams.get("token")

  useEffect(() => {
    if (token) {
      loadAccessRequest()
    } else {
      setStatus("invalid")
      setLoading(false)
    }
  }, [token])

  const loadAccessRequest = async () => {
    try {
      const response = await fetch(`/api/access-request/details?token=${token}`)
      const data = await response.json()

      if (response.ok) {
        setAccessRequest(data.request)
        setStatus(data.request.status)
      } else {
        setStatus("invalid")
        toast({
          title: "Error",
          description: data.error || "Invalid access request",
          variant: "destructive",
        })
      }
    } catch (error) {
      setStatus("invalid")
      toast({
        title: "Error",
        description: "Failed to load access request",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (approve: boolean) => {
    if (!token) return

    setProcessing(true)
    try {
      const response = await fetch("/api/access-request/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          approve,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus(approve ? "approved" : "denied")
        toast({
          title: "Success",
          description: approve ? "Access approved successfully" : "Access denied",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to process request",
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
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p>Loading access request...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <QrCode className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">Pring</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {status === "pending" && accessRequest ? (
          <PendingApprovalView
            accessRequest={accessRequest}
            onApprove={() => handleApproval(true)}
            onDeny={() => handleApproval(false)}
            processing={processing}
          />
        ) : status === "approved" ? (
          <ApprovedView />
        ) : status === "denied" ? (
          <DeniedView />
        ) : status === "expired" ? (
          <ExpiredView />
        ) : (
          <InvalidView />
        )}
      </div>
    </div>
  )
}

function PendingApprovalView({
  accessRequest,
  onApprove,
  onDeny,
  processing,
}: {
  accessRequest: AccessRequest
  onApprove: () => void
  onDeny: () => void
  processing: boolean
}) {
  return (
    <Card>
      <CardHeader className="text-center">
        <Clock className="h-16 w-16 text-blue-500 mx-auto mb-4" />
        <CardTitle>Profile Access Request</CardTitle>
        <CardDescription>Someone wants to view your professional profile</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Request Details:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Profile: {accessRequest.profileOwner?.type_of_work}</li>
            <li>• Requested: {new Date(accessRequest.created_at).toLocaleString()}</li>
            <li>• Access Duration: 24 hours (if approved)</li>
          </ul>
        </div>

        <div className="text-center space-y-4">
          <p className="text-gray-600">Do you want to allow this person to view your profile information?</p>

          <div className="flex space-x-4 justify-center">
            <Button onClick={onApprove} disabled={processing} className="px-8">
              {processing ? "Processing..." : "Approve Access"}
            </Button>
            <Button variant="outline" onClick={onDeny} disabled={processing} className="px-8">
              Deny Access
            </Button>
          </div>
        </div>

        <div className="bg-gray-50 border rounded-lg p-4">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> If you approve, the requester will receive an email with a secure link to view your
            profile. The access will automatically expire after 24 hours.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function ApprovedView() {
  return (
    <Card className="text-center">
      <CardHeader>
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <CardTitle>Access Approved</CardTitle>
        <CardDescription>You have successfully approved the profile access request</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">
            The requester has been notified and can now view your profile for the next 24 hours.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function DeniedView() {
  return (
    <Card className="text-center">
      <CardHeader>
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <CardTitle>Access Denied</CardTitle>
        <CardDescription>You have denied the profile access request</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">The requester will not be able to view your profile information.</p>
        </div>
      </CardContent>
    </Card>
  )
}

function ExpiredView() {
  return (
    <Card className="text-center">
      <CardHeader>
        <Clock className="h-16 w-16 text-gray-500 mx-auto mb-4" />
        <CardTitle>Request Expired</CardTitle>
        <CardDescription>This access request has expired and is no longer valid</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Access requests expire after 24 hours for security reasons.</p>
        </div>
      </CardContent>
    </Card>
  )
}

function InvalidView() {
  return (
    <Card className="text-center">
      <CardHeader>
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <CardTitle>Invalid Request</CardTitle>
        <CardDescription>This access request link is invalid or has been tampered with</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            Please make sure you're using the correct link from the notification email.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
