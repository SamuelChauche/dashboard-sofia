import { useState, useMemo } from 'react';
import { formatEther } from 'viem';
import { useSeasonPool } from '../hooks/useSeasonPool';
import { EXPLORER_URL } from '../config';
import type { LeaderboardProps, AlphaTester, PoolPosition } from '../types';
import './styles/Leaderboard.css';

type AlphaSortOption = 'TX' | 'Intentions' | 'Pioneer' | 'Trust Volume';
type PoolSortOption = 'Current Value' | 'P&L';

const ALPHA_SORT_OPTIONS: AlphaSortOption[] = ['TX', 'Intentions', 'Pioneer', 'Trust Volume'];
const POOL_SORT_OPTIONS: PoolSortOption[] = ['Current Value', 'P&L'];

function truncateAddress(addr: string) {
  if (!addr) return '';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

function formatTrust(wei: bigint) {
  const num = parseFloat(formatEther(wei));
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  if (num >= 1) return num.toFixed(2);
  return num.toFixed(4);
}

function sortAlpha(data: AlphaTester[], sortBy: AlphaSortOption) {
  return [...data].sort((a, b) => {
    switch (sortBy) {
      case 'TX': return b.tx - a.tx;
      case 'Intentions': return b.intentions - a.intentions;
      case 'Pioneer': return b.pioneer - a.pioneer;
      case 'Trust Volume': return b.trustVolume > a.trustVolume ? -1 : 1;
      default: return 0;
    }
  });
}

function sortPool(data: PoolPosition[], sortBy: PoolSortOption) {
  return [...data].sort((a, b) => {
    switch (sortBy) {
      case 'Current Value': return b.currentValue > a.currentValue ? -1 : 1;
      case 'P&L': return b.pnl > a.pnl ? -1 : 1;
      default: return 0;
    }
  });
}

function SkeletonRows({ cols }: { cols: number }) {
  return Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="leaderboard__row">
      {Array.from({ length: cols }).map((_, j) => (
        <td key={j} className="leaderboard__cell">
          <span className="leaderboard__skeleton" />
        </td>
      ))}
    </tr>
  ));
}

function Leaderboard({ alphaData = [], alphaLoading, alphaError }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<'alpha' | 'pool'>('alpha');
  const [alphaSortBy, setAlphaSortBy] = useState<AlphaSortOption>('TX');
  const [poolSortBy, setPoolSortBy] = useState<PoolSortOption>('Current Value');

  const { data: poolData, loading: poolLoading, error: poolError } = useSeasonPool(activeTab === 'pool');

  const sortedAlpha = useMemo(() => sortAlpha(alphaData, alphaSortBy), [alphaData, alphaSortBy]);
  const sortedPool = useMemo(() => poolData ? sortPool(poolData, poolSortBy) : [], [poolData, poolSortBy]);

  const isAlpha = activeTab === 'alpha';
  const sortOptions = isAlpha ? ALPHA_SORT_OPTIONS : POOL_SORT_OPTIONS;
  const currentSort = isAlpha ? alphaSortBy : poolSortBy;
  const setCurrentSort = isAlpha
    ? (v: string) => setAlphaSortBy(v as AlphaSortOption)
    : (v: string) => setPoolSortBy(v as PoolSortOption);
  const loading = isAlpha ? alphaLoading : poolLoading;
  const error = isAlpha ? alphaError : poolError;

  return (
    <section className="leaderboard">
      <div className="leaderboard__inner">
        <div className="leaderboard__header">
          <h2 className="leaderboard__title">Leaderboard</h2>
          <div className="leaderboard__controls">
            <div className="leaderboard__tabs">
              <button
                className={`leaderboard__tab${activeTab === 'alpha' ? ' leaderboard__tab--active' : ''}`}
                onClick={() => setActiveTab('alpha')}
              >
                Alpha Testers
              </button>
              <button
                className={`leaderboard__tab${activeTab === 'pool' ? ' leaderboard__tab--active' : ''}`}
                onClick={() => setActiveTab('pool')}
              >
                Season Pool
              </button>
            </div>
            <div className="leaderboard__filters">
              {sortOptions.map((option) => (
                <button
                  key={option}
                  className={`leaderboard__filter${currentSort === option ? ' leaderboard__filter--active' : ''}`}
                  onClick={() => setCurrentSort(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="leaderboard__table-wrapper">
          <table className="leaderboard__table">
            {isAlpha ? (
              <>
                <thead>
                  <tr className="leaderboard__row leaderboard__row--head">
                    <th className="leaderboard__cell leaderboard__cell--rank">Rank</th>
                    <th className="leaderboard__cell leaderboard__cell--address">Tester</th>
                    <th className="leaderboard__cell leaderboard__cell--num">TX</th>
                    <th className="leaderboard__cell leaderboard__cell--num">Intentions</th>
                    <th className="leaderboard__cell leaderboard__cell--num">Pioneer</th>
                    <th className="leaderboard__cell leaderboard__cell--num">Trust Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && <SkeletonRows cols={6} />}
                  {error && (
                    <tr className="leaderboard__row">
                      <td className="leaderboard__cell leaderboard__cell--error" colSpan={6}>{error}</td>
                    </tr>
                  )}
                  {!loading && !error && sortedAlpha.map((user, i) => (
                    <tr
                      key={user.address}
                      className={`leaderboard__row${i < 3 ? ' leaderboard__row--highlighted' : ''}`}
                    >
                      <td className="leaderboard__cell leaderboard__cell--rank">{i + 1}</td>
                      <td className="leaderboard__cell leaderboard__cell--address">
                        <a
                          href={`${EXPLORER_URL}/address/${user.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="leaderboard__address-link"
                        >
                          {truncateAddress(user.address)}
                        </a>
                      </td>
                      <td className="leaderboard__cell leaderboard__cell--num">
                        <span className="leaderboard__mono">{user.tx.toLocaleString()}</span>
                      </td>
                      <td className="leaderboard__cell leaderboard__cell--num">
                        <span className="leaderboard__mono">{user.intentions.toLocaleString()}</span>
                      </td>
                      <td className="leaderboard__cell leaderboard__cell--num">
                        <span className="leaderboard__mono">{user.pioneer}</span>
                      </td>
                      <td className="leaderboard__cell leaderboard__cell--num">
                        <span className="leaderboard__mono">{formatTrust(user.trustVolume)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            ) : (
              <>
                <thead>
                  <tr className="leaderboard__row leaderboard__row--head">
                    <th className="leaderboard__cell leaderboard__cell--rank">Rank</th>
                    <th className="leaderboard__cell leaderboard__cell--address">Staker</th>
                    <th className="leaderboard__cell leaderboard__cell--num">Shares</th>
                    <th className="leaderboard__cell leaderboard__cell--num">Current Value</th>
                    <th className="leaderboard__cell leaderboard__cell--num">P&L</th>
                    <th className="leaderboard__cell leaderboard__cell--num">P&L %</th>
                  </tr>
                </thead>
                <tbody>
                  {poolLoading && <SkeletonRows cols={6} />}
                  {poolError && (
                    <tr className="leaderboard__row">
                      <td className="leaderboard__cell leaderboard__cell--error" colSpan={6}>{poolError}</td>
                    </tr>
                  )}
                  {!poolLoading && !poolError && sortedPool.map((pos, i) => (
                    <tr
                      key={pos.address}
                      className={`leaderboard__row${i < 3 ? ' leaderboard__row--highlighted' : ''}`}
                    >
                      <td className="leaderboard__cell leaderboard__cell--rank">{i + 1}</td>
                      <td className="leaderboard__cell leaderboard__cell--address">
                        <a
                          href={`${EXPLORER_URL}/address/${pos.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="leaderboard__address-link"
                        >
                          {truncateAddress(pos.address)}
                        </a>
                      </td>
                      <td className="leaderboard__cell leaderboard__cell--num">
                        <span className="leaderboard__mono">{formatTrust(pos.shares)}</span>
                      </td>
                      <td className="leaderboard__cell leaderboard__cell--num">
                        <span className="leaderboard__mono">{formatTrust(pos.currentValue)}</span>
                      </td>
                      <td className={`leaderboard__cell leaderboard__cell--num ${pos.pnl >= 0n ? 'leaderboard__cell--pnl-positive' : 'leaderboard__cell--pnl-negative'}`}>
                        <span className="leaderboard__mono">
                          {pos.pnl >= 0n ? '+' : ''}{formatTrust(pos.pnl)}
                        </span>
                      </td>
                      <td className={`leaderboard__cell leaderboard__cell--num ${pos.pnlPercent >= 0 ? 'leaderboard__cell--pnl-positive' : 'leaderboard__cell--pnl-negative'}`}>
                        <span className="leaderboard__mono">
                          {pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
          </table>
        </div>
      </div>
    </section>
  );
}

export default Leaderboard;
