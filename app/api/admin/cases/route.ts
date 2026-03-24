import { NextRequest, NextResponse } from "next/server";
import { getAllCases } from "@/lib/kv-store";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || key !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cases = await getAllCases();
  return NextResponse.json({ cases });
}
