import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import mongoosePromise from "@/db/db.config";
import { UserProgress, CompletedItems } from "@/db/models";

// Define the type for completed items based on the schema
interface CompletedItemType {
  item_id: string;
  chat_id: string;
  service_id: mongoose.Types.ObjectId;
  completed_at: Date;
}

// POST /api/update-course-progress
export async function POST(request: NextRequest) {
  try {
    await mongoosePromise;

    const body = await request.json();
    const { userId, serviceId, courseProgressId, moduleId, itemId, completed } = body;

    console.log('Updating course progress:', { userId, serviceId, courseProgressId, moduleId, itemId, completed });

    // Validate required fields
    if (!userId || !serviceId || !courseProgressId || !moduleId || !itemId) {
      return NextResponse.json(
        { error: "userId, serviceId, courseProgressId, moduleId, itemId are required" },
        { status: 400 }
      );
    }

    // Find or create user progress record
    let userProgress = await UserProgress.findOne({ chat_id: userId, service: serviceId });

    if (!userProgress) {
      // Create new progress record
      userProgress = new UserProgress({
        chat_id: userId,
        service: serviceId,
        progress: {},
        completedItems: [],
      });
    }

    // Find existing completed item or create new one
    const existingCompletedItem = userProgress.completedItems.find(
      (item: CompletedItemType) => item.item_id === itemId && item.chat_id === userId && item.service_id.toString() === serviceId
    );

    if (completed) {
      // Mark as completed
      if (!existingCompletedItem) {
        // Add new completed item
        userProgress.completedItems.push({
          item_id: itemId,
          chat_id: userId,
          service_id: serviceId,
          completed_at: new Date(),
        });
      } else {
        // Update existing completed item timestamp
        existingCompletedItem.completed_at = new Date();
      }
    } else {
      // Mark as incomplete - remove from completed items
      if (existingCompletedItem) {
        userProgress.completedItems = userProgress.completedItems.filter(
          (item: CompletedItemType) => !(item.item_id === itemId && item.chat_id === userId && item.service_id.toString() === serviceId)
        );
      }
    }

    // Calculate module completion percentage
    const totalItems = Object.keys(userProgress.progress.get(courseProgressId)?.get(moduleId) || {}).length || 0;
    const completedItemsCount = userProgress.completedItems.filter(
      (item: CompletedItemType) => item.service_id.toString() === serviceId
    ).length;
    const moduleCompletion = totalItems > 0 ? Math.round((completedItemsCount / totalItems) * 100) : 0;

    console.log('About to save userProgress:', {
      courseProgressId,
      moduleId,
      itemId,
      completed,
      completedItemsCount,
      totalItems,
      moduleCompletion
    });

    // Save the updated progress
    await userProgress.save();
    console.log('Saved userProgress:', JSON.stringify(userProgress.toObject(), null, 2));

    return NextResponse.json({
      success: true,
      message: "Progress updated successfully",
      completion: {
        item: completed,
        module: moduleCompletion,
        courseProgressId,
        moduleId,
        itemId,
      },
    });

  } catch (error: any) {
    console.error("Error updating course progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress", details: error.message },
      { status: 500 }
    );
  }
}
