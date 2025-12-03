import { NextRequest, NextResponse } from 'next/server'

/**
 * OAuth Callback Handler
 * Handles OAuth redirects from all providers
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: urlProvider } = await params
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Use state parameter as the device ID if available (it contains the actual device ID like 'google_fit')
  // Fall back to URL provider for backward compatibility
  const provider = state || urlProvider

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

  return NextResponse.redirect(redirectUrl)
}
