import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, auth_id } = await req.json();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        auth_id,
      },
    });

    return NextResponse.json(user);
  } catch (err: unknown) {
    console.error("Error creating user:", err instanceof Error ? err : err); // Cast to Error for message if needed
    
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
