import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const pathname = req.nextUrl.pathname;

    // Manage route protection
    const isAuth = await getToken({ req });
    console.log("from middleware");
    console.log(isAuth);
    const isLoginPage = pathname.startsWith("/auth/signin");

    const protectedRoutes = ["/dashboard"];
    const isAccessingProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isLoginPage && isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (!isAuth && isAccessingProtectedRoute) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    if (pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized() {
        return true;
      },
    },
  }
);

export const config = {
  matchter: ["/", "/auth/signin", "/dashboard/:path*"],
};
