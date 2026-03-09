import { formatEther } from 'viem';
import type { UserStats } from '../types';
import './styles/PersonalStats.css';

function formatTrust(wei: bigint) {
  const num = parseFloat(formatEther(wei));
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k T';
  if (num >= 1) return num.toFixed(2) + ' T';
  return num.toFixed(4) + ' T';
}

interface PersonalStatsProps {
  userStats: UserStats;
  totalAlphaTesters: number;
  totalPoolStakers: number | null;
}

function PersonalStats({ userStats, totalAlphaTesters, totalPoolStakers }: PersonalStatsProps) {
  const { isAlphaTester, alphaData, alphaRank, poolData, poolRank } = userStats;

  if (!isAlphaTester) {
    return (
      <section className="personal-stats">
        <div className="personal-stats__inner">
          <div className="personal-stats__not-found">
            <p className="personal-stats__not-found-text">
              You are not part of the Alpha Tester Program
            </p>
            <p className="personal-stats__not-found-sub">
              Start using Sofia to appear on the leaderboard
            </p>
          </div>
        </div>
      </section>
    );
  }

  const cards: { label: string; value: string; sub?: string; variant?: string }[] = [
    { label: 'Alpha Rank', value: `#${alphaRank}`, sub: `of ${totalAlphaTesters}` },
    { label: 'Transactions', value: alphaData!.tx.toLocaleString() },
    { label: 'Intentions', value: alphaData!.intentions.toLocaleString() },
    { label: 'Pioneer', value: String(alphaData!.pioneer) },
    { label: 'Trust Volume', value: formatTrust(alphaData!.trustVolume) },
  ];

  if (poolData && poolRank) {
    cards.push(
      { label: 'Pool Rank', value: `#${poolRank}`, sub: totalPoolStakers ? `of ${totalPoolStakers}` : undefined },
      { label: 'Pool P&L', value: `${poolData.pnl >= 0n ? '+' : ''}${formatTrust(poolData.pnl)}`, variant: poolData.pnl >= 0n ? 'positive' : 'negative' },
      { label: 'Pool P&L %', value: `${poolData.pnlPercent >= 0 ? '+' : ''}${poolData.pnlPercent.toFixed(1)}%`, variant: poolData.pnlPercent >= 0 ? 'positive' : 'negative' },
    );
  }

  return (
    <section className="personal-stats">
      <div className="personal-stats__inner">
        <div className="personal-stats__grid">
          {cards.map((card) => (
            <div
              key={card.label}
              className={`personal-stats__card${card.variant ? ` personal-stats__card--${card.variant}` : ''}`}
            >
              <span className="personal-stats__value">{card.value}</span>
              <span className="personal-stats__label">{card.label}</span>
              {card.sub && <span className="personal-stats__sub">{card.sub}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PersonalStats;
