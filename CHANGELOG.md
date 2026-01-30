# Changelog

## [2.0.0] – 2025-01-30

### Fixed

- Removed unused `doc` import from `src/api.ts` (fixes Vercel build / TS6133).

### Changed

- Version bump to 2.0.0.

---

## [1.0.0] – 2025-01-30

### Added

- **Expenses** – Add expense (who paid, amount AED, who was involved, optional note); expense history.
- **Users** – Add roommates; they appear in “involved” when adding expenses.
- **Who owes whom** – Automatic split and net debts (e.g. “Zahoor owes Dayim X AED”).
- **Tabs** – Expenses, Users, Who owes whom, Coming soon.
- **Firebase** – Data stored in Firestore; free tier.
- **Responsive** – Works on phone and laptop; share link for everyone to add from their device.
- **Demo mode** – App runs without Firebase; banner explains how to connect.
- **Deploy** – Ready for Vercel with env vars.
