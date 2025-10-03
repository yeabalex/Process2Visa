import { NextRequest, NextResponse } from "next/server";
import mongoosePromise from "@/db/db.config";
import { Course, Purchase } from "@/db/models";
import { UserProgress } from "@/db/models";
import { ItemsCompleted } from "@/db/models";

// GET /api/get-course?userId=...&serviceId=...&progress=...
export async function GET(request: NextRequest) {
  try {
    await mongoosePromise;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const serviceId = searchParams.get("serviceId");
    const progressParam = searchParams.get("progress");

    if (!userId || !serviceId || !progressParam) {
      return NextResponse.json(
        { error: "userId, serviceId and progress are required" },
        { status: 400 }
      );
    }

    const progress = Number(progressParam);
    if (Number.isNaN(progress)) {
      return NextResponse.json(
        { error: "progress must be a number" },
        { status: 400 }
      );
    }

    // Ensure user purchased and completed payment for this service
    const purchase = await Purchase.findOne({ chat_id: userId, service: serviceId })
      .select("status service")
      .lean<{ status: "pending" | "completed" | "failed"; service: string }>();

    if (!purchase) {
      return NextResponse.json({ error: "No purchase found for this service" }, { status: 404 });
    }

    if (purchase.status !== "completed") {
      return NextResponse.json({ error: "Purchase not completed" }, { status: 403 });
    }

    console.log("serviceId:", serviceId, "progress:", progress);
    // Fetch the course modules for this service + progress step
    const courseDoc = await Course.findOne({ service: serviceId, progress })
      .lean<{ progress: number; country: string; service: string; module: any[] }>();
    console.log("Fetched courseDoc:", courseDoc);


    if (!courseDoc) {
      return NextResponse.json({ module: [], progress, serviceId, country: null });
    }

    // Fetch user progress for this service (legacy schema)
    const userProgress = await UserProgress.findOne({ chat_id: userId, service: serviceId })
      .lean<{ chat_id: string; service: string; progress?: Record<string, Record<string, boolean>>; completedItems?: Array<{ item_id: string; chat_id: string; service_id: string; completed_at: Date }> }>();

    console.log('Raw userProgress from DB:', JSON.stringify(userProgress, null, 2));

    // Fetch completed items from new ItemsCompleted schema
    const itemsCompleted = await ItemsCompleted.find({ chat_id: userId, serviceid: serviceId })
      .lean<{ serviceid: string; chat_id: string; item_id: string; completed_at: Date }[]>();

    console.log('Items completed from new schema:', JSON.stringify(itemsCompleted, null, 2));

    if (!userProgress && !itemsCompleted.length) {
      console.log('No user progress found, returning modules without progress');
      return NextResponse.json({
        progress: courseDoc.progress,
        country: courseDoc.country,
        serviceId,
        module: courseDoc.module || [],
      });
    }

    // Get completed item IDs from both schemas
    const completedItemIds = new Set<string>();

    // Add completed items from legacy UserProgress schema
    if (userProgress?.completedItems) {
      userProgress.completedItems
        .filter(item => item.service_id.toString() === serviceId)
        .forEach(item => completedItemIds.add(item.item_id));
    }

    // Add completed items from new ItemsCompleted schema
    itemsCompleted.forEach(item => completedItemIds.add(item.item_id));

    console.log('Combined completed item IDs:', Array.from(completedItemIds));

    // Merge completion state into course modules based on completed items
    let mergedModules = courseDoc.module || [];
    mergedModules = mergedModules.map((mod: any) => {
      console.log(`Processing module ID: "${mod.id}" (type: ${typeof mod.id})`);

      // Update items with completion status
      const updatedItems = (mod.items || []).map((item: any) => {
        const isCompleted = completedItemIds.has(item.id);
        console.log(`Item ${item.id} completed: ${isCompleted}`);
        return { ...item, completed: isCompleted };
      });

      return { ...mod, items: updatedItems };
    });

    return NextResponse.json({
      progress: courseDoc.progress,
      country: courseDoc.country,
      serviceId,
      module: mergedModules,
    });
  } catch (error: any) {
    console.error("Error fetching course:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



