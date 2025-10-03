import { NextRequest, NextResponse } from "next/server";
import mongoosePromise from "@/db/db.config";
import { User } from "@/db/userModel";

export async function GET() {
  try {
    await mongoosePromise;

    const users = await User.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
