import { NextRequest, NextResponse } from "next/server";
import mongoosePromise from "@/db/db.config";
import { Course } from "@/db/userModel";
import Service from "@/db/serviceModel";

export async function GET() {
  try {
    await mongoosePromise;

    const courses = await Course.find({})
      .populate("service")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { progress, country, serviceId, module } = body;

    if (!progress || !country || !serviceId) {
      return NextResponse.json(
        { success: false, message: "Progress, country, and service ID are required" },
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

    // Note: Content is managed within individual course items (courseItemSchema.content)
    // not as a direct field on the course schema
    const course = new Course({
      progress,
      country,
      service: serviceId,
      module: module || [],
    });

    await course.save();

    return NextResponse.json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create course" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, progress, country, serviceId, module } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Course ID is required" },
        { status: 400 }
      );
    }

    await mongoosePromise;

    const updateData: any = {};

    if (progress !== undefined) updateData.progress = progress;
    if (country) updateData.country = country;
    if (serviceId) {
      const service = await Service.findById(serviceId);
      if (!service) {
        return NextResponse.json(
          { success: false, message: "Service not found" },
          { status: 404 }
        );
      }
      updateData.service = serviceId;
    }
    if (module !== undefined) updateData.module = module;

    const course = await Course.findByIdAndUpdate(id, updateData, { new: true })
      .populate("service");

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update course" },
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
        { success: false, message: "Course ID is required" },
        { status: 400 }
      );
    }

    await mongoosePromise;
    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete course" },
      { status: 500 }
    );
  }
}
