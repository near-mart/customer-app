import { NextResponse, NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    let token = request.cookies.get("access_token")?.value;
    let refreshToken = request.cookies.get("refresh_token")?.value;

    if (!token && refreshToken) {
        try {
            const res = await fetch(`${process.env.BASE_URL}/service/customer_service/v1/no-auth/refresh-token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (res.ok) {
                const data = await res.json();
                token = data?._payload?.accessToken;
                if (data?._payload?.refreshToken) {
                    refreshToken = data?._payload?.refreshToken;
                }
                const response = NextResponse.next();
                response.cookies.set("access_token", token, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 60 * 60 * 1000,  // 1 hour expiration
                    sameSite: "none",
                    path: "/",
                });
                response.cookies.set("refresh_token", refreshToken, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days expiration
                    sameSite: "none",
                    path: "/",
                });
                return response;
            } else {
                console.log("Token refresh failed");
            }
        } catch (error) {
            console.error("Error refreshing token:", error);
        }
    }

    // 🔒 Auth route protection logic
    const protectedRoutes = ["/account", "/orders", "/profile", "/checkout", "/cart"];

    // If logged in, prevent access to login/register
    if (token && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // If not logged in, block protected routes
    if (!token && protectedRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/login",
        "/register",
        "/account/:path*",
        "/orders/:path*",
        "/profile/:path*",
        "/checkout/:path*",
        "/cart",
    ],
};
