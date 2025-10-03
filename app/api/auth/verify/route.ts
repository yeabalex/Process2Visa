// app/api/verify-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoosePromise from "@/db/db.config";
import Otp from "@/db/otpModel";
import { createToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const { chatId, otp } = await request.json();
    console.log("Received OTP verification request:", otp);
    
    if (!chatId || typeof chatId !== "string") {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      );
    }
    
    if (!otp || typeof otp !== "string") {
      return NextResponse.json(
        { error: "OTP code is required" },
        { status: 400 }
      );
    }

    await mongoosePromise;
    
    // Find OTP for this chatId
    const otpDoc = await Otp.findOne({ chatId });
    if (!otpDoc) {
      return NextResponse.json(
        { error: "No OTP found for this chatId" },
        { status: 404 }
      );
    }

    // Check expiry
    if (otpDoc.expiresAt < new Date()) {
      await otpDoc.deleteOne();
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    console.log("Stored OTP:", otpDoc.otp);
    
    // Check if OTP matches
    if (otpDoc.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // OTP is valid -> delete it to prevent reuse
    await otpDoc.deleteOne();

    // Create JWT
    const token = createToken(chatId);
    console.log("Generated token:", token);

    // Create response
    const response = NextResponse.json({ 
      success: true, 
      redirectTo: "/",
      message: "Authentication successful" 
    });

    // Set cookie with proper configuration
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      sameSite: "lax", // Changed from "strict" to "lax"
      maxAge: 86400, // 24 hours
      path: "/",
    });

    console.log("Cookie set successfully");
    return response;
    
  } catch (error) {
    console.error("OTP verification failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}