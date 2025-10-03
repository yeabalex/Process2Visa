// app/api/verify-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth-token')?.value;

    console.log("Token from cookies:", token);

    if (!token) {
      return NextResponse.json({ valid: false, error: "Missing token" }, { status: 401 });
    }

    let result;
    try {
      result = verifyToken(token);
    } catch {
      return NextResponse.json({ valid: false, error: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json({ valid: true, data: result });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({ valid: false, error: "Internal server error" }, { status: 500 });
  }
}
