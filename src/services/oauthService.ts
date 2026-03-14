/**
 * OAuth Service — Dashboard
 * Handles OAuth flows for 103 platforms via sofia-mastra backend.
 * Uses popup-based OAuth flow: open provider → callback → exchange token.
 */

const MASTRA_URL =
  (import.meta.env.VITE_MASTRA_URL as string) || 'http://localhost:4111'

const OAUTH_CALLBACK_URL =
  (import.meta.env.VITE_OAUTH_CALLBACK_URL as string) ||
  `${window.location.origin}/auth/callback`

// ── Platform OAuth configs (client-side) ──

interface OAuthProviderConfig {
  authUrl: string
  scopes: string[]
  clientIdEnvKey?: string
}

const OAUTH_PROVIDERS: Record<string, OAuthProviderConfig> = {
  github: {
    authUrl: 'https://github.com/login/oauth/authorize',
    scopes: ['read:user', 'repo'],
  },
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/fitness.activity.read',
    ],
  },
  spotify: {
    authUrl: 'https://accounts.spotify.com/authorize',
    scopes: ['user-read-recently-played', 'user-top-read', 'user-library-read'],
  },
  discord: {
    authUrl: 'https://discord.com/api/oauth2/authorize',
    scopes: ['identify', 'guilds'],
  },
  twitch: {
    authUrl: 'https://id.twitch.tv/oauth2/authorize',
    scopes: ['user:read:follows'],
  },
  twitter: {
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    scopes: ['tweet.read', 'users.read', 'follows.read'],
  },
  reddit: {
    authUrl: 'https://www.reddit.com/api/v1/authorize',
    scopes: ['identity', 'mysubreddits', 'read'],
  },
  strava: {
    authUrl: 'https://www.strava.com/oauth/authorize',
    scopes: ['activity:read'],
  },
}

// ── Types ──

export interface OAuthResult {
  success: boolean
  platformId: string
  userId?: string
  username?: string
  error?: string
}

export interface LinkResult {
  success: boolean
  platformId: string
  userId?: string
  username?: string
  txHash?: string
  error?: string
}

// ── OAuth Flow ──

/**
 * Initiate OAuth flow for a platform via popup window.
 * Returns the authorization code from the callback.
 */
export function startOAuthFlow(platformId: string): Promise<string> {
  const provider = OAUTH_PROVIDERS[platformId]
  if (!provider) {
    return Promise.reject(new Error(`No OAuth config for platform: ${platformId}`))
  }

  const state = `${platformId}_${Date.now()}_${Math.random().toString(36).slice(2)}`
  sessionStorage.setItem('oauth_state', state)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: '', // Will be set by sofia-mastra proxy
    redirect_uri: OAUTH_CALLBACK_URL,
    scope: provider.scopes.join(' '),
    state,
  })

  const url = `${MASTRA_URL}/api/oauth/${platformId}/authorize?${params}`

  return new Promise((resolve, reject) => {
    const popup = window.open(url, 'oauth_popup', 'width=600,height=700')
    if (!popup) {
      reject(new Error('Popup blocked — please allow popups'))
      return
    }

    const interval = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(interval)
          reject(new Error('OAuth cancelled'))
        }
      } catch {
        // Cross-origin — popup still loading
      }
    }, 500)

    // Listen for message from callback page
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type !== 'oauth_callback') return

      clearInterval(interval)
      window.removeEventListener('message', handler)
      popup.close()

      const savedState = sessionStorage.getItem('oauth_state')
      sessionStorage.removeItem('oauth_state')

      if (event.data.state !== savedState) {
        reject(new Error('OAuth state mismatch'))
        return
      }

      if (event.data.error) {
        reject(new Error(event.data.error))
        return
      }

      resolve(event.data.code)
    }

    window.addEventListener('message', handler)

    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(interval)
      window.removeEventListener('message', handler)
      if (!popup.closed) popup.close()
      reject(new Error('OAuth timeout'))
    }, 5 * 60 * 1000)
  })
}

/**
 * Exchange authorization code for token via sofia-mastra backend.
 */
export async function exchangeOAuthCode(
  platformId: string,
  code: string,
): Promise<OAuthResult> {
  const response = await fetch(`${MASTRA_URL}/api/oauth/${platformId}/callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, redirectUri: OAUTH_CALLBACK_URL }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`OAuth exchange failed: ${text}`)
  }

  return response.json()
}

/**
 * Link a platform to user's wallet via linkSocialWorkflow.
 */
export async function linkPlatformToWallet(
  walletAddress: string,
  platformId: string,
  oauthToken: string,
): Promise<LinkResult> {
  const response = await fetch(
    `${MASTRA_URL}/api/workflows/linkSocialWorkflow/start-async`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress,
        platform: platformId,
        oauthToken,
      }),
    },
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Link workflow failed: ${text}`)
  }

  return response.json()
}

/**
 * Connect a platform that uses public API (no OAuth needed).
 * Just validates the username/ID exists on the platform.
 */
export async function connectPublicPlatform(
  platformId: string,
  username: string,
): Promise<OAuthResult> {
  const response = await fetch(`${MASTRA_URL}/api/platforms/${platformId}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Public platform verification failed: ${text}`)
  }

  return response.json()
}

/**
 * Check if a platform supports OAuth (vs public API / API key).
 */
export function isOAuthPlatform(platformId: string): boolean {
  return platformId in OAUTH_PROVIDERS
}
