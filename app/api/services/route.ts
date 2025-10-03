// app/api/services/route.js
import { NextRequest, NextResponse } from "next/server";
import mongoosePromise from "@/db/db.config";
import Service from "@/db/serviceModel"; // adjust path if needed

// Reusable DB connection helper


export async function GET(req: NextRequest) {
  try {

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const skip = (page - 1) * limit;
    await mongoosePromise;
    const [services, total] = await Promise.all([
      Service.find({})
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }), // newest first
      Service.countDocuments(),
    ]);

    return NextResponse.json({
      success: true,
      data: services,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
