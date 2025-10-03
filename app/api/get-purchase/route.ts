import { NextRequest, NextResponse } from "next/server";
import mongoosePromise from "@/db/db.config";
import Purchase from "@/db/purchaseModel";
import Service from "@/db/serviceModel";

export async function GET(request: NextRequest) {
  try {
    await mongoosePromise; // Ensure DB is connected

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const purchases = await Purchase.find({ chat_id: userId }).lean();

    if (!purchases.length) {
      return NextResponse.json({ services: [] }); // No purchases found
    }

    const serviceIds = [...new Set(purchases.map(p => p.service.toString()))];

    const services = await Service.find({ _id: { $in: serviceIds } }).lean();

    return NextResponse.json({ services });
  } catch (error: any) {
    console.error("Error fetching user purchases:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
