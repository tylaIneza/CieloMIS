import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isLoginPage = req.nextUrl.pathname.startsWith("/login")

  if (!isLoggedIn && !isLoginPage) {
    const redirectUrl = new URL("/login", req.nextUrl)
    redirectUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
}
