import { NextResponse } from "next/server";
import { testPurchaseCompletionFlow } from "@/lib/test-purchase-flow";

export async function GET() {
  try {
    const result = await testPurchaseCompletionFlow();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Purchase completion flow test completed successfully",
        data: result
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "Purchase completion flow test failed",
        error: result.message
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in test endpoint:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message
    }, { status: 500 });
  }
}
