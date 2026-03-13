import { useState } from 'react';
import { formatEther } from 'viem';
import type { Address } from 'viem';
import type { UserStats } from '../types';
import { OG_BASE_URL } from '../config';
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
  walletAddress: Address;
  displayName: string;
}

function PersonalStats({ userStats, totalAlphaTesters, totalPoolStakers, walletAddress, displayName }: PersonalStatsProps) {
  const { isAlphaTester, alphaData, alphaRank, poolData, poolRank } = userStats;
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    if (!alphaData || !alphaRank) return;
    setSharing(true);
    try {
      const body: Record<string, string | number> = {
        wallet: walletAddress,
        name: displayName,
        alphaRank,
        totalAlpha: totalAlphaTesters,
        tx: alphaData.tx,
        intentions: alphaData.intentions,
        pioneer: alphaData.pioneer,
        trustVolume: formatTrust(alphaData.trustVolume),
      };

      if (poolData && poolRank) {
        body.poolRank = poolRank;
        if (totalPoolStakers) body.totalPool = totalPoolStakers;
        body.pnl = `${poolData.pnl >= 0n ? '+' : ''}${formatTrust(poolData.pnl)}`;
        body.pnlPercent = `${poolData.pnlPercent >= 0 ? '+' : ''}${poolData.pnlPercent.toFixed(1)}%`;
      }

      const res = await fetch(`${OG_BASE_URL}/api/share/board`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const { url } = await res.json();

      const tweetText = encodeURIComponent(
        `Check out my Sofia Season stats! Alpha Rank #${alphaRank} of ${totalAlphaTesters}`
      );
      window.open(
        `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(url)}`,
        '_blank'
      );
    } catch (err) {
      console.error('Share failed:', err);
    } finally {
      setSharing(false);
    }
  }

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
        <button
          className="personal-stats__share-btn"
          onClick={handleShare}
          disabled={sharing}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          {sharing ? 'Sharing...' : 'Share'}
        </button>
      </div>
    </section>
  );
}

export default PersonalStats;
