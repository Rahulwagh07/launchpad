import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const poolId = url.searchParams.get('poolId');

    if (!poolId) {
      return NextResponse.json(
        { message: "poolId is required" },
        { status: 400 }
      );
    }

    const poolExists = await prisma.user.findFirst({
      where: {
        pools: {
          has: poolId,
        },
      },
    });

    return NextResponse.json(
      { isExist: !!poolExists },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error checking pool existence", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}