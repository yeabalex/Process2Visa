import { NextRequest, NextResponse } from "next/server";
import mongoosePromise from "@/db/db.config";
import Service from "@/db/serviceModel";

export async function GET() {
  try {
    await mongoosePromise;
    const services = await Service.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, displayName, description, price, currency, image } = body;

    if (!name || !displayName) {
      return NextResponse.json(
        { success: false, message: "Name and display name are required" },
        { status: 400 }
      );
    }

    await mongoosePromise;
    const service = new Service({
      name: name.toLowerCase().trim(),
      displayName: displayName.trim(),
      description: description?.trim(),
      price: price || 0,
      currency: currency || "ETB",
      image: image?.trim() || undefined,
    });

    await service.save();

    return NextResponse.json({
      success: true,
      message: "Service created successfully",
      data: service,
    });
  } catch (error: any) {
    console.error("Error creating service:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Service name already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create service" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, displayName, description, price, currency, image } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Service ID is required" },
        { status: 400 }
      );
    }

    await mongoosePromise;
    const updateData: any = {};

    if (name) updateData.name = name.toLowerCase().trim();
    if (displayName) updateData.displayName = displayName.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (price !== undefined) updateData.price = price;
    if (currency) updateData.currency = currency;
    if (image !== undefined) updateData.image = image?.trim() || undefined;

    const service = await Service.findByIdAndUpdate(id, updateData, { new: true });

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Service updated successfully",
      data: service,
    });
  } catch (error: any) {
    console.error("Error updating service:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Service name already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update service" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Service ID is required" },
        { status: 400 }
      );
    }

    await mongoosePromise;
    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete service" },
      { status: 500 }
    );
  }
}
