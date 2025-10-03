import { NextRequest, NextResponse } from "next/server";
import mongoosePromise from "@/db/db.config";
import Steps from "@/db/stepsSchema";
import Service from "@/db/serviceModel";

export async function GET() {
  try {
    await mongoosePromise;

    const stepsData = await Steps.find({})
      .populate("serviceId")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: stepsData,
    });
  } catch (error) {
    console.error("Error fetching steps:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch steps" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceId, steps } = body;

    if (!serviceId || !steps || !Array.isArray(steps)) {
      return NextResponse.json(
        { success: false, message: "Service ID and steps array are required" },
        { status: 400 }
      );
    }

    await mongoosePromise;

    // Verify service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 }
      );
    }

    const stepsData = new Steps({
      serviceId,
      steps,
    });

    await stepsData.save();

    return NextResponse.json({
      success: true,
      message: "Steps created successfully",
      data: stepsData,
    });
  } catch (error) {
    console.error("Error creating steps:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create steps" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, serviceId, steps } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Steps ID is required" },
        { status: 400 }
      );
    }

    await mongoosePromise;

    const updateData: any = {};

    if (serviceId) {
      const service = await Service.findById(serviceId);
      if (!service) {
        return NextResponse.json(
          { success: false, message: "Service not found" },
          { status: 404 }
        );
      }
      updateData.serviceId = serviceId;
    }

    if (steps !== undefined) updateData.steps = steps;

    const stepsData = await Steps.findByIdAndUpdate(id, updateData, { new: true })
      .populate("serviceId");

    if (!stepsData) {
      return NextResponse.json(
        { success: false, message: "Steps not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Steps updated successfully",
      data: stepsData,
    });
  } catch (error) {
    console.error("Error updating steps:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update steps" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Steps ID is required" },
        { status: 400 }
      );
    }

    await mongoosePromise;
    const stepsData = await Steps.findByIdAndDelete(id);

    if (!stepsData) {
      return NextResponse.json(
        { success: false, message: "Steps not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Steps deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting steps:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete steps" },
      { status: 500 }
    );
  }
}
