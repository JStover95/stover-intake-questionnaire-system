import { db } from "@/app/lib/db";
import { user } from "@/app/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  if (!username) {
    const url = new URL("/", request.url);
    url.searchParams.set("error", "Please enter a username");
    return NextResponse.redirect(url, { status: 302 });
  }

  if (!password) {
    const url = new URL("/", request.url);
    url.searchParams.set("error", "Please enter a password");
    return NextResponse.redirect(url, { status: 302 });
  }

  const userResult = await db.select().from(user).where(eq(user.username, username.toString()));

  // Not real password validation
  if (!userResult.length || password !== userResult[0].password) {
    const url = new URL("/", request.url);
    url.searchParams.set("error", "Invalid login credentials");
    return NextResponse.redirect(url, { status: 302 });
  }

  let url = new URL("/", request.url);
  if (userResult[0].isAdmin) {
    url = new URL("/admin", request.url);
  } else {
    url = new URL("/questionnaires", request.url);
  };
  const res = NextResponse.redirect(url, { status: 302 });
 
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/'
  }

  res.cookies.set("user", JSON.stringify(userResult[0]), cookieOpts);
  return res;
}

