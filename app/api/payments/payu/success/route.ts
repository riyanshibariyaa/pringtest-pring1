import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { connectDB } from "@/lib/mongodb"
import Company from "@/models/Company"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const data = Object.fromEntries(formData.entries())

    const {
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      status,
      hash,
      udf1: plan,
      udf2: companyName,
      udf3: companyDataStr,
      mihpayid,
    } = data

    // Verify hash
    const merchantSalt = process.env.PAYU_MERCHANT_SALT!
    const hashString = `${merchantSalt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`
    const expectedHash = crypto.createHash("sha512").update(hashString).digest("hex")

    if (hash !== expectedHash) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/corporate/payment/failure?error=hash_mismatch`)
    }

    if (status === "success") {
      // Connect to database
      await connectDB()

      const companyData = JSON.parse(companyDataStr as string)

      // Create company with paid subscription
      const subscriptionDetails = {
        basic: { employeeLimit: 25, qrCodeLimit: 250, price: 2499 },
        premium: { employeeLimit: 100, qrCodeLimit: 1000, price: 7999 },
        enterprise: { employeeLimit: -1, qrCodeLimit: -1, price: 24999 },
      }

      const planDetails = subscriptionDetails[plan.toString().toLowerCase() as keyof typeof subscriptionDetails]

      const company = new Company({
        companyName: companyData.companyName,
        companyEmail: companyData.companyEmail,
        industry: companyData.industry,
        companySize: companyData.companySize,
        companyPhone: companyData.companyPhone,
        companyAddress: companyData.companyAddress,
        adminUser: {
          name: companyData.adminName,
          email: companyData.adminEmail,
          password: companyData.hashedPassword,
        },
        subscription: {
          plan: plan.toString().toLowerCase(),
          employeeLimit: planDetails.employeeLimit,
          qrCodeLimit: planDetails.qrCodeLimit,
          qrCodesGenerated: 0,
          isActive: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        paymentHistory: [
          {
            paymentId: mihpayid as string,
            orderId: txnid as string,
            amount: Number.parseFloat(amount as string),
            currency: "INR",
            status: "completed",
            paymentMethod: "payu",
            paidAt: new Date(),
          },
        ],
      })

      await company.save()

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/corporate/payment/success?company_id=${company._id}`,
      )
    } else {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/corporate/payment/failure?error=payment_failed`)
    }
  } catch (error: any) {
    console.error("PayU success handler error:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/corporate/payment/failure?error=processing_error`)
  }
}
