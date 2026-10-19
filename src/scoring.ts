export type Answer = 'yes' | 'no'

export interface Vote {
  answer: Answer
  votedAt: number
}

export interface Score {
  yesWeight: number
  noWeight: number
  yesShare: number
  leading: Answer | null
  lastVote: Vote | null
}

const HOUR = 60 * 60 * 1000

export const HALF_LIFE_MS = 12 * HOUR
export const VOTE_COOLDOWN_MS = 6 * HOUR
export const VOTE_WINDOW_MS = 7 * 24 * HOUR
export const STALE_WEIGHT = 0.5

export function voteWeight(votedAt: number, now: number, halfLifeMs = HALF_LIFE_MS): number {
  const age = Math.max(0, now - votedAt)
  return 0.5 ** (age / halfLifeMs)
}

export function computeScore(votes: Vote[], now: number, halfLifeMs = HALF_LIFE_MS): Score {
  let yesWeight = 0
  let noWeight = 0
  let lastVote: Vote | null = null

  for (const vote of votes) {
    const weight = voteWeight(vote.votedAt, now, halfLifeMs)
    if (vote.answer === 'yes') yesWeight += weight
    else noWeight += weight
    if (!lastVote || vote.votedAt > lastVote.votedAt) lastVote = vote
  }

  const total = yesWeight + noWeight
  const yesShare = total > 0 ? yesWeight / total : 0
  const leading = total < STALE_WEIGHT || yesWeight === noWeight ? null : yesWeight > noWeight ? 'yes' : 'no'

  return { yesWeight, noWeight, yesShare, leading, lastVote }
}

export function cooldownRemaining(ownVotedAt: number | null, now: number): number {
  if (ownVotedAt === null) return 0
  return Math.max(0, ownVotedAt + VOTE_COOLDOWN_MS - now)
}
