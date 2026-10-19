import { dismissError, useCurrentError } from './errors'
import { duration, timeAgo } from './format'
import { QUESTIONS, type Question } from './questions'
import { computeScore, cooldownRemaining, type Answer } from './scoring'
import { useNow } from './useNow'
import { useUserId } from './useUserId'
import { castVote, useVotes } from './useVotes'

const LABELS: Record<Answer, string> = { yes: 'Yes', no: 'No' }

function QuestionCard({ question, userId }: { question: Question; userId: string | null }) {
  const now = useNow()
  const { votes, ownVote, fromCache, pendingWrite } = useVotes(question.id, userId)
  const score = computeScore(votes, now)
  const cooldown = cooldownRemaining(ownVote?.votedAt ?? null, now)
  const canVote = userId !== null && cooldown === 0

  const share = score.leading === 'yes' ? score.yesShare : 1 - score.yesShare

  return (
    <section className="card">
      <h1>{question.text}</h1>

      <div className="result">
        {score.leading ? (
          <>
            <span className={`answer answer-${score.leading}`}>{LABELS[score.leading]}</span>
            <span className="share">{Math.round(share * 100)}%</span>
          </>
        ) : (
          <span className="answer">Unknown</span>
        )}
      </div>

      <p className="meta">
        {score.lastVote
          ? `Last vote: ${LABELS[score.lastVote.answer]} · ${timeAgo(score.lastVote.votedAt, now)}`
          : 'No recent votes'}
      </p>

      <div className="buttons">
        {(['yes', 'no'] as const).map((answer) => (
          <button
            key={answer}
            className={`vote vote-${answer}`}
            disabled={!canVote}
            onClick={() => userId && castVote(question.id, userId, answer)}
          >
            {LABELS[answer]}
          </button>
        ))}
      </div>

      <p className="meta">
        {cooldown > 0 && `You voted ${LABELS[ownVote!.answer]}. Vote again in ${duration(cooldown)}.`}
        {pendingWrite && ' Waiting to sync.'}
        {fromCache && !pendingWrite && ' Offline: showing cached results.'}
      </p>
    </section>
  )
}

export default function App() {
  const userId = useUserId()
  const error = useCurrentError()
  return (
    <main>
      {error !== null && (
        <button className="error" onClick={dismissError}>
          Error {error} · tap to dismiss
        </button>
      )}
      {QUESTIONS.map((question) => (
        <QuestionCard key={question.id} question={question} userId={userId} />
      ))}
    </main>
  )
}
