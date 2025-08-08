"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from "lucide-react"

export default function PaymentFailurePage() {
  const searchParams = useSearchParams()
  const [error, setError] = useState("")
  const [txnId, setTxnId] = useState("")

  useEffect(() => {
    const errorParam = searchParams.get("error")
    const txnIdParam = searchParams.get("txnid")

    setError(errorParam || "Payment failed")
    setTxnId(txnIdParam || "")
  }, [searchParams])

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "hash_mismatch":
        return "Payment verification failed. Please try again."
      case "payment_failed":
        return "Payment was not completed successfully."
      case "processing_error":
        return "There was an error processing your payment."
      default:
        return errorCode || "Payment failed. Please try again."
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-white/5 border-white/10 glass backdrop-blur-lg">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-6 w-20 h-20 bg-red-500 rounded-full flex items-center justify-center animate-scale-in">
            <XCircle className="h-12 w-12 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-white mb-2">Payment Failed</CardTitle>
          <p className="text-white/70 text-lg">We couldn't process your payment</p>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Error Details */}
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl">
            <h3 className="text-red-400 font-semibold mb-2">Error Details</h3>
            <p className="text-white/80">{getErrorMessage(error)}</p>
            {txnId && <p className="text-white/60 text-sm mt-2">Transaction ID: {txnId}</p>}
          </div>

          {/* Common Issues */}
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">Common Issues & Solutions</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="bg-brand-blue rounded-full w-6 h-6 flex items-center justify-center text-white font-semibold text-xs mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-white font-medium">Insufficient Balance</p>
                  <p className="text-white/70 text-sm">Check your account balance or try a different payment method</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="bg-brand-blue rounded-full w-6 h-6 flex items-center justify-center text-white font-semibold text-xs mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-white font-medium">Network Issues</p>
                  <p className="text-white/70 text-sm">Check your internet connection and try again</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="bg-brand-blue rounded-full w-6 h-6 flex items-center justify-center text-white font-semibold text-xs mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-white font-medium">Card Declined</p>
                  <p className="text-white/70 text-sm">Contact your bank or try a different card</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="bg-brand-blue rounded-full w-6 h-6 flex items-center justify-center text-white font-semibold text-xs mt-0.5">
                  4
                </div>
                <div>
                  <p className="text-white font-medium">Session Timeout</p>
                  <p className="text-white/70 text-sm">The payment session may have expired. Please try again</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/corporate/register" className="flex-1">
              <Button className="w-full py-4 text-lg bg-gradient-blue hover:shadow-glow-lg transition-all duration-300 hover-lift">
                <RefreshCw className="h-5 w-5 mr-2" />
                Try Again
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button
                variant="outline"
                className="w-full py-4 text-lg border-white/20 text-white hover:bg-white/10 transition-all duration-300 hover-lift bg-transparent"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>

          {/* Support */}
          <div className="text-center pt-6 border-t border-white/10">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <HelpCircle className="h-5 w-5 text-brand-blue" />
              <p className="text-white/70 text-sm">Still having issues?</p>
            </div>
            <Link href="/support" className="text-brand-blue hover:text-brand-blue-light transition-colors">
              Contact our support team
            </Link>
            <p className="text-white/50 text-xs mt-2">We're here to help you get started</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
