import { useState, useMemo } from 'react';
import { formatEther } from 'viem';
import type { Address } from 'viem';
import { useSeasonPool } from '../hooks/useSeasonPool';
import { useEnsNames } from '../hooks/useEnsNames';
import { EXPLORER_URL } from '../config';
import type { LeaderboardProps, AlphaTester, PoolPosition } from '../types';
import './styles/Leaderboard.css';

type AlphaSortOption = 'TX' | 'Intentions' | 'Pioneer' | 'Trust Volume';
type PoolSortOption = 'Shares' | 'Current Value' | 'P&L' | 'P&L %';

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
      case 'Trust Volume': return a.trustVolume > b.trustVolume ? -1 : a.trustVolume < b.trustVolume ? 1 : 0;
      default: return 0;
    }
  });
}

function sortPool(data: PoolPosition[], sortBy: PoolSortOption) {
  return [...data].sort((a, b) => {
    switch (sortBy) {
      case 'Shares': return a.shares > b.shares ? -1 : a.shares < b.shares ? 1 : 0;
      case 'Current Value': return a.currentValue > b.currentValue ? -1 : a.currentValue < b.currentValue ? 1 : 0;
      case 'P&L': return a.pnl > b.pnl ? -1 : a.pnl < b.pnl ? 1 : 0;
      case 'P&L %': return b.pnlPercent - a.pnlPercent;
      default: return 0;
    }
  });
}

function SortableHeader({ label, sortKey, currentSort, onSort }: {
  label: string;
  sortKey: string;
  currentSort: string;
  onSort: (key: string) => void;
}) {
  const isActive = currentSort === sortKey;
  return (
    <th
      className={`leaderboard__cell leaderboard__cell--num leaderboard__cell--sortable${isActive ? ' leaderboard__cell--sorted' : ''}`}
      onClick={() => onSort(sortKey)}
    >
      {label}
      {isActive && <span className="leaderboard__sort-arrow">▼</span>}
    </th>
  );
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

const ALPHA_COLUMNS: { label: string; key: AlphaSortOption }[] = [
  { label: 'Intentions', key: 'Intentions' },
  { label: 'Pioneer', key: 'Pioneer' },
  { label: 'Trust Volume', key: 'Trust Volume' },
  { label: 'TX', key: 'TX' },
];

const POOL_COLUMNS: { label: string; key: PoolSortOption }[] = [
  { label: 'Current Value', key: 'Current Value' },
  { label: 'P&L', key: 'P&L' },
  { label: 'P&L %', key: 'P&L %' },
];

function Leaderboard({ alphaData = [], alphaLoading, alphaError }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<'alpha' | 'pool'>('alpha');
  const [alphaSortBy, setAlphaSortBy] = useState<AlphaSortOption>('TX');
  const [poolSortBy, setPoolSortBy] = useState<PoolSortOption>('P&L %');

  const { data: poolData, loading: poolLoading, error: poolError } = useSeasonPool(activeTab === 'pool');

  const sortedAlpha = useMemo(() => sortAlpha(alphaData, alphaSortBy), [alphaData, alphaSortBy]);
  const sortedPool = useMemo(() => poolData ? sortPool(poolData, poolSortBy) : [], [poolData, poolSortBy]);

  const allAddresses = useMemo(() => {
    const alphaAddrs = alphaData.map((u) => u.address);
    const poolAddrs = (poolData || []).map((p) => p.address);
    return [...alphaAddrs, ...poolAddrs] as Address[];
  }, [alphaData, poolData]);

  const { getDisplay, getAvatar } = useEnsNames(allAddresses);

  const isAlpha = activeTab === 'alpha';
  const loading = isAlpha ? alphaLoading : poolLoading;
  const error = isAlpha ? alphaError : poolError;

  function colClass(key: string, currentSort: string, extra?: string) {
    const active = key === currentSort ? ' leaderboard__cell--active-col' : '';
    return `leaderboard__cell leaderboard__cell--num${active}${extra ? ' ' + extra : ''}`;
  }

  return (
    <section className="leaderboard">
      <div className="leaderboard__inner">
        <div className="leaderboard__header">
          <h2 className="leaderboard__title">Leaderboard</h2>
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
        </div>

        <div className="leaderboard__table-wrapper">
          <table className="leaderboard__table">
            {isAlpha ? (
              <>
                <thead>
                  <tr className="leaderboard__row leaderboard__row--head">
                    <th className="leaderboard__cell leaderboard__cell--rank">Rank</th>
                    <th className="leaderboard__cell leaderboard__cell--address">Tester</th>
                    {ALPHA_COLUMNS.map((col) => (
                      <SortableHeader
                        key={col.key}
                        label={col.label}
                        sortKey={col.key}
                        currentSort={alphaSortBy}
                        onSort={(k) => setAlphaSortBy(k as AlphaSortOption)}
                      />
                    ))}
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
                          <img
                            src={getAvatar(user.address)}
                            alt=""
                            className="leaderboard__avatar-img"
                          />
                          {getDisplay(user.address)}
                        </a>
                      </td>
                      <td className={colClass('Intentions', alphaSortBy)}>
                        <span className="leaderboard__mono">{user.intentions.toLocaleString()}</span>
                      </td>
                      <td className={colClass('Pioneer', alphaSortBy)}>
                        <span className="leaderboard__mono">{user.pioneer}</span>
                      </td>
                      <td className={colClass('Trust Volume', alphaSortBy)}>
                        <span className="leaderboard__mono">{formatTrust(user.trustVolume)}</span>
                      </td>
                      <td className={colClass('TX', alphaSortBy)}>
                        <span className="leaderboard__mono">{user.tx.toLocaleString()}</span>
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
                    {POOL_COLUMNS.map((col) => (
                      <SortableHeader
                        key={col.key}
                        label={col.label}
                        sortKey={col.key}
                        currentSort={poolSortBy}
                        onSort={(k) => setPoolSortBy(k as PoolSortOption)}
                      />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {poolLoading && <SkeletonRows cols={5} />}
                  {poolError && (
                    <tr className="leaderboard__row">
                      <td className="leaderboard__cell leaderboard__cell--error" colSpan={5}>{poolError}</td>
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
                          <img
                            src={getAvatar(pos.address)}
                            alt=""
                            className="leaderboard__avatar-img"
                          />
                          {getDisplay(pos.address)}
                        </a>
                      </td>
                      <td className={colClass('Current Value', poolSortBy)}>
                        <span className="leaderboard__mono">{formatTrust(pos.currentValue)}</span>
                      </td>
                      <td className={colClass('P&L', poolSortBy, pos.pnl >= 0n ? 'leaderboard__cell--pnl-positive' : 'leaderboard__cell--pnl-negative')}>
                        <span className="leaderboard__mono">
                          {pos.pnl >= 0n ? '+' : ''}{formatTrust(pos.pnl)}
                        </span>
                      </td>
                      <td className={colClass('P&L %', poolSortBy, pos.pnlPercent >= 0 ? 'leaderboard__cell--pnl-positive' : 'leaderboard__cell--pnl-negative')}>
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
