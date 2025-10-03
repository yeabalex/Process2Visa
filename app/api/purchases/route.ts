export const runtime = "nodejs";
 
import mongoosePromise from "@/db/db.config"; // your mongoosePromise connection
import { Purchase, Service } from "@/db/models";   // centralized models
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const chat_id = searchParams.get("chat_id");
    const serviceName = searchParams.get("service"); // optional

    if (!chat_id) {
      return new Response(JSON.stringify({ error: "chat_id is required" }), { status: 400 });
    }

    await mongoosePromise;

    const purchases = await Purchase.find({ chat_id })
      .populate("service")
      .select("service")
      .lean();

    let uniqueServices = Array.from(
      new Map(
        purchases.filter(p => p.service)
                 .map(p => [p.service._id.toString(), p.service])
      ).values()
    );

    if (serviceName) {
      uniqueServices = uniqueServices.filter(
        s => s.name.toLowerCase() === serviceName.toLowerCase()
      );
    }

    return new Response(JSON.stringify({ services: uniqueServices }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error fetching services:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
