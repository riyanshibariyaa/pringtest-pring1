import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { amount, plan, companyData } = await request.json()

    const merchantKey = process.env.PAYU_MERCHANT_KEY!
    const merchantSalt = process.env.PAYU_MERCHANT_SALT!
    const baseUrl = process.env.PAYU_BASE_URL!

    const txnid = `txn_${Date.now()}`
    const productinfo = `QRProfile ${plan} Plan`
    const firstname = companyData.adminName
    const email = companyData.adminEmail
    const phone = companyData.companyPhone || "9999999999"
    const surl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/payu/success`
    const furl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/payu/failure`

    // Generate hash
    const hashString = `${merchantKey}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${merchantSalt}`
    const hash = crypto.createHash("sha512").update(hashString).digest("hex")

    const params = {
      key: merchantKey,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      surl,
      furl,
      hash,
      service_provider: "payu_paisa",
      udf1: plan,
      udf2: companyData.companyName,
      udf3: JSON.stringify(companyData),
    }

    return NextResponse.json({
      paymentUrl: baseUrl,
      params,
    })
  } catch (error: any) {
    console.error("PayU payment creation error:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}
