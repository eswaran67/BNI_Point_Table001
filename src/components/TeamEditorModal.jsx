import React, { useState, useEffect } from 'react';

export default function TeamEditorModal({ isOpen, team, onClose, onSave }) {
  if (!isOpen || !team) return null;

  const captainObj = (team.players || []).find(p => p.role === 'Captain') || { name: team.captain || '', points: 0 };
  const vcObj = (team.players || []).find(p => p.role === 'Vice Captain') || { name: team.viceCaptain || '', points: 0 };
  const memberNames = (team.players || []).filter(p => p.role === 'Member').map(p => p.name).join('\n');

  const [captain, setCaptain] = useState(captainObj.name);
  const [viceCaptain, setViceCaptain] = useState(vcObj.name);
  const [membersText, setMembersText] = useState(memberNames);

  useEffect(() => {
    setCaptain(captainObj.name);
    setViceCaptain(vcObj.name);
    setMembersText(memberNames);
  }, [team]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const members = membersText
      .split('\n')
      .map(m => m.trim())
      .filter(m => m.length > 0);

    onSave(team.id, {
      captain: captain.trim(),
      viceCaptain: viceCaptain.trim(),
      members
    });
  };

  return (
    <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Edit Team: {team.name}</h3>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Captain Name</label>
              <input
                type="text"
                className="form-input"
                value={captain}
                onChange={(e) => setCaptain(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vice Captain Name</label>
              <input
                type="text"
                className="form-input"
                value={viceCaptain}
                onChange={(e) => setViceCaptain(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Team Members (One per line)</label>
              <textarea
                className="form-input"
                rows={7}
                style={{ resize: 'vertical' }}
                value={membersText}
                onChange={(e) => setMembersText(e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Enter each member's name on a separate line.
              </span>
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: '1px solid rgba(212,175,55,0.2)' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-gold">
                <i className="fas fa-save mr-1"></i> Save Roster to Database
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

