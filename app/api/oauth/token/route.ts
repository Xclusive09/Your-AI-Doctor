import { NextRequest, NextResponse } from 'next/server'

/**
 * OAuth Token Exchange Endpoint
 * Exchanges authorization code for access token
 */

// Helper function to fetch with timeout and retry
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  retries = 3, 
  timeout = 15000
): Promise<Response> {
  let lastError: Error | null = null
  
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      lastError = error as Error
      console.warn(`Fetch attempt ${i + 1}/${retries} failed:`, error)
      
      // Wait before retrying (exponential backoff)
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }
  
  throw lastError || new Error('Fetch failed after retries')
}

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
    // Note: Using NEXT_PUBLIC_ prefix for client IDs as they're shared with frontend
const configs: Record<string, { tokenUrl: string; clientId: string; clientSecret: string }> = {
  google_fit: {
    tokenUrl: 'https://www.googleapis.com/oauth2/v4/token',  // THIS FIXES ETIMEDOUT
    clientId: process.env.NEXT_PUBLIC_GOOGLE_FIT_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_FIT_CLIENT_SECRET || '',
  },
  fitbit: {
    tokenUrl: 'https://api.fitbit.com/oauth2/token',
    clientId: process.env.NEXT_PUBLIC_FITBIT_CLIENT_ID || '',
    clientSecret: process.env.FITBIT_CLIENT_SECRET || '',
  },
  withings: {
    tokenUrl: 'https://wbsapi.withings.net/v2/oauth2',
    clientId: process.env.NEXT_PUBLIC_WITHINGS_CLIENT_ID || '',
    clientSecret: process.env.WITHINGS_CLIENT_SECRET || '',
  },
  oura: {
    tokenUrl: 'https://api.ouraring.com/oauth/token',
    clientId: process.env.NEXT_PUBLIC_OURA_CLIENT_ID || '',
    clientSecret: process.env.OURA_CLIENT_SECRET || '',
  },
  // strava: {
  //   tokenUrl: 'https://www.strava.com/oauth/token',
  //   clientId: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID || '',
  //   clientSecret: process.env. env.STRAVA_CLIENT_SECRET || '',
  // },
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
      tokenResponse = await fetchWithRetry(config.tokenUrl, {
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
      tokenResponse = await fetchWithRetry(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenParams.toString(),
      })
    } else {
      // Standard OAuth2 token exchange
      tokenResponse = await fetchWithRetry(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenParams.toString(),
      })
    }

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error(`Token exchange failed for ${deviceId}:`, {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText,
        requestedRedirectUri: redirectUri,
        clientIdPresent: !!config.clientId,
        clientSecretPresent: !!config.clientSecret,
      })
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
    
    // Provide more helpful error messages
    let errorMessage = 'Internal server error'
    let errorDetails = ''
    
    if (error instanceof Error) {
      if (error.message.includes('ETIMEDOUT') || error.message.includes('timeout') || error.name === 'AbortError') {
        errorMessage = 'Connection timeout'
        errorDetails = 'Unable to reach the OAuth server. Please check your internet connection and try again.'
      } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
        errorMessage = 'DNS resolution failed'
        errorDetails = 'Unable to resolve the OAuth server address. Please check your network configuration.'
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Connection refused'
        errorDetails = 'The OAuth server refused the connection.'
      } else {
        errorDetails = error.message
      }
    }
    
    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: 500 }
    )
  }
}
