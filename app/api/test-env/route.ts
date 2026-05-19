import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export async function GET() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";

  let kvStatus = "unknown";
  let kvError = "";
  let testRead = null;

  try {
    const kv = new Redis({ url, token });
    await kv.set("test:ping", "pong", { ex: 60 });
    testRead = await kv.get("test:ping");
    kvStatus = "ok";
  } catch (e) {
    kvStatus = "error";
    kvError = String(e);
  }

  return NextResponse.json({
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    hasKvUrl: !!url,
    hasKvToken: !!token,
    kvUrlStart: url.slice(0, 30),
    kvStatus,
    kvError,
    testRead,
  });
}
