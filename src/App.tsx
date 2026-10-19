import { dismissError, useCurrentError } from './errors'
import { duration, timeAgo } from './format'
import { QUESTIONS, type Question } from './questions'
import { computeScore, cooldownRemaining, type Answer } from './scoring'
import { useNow } from './useNow'
import { useUserId } from './useUserId'
import { castVote, useVotes } from './useVotes'

const LABELS: Record<Answer, string> = { yes: 'Sí', no: 'No' }
const ICONS: Record<Answer, string> = { yes: '👍', no: '👎' }

function QuestionCard({ question, userId }: { question: Question; userId: string | null }) {
  const now = useNow()
  const { votes, ownVote, fromCache, pendingWrite } = useVotes(question.id, userId)
  const score = computeScore(votes, now)
  const cooldown = cooldownRemaining(ownVote?.votedAt ?? null, now)
  const canVote = userId !== null && cooldown === 0

  const share = score.leading === 'yes' ? score.yesShare : 1 - score.yesShare

  return (
    <section className="question">
      <div className="board">
        <h1>{question.text}</h1>

        <div className="result">
          {score.leading ? (
            <>
              <span className="answer" role="img" aria-label={LABELS[score.leading]}>
                {ICONS[score.leading]}
              </span>
              <span className="share">{Math.round(share * 100)}%</span>
            </>
          ) : (
            <span className="answer" role="img" aria-label="Desconocido">
              🤷
            </span>
          )}
        </div>

        <p className="chalk-note">
          {score.lastVote
            ? `Último voto: ${LABELS[score.lastVote.answer]} · ${timeAgo(score.lastVote.votedAt, now)}`
            : 'Sin votos recientes'}
        </p>
      </div>

      <div className="counter">
        <div className="tiles">
          {(['yes', 'no'] as const).map((answer) => (
            <button
              key={answer}
              className={`tile tile-${answer}`}
              disabled={!canVote}
              onClick={() => userId && castVote(question.id, userId, answer)}
            >
              {LABELS[answer]}
            </button>
          ))}
        </div>

        <p className="status">
          {cooldown > 0 && `Votaste ${LABELS[ownVote!.answer]}. Podrás volver a votar en ${duration(cooldown)}.`}
          {pendingWrite && ' Pendiente de sincronizar.'}
          {fromCache && !pendingWrite && ' Sin conexión: mostrando resultados guardados.'}
        </p>
      </div>
    </section>
  )
}

export default function App() {
  const userId = useUserId()
  const error = useCurrentError()
  return (
    <main>
      {error !== null && (
        <button className="ticket" onClick={dismissError}>
          Error {error} · toca para cerrar
        </button>
      )}
      {QUESTIONS.map((question) => (
        <QuestionCard key={question.id} question={question} userId={userId} />
      ))}
    </main>
  )
}
