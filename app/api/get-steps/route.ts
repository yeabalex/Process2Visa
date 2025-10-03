import { NextRequest, NextResponse } from "next/server";
import mongoosePromise from "@/db/db.config";
import { Steps, Purchase } from "@/db/models";

// GET /api/get-steps?userId=...&serviceId=...
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

    // Verify purchase exists and is completed
    const purchase = await Purchase.findOne({ chat_id: userId, service: serviceId })
      .select("status service")
      .lean<{ status: "pending" | "completed" | "failed"; service: string }>();

    if (!purchase) {
      return NextResponse.json({ error: "No purchase found for this service" }, { status: 404 });
    }

    if (purchase.status !== "completed") {
      return NextResponse.json({ error: "Purchase not completed" }, { status: 403 });
    }

    const stepsDoc = await Steps.findOne({ serviceId: serviceId })
      .lean<{ serviceId: string; steps: any[] }>();

    if (!stepsDoc) {
      return NextResponse.json({ steps: [] }, { status: 200 });
    }

    return NextResponse.json({ steps: stepsDoc.steps, serviceId: stepsDoc.serviceId });
  } catch (error: any) {
    console.error("Error fetching steps:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


