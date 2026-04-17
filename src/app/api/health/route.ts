/** EO-104 health endpoint. */
import { NextResponse } from "next/server";
import { APP_VERSION, APP_NAME } from "@/lib/config";

const startTime = Date.now();

export function GET() {
  return NextResponse.json({
    status: "ok",
    name: APP_NAME,
    version: APP_VERSION,
    uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
  });
}
