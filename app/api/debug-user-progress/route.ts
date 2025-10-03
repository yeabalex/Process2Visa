import { NextRequest, NextResponse } from "next/server";
import mongoosePromise from "@/db/db.config";
import { UserCourses } from "@/db/userModel";

// GET /api/debug-user-progress?userId=...&serviceId=...
export async function GET(request: NextRequest) {
  try {
    await mongoosePromise;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const serviceId = searchParams.get("serviceId");

    if (!userId || !serviceId) {
      return NextResponse.json(
        { error: "userId and serviceId are required" },
        { status: 400 }
      );
    }

    const userCourse = await UserCourses.findOne({ chat_id: userId, service: serviceId })
      .lean();

    return NextResponse.json({
      found: !!userCourse,
      progress: userCourse?.progress || {},
      userCourse: userCourse ? {
        chat_id: userCourse.chat_id,
        service: userCourse.service,
        progress: userCourse.progress,
      } : null,
    });

  } catch (error: any) {
    console.error("Error debugging user progress:", error);
    return NextResponse.json(
      { error: "Failed to debug progress", details: error.message },
      { status: 500 }
    );
  }
}
