import { db, users } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let user = null;
  
  try {
    user = await currentUser();
  } catch (error) {
    console.error("Clerk network error during currentUser():", error);
    return NextResponse.json(
      { error: "Temporary authentication failure. Please try again." },
      { status: 503 }
    );
  }

  const email = user?.primaryEmailAddress?.emailAddress;

  if (!user || !email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user already exists in DB
  const usersResult = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (usersResult.length > 0) {
    return NextResponse.json(usersResult[0]);
  }

  // If user does not exist, safely insert with conflict handling
  try {
    const result = await db
      .insert(users)
      .values({
        name: user?.fullName ?? "",
        email: email,
      })
      .onConflictDoNothing({ target: users.email })
      .returning();

    // If another request inserted it concurrently, fetch it now
    if (result.length === 0) {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
      return NextResponse.json(existingUser[0]);
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Database error during user creation:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}