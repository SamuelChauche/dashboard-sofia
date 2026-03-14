interface ProfileHeaderProps {
  walletAddress: string
  ensName?: string
  avatar?: string
  stats: { label: string; value: string }[]
}

function ProfileHeader({
  walletAddress,
  ensName,
  avatar,
  stats,
}: ProfileHeaderProps) {
  const displayName = ensName || walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4)
  const initials = (ensName || walletAddress).slice(0, 2).toUpperCase()

  return (
    <div className="profile-header">
      {avatar ? (
        <img
          className="profile-header__avatar"
          src={avatar}
          alt={displayName}
        />
      ) : (
        <div className="profile-header__avatar--placeholder">
          {initials}
        </div>
      )}
      <div className="profile-header__info">
        <h1 className="profile-header__name">{displayName}</h1>
        {ensName && (
          <p className="profile-header__address">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
        )}
      </div>
      <div className="profile-header__stats">
        {stats.map((stat) => (
          <div key={stat.label} className="profile-header__stat">
            <div className="profile-header__stat-value">{stat.value}</div>
            <div className="profile-header__stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProfileHeader
