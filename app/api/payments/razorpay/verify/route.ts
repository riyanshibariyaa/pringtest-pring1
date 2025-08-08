import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { connectDB } from "@/lib/mongodb"
import Company from "@/models/Company"

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, companyData, plan } = await request.json()

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    // Connect to database
    await connectDB()

    // Create company with paid subscription
    const subscriptionDetails = {
      free: { employeeLimit: 5, qrCodeLimit: 50, price: 0 },
      basic: { employeeLimit: 25, qrCodeLimit: 250, price: 2499 },
      premium: { employeeLimit: 100, qrCodeLimit: 1000, price: 7999 },
      enterprise: { employeeLimit: -1, qrCodeLimit: -1, price: 24999 },
    }

    const planDetails = subscriptionDetails[plan.name.toLowerCase() as keyof typeof subscriptionDetails]

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
        plan: plan.name.toLowerCase(),
        employeeLimit: planDetails.employeeLimit,
        qrCodeLimit: planDetails.qrCodeLimit,
        qrCodesGenerated: 0,
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      paymentHistory: [
        {
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          amount: plan.price,
          currency: "INR",
          status: "completed",
          paymentMethod: "razorpay",
          paidAt: new Date(),
        },
      ],
    })

    await company.save()

    return NextResponse.json({
      success: true,
      company: {
        _id: company._id,
        companyName: company.companyName,
        subscription: company.subscription,
      },
      message: "Payment successful and account created",
    })
  } catch (error: any) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
  }
}
