"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Building2, ArrowRight, Sparkles } from "lucide-react"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const companyId = searchParams.get("company_id")
    if (companyId) {
      loadCompanyData(companyId)
    } else {
      // Check if company data is in localStorage (from Razorpay flow)
      const corporateUser = localStorage.getItem("corporateUser")
      if (corporateUser) {
        setCompany(JSON.parse(corporateUser))
        setLoading(false)
      } else {
        router.push("/corporate/register")
      }
    }
  }, [searchParams, router])

  const loadCompanyData = async (companyId: string) => {
    try {
      const response = await fetch(`/api/corporate/company?id=${companyId}`)
      const data = await response.json()

      if (response.ok) {
        setCompany(data.company)
        localStorage.setItem("corporateUser", JSON.stringify(data.company))
      } else {
        router.push("/corporate/register")
      }
    } catch (error) {
      router.push("/corporate/register")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-white/5 border-white/10 glass backdrop-blur-lg">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-6 w-20 h-20 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-white mb-2">Payment Successful!</CardTitle>
          <p className="text-white/70 text-lg">Your corporate account has been activated successfully</p>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Company Details */}
          {company && (
            <div className="bg-gradient-blue p-6 rounded-xl text-white">
              <div className="flex items-center space-x-3 mb-4">
                <Building2 className="h-6 w-6" />
                <h3 className="text-xl font-semibold">{company.companyName}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white/10 rounded-lg">
                  <p className="text-2xl font-bold capitalize">{company.subscription?.plan || "Basic"}</p>
                  <p className="text-sm opacity-80">Plan</p>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-lg">
                  <p className="text-2xl font-bold">{company.subscription?.employeeLimit || 25}</p>
                  <p className="text-sm opacity-80">Employees</p>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-lg">
                  <p className="text-2xl font-bold">{company.subscription?.qrCodeLimit || 250}</p>
                  <p className="text-sm opacity-80">QR Codes</p>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">What's Next?</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="bg-brand-blue rounded-full w-8 h-8 flex items-center justify-center text-white font-semibold text-sm">
                  1
                </div>
                <span className="text-white">Access your corporate dashboard</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="bg-brand-blue rounded-full w-8 h-8 flex items-center justify-center text-white font-semibold text-sm">
                  2
                </div>
                <span className="text-white">Add your first employees</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="bg-brand-blue rounded-full w-8 h-8 flex items-center justify-center text-white font-semibold text-sm">
                  3
                </div>
                <span className="text-white">Generate QR codes for your team</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="bg-brand-blue rounded-full w-8 h-8 flex items-center justify-center text-white font-semibold text-sm">
                  4
                </div>
                <span className="text-white">Customize branding and analytics</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/corporate/dashboard" className="flex-1">
              <Button className="w-full py-4 text-lg bg-gradient-blue hover:shadow-glow-lg transition-all duration-300 hover-lift">
                <Building2 className="h-5 w-5 mr-2" />
                Go to Dashboard
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/corporate/employees/add" className="flex-1">
              <Button
                variant="outline"
                className="w-full py-4 text-lg border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white transition-all duration-300 hover-lift bg-transparent"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Add Employees
              </Button>
            </Link>
          </div>

          {/* Support */}
          <div className="text-center pt-6 border-t border-white/10">
            <p className="text-white/70 text-sm mb-2">Need help getting started?</p>
            <Link href="/support" className="text-brand-blue hover:text-brand-blue-light transition-colors">
              Contact our support team
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
