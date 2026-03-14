import { usePrivy } from '@privy-io/react-auth'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

function ProfilePage() {
  const { authenticated, user } = usePrivy()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authenticated) {
      navigate('/')
    }
  }, [authenticated, navigate])

  const walletAddress = user?.wallet?.address
  const displayAddress = walletAddress
    ? walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4)
    : ''

  if (!authenticated) return null

  return (
    <section className="profile-page" style={{ position: 'relative', zIndex: 1 }}>
      <div style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '120px 24px 64px',
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-3xl)',
            color: 'var(--color-primary-light)',
            marginBottom: '16px',
          }}>
            My Profile
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-lg)',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '8px',
          }}>
            {displayAddress}
          </p>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-base)',
            color: 'rgba(255, 255, 255, 0.4)',
          }}>
            Profile enrichment coming soon — select your domains, connect platforms, and build your reputation.
          </p>
        </div>
      </div>
    </section>
  )
}

export default ProfilePage
