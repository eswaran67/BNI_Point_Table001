# BNI Tournament - Five Teams Member Line-Up & Points Table

A premium, responsive sports/tournament points and team management web application inspired by iconic Rajinikanth cinema titles, powered by a **Permanent SQLite Database**.

## 🌟 Key Features

1. **Permanent SQLite Database (`data/tournament.sqlite`)**:
   - Built-in relational SQLite 3 database using Node.js native engine (`node:sqlite`).
   - Every single score update, player point addition, win/loss, or roster change is **saved permanently to disk immediately**.
   - Restarting your computer, closing the browser, or clearing browser cache will **never lose data**.
   - Auto-generates human-readable backups at `data/tournament_backup.json`.
   - Multi-device real-time sync: Open from your phone or tablet on the same Wi-Fi and see live points update automatically!

2. **Cinematic Grand Theme (Dark & Gold)**:
   - Deep royal crimson & gold gradient theme matching the original poster.
   - Crowned BNI official logo (transparent PNG with white background removed).
   - Custom stylized logos for each team:
     - **BAASHA**: Fiery amber gold gradient
     - **PADAYAPPA**: Royal gold & metallic silver shield
     - **SIVAJI The Boss**: Neon electric cyan script
     - **PETTA**: Futuristic cyberpunk cyan stencil
     - **JAILER**: Titanium metallic gunmetal

3. **Five Teams Line-Up (Poster View)**:
   - **BAASHA**: Captain: *Raj venkatesh* | Vice Captain: *Suhaina* | Members: *Victor, Lakshmanan, Karthick kumar, Daniel, A.suresh babu, Ashok Kumar, Sridhar*
   - **PADAYAPPA**: Captain: *Rahul* | Vice Captain: *Vijayakumar (Vijay Media)* | Members: *Priyatharshini, SENBAGARAJA, Premkumar, Manikandan G, Gowtham K G, Vignesh C, Bethuraj*
   - **SIVAJI**: Captain: *Arjun P* | Vice Captain: *Ranjitha Marry* | Members: *Muthuraj, Soundarapandi, Jerrin Thomas, Harish Raj, Dilip Kumar, Senthil Kumar, Nevendra Pandian*
   - **PETTA**: Captain: *Vijayakumar (Vijay Cater)* | Vice Captain: *Mariappan* | Members: *Rajendran P, Mari Selvam, DINESH KUMAR, Usha Ramesh, Prasanna Rajan, Mukesh Kumar, Manikandan J*
   - **JAILER**: Captain: *Ajay Kumar* | Vice Captain: *Jayabalan* | Members: *Balamurugan, Suresh P, Santhosh, Vinoth Kannan, Pranavathan, Ramesh V*

4. **Individual Player Points & MVP Leaderboard**:
   - Individual points tracking for all 44 players (Captains, Vice Captains, and Members).
   - Quick `+1` / `-1` micro buttons right on each team card.
   - Dedicated **Player Points** tab with team filter, direct score input, and Top Scorer (🥇, 🥈, 🥉) rankings.
   - **"Sync from Player Points"** button: Automatically calculates each team's total points as the sum of all its players' points!

5. **Championship Points Table**:
   - **1 Point per Win** (`+ Win (+1)` adds 1 match, 1 win, 1 point).
   - Protected against negative values (floored at 0).
   - Direct `+1 Pt` and `-1 Pt` quick buttons.
   - Revert / Undo match feature.

6. **10 Match Fixtures & Live Score Recorder**:
   - 10 Round-robin matches between all 5 teams.
   - "Enter Result" records scores, winner, or tie and updates standings with celebratory confetti!

## 🚀 How to Run

Open your terminal in VS Code and run:
```bash
npm run dev
```
*(or `npm start`)*

This starts the server and connects to the **Permanent SQLite Database**:
- **Local URL**: `http://localhost:3000` (auto-opens in your browser)
- **Mobile / Wi-Fi Access**: The terminal will display your local IP (e.g. `http://192.168.1.x:3000`) so you can open and update scores from your phone or tablet on the same Wi-Fi!
- **Database File**: Stored permanently at [**`data/tournament.sqlite`**](file:///e:/BNI%20Point%20table/data/tournament.sqlite).
