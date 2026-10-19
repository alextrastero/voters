# Voters

Mobile-first PWA for yes/no questions. Votes decay with a 12h half-life, each user can vote once per question every 6h, and the app loads and accepts votes offline.

## Setup

1. Create a Firebase project. Enable **Authentication → Anonymous** and **Firestore**.
2. Add a web app in project settings and copy its config into `.env` (see `.env.example`). Set `VITE_QUESTIONS` there too. When deploying, set the same variables in the host's build environment.
3. `npm install`
4. `npx firebase-tools login`, then `npx firebase-tools use --add` to pick the project.
5. `npx firebase-tools deploy --only firestore:rules`

## Scripts

- `npm run dev`: local dev server
- `npm test`: scoring unit tests
- `npm run build`, then `npx firebase-tools deploy --only hosting`

## Data model

`questions/{questionId}/votes/{userId}` → `{ answer: 'yes' | 'no', votedAt: <server timestamp> }`

Questions come from `VITE_QUESTIONS`, a JSON array of `{ id, text }` read at build time. Scoring lives in `src/scoring.ts`, and the 6h cooldown is enforced in `firestore.rules`.

## Error numbers

The app shows `Error <number>` on screen and logs the underlying error to the console. The source of truth is `ERRORS` in `src/errors.ts`.

| Number | Meaning |
|---|---|
| 100 | Sign-in: anonymous auth is disabled in the Firebase project |
| 101 | Sign-in: network request failed |
| 199 | Sign-in: other error |
| 200 | Vote: rejected by Firestore rules, e.g. cooldown not over |
| 299 | Vote: other error |
| 300 | Loading votes: rejected by Firestore rules |
| 301 | Loading votes: Firestore unavailable |
| 399 | Loading votes: other error |
| 400 | Config: `VITE_QUESTIONS` is missing or not a JSON array of `{ id, text }` |
| 401 | Config: one or more `VITE_FIREBASE_*` values are missing |
