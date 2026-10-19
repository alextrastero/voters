import { describe, expect, it } from 'vitest'
import { HALF_LIFE_MS, VOTE_COOLDOWN_MS, computeScore, cooldownRemaining, voteWeight, type Vote } from './scoring'

const now = Date.UTC(2026, 9, 19, 12)

describe('voteWeight', () => {
  it('halves every half-life', () => {
    expect(voteWeight(now, now)).toBe(1)
    expect(voteWeight(now - HALF_LIFE_MS, now)).toBeCloseTo(0.5)
    expect(voteWeight(now - 2 * HALF_LIFE_MS, now)).toBeCloseTo(0.25)
  })

  it('treats future timestamps as fresh', () => {
    expect(voteWeight(now + 1000, now)).toBe(1)
  })
})

describe('computeScore', () => {
  it('lets a fresh vote outweigh many old ones', () => {
    const old: Vote[] = Array.from({ length: 10 }, () => ({ answer: 'yes', votedAt: now - 4 * HALF_LIFE_MS }))
    const score = computeScore([...old, { answer: 'no', votedAt: now }], now)
    expect(score.leading).toBe('no')
    expect(score.yesShare).toBeCloseTo(0.625 / 1.625)
    expect(score.lastVote?.answer).toBe('no')
  })

  it('reports no leader when total weight is below the stale threshold', () => {
    const score = computeScore([{ answer: 'yes', votedAt: now - 2 * HALF_LIFE_MS }], now)
    expect(score.leading).toBeNull()
  })

  it('reports no leader on a tie', () => {
    const score = computeScore([{ answer: 'yes', votedAt: now }, { answer: 'no', votedAt: now }], now)
    expect(score.leading).toBeNull()
  })

  it('handles no votes', () => {
    expect(computeScore([], now)).toMatchObject({ leading: null, lastVote: null, yesShare: 0 })
  })
})

describe('cooldownRemaining', () => {
  it('is zero with no previous vote or after the cooldown', () => {
    expect(cooldownRemaining(null, now)).toBe(0)
    expect(cooldownRemaining(now - VOTE_COOLDOWN_MS, now)).toBe(0)
  })

  it('counts down after a vote', () => {
    expect(cooldownRemaining(now - 1000, now)).toBe(VOTE_COOLDOWN_MS - 1000)
  })
})
