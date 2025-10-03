import mongoosePromise from "@/db/db.config";
import { UserCourses, Course } from "@/db/models";
import { buildEmptyProgress } from "@/lib/courseProgress";

/**
 * Test function to verify UserCourses initialization
 */
async function testUserCoursesInitialization() {
  try {
    await mongoosePromise;
    console.log("✅ Database connected");

    // Create a mock course for testing
    const mockCourse = {
      progress: 0,
      country: "Ethiopia",
      service: "507f1f77bcf86cd799439011", // Mock service ID
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
        },
        {
          id: "module2",
          title: "Advanced Topics",
          description: "Deep dive",
          items: [
            {
              id: "item3",
              title: "Advanced Concepts",
              type: "reading",
              completed: false,
              duration: "15 min",
              description: "Complex topics"
            }
          ]
        }
      ]
    };

    // Test the buildEmptyProgress function
    const emptyProgress = buildEmptyProgress(mockCourse);
    console.log("✅ Empty progress structure built:");
    console.log(JSON.stringify(emptyProgress, null, 2));

    // Verify the structure matches expected format
    const progressKey = String(mockCourse.progress);
    if (!emptyProgress[progressKey]) {
      throw new Error("Progress key not found");
    }

    if (!emptyProgress[progressKey]["0"]) {
      throw new Error("Module 0 not found");
    }

    if (!emptyProgress[progressKey]["1"]) {
      throw new Error("Module 1 not found");
    }

    if (emptyProgress[progressKey]["0"].length !== 2) {
      throw new Error("Module 0 should have 2 items");
    }

    if (emptyProgress[progressKey]["1"].length !== 1) {
      throw new Error("Module 1 should have 1 item");
    }

    console.log("✅ Progress structure validation passed");

    // Test creating UserCourses document
    const userId = "123456789";
    const serviceId = "507f1f77bcf86cd799439011";

    const userCourse = await UserCourses.create({
      userId,
      service: serviceId,
      progress: emptyProgress,
    });

    console.log("✅ UserCourses document created:", userCourse._id);

    // Verify the document was saved correctly
    const savedUserCourse = await UserCourses.findById(userCourse._id).lean();
    if (!savedUserCourse) {
      throw new Error("UserCourses document not found");
    }

    console.log("✅ UserCourses document retrieved successfully");
    console.log("Document structure:", {
      userId: savedUserCourse.userId,
      service: savedUserCourse.service,
      progressKeys: Object.keys(savedUserCourse.progress || {}),
    });

    return true;
  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

// Export for potential use in other test files
export { testUserCoursesInitialization };

// Run test if this file is executed directly
if (require.main === module) {
  testUserCoursesInitialization()
    .then(() => {
      console.log("🎉 All tests passed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Test failed:", error);
      process.exit(1);
    });
}
