import { db } from "@/app/lib/db";
import { user } from "@/app/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  // If the user did not enter a username
  if (!username) {
    const url = new URL("/", request.url);
    url.searchParams.set("error", "Please enter a username");
    return NextResponse.redirect(url, { status: 302 });
  }

  // If the user did not enter a password
  if (!password) {
    const url = new URL("/", request.url);
    url.searchParams.set("error", "Please enter a password");
    return NextResponse.redirect(url, { status: 302 });
  }

  // Try to query the user from the database
  const userResult = await db.select()
    .from(user)
    .where(eq(user.username, username.toString()));

  // Not real password validation
  // In the real world, we would store hashed passwords in the database as use something like JWT for authentication
  if (!userResult.length || password !== userResult[0].password) {
    const url = new URL("/", request.url);
    url.searchParams.set("error", "Invalid login credentials");
    return NextResponse.redirect(url, { status: 302 });
  }

  // Determine whether to redirect to the questionnaires page or admin page
  let url = new URL("/", request.url);
  if (userResult[0].isAdmin) {
    url = new URL("/admin", request.url);
  } else {
    url = new URL("/questionnaires", request.url);
  };
  const res = NextResponse.redirect(url, { status: 302 });

  // Set a cookie for the user's session
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/'
  }
  res.cookies.set("user", JSON.stringify(userResult[0]), cookieOpts);

  return res;
}

