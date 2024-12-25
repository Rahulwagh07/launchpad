import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { poolId, address } = await req.json();

    const user = await prisma.user.findFirst({
      where: {
        address: address,
      },
    });

    if (user && !user.pools.includes(poolId)) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          pools: [...user.pools, poolId], 
        },
      });
    } else {
       if(!user){
        await prisma.user.create({
          data: {
            address: address,
            pools: [poolId],
          },
        });
       }
    }

    return NextResponse.json(
      { message: "pool Id stored in db" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in storing poolId in db", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function GET(req: Request) {
  try{
    const url = new URL(req.url);
    const address = url.searchParams.get('address'); 
    if(!address){
      const allPools = await prisma.user.findMany({
        select: {
          pools: true,
        },
      });
      const poolIds = [...new Set(allPools.flatMap(user => user.pools))];
      return NextResponse.json(
        {data: poolIds},
        { status: 200 }
      );
    } 
    const user = await prisma.user.findFirst({
      where: {
        address: address,
      },
    });
    if(user){
      return NextResponse.json(
        {data: user.pools},
        { status: 200 }
      );
    }
  } catch(error){
    console.log("Error fetching poolids by address", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}