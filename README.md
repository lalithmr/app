# Eternix

Eternix is a chess-based gamified MVP built with Next.js, Firebase Authentication, Firestore, and the Lichess API.

## Features

- Email/password and Google authentication
- Firestore-backed player profiles
- Lichess username validation
- League progression map
- Latest game sync with NDJSON parsing
- Win/loss detection with duplicate protection
- Puzzle surfacing for daily questing

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and fill in Firebase and Lichess values.
3. Start the app:

```bash
npm run dev
```

## Firestore collection

Use a `users` collection keyed by Firebase Auth `uid`.

## Notes

- The in-memory API throttle protects the MVP from accidental Lichess spamming during a single server instance.
- For multi-region or high-scale usage, move throttling and quest locks into Redis or Firestore.
