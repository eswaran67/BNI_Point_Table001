import React from 'react';

export default function MembersDirectoryTab({
  teams,
  searchQuery,
  onEditPlayerPoint
}) {
  let allPlayers = [];
  teams.forEach((t) => {
    (t.players || []).forEach((p) => {
      allPlayers.push({
        teamId: t.id,
        teamName: t.name,
        name: p.name,
        role: p.role,
        points: p.points || 0
      });
    });
  });

  const q = (searchQuery || '').trim().toLowerCase();
  if (q) {
    allPlayers = allPlayers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.teamName.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q)
    );
  }

  return (
    <div className="tab-content-panel">
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-extrabold text-yellow-300 font-['Rajdhani'] tracking-wide">
          <i className="fas fa-users mr-2 text-yellow-400"></i> COMPLETE PLAYERS & CAPTAINS DIRECTORY
        </h2>
        <p className="text-xs md:text-sm text-pink-200/70">
          All registered members from BAASHA, PADAYAPPA, SIVAJI, PETTA, and JAILER.
        </p>
      </div>

      <div style={{ marginBottom: '1rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
        Total Players in Directory: <strong style={{ color: '#f6cf66' }}>{allPlayers.length}</strong>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {allPlayers.map((person) => {
          let roleBg = 'rgba(255,255,255,0.1)';
          let roleColor = '#cbd5e1';
          if (person.role === 'Captain') {
            roleBg = 'linear-gradient(135deg, #ad181e, #800e13)';
            roleColor = '#fef08a';
          } else if (person.role === 'Vice Captain') {
            roleBg = 'rgba(180, 83, 9, 0.4)';
            roleColor = '#fde68a';
          }

          return (
            <div
              key={`${person.teamId}-${person.name}`}
              style={{
                background: 'rgba(20, 2, 4, 0.9)',
                border: '1.5px solid rgba(212, 175, 55, 0.35)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem'
              }}
            >
              <div className="team-avatar-mini" style={{ width: '44px', height: '44px', fontSize: '1rem' }}>
                {person.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 700,
                  color: '#fff',
                  fontSize: '1rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {person.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 3 }}>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '1px 7px',
                    borderRadius: '9999px',
                    background: roleBg,
                    color: roleColor,
                    fontWeight: 700,
                    border: '1px solid rgba(212, 175, 55, 0.3)'
                  }}>
                    {person.role}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#f6cf66', fontWeight: 600 }}>
                    {person.teamName}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div
                  className="player-pts-pill cursor-pointer"
                  onClick={() => onEditPlayerPoint(person.teamId, person.name, person.points)}
                  title="Click to edit points directly"
                >
                  ⭐ {person.points || 0} pts
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

