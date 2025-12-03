// app/api/oauth/callback/google/route.ts
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const state = searchParams.get('state')

  const redirectUrl = new URL('/connect', request.url)

  if (error || !code) {
    redirectUrl.searchParams.set('error', error || 'missing_code')
  } else {
    redirectUrl.searchParams.set('code', code)
    redirectUrl.searchParams.set('provider', state || 'google_fit')
    // ← THIS LINE IS CRITICAL
    redirectUrl.searchParams.set('redirectUri', `${request.headers.get('host')?.includes('localhost') ? 'http' : 'https'}://${request.headers.get('host')}/api/oauth/callback/google`)
  }

  return Response.redirect(redirectUrl)
}