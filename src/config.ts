// ── Network ──
export const RPC_URL = 'https://rpc.intuition.systems'
export const GRAPHQL_URL = 'https://mainnet.intuition.sh/v1/graphql'
export const EXPLORER_URL = 'https://explorer.intuition.systems'

// ── Sofia Proxy Contract ──
export const SOFIA_PROXY_ADDRESS = '0x26F81d723Ad1648194FAA4b7E235105Fd1212c6c'
export const BLOCK_CHUNK = 50_000n
export const REFRESH_INTERVAL = 120_000 // 2 min

// ── Season Config (modifier ici pour changer de saison) ──
export const SEASON_NAME = 'Beta'
export const SEASON_START = new Date('2026-02-21T08:34:18Z')
export const SEASON_END = new Date('2026-04-05T00:00:00Z')
export const SEASON_START_BLOCK = 0n // 0 = auto-detect via timestamp

// ── Beta Season Pool vault ──
export const SEASON_POOL_TERM_ID = '0xd1315af387fa4148375918e4917466d2ba36c49d07c547c9e04c881b76437d10'
export const SEASON_POOL_CURVE_ID = 1
