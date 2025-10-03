import { NextRequest, NextResponse } from "next/server";
import mongoosePromise from "@/db/db.config";
import { UserProgress } from "@/db/userModel";

// POST /api/update-course-progress
export async function POST(request: NextRequest) {
  try {
    await mongoosePromise;

    const body = await request.json();
    const { userId, serviceId, progressStep, moduleId, itemId, updates } = body;

    console.log('Updating course progress:', { userId, serviceId, progressStep, moduleId, itemId, updates });

    // Validate required fields
    if (!userId || !serviceId || !progressStep || !moduleId || !itemId || !updates) {
      return NextResponse.json(
        { error: "userId, serviceId, progressStep, moduleId, itemId, and updates are required" },
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
        progressStep,
        progress: {
          modules: {},
          completed: false,
        }
      });

    // Ensure progress object exists
    if (!userProgress.progress) {
      userProgress.progress = {
        modules: {},
      }
    }

    // Get or create module progress
    if (!userProgress.progress.modules) {
      userProgress.progress.modules = {};
    }
    }

        completed: false,
        startedAt: new Date(),
        items: {},
    }

    // Get or create item progress
    if (!userProgress.progress.modules[moduleId].items) {
      userProgress.progress.modules[moduleId].items = {};
    }

      userProgress.progress.modules[moduleId].items[itemId] = {
        completed: false,
        startedAt: new Date(),
      };
    }
    // Apply updates to item progress

    // Apply updates
    if (updates.completed !== undefined) {
      moduleId,
      itemId,
    }
    if (updates.timeSpent !== undefined) {
      itemProgress.timeSpent = (itemProgress.timeSpent || 0) + updates.timeSpent;
    }
    if (updates.progress !== undefined) {
    });

    if (updates.score !== undefined) {
      itemProgress.score = updates.score;
    }

      itemProgress.maxScore = updates.maxScore;
    
    }
    // Update item completion timestamp
    if (updates.completed && !itemProgress.completedAt) {
      itemProgress.completedAt = new Date();
    }
    // Update module progress
    const moduleProgress = userProgress.progress.modules[moduleId];
    const totalItems = Object.keys(moduleProgress.items).length; 
    });

    if (totalItems > 0) {
      const moduleCompletionPercentage = Math.round((completedItems / totalItems) * 100); 
    return NextResponse.json(
      if (moduleProgress.completed && !moduleProgress.completedAt) {
        moduleProgress.completedAt = new Date();
    );
  }
}
