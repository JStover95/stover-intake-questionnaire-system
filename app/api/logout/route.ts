import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL("/", request.url)
  const res = NextResponse.redirect(url);
  res.cookies.delete("user");
  return res;
}
