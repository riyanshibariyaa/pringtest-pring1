"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { CreditCard, Building, Shield, CheckCircle, IndianRupee, Zap } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  plan: {
    name: string
    price: number
    currency: string
    features: string[]
    employeeLimit: number
    qrCodeLimit: number
  }
  onPaymentSuccess: (paymentData: any) => void
  companyData: any
}

export function PaymentModal({ isOpen, onClose, plan, onPaymentSuccess, companyData }: PaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<"stripe" | "razorpay" | "payu">("razorpay")

  const handlePayment = async (method: string) => {
    setLoading(true)
    try {
      switch (method) {
        case "razorpay":
          await handleRazorpayPayment()
          break
        case "stripe":
          await handleStripePayment()
          break
        case "payu":
          await handlePayUPayment()
          break
        default:
          throw new Error("Invalid payment method")
      }
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRazorpayPayment = async () => {
    // Create order on backend
    const orderResponse = await fetch("/api/payments/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: plan.price * 100, // Razorpay expects amount in paise
        currency: "INR",
        plan: plan.name,
        companyData,
      }),
    })

    const orderData = await orderResponse.json()
    if (!orderResponse.ok) throw new Error(orderData.error)

    // Load Razorpay script
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Pring Corporate",
        description: `${plan.name} Plan Subscription`,
        order_id: orderData.id,
        prefill: {
          name: companyData.adminName,
          email: companyData.adminEmail,
          contact: companyData.companyPhone,
        },
        theme: {
          color: "#0077C0",
        },
        handler: async (response: any) => {
          // Verify payment on backend
          const verifyResponse = await fetch("/api/payments/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              companyData,
              plan,
            }),
          })

          const verifyData = await verifyResponse.json()
          if (verifyResponse.ok) {
            onPaymentSuccess(verifyData)
            onClose()
            toast({
              title: "Payment Successful!",
              description: "Your corporate account has been activated.",
            })
          } else {
            throw new Error(verifyData.error)
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
          },
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    }
    document.head.appendChild(script)
  }

  const handleStripePayment = async () => {
    const response = await fetch("/api/payments/stripe/create-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan,
        companyData,
        successUrl: `${window.location.origin}/corporate/payment/success`,
        cancelUrl: `${window.location.origin}/corporate/payment/cancel`,
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error)

    // Redirect to Stripe Checkout
    window.location.href = data.url
  }

  const handlePayUPayment = async () => {
    const response = await fetch("/api/payments/payu/create-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: plan.price,
        plan: plan.name,
        companyData,
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error)

    // Create PayU form and submit
    const form = document.createElement("form")
    form.method = "POST"
    form.action = data.paymentUrl

    Object.keys(data.params).forEach((key) => {
      const input = document.createElement("input")
      input.type = "hidden"
      input.name = key
      input.value = data.params[key]
      form.appendChild(input)
    })

    document.body.appendChild(form)
    form.submit()
  }

  const paymentMethods = [
    {
      id: "razorpay",
      name: "Razorpay",
      description: "UPI, Cards, Net Banking, Wallets",
      icon: IndianRupee,
      supported: ["UPI", "Credit/Debit Cards", "Net Banking", "Wallets"],
      recommended: true,
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "International Cards",
      icon: CreditCard,
      supported: ["Credit/Debit Cards", "Apple Pay", "Google Pay"],
      recommended: false,
    },
    {
      id: "payu",
      name: "PayU",
      description: "Cards, UPI, Net Banking",
      icon: Building,
      supported: ["UPI", "Credit/Debit Cards", "Net Banking"],
      recommended: false,
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-dark-surface border-dark-border">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl flex items-center">
            <Shield className="h-6 w-6 mr-2 text-brand-blue" />
            Complete Your Payment
          </DialogTitle>
          <DialogDescription className="text-dark-text-muted">
            Secure payment processing with multiple options
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <div className="space-y-6">
            <Card className="bg-gradient-blue border-0 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{plan.name} Plan</CardTitle>
                  <Badge className="bg-white/20 text-white">
                    {plan.currency === "INR" ? "₹" : "$"}
                    {plan.price}/month
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <p className="text-2xl font-bold">{plan.employeeLimit}</p>
                    <p className="text-sm opacity-80">Employees</p>
                  </div>
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <p className="text-2xl font-bold">{plan.qrCodeLimit}</p>
                    <p className="text-sm opacity-80">QR Codes</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card className="bg-dark-surface/50 border-dark-border">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-500" />
                  Secure Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-dark-text">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">256-bit SSL Encryption</span>
                </div>
                <div className="flex items-center space-x-2 text-dark-text">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">PCI DSS Compliant</span>
                </div>
                <div className="flex items-center space-x-2 text-dark-text">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">No card details stored</span>
                </div>
                <div className="flex items-center space-x-2 text-dark-text">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Instant activation</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <div className="space-y-6">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Choose Payment Method</h3>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <Card
                    key={method.id}
                    className={`cursor-pointer transition-all duration-300 hover-lift ${
                      selectedMethod === method.id
                        ? "border-brand-blue bg-brand-blue/10"
                        : "border-dark-border bg-dark-surface/50 hover:border-brand-blue/50"
                    }`}
                    onClick={() => setSelectedMethod(method.id as any)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-lg ${
                              selectedMethod === method.id ? "bg-brand-blue" : "bg-dark-border"
                            }`}
                          >
                            <method.icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-white font-medium">{method.name}</h4>
                              {method.recommended && (
                                <Badge className="bg-green-500 text-white text-xs">Recommended</Badge>
                              )}
                            </div>
                            <p className="text-dark-text-muted text-sm">{method.description}</p>
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            selectedMethod === method.id ? "border-brand-blue bg-brand-blue" : "border-dark-border"
                          }`}
                        >
                          {selectedMethod === method.id && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {method.supported.map((support, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-dark-border text-dark-text">
                            {support}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Payment Button */}
            <div className="space-y-4">
              <Button
                onClick={() => handlePayment(selectedMethod)}
                disabled={loading}
                className="w-full py-4 text-lg bg-gradient-blue hover:shadow-glow-lg transition-all duration-300"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>
                      Pay {plan.currency === "INR" ? "₹" : "$"}
                      {plan.price} & Activate
                    </span>
                  </div>
                )}
              </Button>

              <div className="text-center">
                <p className="text-dark-text-muted text-sm">
                  By proceeding, you agree to our{" "}
                  <a href="/terms" className="text-brand-blue hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-brand-blue hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
