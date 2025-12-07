// import { NextResponse } from "next/server";

// export function middleware(request) {
//     const token = request.cookies.get("token")?.value;
//     const path = request.nextUrl.pathname;

//     const isPublic = path.startsWith("/login") || path.startsWith("/register");

//     if (!token && !isPublic) {
//         return NextResponse.redirect(new URL("/login", request.url));
//     }

//     if (token && isPublic) {
//         return NextResponse.redirect(new URL("/dashboard", request.url));
//     }

//     return NextResponse.next();
// }

// export const config = {
//     matcher: ["/((?!_next/static|_next/image).*)"],
// };



import { NextResponse } from "next/server";

export function middleware(request) {
    const token = request.cookies.get("token")?.value;
    const path = request.nextUrl.pathname;

    const isPublic = path.startsWith("/login") || path.startsWith("/register");

    if (!token && !isPublic) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (token && isPublic) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next|api).*)"],
};
