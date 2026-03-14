/**
 * Profile Service — Dashboard
 * Aggregates user profile data from multiple sources:
 * - Wallet info (Privy)
 * - Connected platforms (localStorage + on-chain)
 * - Domain/niche selections
 * - Reputation scores
 */

import { graphqlQuery } from './graphqlClient'
import { GRAPHQL_URL } from '../config'

// ── GraphQL Queries ──

const GET_USER_ATOMS = `
  query GetUserAtoms($accountId: String!) {
    triples(
      where: {
        subject: { value: { account: { id: { _ilike: $accountId } } } }
      }
      order_by: { block_number: desc }
      limit: 100
    ) {
      id
      predicate {
        label
        term_id
      }
      object {
        label
        term_id
        value {
          thing {
            url
            name
          }
          account {
            id
            label
          }
        }
      }
      block_number
      block_timestamp
    }
  }
`

const GET_USER_VAULT_POSITIONS = `
  query GetUserVaultPositions($accountId: String!) {
    positions(
      where: { account_id: { _ilike: $accountId } }
      order_by: { shares: desc }
      limit: 50
    ) {
      id
      shares
      vault {
        atom {
          label
          term_id
          value {
            thing {
              url
              name
            }
          }
        }
        triple {
          id
          predicate {
            label
          }
          object {
            label
          }
        }
        current_share_price
      }
    }
  }
`

// ── Types ──

export interface UserTriple {
  predicateLabel: string
  predicateTermId: string
  objectLabel: string
  objectUrl?: string
  blockTimestamp: string
}

export interface UserPosition {
  shares: string
  atomLabel?: string
  atomUrl?: string
  triplePredicateLabel?: string
  tripleObjectLabel?: string
  currentSharePrice: string
}

export interface UserProfileData {
  triples: UserTriple[]
  positions: UserPosition[]
  connectedPlatforms: string[]
  totalCertifications: number
  totalStaked: number
}

// ── Fetchers ──

interface TriplesResponse {
  triples: Array<{
    id: string
    predicate: { label: string; term_id: string }
    object: {
      label: string
      term_id: string
      value: {
        thing?: { url?: string; name?: string }
        account?: { id: string; label: string }
      }
    }
    block_number: number
    block_timestamp: string
  }>
}

interface PositionsResponse {
  positions: Array<{
    id: string
    shares: string
    vault: {
      atom?: {
        label: string
        term_id: string
        value: { thing?: { url?: string; name?: string } }
      }
      triple?: {
        id: string
        predicate: { label: string }
        object: { label: string }
      }
      current_share_price: string
    }
  }>
}

/**
 * Fetch user's on-chain triples (certifications, social links, etc.)
 */
export async function fetchUserTriples(
  walletAddress: string,
): Promise<UserTriple[]> {
  const data = await graphqlQuery<TriplesResponse>(GET_USER_ATOMS, {
    accountId: walletAddress,
  })

  return data.triples.map((t) => ({
    predicateLabel: t.predicate.label,
    predicateTermId: t.predicate.term_id,
    objectLabel: t.object.label,
    objectUrl: t.object.value?.thing?.url,
    blockTimestamp: t.block_timestamp,
  }))
}

/**
 * Fetch user's vault positions (staking)
 */
export async function fetchUserPositions(
  walletAddress: string,
): Promise<UserPosition[]> {
  const data = await graphqlQuery<PositionsResponse>(
    GET_USER_VAULT_POSITIONS,
    { accountId: walletAddress },
  )

  return data.positions.map((p) => ({
    shares: p.shares,
    atomLabel: p.vault.atom?.label,
    atomUrl: p.vault.atom?.value?.thing?.url,
    triplePredicateLabel: p.vault.triple?.predicate.label,
    tripleObjectLabel: p.vault.triple?.object.label,
    currentSharePrice: p.vault.current_share_price,
  }))
}

/**
 * Fetch full user profile data from on-chain sources.
 */
export async function fetchUserProfile(
  walletAddress: string,
): Promise<UserProfileData> {
  const [triples, positions] = await Promise.all([
    fetchUserTriples(walletAddress),
    fetchUserPositions(walletAddress),
  ])

  // Extract connected platforms from social link triples
  const socialPredicates = [
    'has verified youtube id',
    'has verified spotify id',
    'has verified discord id',
    'has verified twitch id',
    'has verified twitter id',
  ]
  const connectedPlatforms = triples
    .filter((t) =>
      socialPredicates.some((p) =>
        t.predicateLabel.toLowerCase().includes(p),
      ),
    )
    .map((t) => {
      const match = t.predicateLabel.match(/has verified (\w+) id/i)
      return match?.[1]?.toLowerCase() ?? ''
    })
    .filter(Boolean)

  const totalCertifications = triples.filter((t) =>
    t.predicateLabel.startsWith('visits for'),
  ).length

  const totalStaked = positions.reduce((sum, p) => {
    const shares = parseFloat(p.shares) || 0
    const price = parseFloat(p.currentSharePrice) || 0
    return sum + (shares * price) / 1e18
  }, 0)

  return {
    triples,
    positions,
    connectedPlatforms,
    totalCertifications,
    totalStaked,
  }
}
