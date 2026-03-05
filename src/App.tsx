import { useMemo } from 'react';
import { formatEther } from 'viem';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StatsRibbon from './components/StatsRibbon';
import Leaderboard from './components/Leaderboard';
import TrendingPages from './components/TrendingPages';
import HowRewards from './components/HowRewards';
import FooterCTA from './components/FooterCTA';
import Grainient from './components/Grainient';
import { useAlphaTesters } from './hooks/useAlphaTesters';
import './App.css';

function formatTrustShort(wei: bigint) {
  const num = parseFloat(formatEther(wei));
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  if (num >= 1) return num.toFixed(1);
  return num.toFixed(4);
}

function App() {
  const { leaderboard, totals, loading, error } = useAlphaTesters();

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
      <div className="app__bg" aria-hidden="true">
        <Grainient />
      </div>
      <Navbar />
      <Hero />
      <StatsRibbon stats={stats} />
      <Leaderboard alphaData={leaderboard} alphaLoading={loading} alphaError={error} />
      <TrendingPages />
      <HowRewards />
      <FooterCTA />
    </div>
  );
}

export default App;
