import { useState, useEffect, useCallback } from 'react'
import { formatEther } from 'viem'
import { graphqlQuery } from '../api/graphqlClient'
import { SEASON_POOL_TERM_ID, SEASON_POOL_CURVE_ID } from '../config'

const QUERY = `
  query GetSeasonPoolPositions($termId: String!, $curveId: numeric!) {
    vaults(where: { term_id: { _eq: $termId }, curve_id: { _eq: $curveId } }) {
      current_share_price
      total_shares
      total_assets
      position_count
      positions(order_by: { shares: desc }) {
        account_id
        shares
        total_deposit_assets_after_total_fees
        total_redeem_assets_for_receiver
      }
    }
  }
`

function processPositions(vault) {
  const sharePrice = BigInt(vault.current_share_price || '0')

  const positions = (vault.positions || [])
    .filter((p) => BigInt(p.shares || '0') > 0n)
    .map((p) => {
      const shares = BigInt(p.shares)
      const totalDeposited = BigInt(p.total_deposit_assets_after_total_fees || '0')
      const totalRedeemed = BigInt(p.total_redeem_assets_for_receiver || '0')
      const currentValue = (shares * sharePrice) / 10n ** 18n
      const netDeposited = totalDeposited - totalRedeemed
      const pnl = currentValue - netDeposited
      const pnlPercent =
        netDeposited > 0n ? Number((pnl * 10000n) / netDeposited) / 100 : 0

      return {
        address: p.account_id,
        shares,
        sharesFormatted: formatEther(shares),
        currentValue,
        currentValueFormatted: formatEther(currentValue),
        netDeposited,
        pnl,
        pnlFormatted: formatEther(pnl),
        pnlPercent,
      }
    })

  positions.sort((a, b) => (b.currentValue > a.currentValue ? 1 : -1))

  return {
    positions,
    vaultStats: {
      totalStakers: vault.position_count || 0,
      tvl: BigInt(vault.total_assets || '0'),
      sharePrice,
    },
  }
}

export function useSeasonPool(enabled) {
  const [data, setData] = useState(null)
  const [vaultStats, setVaultStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fetched, setFetched] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await graphqlQuery(QUERY, {
        termId: SEASON_POOL_TERM_ID,
        curveId: SEASON_POOL_CURVE_ID,
      })

      const vault = result?.vaults?.[0]
      if (!vault) {
        setData([])
        setVaultStats(null)
        return
      }

      const processed = processPositions(vault)
      setData(processed.positions)
      setVaultStats(processed.vaultStats)
      setError(null)
      setFetched(true)
    } catch (err) {
      console.error('[useSeasonPool]', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (enabled && !fetched) {
      load()
    }
  }, [enabled, fetched, load])

  return { data, vaultStats, loading, error }
}
