import { NextRequest, NextResponse } from "next/server";
import mongoosePromise from "@/db/db.config";
import { Purchase } from "@/db/models";
import { UserCourses } from "@/db/userModel";

// POST /api/course-complete
// body: { userId: string, serviceId: string, progress: number, moduleIndex: number, itemIndex: number }
export async function POST(request: NextRequest) {
  try {
    await mongoosePromise;
    const body = await request.json();
    const { userId, serviceId, progress, moduleIndex, itemIndex } = body || {};

    if (!userId || !serviceId || typeof progress !== "number" || typeof moduleIndex !== "number" || typeof itemIndex !== "number") {
      return NextResponse.json({ error: "userId, serviceId, progress, moduleIndex, itemIndex are required" }, { status: 400 });
    }

    // Verify purchase is completed
    const purchase = await Purchase.findOne({ chat_id: userId, service: serviceId })
      .select("status service")
      .lean<{ status: "pending" | "completed" | "failed" }>();
    if (!purchase || purchase.status !== "completed") {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    // Upsert UserCourses and set completion
    const key = String(progress);
    const now = new Date();
    const update = {
      $set: {
        [`progress.${key}.${moduleIndex}.${itemIndex}.completed`]: true,
        [`progress.${key}.${moduleIndex}.${itemIndex}.completedAt`]: now,
      },
    } as any;

    const result = await UserCourses.findOneAndUpdate(
      { chat_id: userId, service: serviceId },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean<{
      chat_id: string;
      service: string;
      progress: Record<string, Record<string, { completed: boolean; completedAt: Date | null }[]>>;
    }>();

    return NextResponse.json({ success: true, progress: result?.progress ?? {} });
  } catch (error: any) {
    console.error("Error updating completion:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



