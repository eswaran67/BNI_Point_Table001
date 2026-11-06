import React, { useState, useEffect } from 'react';

export default function PlayerPointModal({ isOpen, playerInfo, onClose, onSave }) {
  if (!isOpen || !playerInfo) return null;

  const [points, setPoints] = useState(playerInfo.points || 0);

  useEffect(() => {
    setPoints(playerInfo.points || 0);
  }, [playerInfo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(playerInfo.teamId, playerInfo.name, points);
  };

  return (
    <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h3 className="modal-title">Edit Player Points</h3>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f6cf66' }}>
                {playerInfo.name}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
                {playerInfo.teamId ? playerInfo.teamId.toUpperCase() : ''}
              </div>
            </div>

            <div className="form-group" style={{ textAlign: 'center' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Current Points
              </label>
              <input
                type="number"
                min="0"
                className="form-input text-center text-2xl font-black text-yellow-300"
                style={{ width: '130px', margin: '0 auto', display: 'block', padding: '0.5rem' }}
                value={points}
                onChange={(e) => setPoints(Math.max(0, parseInt(e.target.value, 10) || 0))}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button
                type="button"
                className="btn-micro-red"
                style={{ width: '36px', height: '36px', fontSize: '1.1rem' }}
                onClick={() => setPoints(Math.max(0, points - 1))}
                title="-1"
              >
                -1
              </button>
              <button
                type="button"
                className="btn-micro-gold"
                style={{ width: '36px', height: '36px', fontSize: '1.1rem' }}
                onClick={() => setPoints(points + 1)}
                title="+1"
              >
                +1
              </button>
              <button
                type="button"
                className="btn-gold text-xs px-2.5 py-1"
                onClick={() => setPoints(points + 5)}
              >
                +5 Pts
              </button>
              <button
                type="button"
                className="btn-secondary text-xs px-2.5 py-1"
                onClick={() => setPoints(0)}
              >
                Reset (0)
              </button>
            </div>

            <div className="modal-footer" style={{ padding: '0.75rem 0 0', borderTop: '1px solid rgba(212,175,55,0.2)' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-gold">
                <i className="fas fa-check mr-1"></i> Update Points
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

