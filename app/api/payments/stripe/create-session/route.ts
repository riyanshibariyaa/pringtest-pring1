import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const { plan, companyData, successUrl, cancelUrl } = await request.json()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Pring ${plan.name} Plan`,
              description: `${plan.employeeLimit} employees, ${plan.qrCodeLimit} QR codes`,
            },
            unit_amount: Math.round((plan.price * 100) / 83), // Convert INR to USD approximately
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        plan: plan.name,
        companyName: companyData.companyName,
        adminEmail: companyData.adminEmail,
        companyData: JSON.stringify(companyData),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Stripe session creation error:", error)
    return NextResponse.json({ error: "Failed to create payment session" }, { status: 500 })
  }
}
