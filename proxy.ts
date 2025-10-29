import { NextResponse, NextRequest } from "next/server";

// ✅ Middleware function
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 🍪 Read token from cookies (set by backend)
    const token = request.cookies.get("access_token")?.value;

    // 🔒 If user is logged in, prevent access to auth pages
    if (token && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
        // Redirect logged-in user away from login/register
        return NextResponse.redirect(new URL("/", request.url)); // redirect to homepage or dashboard
    }

    // 🛑 If user is not logged in, block access to protected routes
    const protectedRoutes = ["/account", "/orders", "/profile", "/checkout", "/cart"]; // add your secure routes
    if (!token && protectedRoutes.some((route) => pathname.startsWith(route))) {
        // Redirect to login page
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // ✅ Otherwise, continue
    return NextResponse.next();
}

// ✅ Apply middleware globally or selectively
export const config = {
    matcher: [
        "/login",
        "/register",
        "/account/:path*",
        "/orders/:path*",
        "/profile/:path*",
        "/checkout/:path*",
        "/cart"
    ],
};
