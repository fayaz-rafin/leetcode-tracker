import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authenticatedUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authenticatedUser?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrismaClient();
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name || name.length > 80) {
      return NextResponse.json(
        { error: "Name must be between 1 and 80 characters" },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        email: authenticatedUser.email,
        auth_id: authenticatedUser.id,
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
