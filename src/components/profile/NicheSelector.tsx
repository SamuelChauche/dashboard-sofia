import { SOFIA_DOMAINS } from '../../config/taxonomy'
import '../styles/niche-selector.css'

const DOMAIN_ICONS: Record<string, string> = {
  "tech-dev": "💻",
  "design-creative": "🎨",
  "music-audio": "🎵",
  "gaming": "🎮",
  "web3-crypto": "⛓️",
  "science": "🔬",
  "sport-health": "🏋️",
  "video-cinema": "📹",
  "entrepreneurship": "🚀",
  "performing-arts": "🎭",
  "nature-environment": "🌿",
  "food-lifestyle": "🍽️",
  "literature": "📚",
  "personal-dev": "🧠",
}

interface NicheSelectorProps {
  selectedDomains: string[]
  selectedNiches: string[]
  onToggleNiche: (nicheId: string) => void
  onBack: () => void
  onContinue: () => void
}

function NicheSelector({
  selectedDomains,
  selectedNiches,
  onToggleNiche,
  onBack,
  onContinue,
}: NicheSelectorProps) {
  const domains = SOFIA_DOMAINS.filter((d) =>
    selectedDomains.includes(d.id)
  )

  return (
    <div className="niche-selector">
      <div className="niche-selector__header">
        <h2 className="niche-selector__title">
          Select your niches
        </h2>
        <span className="niche-selector__count">
          <span>{selectedNiches.length}</span> selected
        </span>
      </div>

      {domains.map((domain) => {
        const domainNicheCount = domain.categories
          .flatMap((c) => c.niches)
          .filter((n) => selectedNiches.includes(n.id)).length

        return (
          <div key={domain.id} className="niche-domain">
            <div className="niche-domain__header">
              <span className="niche-domain__icon">
                {DOMAIN_ICONS[domain.id] || "📌"}
              </span>
              <span className="niche-domain__name">
                {domain.label}
              </span>
              {domainNicheCount > 0 && (
                <span className="niche-domain__badge">
                  {domainNicheCount} selected
                </span>
              )}
            </div>

            {domain.categories.map((category) => (
              <div key={category.id} className="niche-category">
                <div className="niche-category__label">
                  {category.label}
                </div>
                <div className="niche-chips">
                  {category.niches.map((niche) => (
                    <button
                      key={niche.id}
                      className={`niche-chip${selectedNiches.includes(niche.id) ? ' niche-chip--selected' : ''}`}
                      onClick={() => onToggleNiche(niche.id)}
                    >
                      {niche.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      })}

      <div className="niche-selector__actions">
        <button
          className="niche-selector__btn niche-selector__btn--secondary"
          onClick={onBack}
        >
          Back
        </button>
        <button
          className="niche-selector__btn niche-selector__btn--primary"
          onClick={onContinue}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default NicheSelector
