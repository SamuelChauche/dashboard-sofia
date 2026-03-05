const DEFAULT_CONFIG = {
  minDelayMs: 500,
  baseBackoffMs: 2_000,
  maxBackoffMs: 30_000,
  backoffMultiplier: 2,
  maxRetries: 4,
}

export class RpcQueue {
  constructor(config) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.busy = false
    this.pending = []
    this.lastDispatchTime = 0
    this.backoffUntil = 0
    this.consecutiveRateLimits = 0
  }

  createFetchFn() {
    return (input, init) => this._enqueue(() => fetch(input, init))
  }

  _enqueue(fn) {
    return new Promise((resolve, reject) => {
      this.pending.push({
        execute: () => this._dispatch(fn).then(resolve, reject),
      })
      this._flush()
    })
  }

  _flush() {
    if (this.pending.length > 0 && !this.busy) {
      const entry = this.pending.shift()
      entry.execute()
    }
  }

  async _dispatch(fn) {
    this.busy = true
    try {
      for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
        await this._waitForBackoff()
        await this._enforceMinDelay()
        this.lastDispatchTime = Date.now()

        let response
        try {
          response = await fn()
        } catch (err) {
          if (attempt === this.config.maxRetries) throw err
          this._applyBackoff()
          continue
        }

        if (response.status !== 429) {
          this.consecutiveRateLimits = 0
          return response
        }

        this._applyBackoff()
        if (attempt === this.config.maxRetries) return response
      }

      throw new Error('[RpcQueue] Unexpected exit from retry loop')
    } finally {
      this.busy = false
      this._flush()
    }
  }

  async _waitForBackoff() {
    const remaining = this.backoffUntil - Date.now()
    if (remaining > 0) await this._sleep(remaining)
  }

  async _enforceMinDelay() {
    const elapsed = Date.now() - this.lastDispatchTime
    if (elapsed < this.config.minDelayMs) {
      await this._sleep(this.config.minDelayMs - elapsed)
    }
  }

  _applyBackoff() {
    this.consecutiveRateLimits++
    const base =
      this.config.baseBackoffMs *
      Math.pow(this.config.backoffMultiplier, this.consecutiveRateLimits - 1)
    const capped = Math.min(base, this.config.maxBackoffMs)
    const jitter = capped * (0.8 + Math.random() * 0.4)
    this.backoffUntil = Date.now() + jitter
    console.warn(
      `[RpcQueue] 429 detected (×${this.consecutiveRateLimits}). Backoff: ${Math.round(jitter)}ms`
    )
  }

  _sleep(ms) {
    return new Promise((r) => setTimeout(r, ms))
  }
}
