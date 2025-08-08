import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { connectDB } from "@/lib/mongodb"
import Company from "@/models/Company"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      // Connect to database
      await connectDB()

      const companyData = JSON.parse(session.metadata!.companyData)
      const planName = session.metadata!.plan

      // Create company with paid subscription
      const subscriptionDetails = {
        basic: { employeeLimit: 25, qrCodeLimit: 250, price: 2499 },
        premium: { employeeLimit: 100, qrCodeLimit: 1000, price: 7999 },
        enterprise: { employeeLimit: -1, qrCodeLimit: -1, price: 24999 },
      }

      const planDetails = subscriptionDetails[planName.toLowerCase() as keyof typeof subscriptionDetails]

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
          plan: planName.toLowerCase(),
          employeeLimit: planDetails.employeeLimit,
          qrCodeLimit: planDetails.qrCodeLimit,
          qrCodesGenerated: 0,
          isActive: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        paymentHistory: [
          {
            paymentId: session.payment_intent as string,
            orderId: session.id,
            amount: (session.amount_total || 0) / 100,
            currency: session.currency || "usd",
            status: "completed",
            paymentMethod: "stripe",
            paidAt: new Date(),
          },
        ],
      })

      await company.save()
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Stripe webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
