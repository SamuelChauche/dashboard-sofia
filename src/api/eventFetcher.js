import { parseAbiItem } from 'viem'
import { rpcClient } from './rpcClient'
import { SOFIA_PROXY_ADDRESS, BLOCK_CHUNK, SEASON_START, SEASON_START_BLOCK } from '../config'

const TX_FORWARDED_EVENT = parseAbiItem(
  'event TransactionForwarded(string operation, address indexed user, uint256 sofiaFee, uint256 multiVaultValue, uint256 totalReceived)'
)

export class EventFetcher {
  constructor() {
    this.events = []
    this.lastScannedBlock = 0n
    this.startBlock = null
  }

  async fetch() {
    if (!this.startBlock) {
      this.startBlock = await this._resolveStartBlock()
      this.lastScannedBlock = this.startBlock
    }

    const currentBlock = await rpcClient.getBlockNumber()

    if (currentBlock <= this.lastScannedBlock && this.events.length > 0) {
      return this.events
    }

    const fromBlock =
      this.events.length > 0 ? this.lastScannedBlock + 1n : this.startBlock

    const newLogs = await this._getLogsInChunks(fromBlock, currentBlock)

    if (newLogs.length > 0) {
      const newEvents = newLogs.map((log) => ({
        operation: log.args.operation ?? 'unknown',
        user: log.args.user ?? '0x',
        sofiaFee: log.args.sofiaFee ?? 0n,
        multiVaultValue: log.args.multiVaultValue ?? 0n,
        totalReceived: log.args.totalReceived ?? 0n,
        blockNumber: log.blockNumber,
        txHash: log.transactionHash,
      }))

      this.events.push(...newEvents)
      this.events.sort((a, b) => Number(a.blockNumber - b.blockNumber))
    }

    this.lastScannedBlock = currentBlock
    return this.events
  }

  async _resolveStartBlock() {
    if (SEASON_START_BLOCK > 0n) return SEASON_START_BLOCK

    // Estimate block number from SEASON_START date
    // Intuition chain: ~1 block/sec
    const currentBlock = await rpcClient.getBlockNumber()
    const now = Date.now()
    const seasonStartMs = SEASON_START.getTime()
    const diffSec = Math.floor((now - seasonStartMs) / 1000)
    const estimated = currentBlock - BigInt(diffSec)
    return estimated > 0n ? estimated : 1n
  }

  async _getLogsInChunks(fromBlock, toBlock) {
    const allLogs = []
    let cursor = fromBlock

    while (cursor <= toBlock) {
      const end =
        cursor + BLOCK_CHUNK - 1n > toBlock
          ? toBlock
          : cursor + BLOCK_CHUNK - 1n

      const logs = await rpcClient.getLogs({
        address: SOFIA_PROXY_ADDRESS,
        event: TX_FORWARDED_EVENT,
        fromBlock: cursor,
        toBlock: end,
      })

      allLogs.push(...logs)
      cursor = end + 1n
    }

    return allLogs
  }

  get cachedEventCount() {
    return this.events.length
  }
}
