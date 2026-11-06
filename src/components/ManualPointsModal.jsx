import React, { useState, useEffect } from 'react';

export default function ManualPointsModal({ isOpen, teams, onClose, onSave }) {
  const [statsMap, setStatsMap] = useState({});

  useEffect(() => {
    if (teams) {
      const map = {};
      teams.forEach((t) => {
        map[t.id] = {
          played: t.stats?.played || 0,
          won: t.stats?.won || 0,
          lost: t.stats?.lost || 0,
          points: t.stats?.points || 0
        };
      });
      setStatsMap(map);
    }
  }, [teams, isOpen]);

  if (!isOpen) return null;

  const handleChange = (teamId, field, value) => {
    const val = Math.max(0, parseInt(value, 10) || 0);
    setStatsMap((prev) => ({
      ...prev,
      [teamId]: {
        ...prev[teamId],
        [field]: val
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(statsMap);
  };

  return (
    <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Direct Points Table Editor</h3>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1rem' }}>
            Directly customize Played, Won, Lost, and Points for each team in the database:
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {teams.map((team) => {
                const teamStats = statsMap[team.id] || { played: 0, won: 0, lost: 0, points: 0 };
                return (
                  <div
                    key={team.id}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(212,175,55,0.3)',
                      borderRadius: 8,
                      padding: '0.6rem 0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ fontWeight: 800, color: '#f6cf66', width: '110px' }}>
                      {team.name}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Played</span>
                        <input
                          type="number"
                          className="form-input text-center"
                          style={{ width: '55px' }}
                          min="0"
                          value={teamStats.played}
                          onChange={(e) => handleChange(team.id, 'played', e.target.value)}
                        />
                      </div>

                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#34d399', display: 'block' }}>Won</span>
                        <input
                          type="number"
                          className="form-input text-center"
                          style={{ width: '55px' }}
                          min="0"
                          value={teamStats.won}
                          onChange={(e) => handleChange(team.id, 'won', e.target.value)}
                        />
                      </div>

                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#f87171', display: 'block' }}>Lost</span>
                        <input
                          type="number"
                          className="form-input text-center"
                          style={{ width: '55px' }}
                          min="0"
                          value={teamStats.lost}
                          onChange={(e) => handleChange(team.id, 'lost', e.target.value)}
                        />
                      </div>

                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#fef08a', display: 'block', fontWeight: 700 }}>PTS</span>
                        <input
                          type="number"
                          className="form-input text-center"
                          style={{ width: '60px', borderColor: '#f6cf66', fontWeight: 800 }}
                          min="0"
                          value={teamStats.points}
                          onChange={(e) => handleChange(team.id, 'points', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: '1px solid rgba(212,175,55,0.2)', marginTop: '1rem' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-gold">
                <i className="fas fa-check mr-1"></i> Save Standings to Database
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

