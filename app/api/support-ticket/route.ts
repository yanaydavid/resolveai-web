import { NextRequest, NextResponse } from "next/server";
import { getSupportTicket } from "@/lib/kv-store";

export async function GET(req: NextRequest) {
  const id    = req.nextUrl.searchParams.get("id")    || "";
  const token = req.nextUrl.searchParams.get("token") || "";

  if (!id || !token) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const ticket = await getSupportTicket(id);
  if (!ticket) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (ticket.token !== token) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(ticket);
}