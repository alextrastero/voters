import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { auth } from './firebase'

export function useUserId(): string | null {
  const [userId, setUserId] = useState<string | null>(auth.currentUser?.uid ?? null)

  useEffect(
    () =>
      onAuthStateChanged(auth, (user) => {
        if (user) setUserId(user.uid)
        else signInAnonymously(auth).catch((err) => console.error('Anonymous sign-in failed', err))
      }),
    [],
  )

  return userId
}
