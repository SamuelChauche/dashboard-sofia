import { useMemo } from 'react';
import { formatEther } from 'viem';
import type { Address } from 'viem';
import { usePrivy } from '@privy-io/react-auth';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StatsRibbon from './components/StatsRibbon';
import PersonalStats from './components/PersonalStats';
import Leaderboard from './components/Leaderboard';
import TrendingPages from './components/TrendingPages';
import HowRewards from './components/HowRewards';
import FooterCTA from './components/FooterCTA';

import { useAlphaTesters } from './hooks/useAlphaTesters';
import { useSeasonPool } from './hooks/useSeasonPool';
import { useUserStats } from './hooks/useUserStats';
import './App.css';

function formatTrustShort(wei: bigint) {
  const num = parseFloat(formatEther(wei));
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  if (num >= 1) return num.toFixed(1);
  return num.toFixed(4);
}

function App() {
  const { authenticated, user } = usePrivy();
  const { leaderboard, totals, loading, error } = useAlphaTesters();
  const { data: poolData, vaultStats, loading: poolLoading, error: poolError } = useSeasonPool(true);

  const walletAddress = authenticated
    ? (user?.wallet?.address as Address | undefined) ?? null
    : null;

  const userStats = useUserStats(walletAddress, leaderboard, poolData);

  const stats = useMemo(() => {
    if (!totals) return [];
    return [
      { label: 'Alpha Testers', value: String(totals.wallets) },
      { label: 'TX', value: totals.tx.toLocaleString() },
      { label: 'Intentions', value: totals.intentions.toLocaleString() },
      { label: 'Pioneers', value: String(totals.pioneers) },
      { label: 'Trust Volume', value: formatTrustShort(totals.trustVolume) },
    ];
  }, [totals]);

  return (
    <div className="app">
      <div className="app__bg" aria-hidden="true" />
      <Navbar />
      <Hero />
      <StatsRibbon stats={stats} />
      {authenticated && walletAddress && !loading && (
        <PersonalStats
          userStats={userStats}
          totalAlphaTesters={totals?.wallets ?? 0}
          totalPoolStakers={vaultStats?.totalStakers ?? null}
        />
      )}
      <Leaderboard
        alphaData={leaderboard}
        alphaLoading={loading}
        alphaError={error}
        poolData={poolData}
        poolLoading={poolLoading}
        poolError={poolError}
        connectedAddress={walletAddress}
      />
      <TrendingPages />
      <HowRewards />
      <FooterCTA />
    </div>
  );
}

export default App;
