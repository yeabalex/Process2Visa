import { NextRequest, NextResponse } from "next/server";
import mongoosePromise from "@/db/db.config";
import { Course } from "@/db/models";
import { UserCourses } from "@/db/userModel";
import { buildEmptyProgress } from "@/lib/courseProgress";

/**
 * Test endpoint to simulate UserCourses initialization during checkout
 */
export async function GET(req: NextRequest) {
  try {
    await mongoosePromise;

    // Create test data
    const testUserId = "test-user-123";
    const testServiceId = "507f1f77bcf86cd799439011";

    // Create a mock course in the database if it doesn't exist
    let course = await Course.findOne({ service: testServiceId });

    if (!course) {
      course = await Course.create({
        progress: 0,
        country: "Ethiopia",
        service: testServiceId,
        module: [
          {
            id: "module1",
            title: "Introduction",
            description: "Basic concepts",
            items: [
              {
                id: "item1",
                title: "Welcome",
                type: "reading",
                completed: false,
                duration: "5 min",
                description: "Introduction to the course"
              },
              {
                id: "item2",
                title: "Getting Started",
                type: "video",
                completed: false,
                duration: "10 min",
                description: "Setup instructions"
              }
            ]
          }
        ]
      });
      console.log("✅ Test course created");
    }

    // Test the buildEmptyProgress function
    const emptyProgress = buildEmptyProgress(course.toObject());
    console.log("✅ Empty progress structure built");

    // Check if UserCourses already exists
    const existingUserCourse = await UserCourses.findOne({
      chat_id: testUserId,
      service: testServiceId
    });

    if (existingUserCourse) {
      return NextResponse.json({
        message: "UserCourses already exists",
        userCourse: existingUserCourse,
        progress: emptyProgress
      });
    }

    // Create UserCourses document
    const userCourse = await UserCourses.create({
      chat_id: testUserId,
      service: testServiceId,
      progress: emptyProgress,
    });

    console.log("✅ UserCourses document created:", userCourse._id);

    return NextResponse.json({
      message: "UserCourses initialization test successful",
      userCourse: {
        _id: userCourse._id,
        chat_id: userCourse.chat_id,
        service: userCourse.service,
        progressKeys: Object.keys(userCourse.progress || {}),
      },
      progressStructure: emptyProgress,
    });

  } catch (error: any) {
    console.error("❌ Test failed:", error);
    return NextResponse.json(
      {
        error: "Test failed",
        message: error.message
      },
      { status: 500 }
    );
  }
}
