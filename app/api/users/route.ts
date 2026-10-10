import { db, users } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const user = await currentUser();
  //If user already exists in DB
  const usersResult = await db
    .select()
    .from(users)
    .where(eq(users.email, user?.primaryEmailAddress?.emailAddress ?? ""));

  //If user does not exist in DB, create a new user
  if (usersResult.length === 0) {
    const result = await db
      .insert(users)
      .values({
        name: user?.fullName ?? "",
        email: user?.primaryEmailAddress?.emailAddress ?? "",
      })
      .returning();

    return NextResponse.json(result);
  }
  return NextResponse.json(usersResult[0]);
}
