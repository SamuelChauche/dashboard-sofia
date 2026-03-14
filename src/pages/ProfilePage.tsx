import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useNavigate } from 'react-router-dom'
import ProfileHeader from '../components/profile/ProfileHeader'
import ProfileTabs from '../components/profile/ProfileTabs'
import DomainSelector from '../components/profile/DomainSelector'
import NicheSelector from '../components/profile/NicheSelector'
import { useDomainSelection } from '../hooks/useDomainSelection'
import type { ProfileTab } from '../types/profile'
import '../components/styles/profile.css'

type DomainStep = 'domains' | 'niches'

function ProfilePage() {
  const { authenticated, user } = usePrivy()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview')
  const [domainStep, setDomainStep] = useState<DomainStep>('domains')
  const {
    selectedDomains,
    selectedNiches,
    toggleDomain,
    toggleNiche,
    maxDomains,
  } = useDomainSelection()

  useEffect(() => {
    if (!authenticated) {
      navigate('/')
    }
  }, [authenticated, navigate])

  if (!authenticated || !user?.wallet?.address) return null

  const walletAddress = user.wallet.address

  const headerStats = [
    { label: 'Platforms', value: '0' },
    { label: 'Domains', value: String(selectedDomains.length) },
    { label: 'Niches', value: String(selectedNiches.length) },
  ]

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab)
    if (tab === 'domains') setDomainStep('domains')
  }

  return (
    <section className="profile-page">
      <div className="profile">
        <ProfileHeader
          walletAddress={walletAddress}
          stats={headerStats}
        />
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        <div className="profile-content">
          {activeTab === 'overview' && (
            <>
              <div className="profile-overview">
                <div className="profile-overview__card">
                  <div className="profile-overview__card-value">0</div>
                  <div className="profile-overview__card-label">Certifications</div>
                </div>
                <div className="profile-overview__card">
                  <div className="profile-overview__card-value">0</div>
                  <div className="profile-overview__card-label">Pioneer Pages</div>
                </div>
                <div className="profile-overview__card">
                  <div className="profile-overview__card-value">0 T</div>
                  <div className="profile-overview__card-label">Trust Volume</div>
                </div>
                <div className="profile-overview__card">
                  <div className="profile-overview__card-value">0</div>
                  <div className="profile-overview__card-label">Transactions</div>
                </div>
              </div>
              <div className="profile-cta">
                <h2 className="profile-cta__title">
                  Enrich your profile
                </h2>
                <p className="profile-cta__text">
                  Select your domains of interest, connect your favorite platforms,
                  and build your behavioral reputation across 103 platforms.
                </p>
                <button
                  className="profile-cta__btn"
                  onClick={() => setActiveTab('domains')}
                >
                  Get Started
                </button>
              </div>
            </>
          )}

          {activeTab === 'domains' && domainStep === 'domains' && (
            <DomainSelector
              selectedDomains={selectedDomains}
              onToggle={toggleDomain}
              onContinue={() => setDomainStep('niches')}
              maxSelection={maxDomains}
            />
          )}

          {activeTab === 'domains' && domainStep === 'niches' && (
            <NicheSelector
              selectedDomains={selectedDomains}
              selectedNiches={selectedNiches}
              onToggleNiche={toggleNiche}
              onBack={() => setDomainStep('domains')}
              onContinue={() => setActiveTab('platforms')}
            />
          )}

          {activeTab === 'platforms' && (
            <div className="profile-placeholder">
              <div className="profile-placeholder__icon">🔗</div>
              <p className="profile-placeholder__text">
                Platform connections coming soon
              </p>
            </div>
          )}

          {activeTab === 'scores' && (
            <div className="profile-placeholder">
              <div className="profile-placeholder__icon">📊</div>
              <p className="profile-placeholder__text">
                Score visualization coming soon
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ProfilePage
