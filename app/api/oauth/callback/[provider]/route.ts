import { NextRequest, NextResponse } from 'next/server'

/**
 * OAuth Callback Handler
 * Handles OAuth redirects from all providers
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Handle OAuth errors
  if (error) {
    const errorDescription = searchParams.get('error_description') || 'Authorization failed'
    return NextResponse.redirect(
      new URL(`/connect?error=${encodeURIComponent(errorDescription)}&provider=${provider}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(`/connect?error=${encodeURIComponent('No authorization code received')}&provider=${provider}`, request.url)
    )
  }

  // Redirect back to connect page with the code
  // The client-side will handle the token exchange
  const redirectUrl = new URL('/connect', request.url)
  redirectUrl.searchParams.set('code', code)
  redirectUrl.searchParams.set('provider', provider)
  if (state) {
    redirectUrl.searchParams.set('state', state)
  }

  return NextResponse.redirect(redirectUrl)
}
