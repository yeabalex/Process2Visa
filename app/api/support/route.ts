import { NextRequest, NextResponse } from "next/server";
import mongoosePromise from "@/db/db.config";
import SupportTicketModel from "@/db/supportTicketModel";

// Support ticket interface for the API
interface SupportTicketData {
  name: string;
  phoneNumber: string;
  telegramUsername?: string;
  category: string;
  subject: string;
  message: string;
}

// POST - Submit a support ticket
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phoneNumber, telegramUsername, category, subject, message } = body;

    // Basic validation
    if (!name || !phoneNumber || !category || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { success: false, message: "Invalid phone number format" },
        { status: 400 }
      );
    }

    await mongoosePromise;

    // Generate unique ticket ID
    const ticketId = `SPT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create and save support ticket to database
    const supportTicket = new SupportTicketModel({
      name,
      phoneNumber,
      telegramUsername: telegramUsername || "",
      category,
      subject,
      message,
      ticketId,
      status: "open",
      priority: "medium",
    });

    const savedTicket = await supportTicket.save();

    // Log the new support ticket
    console.log("New support ticket created:", {
      ticketId,
      name,
      phoneNumber,
      telegramUsername,
      category,
      subject,
      message,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: "Support ticket submitted successfully",
      ticketId: savedTicket.ticketId,
    });

  } catch (error) {
    console.error("Error submitting support ticket:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit support ticket" },
      { status: 500 }
    );
  }
}

// GET - Retrieve support tickets (for admin use)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const status = searchParams.get("status"); // Filter by status if provided

    const skip = (page - 1) * limit;

    await mongoosePromise;

    // Build query
    const query: any = {};
    if (status) {
      query.status = status;
    }

    // Get tickets from database
    const tickets = await SupportTicketModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SupportTicketModel.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: tickets,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Error fetching support tickets:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch support tickets" },
      { status: 500 }
    );
  }
}
