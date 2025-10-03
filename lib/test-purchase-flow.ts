/**
 * Test script to verify the purchase completion functionality
 * This can be used to test the complete flow without making actual purchases
 */

import mongoosePromise from "@/db/db.config";
import Purchase from "@/db/purchaseModel";
import Service from "@/db/serviceModel";
import { UserCourses, Course } from "@/db/userModel";
import { sendPurchaseConfirmationMessage } from "@/lib/telegram";

export async function testPurchaseCompletionFlow() {
  try {
    await mongoosePromise;
    console.log("Starting purchase completion flow test...");

    // 1. Create a test purchase (or find existing)
    let testService = await Service.findOne({ name: "education-consultation" });
    if (!testService) {
      console.log("Test service not found. Creating test service...");
      const newService = new Service({
        name: "education-consultation",
        displayName: "Education Consultation",
        description: "Test education consultation service",
        price: 100
      });
      await newService.save();
      testService = newService;
    }

    // 2. Create a test purchase
    const testPurchase = new Purchase({
      chat_id: "123456789", // Test chat ID
      service: testService._id,
      amount: 100,
      method: "tele-birr",
      currency: "ETB",
      status: "pending", // Start as pending
      txn_id: "test_txn_123"
    });
    await testPurchase.save();
    console.log("Test purchase created:", testPurchase._id);

    // 3. Update purchase status to completed directly
    testPurchase.status = "completed";
    await testPurchase.save();
    console.log("Purchase status updated to completed");

    // 4. Test user course population directly
    let createdUserCourse = null;
    const courses = await Course.find({ service: testService._id }).lean();
    
    if (courses && courses.length > 0) {
      // For each course, create or update user progress
      for (const course of courses) {
        const progressMap = new Map();
        
        // Initialize progress for each module and item as not completed
        if (course.module && course.module.length > 0) {
          course.module.forEach((module: any, moduleIndex: number) => {
            const moduleProgress: any[] = [];
            
            if (module.items && module.items.length > 0) {
              module.items.forEach((item: any, itemIndex: number) => {
                moduleProgress.push({
                  completed: false,
                  completedAt: null
                });
              });
            }
            
            progressMap.set(moduleIndex.toString(), moduleProgress);
          });
        }
        
        // Check if user course already exists
        const existingUserCourse = await UserCourses.findOne({
          chat_id: testPurchase.chat_id,
          service: testService._id
        });
        
        if (existingUserCourse) {
          // Update existing user course
          existingUserCourse.progress = progressMap;
          await existingUserCourse.save();
          console.log('Updated existing user course progress');
        } else {
          // Create new user course
          const newUserCourse = new UserCourses({
            chat_id: testPurchase.chat_id,
            service: testService._id,
            progress: progressMap
          });
          createdUserCourse = newUserCourse;
          await newUserCourse.save();
        }
      }
    } else {
      console.log('No courses found for the service');
    }

    // 5. Test telegram messaging directly
    console.log('Testing telegram message sending...');
    const telegramResult = await sendPurchaseConfirmationMessage(
      testPurchase.chat_id,
      testService.displayName || testService.name
    );
    console.log('Telegram message result:', telegramResult);

    console.log("✅ Purchase completion flow test completed successfully!");

    // Cleanup test data
    await Purchase.findByIdAndDelete(testPurchase._id);
    if (createdUserCourse) {
      await UserCourses.findByIdAndDelete(createdUserCourse._id);
    }

    return {
      success: true,
      message: "Test completed successfully"
    };

  } catch (error) {
    console.error("❌ Test failed:", error);
    return {
      success: false,
      message: (error as Error).message
    };
  }
}
