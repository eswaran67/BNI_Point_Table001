# BNI Tournament - Five Teams Member Line-Up & Points Table (React + SQLite)

A modern, high-performance **React** web application for the BNI Tournament Five Teams Line-up, Standings, Player MVP Points, and Match Scores. Powered by **Vite**, **React 18**, and a permanent **SQLite 3 Database** backend.

---

## ⚡ Quick Start / Run பண்ணுவது எப்படி?

### 1. React Dev Server (Vite Hot-Reload):
```bash
npm run dev
```
Open: `http://localhost:5173`

### 2. Full Production Server (React App + Permanent SQLite 3 Database):
```bash
npm start
# or
npm run server
```
Open: `http://localhost:3000` (Also reachable via mobile on your local Wi-Fi!)

### 3. Build React Production App:
```bash
npm run build
```

---

## 🌟 React Architecture & Features

1. **React 18 + Vite**:
   - Lightning-fast component-driven architecture located in `src/`.
   - Modals for score entry, manual standings, team roster editing, and player points.
   - Real-time instant state updates and optimistic rendering.

2. **Permanent SQLite Database (`data/tournament.sqlite`)**:
   - Zero-dependency Node.js native SQLite 3 persistence.
   - All points, matches, and roster updates are saved permanently to disk.
   - Background live sync every 6 seconds.

3. **6 Feature Tabs**:
   - 🛡️ **Teams Line-Up**: 5 poster columns (Baasha, Padayappa, Sivaji, Petta, Jailer) with captain, vice-captain, player points, and team roster editor.
   - 🏆 **Points Table**: Official leaderboard with rank podium topper, form pills, win (+1 pt), loss, custom points adjustment, and print preview.
   - ⭐ **Player Points & MVP**: Top 3 MVP podium, team filters, sort options, and bulk sync to team scores.
   - 📅 **Match Scores & Fixtures**: 10 fixtures across 5 rounds with live result modal and auto-recalculated standings.
   - 👥 **All Players Directory**: Searchable directory cards for all ~42 players and captains.
   - 🖼️ **Original Poster**: High-res poster preview and instant download.

4. **Celebration & UX**:
   - Canvas Confetti animations on wins and points additions.
   - Animated Toast notifications for saves and updates.
   - Royal Gold & Crimson cinematic visual styling.
