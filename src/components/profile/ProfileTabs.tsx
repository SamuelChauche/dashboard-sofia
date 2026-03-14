import type { ProfileTab } from '../../types/profile'

const TABS: { key: ProfileTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'domains', label: 'Domains' },
  { key: 'platforms', label: 'Platforms' },
  { key: 'scores', label: 'Scores' },
]

interface ProfileTabsProps {
  activeTab: ProfileTab
  onTabChange: (tab: ProfileTab) => void
}

function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="profile-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`profile-tabs__tab${activeTab === tab.key ? ' profile-tabs__tab--active' : ''}`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default ProfileTabs
