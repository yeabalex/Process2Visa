import { NextRequest, NextResponse } from "next/server";
import mongoosePromise from "@/db/db.config";
import { ItemsCompleted } from "@/db/models";

// POST /api/items-completed - Create or update completed item
export async function POST(request: NextRequest) {
  try {
    await mongoosePromise;

    const body = await request.json();
    const { serviceid, chat_id, item_id, completed } = body;

    console.log('Items completed request:', { serviceid, chat_id, item_id, completed });

    // Validate required fields
    if (!serviceid || !chat_id || !item_id) {
      return NextResponse.json(
        { error: "serviceid, chat_id, and item_id are required" },
        { status: 400 }
      );
    }

    if (completed) {
      // Mark item as completed (upsert)
      const result = await ItemsCompleted.findOneAndUpdate(
        { serviceid, chat_id, item_id },
        {
          serviceid,
          chat_id,
          item_id,
          completed_at: new Date()
        },
        {
          upsert: true,
          new: true,
          runValidators: true
        }
      );

      console.log('Item marked as completed:', result);

      return NextResponse.json({
        success: true,
        message: "Item marked as completed",
        data: result
      });
    } else {
      // Mark item as incomplete (remove from completed items)
      const result = await ItemsCompleted.findOneAndDelete({
        serviceid,
        chat_id,
        item_id
      });

      console.log('Item marked as incomplete:', result);

      return NextResponse.json({
        success: true,
        message: "Item marked as incomplete",
        data: result
      });
    }

  } catch (error: any) {
    console.error("Error updating items completed:", error);
    return NextResponse.json(
      { error: "Failed to update items completed", details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/items-completed - Get completed items for a user and service
export async function GET(request: NextRequest) {
  try {
    await mongoosePromise;

    const { searchParams } = new URL(request.url);
    const serviceid = searchParams.get('serviceid');
    const chat_id = searchParams.get('chat_id');
    const item_id = searchParams.get('item_id');

    // Build query based on provided parameters
    const query: any = {};
    if (serviceid) query.serviceid = serviceid;
    if (chat_id) query.chat_id = chat_id;
    if (item_id) query.item_id = item_id;

    const completedItems = await ItemsCompleted.find(query).sort({ completed_at: -1 });

    return NextResponse.json({
      success: true,
      data: completedItems
    });

  } catch (error: any) {
    console.error("Error fetching items completed:", error);
    return NextResponse.json(
      { error: "Failed to fetch items completed", details: error.message },
      { status: 500 }
    );
  }
}
