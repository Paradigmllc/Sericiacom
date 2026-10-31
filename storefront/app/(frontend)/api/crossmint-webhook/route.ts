import { NextResponse } from "next/server";

// Retired payment routes must never create orders, change stock, or send mail.
export async function POST() {
  return NextResponse.json({ error: "crypto_payments_retired" }, { status: 410 });
}
