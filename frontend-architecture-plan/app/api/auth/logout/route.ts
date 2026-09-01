import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");

  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully from Next.js server session",
  });

  response.cookies.set("accessToken", "", {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  response.cookies.set("refreshToken", "", {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}

export async function GET() {
  return POST();
}
