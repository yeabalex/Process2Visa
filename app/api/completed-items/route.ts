import { NextRequest, NextResponse } from "next/server";
import mongoosePromise from "@/db/db.config";
import { UserProgress } from "@/db/models";

// GET /api/completed-items?userId=...&serviceId=...
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

    // Fetch user progress for this service
    const userProgress = await UserProgress.findOne({ chat_id: userId, service: serviceId })
      .select("completedItems")
      .lean();

    if (!userProgress) {
      return NextResponse.json({ completedItems: [] });
    }

    // Return only completed items for this service
    const completedItems = userProgress.completedItems
      ?.filter(item => item.service_id.toString() === serviceId)
      .map(item => ({
        item_id: item.item_id,
        completed_at: item.completed_at,
      })) || [];

    return NextResponse.json({
      completedItems,
      count: completedItems.length,
    });

  } catch (error: any) {
    console.error("Error fetching completed items:", error);
    return NextResponse.json(
      { error: "Failed to fetch completed items", details: error.message },
      { status: 500 }
    );
  }
}
