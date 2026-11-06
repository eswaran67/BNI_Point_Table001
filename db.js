/**
 * Permanent SQLite Database Manager
 * Uses Node.js 22+ built-in node:sqlite (zero external dependencies)
 */

const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'tournament.sqlite');
const BACKUP_PATH = path.join(DB_DIR, 'tournament_backup.json');

// Initial defaults if DB is fresh
const INITIAL_SETTINGS = {
  title: "BNI TOURNAMENT • FIVE TEAMS MEMBER LINE-UP",
  subtitle: "CHAMPIONSHIP POINTS TABLE & TEAM ROSTER",
  winPoints: 1,
  tiePoints: 0.5,
  lossPoints: 0
};

const INITIAL_TEAMS = [
  {
    id: "baasha",
    name: "BAASHA",
    tamilName: "பாட்ஷா",
    tagline: "Manick Baasha - Naan oru thadava sonna...",
    badgeClass: "badge-baasha",
    accentColor: "#f59e0b",
    secondaryColor: "#ef4444",
    captain: "Raj venkatesh",
    viceCaptain: "Suhaina",
    members: ["Victor", "Lakshmanan", "Karthick kumar", "Daniel", "A.suresh babu", "Ashok Kumar", "Sridhar"],
    players: [
      { name: "Raj venkatesh", role: "Captain", points: 0 },
      { name: "Suhaina", role: "Vice Captain", points: 0 },
      { name: "Victor", role: "Member", points: 0 },
      { name: "Lakshmanan", role: "Member", points: 0 },
      { name: "Karthick kumar", role: "Member", points: 0 },
      { name: "Daniel", role: "Member", points: 0 },
      { name: "A.suresh babu", role: "Member", points: 0 },
      { name: "Ashok Kumar", role: "Member", points: 0 },
      { name: "Sridhar", role: "Member", points: 0 }
    ],
    stats: { played: 0, won: 0, lost: 0, tied: 0, points: 0, form: [] }
  },
  {
    id: "padayappa",
    name: "PADAYAPPA",
    tamilName: "படையப்பா",
    tagline: "En vazhi thani vazhi!",
    badgeClass: "badge-padayappa",
    accentColor: "#fbbf24",
    secondaryColor: "#b45309",
    captain: "Rahul",
    viceCaptain: "Vijayakumar (Vijay Media)",
    members: ["Priyatharshini", "SENBAGARAJA", "Premkumar", "Manikandan G", "Gowtham K G", "Vignesh C", "Bethuraj"],
    players: [
      { name: "Rahul", role: "Captain", points: 0 },
      { name: "Vijayakumar (Vijay Media)", role: "Vice Captain", points: 0 },
      { name: "Priyatharshini", role: "Member", points: 0 },
      { name: "SENBAGARAJA", role: "Member", points: 0 },
      { name: "Premkumar", role: "Member", points: 0 },
      { name: "Manikandan G", role: "Member", points: 0 },
      { name: "Gowtham K G", role: "Member", points: 0 },
      { name: "Vignesh C", role: "Member", points: 0 },
      { name: "Bethuraj", role: "Member", points: 0 }
    ],
    stats: { played: 0, won: 0, lost: 0, tied: 0, points: 0, form: [] }
  },
  {
    id: "sivaji",
    name: "SIVAJI",
    subtitleBadge: "The boss",
    tamilName: "சிவாஜி The boss",
    tagline: "Kanna, panni dhan koottama varum, Singam single-a dhaan varum!",
    badgeClass: "badge-sivaji",
    accentColor: "#38bdf8",
    secondaryColor: "#0284c7",
    captain: "Arjun P",
    viceCaptain: "Ranjitha Marry",
    members: ["Muthuraj", "Soundarapandi", "Jerrin Thomas", "Harish Raj", "Dilip Kumar", "Senthil Kumar", "Nevendra Pandian"],
    players: [
      { name: "Arjun P", role: "Captain", points: 0 },
      { name: "Ranjitha Marry", role: "Vice Captain", points: 0 },
      { name: "Muthuraj", role: "Member", points: 0 },
      { name: "Soundarapandi", role: "Member", points: 0 },
      { name: "Jerrin Thomas", role: "Member", points: 0 },
      { name: "Harish Raj", role: "Member", points: 0 },
      { name: "Dilip Kumar", role: "Member", points: 0 },
      { name: "Senthil Kumar", role: "Member", points: 0 },
      { name: "Nevendra Pandian", role: "Member", points: 0 }
    ],
    stats: { played: 0, won: 0, lost: 0, tied: 0, points: 0, form: [] }
  },
  {
    id: "petta",
    name: "PETTA",
    tamilName: "பேட்ட",
    tagline: "Kaali... Petta Paraak!",
    badgeClass: "badge-petta",
    accentColor: "#22d3ee",
    secondaryColor: "#0891b2",
    captain: "Vijayakumar (Vijay Cater)",
    viceCaptain: "Mariappan",
    members: ["Rajendran P", "Mari Selvam", "DINESH KUMAR", "Usha Ramesh", "Prasanna Rajan", "Mukesh Kumar", "Manikandan J"],
    players: [
      { name: "Vijayakumar (Vijay Cater)", role: "Captain", points: 0 },
      { name: "Mariappan", role: "Vice Captain", points: 0 },
      { name: "Rajendran P", role: "Member", points: 0 },
      { name: "Mari Selvam", role: "Member", points: 0 },
      { name: "DINESH KUMAR", role: "Member", points: 0 },
      { name: "Usha Ramesh", role: "Member", points: 0 },
      { name: "Prasanna Rajan", role: "Member", points: 0 },
      { name: "Mukesh Kumar", role: "Member", points: 0 },
      { name: "Manikandan J", role: "Member", points: 0 }
    ],
    stats: { played: 0, won: 0, lost: 0, tied: 0, points: 0, form: [] }
  },
  {
    id: "jailer",
    name: "JAILER",
    tamilName: "ஜெயிலர்",
    tagline: "Hukum... Tiger Ka Hukum!",
    badgeClass: "badge-jailer",
    accentColor: "#e2e8f0",
    secondaryColor: "#71717a",
    captain: "Ajay Kumar",
    viceCaptain: "Jayabalan",
    members: ["Balamurugan", "Suresh P", "Santhosh", "Vinoth Kannan", "Pranavathan", "Ramesh V"],
    players: [
      { name: "Ajay Kumar", role: "Captain", points: 0 },
      { name: "Jayabalan", role: "Vice Captain", points: 0 },
      { name: "Balamurugan", role: "Member", points: 0 },
      { name: "Suresh P", role: "Member", points: 0 },
      { name: "Santhosh", role: "Member", points: 0 },
      { name: "Vinoth Kannan", role: "Member", points: 0 },
      { name: "Pranavathan", role: "Member", points: 0 },
      { name: "Ramesh V", role: "Member", points: 0 }
    ],
    stats: { played: 0, won: 0, lost: 0, tied: 0, points: 0, form: [] }
  }
];

const INITIAL_FIXTURES = [
  { id: "match-1", matchNo: 1, round: "Round 1", teamAId: "baasha", teamBId: "padayappa", teamAScore: "", teamBScore: "", winnerId: null, isTie: false, status: "upcoming", notes: "Clash of the Titans" },
  { id: "match-2", matchNo: 2, round: "Round 1", teamAId: "sivaji", teamBId: "petta", teamAScore: "", teamBScore: "", winnerId: null, isTie: false, status: "upcoming", notes: "Style vs Swag" },
  { id: "match-3", matchNo: 3, round: "Round 2", teamAId: "jailer", teamBId: "baasha", teamAScore: "", teamBScore: "", winnerId: null, isTie: false, status: "upcoming", notes: "Tiger meets Don" },
  { id: "match-4", matchNo: 4, round: "Round 2", teamAId: "padayappa", teamBId: "sivaji", teamAScore: "", teamBScore: "", winnerId: null, isTie: false, status: "upcoming", notes: "Mass vs Class" },
  { id: "match-5", matchNo: 5, round: "Round 3", teamAId: "petta", teamBId: "jailer", teamAScore: "", teamBScore: "", winnerId: null, isTie: false, status: "upcoming", notes: "Kaali vs Muthuvel Pandian" },
  { id: "match-6", matchNo: 6, round: "Round 3", teamAId: "baasha", teamBId: "sivaji", teamAScore: "", teamBScore: "", winnerId: null, isTie: false, status: "upcoming", notes: "Royalty Battle" },
  { id: "match-7", matchNo: 7, round: "Round 4", teamAId: "padayappa", teamBId: "petta", teamAScore: "", teamBScore: "", winnerId: null, isTie: false, status: "upcoming", notes: "Power Clash" },
  { id: "match-8", matchNo: 8, round: "Round 4", teamAId: "sivaji", teamBId: "jailer", teamAScore: "", teamBScore: "", winnerId: null, isTie: false, status: "upcoming", notes: "The Boss vs The Tiger" },
  { id: "match-9", matchNo: 9, round: "Round 5", teamAId: "baasha", teamBId: "petta", teamAScore: "", teamBScore: "", winnerId: null, isTie: false, status: "upcoming", notes: "High Voltage Drama" },
  { id: "match-10", matchNo: 10, round: "Round 5", teamAId: "padayappa", teamBId: "jailer", teamAScore: "", teamBScore: "", winnerId: null, isTie: false, status: "upcoming", notes: "Final League Showdown" }
];

class DatabaseManager {
  constructor() {
    this.db = new DatabaseSync(DB_PATH);
    this.initTables();
    this.seedIfEmpty();
  }

  initTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        tamil_name TEXT,
        subtitle_badge TEXT,
        tagline TEXT,
        captain TEXT,
        vice_captain TEXT,
        played INT DEFAULT 0,
        won INT DEFAULT 0,
        lost INT DEFAULT 0,
        tied INT DEFAULT 0,
        points INT DEFAULT 0,
        form_json TEXT DEFAULT '[]'
      );

      CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        team_id TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        points INT DEFAULT 0,
        FOREIGN KEY (team_id) REFERENCES teams(id)
      );

      CREATE TABLE IF NOT EXISTS fixtures (
        id TEXT PRIMARY KEY,
        match_no INT,
        round TEXT,
        team_a_id TEXT,
        team_b_id TEXT,
        team_a_score TEXT,
        team_b_score TEXT,
        winner_id TEXT,
        is_tie INT DEFAULT 0,
        status TEXT DEFAULT 'upcoming',
        notes TEXT
      );
    `);
  }

  seedIfEmpty() {
    const countQuery = this.db.prepare('SELECT COUNT(*) as count FROM teams');
    const result = countQuery.get();

    if (!result || result.count === 0) {
      console.log('Seeding SQLite database with default 5 Teams and Matches...');
      this.resetDatabase();
    }
  }

  resetDatabase() {
    this.db.exec('BEGIN TRANSACTION');
    try {
      this.db.exec('DELETE FROM players');
      this.db.exec('DELETE FROM fixtures');
      this.db.exec('DELETE FROM teams');
      this.db.exec('DELETE FROM meta');

      // Insert Settings
      const insertMeta = this.db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)');
      insertMeta.run('settings', JSON.stringify(INITIAL_SETTINGS));
      insertMeta.run('updated_at', new Date().toISOString());

      // Insert Teams & Players
      const insertTeam = this.db.prepare(`
        INSERT INTO teams (id, name, tamil_name, subtitle_badge, tagline, captain, vice_captain, played, won, lost, tied, points, form_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertPlayer = this.db.prepare(`
        INSERT INTO players (team_id, name, role, points)
        VALUES (?, ?, ?, ?)
      `);

      for (const t of INITIAL_TEAMS) {
        insertTeam.run(
          t.id,
          t.name,
          t.tamilName,
          t.subtitleBadge || '',
          t.tagline || '',
          t.captain,
          t.viceCaptain,
          t.stats.played || 0,
          t.stats.won || 0,
          t.stats.lost || 0,
          t.stats.tied || 0,
          t.stats.points || 0,
          JSON.stringify(t.stats.form || [])
        );

        for (const p of t.players) {
          insertPlayer.run(t.id, p.name, p.role, p.points || 0);
        }
      }

      // Insert Fixtures
      const insertFixture = this.db.prepare(`
        INSERT INTO fixtures (id, match_no, round, team_a_id, team_b_id, team_a_score, team_b_score, winner_id, is_tie, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const f of INITIAL_FIXTURES) {
        insertFixture.run(
          f.id,
          f.matchNo,
          f.round,
          f.teamAId,
          f.teamBId,
          f.teamAScore || '',
          f.teamBScore || '',
          f.winnerId || null,
          f.isTie ? 1 : 0,
          f.status || 'upcoming',
          f.notes || ''
        );
      }

      this.db.exec('COMMIT');
      this.saveBackupJson();
      console.log('Database successfully initialized and seeded!');
    } catch (err) {
      this.db.exec('ROLLBACK');
      console.error('Error during database seed:', err);
      throw err;
    }
  }

  // Get full tournament state
  getFullTournamentData() {
    const teamsRows = this.db.prepare('SELECT * FROM teams').all();
    const playersRows = this.db.prepare('SELECT * FROM players').all();
    const fixturesRows = this.db.prepare('SELECT * FROM fixtures ORDER BY match_no ASC').all();
    const metaSettings = this.db.prepare("SELECT value FROM meta WHERE key = 'settings'").get();

    const settings = metaSettings ? JSON.parse(metaSettings.value) : INITIAL_SETTINGS;

    const teams = teamsRows.map(t => {
      const teamPlayers = playersRows
        .filter(p => p.team_id === t.id)
        .map(p => ({
          name: p.name,
          role: p.role,
          points: p.points
        }));

      let formArr = [];
      try {
        formArr = JSON.parse(t.form_json || '[]');
      } catch (e) {
        formArr = [];
      }

      return {
        id: t.id,
        name: t.name,
        tamilName: t.tamil_name,
        subtitleBadge: t.subtitle_badge || null,
        tagline: t.tagline,
        captain: t.captain,
        viceCaptain: t.vice_captain,
        members: teamPlayers.filter(p => p.role === 'Member').map(p => p.name),
        players: teamPlayers,
        stats: {
          played: t.played,
          won: t.won,
          lost: t.lost,
          tied: t.tied,
          points: t.points,
          form: formArr
        }
      };
    });

    const fixtures = fixturesRows.map(f => ({
      id: f.id,
      matchNo: f.match_no,
      round: f.round,
      teamAId: f.team_a_id,
      teamBId: f.team_b_id,
      teamAScore: f.team_a_score || '',
      teamBScore: f.team_b_score || '',
      winnerId: f.winner_id || null,
      isTie: Boolean(f.is_tie),
      status: f.status,
      notes: f.notes || ''
    }));

    return {
      settings,
      teams,
      fixtures,
      database: "sqlite",
      databasePath: DB_PATH,
      updatedAt: new Date().toISOString()
    };
  }

  // Transactionally save all tournament data from frontend
  saveFullTournamentData(data) {
    if (!data || !Array.isArray(data.teams)) {
      throw new Error('Invalid tournament data payload');
    }

    this.db.exec('BEGIN TRANSACTION');
    try {
      // 1. Update or replace teams and players
      const updateTeam = this.db.prepare(`
        INSERT INTO teams (id, name, tamil_name, subtitle_badge, tagline, captain, vice_captain, played, won, lost, tied, points, form_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          tamil_name = excluded.tamil_name,
          captain = excluded.captain,
          vice_captain = excluded.vice_captain,
          played = excluded.played,
          won = excluded.won,
          lost = excluded.lost,
          tied = excluded.tied,
          points = excluded.points,
          form_json = excluded.form_json
      `);

      this.db.exec('DELETE FROM players');
      const insertPlayer = this.db.prepare(`
        INSERT INTO players (team_id, name, role, points)
        VALUES (?, ?, ?, ?)
      `);

      for (const t of data.teams) {
        updateTeam.run(
          t.id,
          t.name,
          t.tamilName || '',
          t.subtitleBadge || '',
          t.tagline || '',
          t.captain,
          t.viceCaptain,
          Math.max(0, t.stats?.played || 0),
          Math.max(0, t.stats?.won || 0),
          Math.max(0, t.stats?.lost || 0),
          Math.max(0, t.stats?.tied || 0),
          Math.max(0, t.stats?.points || 0),
          JSON.stringify(t.stats?.form || [])
        );

        if (Array.isArray(t.players)) {
          for (const p of t.players) {
            insertPlayer.run(t.id, p.name, p.role, Math.max(0, p.points || 0));
          }
        }
      }

      // 2. Update fixtures if provided
      if (Array.isArray(data.fixtures)) {
        const updateFixture = this.db.prepare(`
          INSERT INTO fixtures (id, match_no, round, team_a_id, team_b_id, team_a_score, team_b_score, winner_id, is_tie, status, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            team_a_score = excluded.team_a_score,
            team_b_score = excluded.team_b_score,
            winner_id = excluded.winner_id,
            is_tie = excluded.is_tie,
            status = excluded.status,
            notes = excluded.notes
        `);

        for (const f of data.fixtures) {
          updateFixture.run(
            f.id,
            f.matchNo,
            f.round,
            f.teamAId,
            f.teamBId,
            f.teamAScore || '',
            f.teamBScore || '',
            f.winnerId || null,
            f.isTie ? 1 : 0,
            f.status || 'upcoming',
            f.notes || ''
          );
        }
      }

      // 3. Update meta
      const updateMeta = this.db.prepare(`
        INSERT INTO meta (key, value) VALUES ('updated_at', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `);
      updateMeta.run(new Date().toISOString());

      this.db.exec('COMMIT');
      this.saveBackupJson();
      return true;
    } catch (err) {
      this.db.exec('ROLLBACK');
      console.error('Error saving tournament data to SQLite:', err);
      throw err;
    }
  }

  // Quick single player point update
  updatePlayerPoint(teamId, playerName, delta, exactVal = null) {
    let stmt;
    if (exactVal !== null) {
      stmt = this.db.prepare(`
        UPDATE players
        SET points = ?
        WHERE team_id = ? AND name = ?
      `);
      stmt.run(Math.max(0, exactVal), teamId, playerName);
    } else {
      stmt = this.db.prepare(`
        UPDATE players
        SET points = MAX(0, points + ?)
        WHERE team_id = ? AND name = ?
      `);
      stmt.run(delta, teamId, playerName);
    }
    this.saveBackupJson();
    return true;
  }

  // Save human-readable JSON backup
  saveBackupJson() {
    try {
      const data = this.getFullTournamentData();
      fs.writeFileSync(BACKUP_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving backup JSON:', e);
    }
  }

  getDbStats() {
    const teamsCount = this.db.prepare('SELECT COUNT(*) as c FROM teams').get()?.c || 0;
    const playersCount = this.db.prepare('SELECT COUNT(*) as c FROM players').get()?.c || 0;
    const fixturesCount = this.db.prepare('SELECT COUNT(*) as c FROM fixtures').get()?.c || 0;
    const fileSize = fs.existsSync(DB_PATH) ? fs.statSync(DB_PATH).size : 0;

    return {
      type: "SQLite 3",
      dbPath: DB_PATH,
      backupPath: BACKUP_PATH,
      sizeBytes: fileSize,
      totalTeams: teamsCount,
      totalPlayers: playersCount,
      totalMatches: fixturesCount
    };
  }
}

module.exports = new DatabaseManager();
