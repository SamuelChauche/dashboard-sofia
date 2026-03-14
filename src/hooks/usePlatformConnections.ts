import { useState, useCallback, useEffect, useMemo } from 'react'
import type { PlatformConnection, ConnectionStatus } from '../types/reputation'
import {
  startOAuthFlow,
  exchangeOAuthCode,
  isOAuthPlatform,
} from '../services/oauthService'

const STORAGE_KEY = 'sofia_platform_connections'

function loadFromStorage(): Map<string, PlatformConnection> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const arr: PlatformConnection[] = JSON.parse(raw)
      return new Map(arr.map((c) => [c.platformId, c]))
    }
  } catch {}
  return new Map()
}

function saveToStorage(connections: Map<string, PlatformConnection>) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([...connections.values()])
  )
}

export function usePlatformConnections() {
  const [connections, setConnections] = useState<Map<string, PlatformConnection>>(loadFromStorage)

  useEffect(() => {
    saveToStorage(connections)
  }, [connections])

  const updateConnection = useCallback(
    (platformId: string, update: Partial<PlatformConnection>) => {
      setConnections((prev) => {
        const next = new Map(prev)
        const existing = next.get(platformId) || {
          platformId,
          status: 'disconnected' as ConnectionStatus,
        }
        next.set(platformId, { ...existing, ...update })
        return next
      })
    },
    [],
  )

  const connect = useCallback(
    async (platformId: string) => {
      updateConnection(platformId, {
        status: 'connecting',
        connectedAt: Date.now(),
        error: undefined,
      })

      try {
        if (isOAuthPlatform(platformId)) {
          // OAuth flow: popup → code → exchange
          const code = await startOAuthFlow(platformId)
          const result = await exchangeOAuthCode(platformId, code)

          if (result.success) {
            updateConnection(platformId, {
              status: 'connected',
              connectedAt: Date.now(),
              userId: result.userId,
              username: result.username,
            })
          } else {
            updateConnection(platformId, {
              status: 'error',
              error: result.error || 'Connection failed',
            })
          }
        } else {
          // Public API platform — mark as connected directly
          // Real verification will happen when syncing data
          updateConnection(platformId, {
            status: 'connected',
            connectedAt: Date.now(),
          })
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Connection failed'
        // Don't show error for user-cancelled OAuth
        if (message === 'OAuth cancelled') {
          updateConnection(platformId, { status: 'disconnected' })
        } else {
          updateConnection(platformId, {
            status: 'error',
            error: message,
          })
        }
      }
    },
    [updateConnection],
  )

  const disconnect = useCallback((platformId: string) => {
    setConnections((prev) => {
      const next = new Map(prev)
      next.delete(platformId)
      return next
    })
  }, [])

  const getStatus = useCallback(
    (platformId: string): ConnectionStatus => {
      return connections.get(platformId)?.status ?? 'disconnected'
    },
    [connections]
  )

  const getConnection = useCallback(
    (platformId: string): PlatformConnection | undefined => {
      return connections.get(platformId)
    },
    [connections]
  )

  const connectedCount = useMemo(
    () => [...connections.values()].filter((c) => c.status === 'connected').length,
    [connections]
  )

  return {
    connections,
    connect,
    disconnect,
    getStatus,
    getConnection,
    connectedCount,
  }
}
