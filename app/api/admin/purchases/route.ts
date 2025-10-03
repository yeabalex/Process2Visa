import { NextRequest, NextResponse } from "next/server";
import mongoosePromise from "@/db/db.config";
import Purchase from "@/db/purchaseModel";
import { UserCourses, Course } from "@/db/userModel";
import { sendPurchaseConfirmationMessage } from "@/lib/telegram";

// Function to populate user course progress when purchase is completed
async function populateUserCourseProgress(chat_id: string, serviceId: string) {
  try {
    // Get all courses for this service
    const courses = await Course.find({ service: serviceId }).lean();

    if (!courses || courses.length === 0) {
      console.log(`No courses found for service ${serviceId}`);
      return;
    }

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
      const existingUserCourse = await UserCourses.findOne({ chat_id, service: serviceId });

      if (existingUserCourse) {
        // Update existing user course
        existingUserCourse.progress = progressMap;
        await existingUserCourse.save();
        console.log(`Updated existing user course progress for chat_id: ${chat_id}, service: ${serviceId}`);
      } else {
        // Create new user course
        const newUserCourse = new UserCourses({
          chat_id,
          service: serviceId,
          progress: progressMap
        });
        await newUserCourse.save();
        console.log(`Created new user course for chat_id: ${chat_id}, service: ${serviceId}`);
      }
    }
  } catch (error) {
    console.error('Error populating user course progress:', error);
    throw error;
  }
}

// Function to send telegram message
async function sendTelegramMessage(chat_id: string, message: string) {
  try {
    // This function is now handled by the telegram utility
    // Keeping for backward compatibility if needed elsewhere
    const { sendPurchaseConfirmationMessage } = await import("@/lib/telegram");
    const serviceName = "Service"; // This should be passed in or extracted from context
    return await sendPurchaseConfirmationMessage(chat_id, serviceName);
  } catch (error) {
    console.error('Error sending telegram message:', error);
    throw error;
  }
}

export async function GET() {
  try {
    await mongoosePromise;

    const purchases = await Purchase.find({})
      .populate("service")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: purchases,
    });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, amount, method, currency } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Purchase ID is required" },
        { status: 400 }
      );
    }

    if (!status || !["pending", "completed", "failed"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Valid status is required (pending, completed, failed)" },
        { status: 400 }
      );
    }

    await mongoosePromise;

    const updateData: any = { status };

    if (amount !== undefined) updateData.amount = amount;
    if (method) updateData.method = method;
    if (currency) updateData.currency = currency;

    const purchase = await Purchase.findByIdAndUpdate(id, updateData, { new: true })
      .populate("service");

    if (!purchase) {
      return NextResponse.json(
        { success: false, message: "Purchase not found" },
        { status: 404 }
      );
    }
    console.log("Status updated to:", status);
    // If status is changed to "completed", populate user course progress and send telegram message
    if (status === "completed" && purchase.chat_id && purchase.service) {
      try {
        // Populate user course progress
        console.log("Populating user course progress for chat_id:", purchase.chat_id);
        await populateUserCourseProgress(purchase.chat_id, purchase.service._id.toString());

        // Send telegram message
        const serviceName = purchase.service.displayName || purchase.service.name;
        await sendPurchaseConfirmationMessage(purchase.chat_id, serviceName, purchase.service._id.toString());

        console.log(`Successfully processed completed purchase for chat_id: ${purchase.chat_id}, service: ${serviceName}`);
      } catch (error) {
        console.error('Error processing completed purchase:', error);
        // Don't fail the purchase update if these additional steps fail
      }
    }

    return NextResponse.json({
      success: true,
      message: "Purchase updated successfully",
      data: purchase,
    });
  } catch (error) {
    console.error("Error updating purchase:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update purchase" },
      { status: 500 }
    );
  }
}
