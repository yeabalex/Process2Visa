import Purchase from "@/db/purchaseModel";
import mongoosePromise from "@/db/db.config";
import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/sendTgMessage";
import { UserCourses } from "@/db/userModel";
import { buildEmptyProgress } from "@/lib/courseProgress";

export async function POST(req: NextRequest) {
  try {
    await mongoosePromise;

    const body = await req.json();
    const { chat_id, service, amount, method, txn_id } = body;

    if (!chat_id || !service || !amount || !method || !txn_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const purchase = new Purchase({
      chat_id,
      service,
      amount,
      method,
      currency: body.currency || "ETB",
      date: body.date ? new Date(body.date) : new Date(),
      status: body.status || "pending",
      txn_id,
    });

    const savedPurchase = await purchase.save();

    // Build confirmation message with "please wait" notice
    const message = `✅ *Purchase Request Received!*\n\n` +
      `*Service:* ${service}\n` +
      `*Amount:* ${amount} ${purchase.currency}\n` +
      `*Method:* ${method}\n` +
      `*Transaction ID:* \`${txn_id}\`\n` +
      `*Status:* ${purchase.status}\n` +
      `*Date:* ${purchase.date.toLocaleString()}\n\n` +
      `⏳ *Please wait a few hours while we confirm your payment.*\n` +
      `You will receive another message once your payment is verified.`;

    await sendTelegramMessage(chat_id, message);

    // Initialize UserCourses document with empty progress structure
    try {
      // Fetch course data for this service to build progress structure
      const courseResponse = await fetch(`${req.nextUrl.origin}/api/course?serviceId=${service}`, {
        headers: {
          'Authorization': req.headers.get('Authorization') || '',
        },
      });

      if (courseResponse.ok) {
        const courseData = await courseResponse.json();

        if (courseData.success && courseData.data) {
          // Build empty progress structure from course data
          const emptyProgress = buildEmptyProgress(courseData.data);

          // Check if UserCourses document already exists
          const existingUserCourse = await UserCourses.findOne({ chat_id: chat_id, service });

          if (!existingUserCourse) {
            // Create new UserCourses document with empty progress
            await UserCourses.create({
              chat_id: chat_id,
              service,
              progress: emptyProgress,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error initializing UserCourses:", error);
      // Don't fail the purchase if UserCourses initialization fails
    }

    return NextResponse.json(savedPurchase, { status: 201 });
  } catch (error: any) {
    console.error("Error creating purchase:", error);
    return NextResponse.json(
      { error: "Failed to create purchase" },
      { status: 500 }
    );
  }
}
