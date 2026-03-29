import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/api/webhooks/(.*)',
  '/api/clerk/(.*)',         // ← add
  '/sign-in(.*)',            // ← add
  '/sign-up(.*)',            // ← add
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    const { userId } = await auth()
    if (!userId) {
      const url = req.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('auth', 'true')
      return NextResponse.redirect(url)
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|.*\\..*|_clerk).*)',   // ← updated to also exclude _clerk
    '/(api|trpc)(.*)',
  ],
}