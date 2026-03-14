import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * OAuth callback page — opened in popup by oauthService.
 * Extracts code/state/error from URL params and posts them
 * back to the opener window via postMessage.
 */
function OAuthCallbackPage() {
  const [params] = useSearchParams()

  useEffect(() => {
    const code = params.get('code')
    const state = params.get('state')
    const error = params.get('error')

    if (window.opener) {
      window.opener.postMessage(
        {
          type: 'oauth_callback',
          code,
          state,
          error,
        },
        window.location.origin,
      )
    }
  }, [params])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      color: '#999',
      fontFamily: 'sans-serif',
    }}>
      Connecting... you can close this window.
    </div>
  )
}

export default OAuthCallbackPage
