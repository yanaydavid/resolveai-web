/**
 * GET /api/payment/success?token=XXX&plan=basic
 * Called by payment provider after successful payment.
 * Verifies the token and redirects to /new with the token.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentToken } from "@/lib/payment";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token  = searchParams.get("token");
  const planId = searchParams.get("plan");

  const origin =
    req.headers.get("origin") ||
    req.headers.get("referer")?.split("/").slice(0, 3).join("/") ||
    "https://resolveai.co.il";

  if (!token || !planId) {
    return NextResponse.redirect(`${origin}/pricing?error=invalid`);
  }

  const record = await verifyPaymentToken(token);
  if (!record) {
    return NextResponse.redirect(`${origin}/checkout?plan=${planId}&error=token_expired`);
  }

  // Redirect to case form with verified token
  return NextResponse.redirect(`${origin}/new?token=${token}&plan=${planId}`);
}

// Tranzila may POST the result
export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();
    const token  = fd.get("TranzactionId") as string || new URL(req.url).searchParams.get("token") || "";
    const planId = new URL(req.url).searchParams.get("plan") || "";
    const origin = "https://resolveai.co.il";

    const record = await verifyPaymentToken(token);
    if (!record) {
      return NextResponse.redirect(`${origin}/checkout?plan=${planId}&error=token_expired`);
    }

    return NextResponse.redirect(`${origin}/new?token=${token}&plan=${planId}`);
  } catch {
    return NextResponse.redirect("https://resolveai.co.il/pricing?error=payment_error");
  }
}
