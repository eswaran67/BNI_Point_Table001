import React, { useState } from 'react';

export default function PlayerPointsTab({
  teams,
  searchQuery,
  onAddPlayerPoint,
  onSetPlayerPoint,
  onSyncAllPlayerPoints
}) {
  const [filterTeam, setFilterTeam] = useState('all');
  const [sortMode, setSortMode] = useState('points'); // 'points' | 'team'

  // Extract all players
  let allPlayers = [];
  teams.forEach((t) => {
    (t.players || []).forEach((p) => {
      allPlayers.push({
        teamId: t.id,
        teamName: t.name,
        accentColor: t.accentColor,
        name: p.name,
        role: p.role,
        points: p.points || 0
      });
    });
  });

  // Top 3 MVP players overall
  const topMvpPlayers = [...allPlayers]
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, 3);

  // Filter players
  let displayedPlayers = allPlayers;
  if (filterTeam !== 'all') {
    displayedPlayers = displayedPlayers.filter((p) => p.teamId === filterTeam);
  }

  const q = (searchQuery || '').trim().toLowerCase();
  if (q) {
    displayedPlayers = displayedPlayers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.teamName.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q)
    );
  }

  // Sort
  if (sortMode === 'points') {
    displayedPlayers.sort((a, b) => (b.points || 0) - (a.points || 0));
  } else {
    displayedPlayers.sort((a, b) => a.teamName.localeCompare(b.teamName) || (b.points || 0) - (a.points || 0));
  }

  return (
    <div className="tab-content-panel">
      {/* Title */}
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-extrabold text-yellow-300 font-['Rajdhani'] tracking-wide">
          <i className="fas fa-star mr-2 text-yellow-400"></i> INDIVIDUAL PLAYER POINTS & MVP SCORING
        </h2>
        <p className="text-xs md:text-sm text-pink-200/70">
          Track individual points for every Captain, Vice Captain and Player. Use +/- buttons or type directly!
        </p>
      </div>

      {/* Top 3 MVP Podium */}
      {topMvpPlayers.length > 0 && (
        <div className="mvp-podium-container">
          {topMvpPlayers.map((mvp, idx) => {
            const ranks = ['🥇 1st MVP', '🥈 2nd MVP', '🥉 3rd MVP'];
            const rankClasses = ['rank-1', 'rank-2', 'rank-3'];
            return (
              <div key={`${mvp.teamId}-${mvp.name}`} className={`mvp-card ${rankClasses[idx]}`}>
                <div className="text-2xl mb-1">{idx === 0 ? '👑' : idx === 1 ? '🥈' : '🥉'}</div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-yellow-400">
                  {ranks[idx]}
                </span>
                <div className="text-lg font-black text-white mt-1 truncate" title={mvp.name}>
                  {mvp.name}
                </div>
                <div className="text-xs text-yellow-300/80 font-medium">
                  {mvp.teamName} • {mvp.role}
                </div>
                <div className="mvp-pts-tag">
                  {mvp.points} Points
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-red-950/40 border border-yellow-600/30 p-3 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-yellow-300 uppercase mr-1">Filter Team:</span>
          <button
            className={`player-filter-btn ${filterTeam === 'all' ? 'active' : ''}`}
            onClick={() => setFilterTeam('all')}
          >
            All Teams ({allPlayers.length})
          </button>
          {teams.map((t) => (
            <button
              key={t.id}
              className={`player-filter-btn ${filterTeam === t.id ? 'active' : ''}`}
              onClick={() => setFilterTeam(t.id)}
            >
              {t.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn-gold"
            style={{ fontSize: '0.8rem' }}
            onClick={onSyncAllPlayerPoints}
          >
            <i className="fas fa-sync-alt mr-1"></i> Sync All to Team Table
          </button>
          <button
            className="btn-secondary"
            style={{ fontSize: '0.8rem' }}
            onClick={() => setSortMode(sortMode === 'points' ? 'team' : 'points')}
          >
            <i className="fas fa-sort-amount-down mr-1"></i> Sort: {sortMode === 'points' ? 'Top Scorers (MVP)' : 'By Team'}
          </button>
        </div>
      </div>

      {/* Player Points Table */}
      <div className="player-points-card">
        <div className="table-responsive">
          <table className="points-table">
            <thead>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}>Rank</th>
                <th>Player Name</th>
                <th>Team</th>
                <th>Role</th>
                <th style={{ textAlign: 'center' }}>Total Points</th>
                <th style={{ textAlign: 'right' }}>Quick Adjust (+ / -)</th>
              </tr>
            </thead>
            <tbody>
              {displayedPlayers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No players found matching your search!
                  </td>
                </tr>
              ) : (
                displayedPlayers.map((player, idx) => {
                  const rank = idx + 1;
                  let rankBadge = <span style={{ color: '#cbd5e1', fontWeight: 700 }}>#{rank}</span>;
                  if (sortMode === 'points') {
                    if (rank === 1 && player.points > 0) rankBadge = <span className="rank-badge rank-1">🥇</span>;
                    else if (rank === 2 && player.points > 0) rankBadge = <span className="rank-badge rank-2">🥈</span>;
                    else if (rank === 3 && player.points > 0) rankBadge = <span className="rank-badge rank-3">🥉</span>;
                  }

                  let roleBadgeStyle = { background: 'rgba(255,255,255,0.08)', color: '#cbd5e1' };
                  if (player.role === 'Captain') roleBadgeStyle = { background: '#ad181e', color: '#fff', fontWeight: 700 };
                  else if (player.role === 'Vice Captain') roleBadgeStyle = { background: '#b45309', color: '#fff', fontWeight: 700 };

                  return (
                    <tr key={`${player.teamId}-${player.name}`}>
                      <td style={{ textAlign: 'center' }}>{rankBadge}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>
                          {player.name}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: '#f6cf66',
                          fontFamily: 'var(--font-heading)',
                          fontSize: '0.95rem'
                        }}>
                          {player.teamName}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.72rem',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          ...roleBadgeStyle
                        }}>
                          {player.role}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="number"
                          className="player-score-input"
                          value={player.points || 0}
                          min="0"
                          onChange={(e) => onSetPlayerPoint(player.teamId, player.name, e.target.value)}
                        />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                          <button
                            className="btn-micro-gold"
                            style={{ width: '26px', height: '26px', fontSize: '0.9rem' }}
                            onClick={() => onAddPlayerPoint(player.teamId, player.name, 1)}
                            title="+1 Point"
                          >
                            +
                          </button>
                          <button
                            className="btn-micro-red"
                            style={{ width: '26px', height: '26px', fontSize: '0.9rem' }}
                            onClick={() => onAddPlayerPoint(player.teamId, player.name, -1)}
                            title="-1 Point"
                          >
                            -
                          </button>
                          <button
                            className="btn-gold"
                            style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                            onClick={() => onAddPlayerPoint(player.teamId, player.name, 5)}
                            title="+5 Points Bonus"
                          >
                            +5
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

