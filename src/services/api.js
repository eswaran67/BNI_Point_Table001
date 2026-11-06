import confetti from 'canvas-confetti';
import { DEFAULT_TEAMS, DEFAULT_FIXTURES } from '../data/defaultData';

const STORAGE_KEY = 'bni_tournament_data_react_v1';

export function fireConfetti() {
  try {
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffe082', '#f6cf66', '#d4af37', '#ad181e', '#ffffff']
    });
  } catch (e) {
    // Ignore if not supported
  }
}

export function loadInitialData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('bni_tournament_data_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        teams: sanitizeTeams(parsed.teams || DEFAULT_TEAMS),
        fixtures: parsed.fixtures || DEFAULT_FIXTURES
      };
    }
  } catch (e) {
    console.warn('Error reading from localStorage:', e);
  }
  return {
    teams: sanitizeTeams(DEFAULT_TEAMS),
    fixtures: DEFAULT_FIXTURES
  };
}

export function sanitizeTeams(teams) {
  return teams.map(team => {
    const stats = {
      played: Math.max(0, team.stats?.played || 0),
      won: Math.max(0, team.stats?.won || 0),
      lost: Math.max(0, team.stats?.lost || 0),
      tied: Math.max(0, team.stats?.tied || 0),
      points: Math.max(0, team.stats?.points || 0),
      form: Array.isArray(team.stats?.form) ? team.stats.form : []
    };

    let players = Array.isArray(team.players) ? [...team.players] : [];
    if (players.length === 0) {
      if (team.captain) players.push({ name: team.captain, role: 'Captain', points: 0 });
      if (team.viceCaptain) players.push({ name: team.viceCaptain, role: 'Vice Captain', points: 0 });
      if (Array.isArray(team.members)) {
        team.members.forEach(m => {
          const name = typeof m === 'string' ? m : (m.name || 'Member');
          const pts = typeof m === 'object' && m.points !== undefined ? m.points : 0;
          players.push({ name, role: 'Member', points: pts });
        });
      }
    } else {
      players = players.map(p => ({
        ...p,
        points: typeof p.points === 'number' && !isNaN(p.points) ? Math.max(0, p.points) : 0
      }));
    }

    const members = players.filter(p => p.role === 'Member').map(p => p.name);

    return {
      ...team,
      players,
      members,
      stats
    };
  });
}

export async function fetchTournamentData() {
  try {
    const res = await fetch('/api/tournament', {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const teams = sanitizeTeams(json.data.teams || DEFAULT_TEAMS);
        const fixtures = json.data.fixtures || DEFAULT_FIXTURES;
        // Save to cache
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ teams, fixtures, updatedAt: json.data.updatedAt }));
        return { isConnected: true, teams, fixtures, updatedAt: json.data.updatedAt };
      }
    }
  } catch (err) {
    // Backend offline / Vite standalone
  }
  return { isConnected: false };
}

export async function saveTournamentData(teams, fixtures) {
  const timestamp = new Date().toISOString();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ teams, fixtures, updatedAt: timestamp }));
  } catch (e) {
    console.error('Local storage save error:', e);
  }

  try {
    const res = await fetch('/api/tournament', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teams, fixtures })
    });
    if (res.ok) {
      return { success: true, permanent: true };
    }
  } catch (err) {
    // Offline
  }
  return { success: true, permanent: false };
}

export async function resetTournamentData() {
  try {
    const res = await fetch('/api/reset', { method: 'POST' });
    if (res.ok) {
      const result = await fetchTournamentData();
      return { success: true, teams: result.teams || DEFAULT_TEAMS, fixtures: result.fixtures || DEFAULT_FIXTURES };
    }
  } catch (e) {
    // Fallback to local reset
  }
  localStorage.removeItem(STORAGE_KEY);
  const teams = sanitizeTeams(DEFAULT_TEAMS);
  const fixtures = DEFAULT_FIXTURES;
  await saveTournamentData(teams, fixtures);
  return { success: true, teams, fixtures };
}

