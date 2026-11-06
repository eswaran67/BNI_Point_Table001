import React from 'react';

export default function LineupTab({
  teams,
  searchQuery,
  onAddPlayerPoint,
  onEditPlayerPoint,
  onSyncTeamPoints,
  onOpenTeamEditor
}) {
  const q = (searchQuery || '').trim().toLowerCase();

  return (
    <div className="poster-lineup-grid">
      {teams.map((team) => {
        const captainObj = (team.players || []).find(p => p.role === 'Captain') || { name: team.captain, points: 0 };
        const vcObj = (team.players || []).find(p => p.role === 'Vice Captain') || { name: team.viceCaptain, points: 0 };
        const memberList = (team.players || []).filter(p => p.role === 'Member');

        const isCaptainMatch = q && captainObj.name.toLowerCase().includes(q);
        const isVcMatch = q && vcObj.name.toLowerCase().includes(q);

        const totalTeamPts = (team.players || []).reduce((sum, p) => sum + (p.points || 0), 0);

        return (
          <div key={team.id} className="poster-team-card" data-team-id={team.id}>
            {/* Header with Tamil title and badge */}
            <div className={`team-poster-header logo-${team.id}`}>
              <div className="tamil-title">{team.tamilName}</div>
              {team.subtitleBadge && (
                <span className="sub-badge-boss">{team.subtitleBadge}</span>
              )}
            </div>

            {/* Team Name Pill */}
            <div className="team-name-pill flex items-center justify-between px-3">
              <span>{team.name}</span>
              <span className="text-[11px] bg-yellow-950/80 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-500/40">
                Sum: {totalTeamPts} pts
              </span>
            </div>

            <div className="poster-card-body">
              {/* CAPTAIN */}
              <div className="poster-role-badge">CAPTAIN</div>
              <div className="poster-player-row">
                <div className={`poster-person-name ${isCaptainMatch ? 'player-highlight' : ''}`}>
                  {captainObj.name}
                </div>
                <div className="player-score-ctrl">
                  <span
                    className="player-pts-pill cursor-pointer"
                    onClick={() => onEditPlayerPoint(team.id, captainObj.name, captainObj.points)}
                    title="Click to edit points directly"
                  >
                    ⭐ <strong>{captainObj.points || 0}</strong> pts
                  </span>
                  <button
                    className="btn-micro-gold"
                    onClick={() => onAddPlayerPoint(team.id, captainObj.name, 1)}
                    title="+1 Point"
                  >
                    +
                  </button>
                  <button
                    className="btn-micro-red"
                    onClick={() => onAddPlayerPoint(team.id, captainObj.name, -1)}
                    title="-1 Point"
                  >
                    -
                  </button>
                </div>
              </div>

              {/* VICE CAPTAIN */}
              <div className="poster-role-badge">VICE CAPTAIN</div>
              <div className="poster-player-row">
                <div className={`poster-person-name ${isVcMatch ? 'player-highlight' : ''}`}>
                  {vcObj.name}
                </div>
                <div className="player-score-ctrl">
                  <span
                    className="player-pts-pill cursor-pointer"
                    onClick={() => onEditPlayerPoint(team.id, vcObj.name, vcObj.points)}
                    title="Click to edit points directly"
                  >
                    ⭐ <strong>{vcObj.points || 0}</strong> pts
                  </span>
                  <button
                    className="btn-micro-gold"
                    onClick={() => onAddPlayerPoint(team.id, vcObj.name, 1)}
                    title="+1 Point"
                  >
                    +
                  </button>
                  <button
                    className="btn-micro-red"
                    onClick={() => onAddPlayerPoint(team.id, vcObj.name, -1)}
                    title="-1 Point"
                  >
                    -
                  </button>
                </div>
              </div>

              <div className="poster-members-divider"></div>

              {/* MEMBERS LIST */}
              <ul className="poster-members-list">
                {memberList.map((member, idx) => {
                  const isMemberMatch = q && member.name.toLowerCase().includes(q);
                  return (
                    <li key={`${team.id}-${member.name}-${idx}`} className="poster-member-item">
                      <span
                        className={`member-name-text ${isMemberMatch ? 'player-highlight' : ''}`}
                        title={`Member #${idx + 1}`}
                      >
                        {member.name}
                      </span>
                      <div className="player-score-ctrl">
                        <span
                          className="player-pts-pill cursor-pointer"
                          onClick={() => onEditPlayerPoint(team.id, member.name, member.points)}
                          title="Click to edit points directly"
                        >
                          <strong>{member.points || 0}</strong>
                        </span>
                        <button
                          className="btn-micro-gold"
                          onClick={() => onAddPlayerPoint(team.id, member.name, 1)}
                          title="+1 Point"
                        >
                          +
                        </button>
                        <button
                          className="btn-micro-red"
                          onClick={() => onAddPlayerPoint(team.id, member.name, -1)}
                          title="-1 Point"
                        >
                          -
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* CARD ACTIONS */}
              <div className="mt-3.5 w-full flex flex-col gap-1.5 items-center">
                <button
                  className="btn-gold w-[92%] justify-center text-xs py-1"
                  onClick={() => onSyncTeamPoints(team.id)}
                  title="Copy player points sum into official team leaderboard score"
                >
                  <i className="fas fa-sync-alt mr-1"></i> Sync Pts to Team Table
                </button>
                <button
                  className="btn-secondary text-[11px] py-0.5 px-3 rounded-md"
                  style={{
                    background: 'rgba(180, 83, 9, 0.12)',
                    color: '#78350f',
                    borderColor: 'rgba(180, 83, 9, 0.25)'
                  }}
                  onClick={() => onOpenTeamEditor(team.id)}
                >
                  <i className="fas fa-edit mr-1"></i> Edit Roster
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

