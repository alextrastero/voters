# Voter

Mobile-first PWA for yes/no questions. Votes decay with a 12h half-life, each user can vote once per question every 6h, and the app loads and accepts votes offline.

## Setup

1. Create a Firebase project. Enable **Authentication → Anonymous** and **Firestore**.
2. Add a web app in project settings and copy its config into `.env` (see `.env.example`).
3. `npm install`
4. `npx firebase-tools login`, then `npx firebase-tools use --add` to pick the project.
5. `npx firebase-tools deploy --only firestore:rules`

## Scripts

- `npm run dev`: local dev server
- `npm test`: scoring unit tests
- `npm run build`, then `npx firebase-tools deploy --only hosting`

## Data model

`questions/{questionId}/votes/{userId}` → `{ answer: 'yes' | 'no', votedAt: <server timestamp> }`

Questions are defined in `src/questions.ts`. Scoring lives in `src/scoring.ts`, and the 6h cooldown is enforced in `firestore.rules`.
