import { NextRequest, NextResponse } from "next/server";
import mongoosePromise from "@/db/db.config";
import { Course } from "@/db/models";

export async function GET(req: NextRequest) {
  try {
    await mongoosePromise;

    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get("serviceId");

    if (!serviceId) {
      return NextResponse.json(
        { error: "Service ID is required" },
        { status: 400 }
      );
    }

    // Find the course associated with this service
    const course = await Course.findOne({ service: serviceId }).lean();

    if (!course) {
      return NextResponse.json(
        { error: "Course not found for this service" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}
