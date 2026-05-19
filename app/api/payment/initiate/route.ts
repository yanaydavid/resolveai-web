/**
 * POST /api/payment/initiate
 * Body: { planId: "basic" | "standard" | "premium" }
 *
 * Beta mode (PAYMENT_PROVIDER=none): returns a free token immediately.
 * Production mode: returns a redirect URL to the payment provider.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getPlanById,
  getPaymentProvider,
  isPaymentEnabled,
  createPaymentToken,
} from "@/lib/payment";

export async function POST(req: NextRequest) {
  try {
    const { planId } = await req.json();

    const plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const provider = getPaymentProvider();
    const paymentEnabled = isPaymentEnabled();

    // ── Beta / free mode ──────────────────────────────────────────
    if (!paymentEnabled || provider === "none") {
      const token = await createPaymentToken(planId, undefined, true);
      return NextResponse.json({
        mode: "beta",
        token,
        redirectTo: `/new?token=${token}&plan=${planId}`,
      });
    }

    // ── Tranzila ──────────────────────────────────────────────────
    if (provider === "tranzila") {
      const terminalName = process.env.TRANZILA_TERMINAL_NAME;
      const origin =
        req.headers.get("origin") ||
        req.headers.get("referer")?.split("/").slice(0, 3).join("/") ||
        "https://resolveai.co.il";

      const token = await createPaymentToken(planId, undefined, false);

      // Tranzila hosted payment page URL
      const params = new URLSearchParams({
        terminal_name: terminalName || "",
        sum: String(plan.price),
        currency: "1", // ILS
        TranzactionId: token,
        success_url: `${origin}/api/payment/success?token=${token}&plan=${planId}`,
        fail_url: `${origin}/checkout?plan=${planId}&error=payment_failed`,
        lang: "he",
        pdesc: `ResolveAI — ${plan.nameHe}`,
      });

      return NextResponse.json({
        mode: "redirect",
        redirectTo: `https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi?${params}`,
        token,
      });
    }

    // ── CardCom ───────────────────────────────────────────────────
    if (provider === "cardcom") {
      const terminalNumber = process.env.CARDCOM_TERMINAL;
      const apiName       = process.env.CARDCOM_API_NAME;
      const origin =
        req.headers.get("origin") ||
        req.headers.get("referer")?.split("/").slice(0, 3).join("/") ||
        "https://resolveai.co.il";

      const token = await createPaymentToken(planId, undefined, false);

      const params = new URLSearchParams({
        TerminalNumber:  terminalNumber || "",
        UserName:        apiName || "",
        SumToBill:       String(plan.price),
        CoinID:          "1", // ILS
        Language:        "he",
        ProductName:     `ResolveAI ${plan.nameHe}`,
        SuccessRedirectUrl: `${origin}/api/payment/success?token=${token}&plan=${planId}`,
        FailedRedirectUrl:  `${origin}/checkout?plan=${planId}&error=payment_failed`,
        codepage:        "65001",
        Operation:       "1",
      });

      return NextResponse.json({
        mode: "redirect",
        redirectTo: `https://secure.cardcom.solutions/Interface/LowProfile.aspx?${params}`,
        token,
      });
    }

    // ── Meshulam ──────────────────────────────────────────────────
    if (provider === "meshulam") {
      const userId = process.env.MESHULAM_USER_ID;
      const apiKey = process.env.MESHULAM_API_KEY;
      const origin =
        req.headers.get("origin") ||
        req.headers.get("referer")?.split("/").slice(0, 3).join("/") ||
        "https://resolveai.co.il";

      const token = await createPaymentToken(planId, undefined, false);

      // Meshulam API: create payment page
      const res = await fetch("https://sandbox.meshulam.co.il/api/v1/createPaymentProcess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          apiKey,
          sum: plan.price,
          description: `ResolveAI ${plan.nameHe}`,
          successUrl: `${origin}/api/payment/success?token=${token}&plan=${planId}`,
          failUrl: `${origin}/checkout?plan=${planId}&error=payment_failed`,
        }),
      });

      const data = await res.json();
      if (data?.data?.pageCode) {
        return NextResponse.json({
          mode: "redirect",
          redirectTo: `https://sandbox.meshulam.co.il/${data.data.pageCode}`,
          token,
        });
      }

      throw new Error("Meshulam failed to create payment page");
    }

    return NextResponse.json({ error: "Payment provider not configured" }, { status: 503 });
  } catch (err) {
    console.error("payment/initiate error:", err);
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 });
  }
}
