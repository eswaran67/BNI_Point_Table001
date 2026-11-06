import React, { useState, useEffect } from 'react';

export default function ScoreEntryModal({ isOpen, match, teams, onClose, onSave }) {
  if (!isOpen || !match) return null;

  const teamA = teams.find(t => t.id === match.teamAId) || { id: match.teamAId, name: match.teamAId };
  const teamB = teams.find(t => t.id === match.teamBId) || { id: match.teamBId, name: match.teamBId };

  const [scoreA, setScoreA] = useState(match.teamAScore || '');
  const [scoreB, setScoreB] = useState(match.teamBScore || '');
  const [outcome, setOutcome] = useState(
    match.status === 'upcoming'
      ? 'pending'
      : match.isTie
      ? 'tie'
      : match.winnerId || 'pending'
  );
  const [notes, setNotes] = useState(match.notes || '');

  useEffect(() => {
    setScoreA(match.teamAScore || '');
    setScoreB(match.teamBScore || '');
    setOutcome(
      match.status === 'upcoming'
        ? 'pending'
        : match.isTie
        ? 'tie'
        : match.winnerId || 'pending'
    );
    setNotes(match.notes || '');
  }, [match]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(match.id, {
      teamAScore: scoreA.trim(),
      teamBScore: scoreB.trim(),
      outcome,
      notes: notes.trim()
    });
  };

  return (
    <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Enter Match Result</h3>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <span style={{
                background: 'rgba(212, 175, 55, 0.2)',
                color: '#fef08a',
                padding: '3px 12px',
                borderRadius: 9999,
                fontSize: '0.8rem',
                fontWeight: 700
              }}>
                Match #{match.matchNo}: {teamA.name} vs {teamB.name}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
              <div style={{ background: '#110204', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: 8, padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontWeight: 800, color: '#f6cf66', marginBottom: '0.5rem' }}>{teamA.name}</div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Score / Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 85/4"
                  value={scoreA}
                  onChange={(e) => setScoreA(e.target.value)}
                />
              </div>

              <div style={{ background: '#110204', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: 8, padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontWeight: 800, color: '#f6cf66', marginBottom: '0.5rem' }}>{teamB.name}</div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Score / Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 82/6"
                  value={scoreB}
                  onChange={(e) => setScoreB(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Match Outcome / Winner (+1 Point)</label>
              <select
                className="form-select"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
              >
                <option value="pending">Upcoming / Not Played Yet</option>
                <option value={teamA.id}>Winner: {teamA.name} (+1 Pt)</option>
                <option value={teamB.id}>Winner: {teamB.name} (+1 Pt)</option>
                <option value="tie">Match Tied / Draw (0.5 pt each)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Match Notes</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Won by 4 runs"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: '1px solid rgba(212,175,55,0.2)' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-gold">
                <i className="fas fa-save mr-1"></i> Save Match Result
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

