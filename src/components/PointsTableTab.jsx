import React from 'react';

export default function PointsTableTab({
  teams,
  onQuickAddWin,
  onQuickAddLoss,
  onQuickAdjustPts,
  onQuickRevertMatch,
  onSyncAllPlayerPoints,
  onOpenManualEdit,
  onResetData
}) {
  // Sort teams descending by points, then by won matches, then alphabetically
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
    if (b.stats.won !== a.stats.won) return b.stats.won - a.stats.won;
    return a.name.localeCompare(b.name);
  });

  const topLeader = sortedTeams[0] || null;
  const hasPlayedAny = sortedTeams.some(t => t.stats.played > 0 || t.stats.points > 0);

  return (
    <div className="tab-content-panel">
      {/* Leader Podium Banner */}
      {topLeader && (
        <div className="podium-banner">
          <div className="podium-badge">
            <i className="fas fa-crown text-yellow-400 text-xl"></i>
            <span>{hasPlayedAny && topLeader.stats.points > 0 ? 'CURRENT TABLE TOPPER' : 'DEFENDING CHAMPION'} : </span>
            <span style={{ color: '#fff', fontWeight: 900, letterSpacing: '1px', marginLeft: 5 }}>
              {topLeader.name}
            </span>
            <span style={{
              background: 'rgba(246, 207, 102, 0.25)',
              border: '1px solid #f6cf66',
              fontSize: '0.82rem',
              padding: '2px 10px',
              borderRadius: 9999,
              marginLeft: 8
            }}>
              {topLeader.stats.points} PTS
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className="btn-gold"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              onClick={onSyncAllPlayerPoints}
              title="Sum all player points into team points"
            >
              <i className="fas fa-calculator mr-1"></i> Sync from Player Points
            </button>
            <button
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              onClick={onOpenManualEdit}
            >
              <i className="fas fa-sliders-h mr-1"></i> Edit Table
            </button>
            <button
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              onClick={() => window.print()}
            >
              <i className="fas fa-print mr-1"></i> Print
            </button>
          </div>
        </div>
      )}

      {/* Scoreboard Card */}
      <div className="scoreboard-card">
        <div className="scoreboard-header">
          <div className="scoreboard-title-group">
            <h2>
              <i className="fas fa-crown mr-2 text-yellow-400"></i> TOURNAMENT LEADERBOARD
            </h2>
            <p>Real-time tournament standings: Win gives 1 Point. Easily update via quick buttons or match results.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-gold" onClick={onOpenManualEdit}>
              <i className="fas fa-edit mr-1"></i> Edit Table
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="points-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'center', width: '55px' }}>Rank</th>
                <th>Team Roster</th>
                <th style={{ textAlign: 'center' }} title="Matches Played">P</th>
                <th style={{ textAlign: 'center' }} title="Matches Won">W</th>
                <th style={{ textAlign: 'center' }} title="Matches Lost">L</th>
                <th style={{ textAlign: 'center' }} title="Matches Tied / Drawn">T</th>
                <th style={{ textAlign: 'center' }} title="Recent Match Form">Form</th>
                <th style={{ textAlign: 'center' }} title="Total Championship Points">PTS</th>
                <th style={{ textAlign: 'right' }}>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team, index) => {
                const rank = index + 1;
                let rankClass = "rank-normal";
                if (rank === 1) rankClass = "rank-1";
                else if (rank === 2) rankClass = "rank-2";
                else if (rank === 3) rankClass = "rank-3";

                const formList = Array.isArray(team.stats?.form) ? team.stats.form.slice(-5) : [];
                const totalPlayerPts = (team.players || []).reduce((sum, p) => sum + (p.points || 0), 0);

                return (
                  <tr key={team.id} className={`team-row-${team.id}`}>
                    <td style={{ textAlign: 'center', width: '55px' }}>
                      <div className={`rank-badge ${rankClass}`}>#{rank}</div>
                    </td>
                    <td>
                      <div className="team-cell">
                        <div className="team-avatar-mini">{team.name.substring(0, 2)}</div>
                        <div className="team-cell-info">
                          <div className="team-main-name">{team.name}</div>
                          <div className="team-sub-info">
                            Capt: {team.captain} | Player Points Sum: <strong style={{ color: '#f6cf66' }}>{totalPlayerPts}</strong>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, textAlign: 'center' }}>{team.stats.played}</td>
                    <td style={{ fontWeight: 700, color: '#34d399', textAlign: 'center' }}>{team.stats.won}</td>
                    <td style={{ fontWeight: 700, color: '#f87171', textAlign: 'center' }}>{team.stats.lost}</td>
                    <td style={{ fontWeight: 700, color: '#fbbf24', textAlign: 'center' }}>{team.stats.tied || 0}</td>
                    <td style={{ textAlign: 'center' }}>
                      {formList.length > 0 ? (
                        formList.map((res, i) => (
                          <span
                            key={i}
                            className={`form-pill form-${res === 'W' ? 'win' : res === 'L' ? 'loss' : 'tie'}`}
                          >
                            {res}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>-</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="pts-highlight">{team.stats.points}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'nowrap' }}>
                        <button
                          className="btn-gold"
                          style={{ padding: '0.32rem 0.65rem', fontSize: '0.78rem' }}
                          title="Add 1 Win (+1 Point)"
                          onClick={() => onQuickAddWin(team.id)}
                        >
                          <i className="fas fa-plus"></i> Win (+1)
                        </button>
                        <button
                          className="btn-red"
                          style={{ padding: '0.32rem 0.6rem', fontSize: '0.78rem' }}
                          title="Record Loss (0 Points)"
                          onClick={() => onQuickAddLoss(team.id)}
                        >
                          <i className="fas fa-times"></i> Loss
                        </button>
                        <button
                          className="btn-gold"
                          style={{ padding: '0.32rem 0.5rem', fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fef08a' }}
                          title="Direct +1 Point"
                          onClick={() => onQuickAdjustPts(team.id, 1)}
                        >
                          +1 Pt
                        </button>
                        <button
                          className="btn-secondary"
                          style={{ padding: '0.32rem 0.5rem', fontSize: '0.75rem' }}
                          title="Direct -1 Point"
                          onClick={() => onQuickAdjustPts(team.id, -1)}
                        >
                          -1 Pt
                        </button>
                        <button
                          className="btn-secondary"
                          style={{ padding: '0.32rem 0.45rem', fontSize: '0.72rem', color: '#94a3b8' }}
                          title="Undo / Revert last match"
                          onClick={() => onQuickRevertMatch(team.id)}
                        >
                          <i className="fas fa-undo"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scoring Rules Card */}
      <div className="bg-red-950/40 border border-yellow-600/30 rounded-xl p-4 text-xs md:text-sm text-yellow-200/90 flex flex-wrap items-center justify-between gap-3 mt-4">
        <div className="flex items-center gap-2">
          <i className="fas fa-info-circle text-yellow-400 text-lg"></i>
          <span>
            <strong>Scoring System:</strong> Win = <strong>1 Point</strong> | Draw/Tie = <strong>0.5 Point</strong> | Loss = <strong>0 Points</strong>
          </span>
        </div>
        <div className="text-gray-300">
          Click <strong>"+ Win (+1)"</strong> to record a win, or use <strong>"Sync from Player Points"</strong> to calculate team score from individual player totals!
        </div>
      </div>
    </div>
  );
}

