import { useSyncExternalStore } from 'react'

export const ERRORS = {
  100: 'Sign-in: anonymous auth is disabled in the Firebase project (auth/admin-restricted-operation)',
  101: 'Sign-in: network request failed (auth/network-request-failed)',
  199: 'Sign-in: other error',
  200: 'Vote: rejected by Firestore rules (permission-denied), e.g. cooldown not over',
  299: 'Vote: other error',
  300: 'Loading votes: rejected by Firestore rules (permission-denied)',
  301: 'Loading votes: Firestore unavailable (unavailable)',
  399: 'Loading votes: other error',
} as const

export type ErrorNumber = keyof typeof ERRORS

const byFirebaseCode: Record<string, ErrorNumber> = {
  'auth/admin-restricted-operation': 100,
  'auth/network-request-failed': 101,
}

let current: ErrorNumber | null = null
const listeners = new Set<() => void>()

function setCurrent(next: ErrorNumber | null) {
  current = next
  listeners.forEach((listener) => listener())
}

export function reportError(number: ErrorNumber, err: unknown): void {
  console.error(`Error ${number}: ${ERRORS[number]}`, err)
  setCurrent(number)
}

export function firebaseCode(err: unknown): string | undefined {
  return typeof err === 'object' && err !== null && 'code' in err ? String(err.code) : undefined
}

export function authErrorNumber(err: unknown): ErrorNumber {
  return byFirebaseCode[firebaseCode(err) ?? ''] ?? 199
}

export function dismissError(): void {
  setCurrent(null)
}

export function useCurrentError(): ErrorNumber | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => current,
  )
}
