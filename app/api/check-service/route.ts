import { NextRequest, NextResponse } from "next/server";
import mongoosePromise from "@/db/db.config";
import { Purchase } from "@/db/models";

// GET /api/check-service?userId=...&serviceId=...
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

    const purchase = await Purchase.findOne({
      chat_id: userId,
      service: serviceId,
    })
      .select("status service")
      .lean<{ status: "pending" | "completed" | "failed"; service: string }>();

    if (!purchase) {
      return NextResponse.json(
        { found: false, status: null },
        { status: 200 }
      );
    }

    return NextResponse.json({ found: true, status: purchase.status });
  } catch (error: any) {
    console.error("Error checking service purchase:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


