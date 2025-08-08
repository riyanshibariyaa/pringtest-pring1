import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const data = Object.fromEntries(formData.entries())

    const { error_Message, txnid } = data

    console.error("PayU payment failed:", { error_Message, txnid })

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/corporate/payment/failure?error=${encodeURIComponent((error_Message as string) || "Payment failed")}&txnid=${txnid}`,
    )
  } catch (error: any) {
    console.error("PayU failure handler error:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/corporate/payment/failure?error=processing_error`)
  }
}
