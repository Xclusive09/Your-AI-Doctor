import { NextRequest, NextResponse } from 'next/server'

/**
 * OAuth Token Exchange Endpoint
 * Exchanges authorization code for access token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deviceId, code, codeVerifier, redirectUri } = body

    if (!deviceId || !code) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // OAuth configurations for each provider
    const configs: Record<string, { tokenUrl: string; clientId: string; clientSecret: string }> = {
      google_fit: {
        tokenUrl: 'https://oauth2.googleapis.com/token',
        clientId: process.env.GOOGLE_FIT_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_FIT_CLIENT_SECRET || '',
      },
      fitbit: {
        tokenUrl: 'https://api.fitbit.com/oauth2/token',
        clientId: process.env.FITBIT_CLIENT_ID || '',
        clientSecret: process.env.FITBIT_CLIENT_SECRET || '',
      },
      withings: {
        tokenUrl: 'https://wbsapi.withings.net/v2/oauth2',
        clientId: process.env.WITHINGS_CLIENT_ID || '',
        clientSecret: process.env.WITHINGS_CLIENT_SECRET || '',
      },
      oura: {
        tokenUrl: 'https://api.ouraring.com/oauth/token',
        clientId: process.env.OURA_CLIENT_ID || '',
        clientSecret: process.env.OURA_CLIENT_SECRET || '',
      },
      strava: {
        tokenUrl: 'https://www.strava.com/oauth/token',
        clientId: process.env.STRAVA_CLIENT_ID || '',
        clientSecret: process.env.STRAVA_CLIENT_SECRET || '',
      },
    }

    const config = configs[deviceId]
    if (!config) {
      return NextResponse.json(
        { error: `Unknown device: ${deviceId}` },
        { status: 400 }
      )
    }

    // Build token request body
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    })

    if (codeVerifier) {
      tokenParams.append('code_verifier', codeVerifier)
    }

    // Special handling for different providers
    let tokenResponse: Response

    if (deviceId === 'fitbit') {
      // Fitbit uses Basic Auth
      const basicAuth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')
      tokenResponse = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenParams.toString(),
      })
    } else if (deviceId === 'withings') {
      // Withings uses action parameter
      tokenParams.append('action', 'requesttoken')
      tokenResponse = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenParams.toString(),
      })
    } else {
      // Standard OAuth2 token exchange
      tokenResponse = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenParams.toString(),
      })
    }

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error(`Token exchange failed for ${deviceId}:`, errorText)
      return NextResponse.json(
        { error: 'Token exchange failed', details: errorText },
        { status: tokenResponse.status }
      )
    }

    const tokenData = await tokenResponse.json()

    // Normalize response format
    let normalizedResponse
    if (deviceId === 'withings' && tokenData.body) {
      normalizedResponse = {
        access_token: tokenData.body.access_token,
        refresh_token: tokenData.body.refresh_token,
        expires_in: tokenData.body.expires_in,
        token_type: 'Bearer',
      }
    } else {
      normalizedResponse = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        token_type: tokenData.token_type || 'Bearer',
      }
    }

    return NextResponse.json(normalizedResponse)
  } catch (error) {
    console.error('OAuth token exchange error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
