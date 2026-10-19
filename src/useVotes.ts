import { Timestamp, collection, doc, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { firebaseCode, reportError } from './errors'
import { db } from './firebase'
import { VOTE_WINDOW_MS, type Answer, type Vote } from './scoring'

export interface VotesState {
  votes: Vote[]
  ownVote: Vote | null
  fromCache: boolean
  pendingWrite: boolean
}

export function useVotes(questionId: string, userId: string | null): VotesState {
  const [state, setState] = useState<VotesState>({ votes: [], ownVote: null, fromCache: true, pendingWrite: false })

  useEffect(() => {
    const since = Timestamp.fromMillis(Date.now() - VOTE_WINDOW_MS)
    const votesQuery = query(collection(db, 'questions', questionId, 'votes'), where('votedAt', '>=', since))

    return onSnapshot(
      votesQuery,
      { includeMetadataChanges: true },
      (snapshot) => {
        const votes: Vote[] = []
        let ownVote: Vote | null = null
        for (const voteDoc of snapshot.docs) {
          const data = voteDoc.data({ serverTimestamps: 'estimate' })
          const vote: Vote = { answer: data.answer as Answer, votedAt: (data.votedAt as Timestamp).toMillis() }
          votes.push(vote)
          if (voteDoc.id === userId) ownVote = vote
        }
        setState({
          votes,
          ownVote,
          fromCache: snapshot.metadata.fromCache,
          pendingWrite: snapshot.metadata.hasPendingWrites,
        })
      },
      (err) => {
        const code = firebaseCode(err)
        reportError(code === 'permission-denied' ? 300 : code === 'unavailable' ? 301 : 399, err)
      },
    )
  }, [questionId, userId])

  return state
}

export function castVote(questionId: string, userId: string, answer: Answer): void {
  // Offline writes are queued by Firestore; the promise resolves only once the server acknowledges.
  setDoc(doc(db, 'questions', questionId, 'votes', userId), { answer, votedAt: serverTimestamp() }).catch((err) =>
    reportError(firebaseCode(err) === 'permission-denied' ? 200 : 299, err),
  )
}
