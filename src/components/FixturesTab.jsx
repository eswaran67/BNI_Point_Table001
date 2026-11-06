import React from 'react';

export default function FixturesTab({
  fixtures,
  teams,
  onOpenScoreModal,
  onSwitchTab
}) {
  return (
    <div className="tab-content-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-yellow-300 font-['Rajdhani'] tracking-wide">
            <i className="fas fa-fire mr-2 text-red-500"></i> TOURNAMENT MATCH FIXTURES
          </h2>
          <p className="text-xs md:text-sm text-pink-200/70">
            Enter live match results, scores and winners to automatically update the Points Table (+1 pt for winner).
          </p>
        </div>
        <button className="btn-gold" onClick={() => onSwitchTab('table')}>
          <i className="fas fa-table mr-1"></i> View Points Table
        </button>
      </div>

      <div className="fixtures-grid">
        {fixtures.map((match) => {
          const teamA = teams.find(t => t.id === match.teamAId) || { name: match.teamAId };
          const teamB = teams.find(t => t.id === match.teamBId) || { name: match.teamBId };

          const isDone = match.status === 'completed';
          const aWon = isDone && match.winnerId === teamA.id;
          const bWon = isDone && match.winnerId === teamB.id;
          const isTie = isDone && match.isTie;

          return (
            <div key={match.id} className="fixture-card">
              <div className="fixture-header">
                <span style={{ fontWeight: 700, color: '#f6cf66' }}>
                  <i className="fas fa-trophy mr-1"></i> Match #{match.matchNo} • {match.round}
                </span>
                <span
                  className="badge"
                  style={{
                    background: isDone ? '#065f46' : 'rgba(255,255,255,0.1)',
                    color: isDone ? '#34d399' : '#cbd5e1',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    textTransform: 'uppercase'
                  }}
                >
                  {isDone ? (isTie ? 'TIED' : 'COMPLETED') : 'UPCOMING'}
                </span>
              </div>

              <div className="fixture-body">
                <div className={`fixture-team ${aWon ? 'winner' : ''}`}>
                  <div className="team-avatar-mini" style={{ marginBottom: 4 }}>
                    {teamA.name.substring(0, 2)}
                  </div>
                  <div className="fixture-team-name">{teamA.name}</div>
                  {match.teamAScore && (
                    <div style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 700, marginTop: 2 }}>
                      {match.teamAScore}
                    </div>
                  )}
                  {aWon && (
                    <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700 }}>
                      <i className="fas fa-crown"></i> WINNER (+1 Pt)
                    </span>
                  )}
                </div>

                <div className="fixture-vs">
                  <div className="vs-badge">VS</div>
                </div>

                <div className={`fixture-team ${bWon ? 'winner' : ''}`}>
                  <div className="team-avatar-mini" style={{ marginBottom: 4 }}>
                    {teamB.name.substring(0, 2)}
                  </div>
                  <div className="fixture-team-name">{teamB.name}</div>
                  {match.teamBScore && (
                    <div style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 700, marginTop: 2 }}>
                      {match.teamBScore}
                    </div>
                  )}
                  {bWon && (
                    <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700 }}>
                      <i className="fas fa-crown"></i> WINNER (+1 Pt)
                    </span>
                  )}
                </div>
              </div>

              <div className="fixture-footer">
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {match.notes || 'Tournament Match'}
                </span>
                <button
                  className="btn-gold"
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}
                  onClick={() => onOpenScoreModal(match.id)}
                >
                  <i className="fas fa-edit mr-1"></i> {isDone ? 'Edit Result' : 'Enter Result'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

