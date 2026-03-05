import { useState, useEffect, useRef, useCallback } from 'react'
import { formatEther } from 'viem'
import { EventFetcher } from '../api/eventFetcher'
import { REFRESH_INTERVAL } from '../config'

function aggregateEvents(events) {
  const wallets = new Map()

  let totalTx = 0
  let totalIntentions = 0
  let totalPioneers = 0
  let totalTrustVolume = 0n

  for (const evt of events) {
    const addr = evt.user.toLowerCase()
    let entry = wallets.get(addr)
    if (!entry) {
      entry = { address: evt.user, tx: 0, intentions: 0, pioneer: 0, trustVolume: 0n }
      wallets.set(addr, entry)
    }

    entry.tx++
    totalTx++

    if (evt.operation === 'deposit') {
      entry.intentions++
      totalIntentions++
    }

    if (evt.operation === 'createAtoms') {
      entry.pioneer++
      totalPioneers++
    }

    entry.trustVolume += evt.totalReceived
    totalTrustVolume += evt.totalReceived
  }

  const leaderboard = Array.from(wallets.values()).map((w) => ({
    ...w,
    trustVolumeFormatted: formatEther(w.trustVolume),
  }))

  leaderboard.sort((a, b) => b.tx - a.tx)

  return {
    leaderboard,
    totals: {
      wallets: wallets.size,
      tx: totalTx,
      intentions: totalIntentions,
      pioneers: totalPioneers,
      trustVolume: totalTrustVolume,
    },
  }
}

export function useAlphaTesters() {
  const fetcherRef = useRef(null)
  const [data, setData] = useState({ leaderboard: [], totals: { wallets: 0, tx: 0, intentions: 0, pioneers: 0, trustVolume: 0n } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      if (!fetcherRef.current) {
        fetcherRef.current = new EventFetcher()
      }
      const events = await fetcherRef.current.fetch()
      setData(aggregateEvents(events))
      setError(null)
    } catch (err) {
      console.error('[useAlphaTesters]', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, REFRESH_INTERVAL)
    return () => clearInterval(id)
  }, [load])

  return { ...data, loading, error }
}
