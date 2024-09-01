import { NextResponse } from "next/server";

export async function GET(request: Request) {

  // Redirect the user to the login page
  const url = new URL("/", request.url)
  const res = NextResponse.redirect(url);

  // Delete the user's session cookie
  res.cookies.delete("user");
  return res;
}
