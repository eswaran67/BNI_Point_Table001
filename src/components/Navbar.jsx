import React from 'react';

const TABS = [
  { id: 'lineup', label: 'Teams Line-Up', icon: 'fas fa-shield-alt' },
  { id: 'table', label: 'Points Table', icon: 'fas fa-trophy' },
  { id: 'playerpoints', label: 'Player Points', icon: 'fas fa-star' },
  { id: 'fixtures', label: 'Match Scores', icon: 'fas fa-calendar-check' },
  { id: 'members', label: 'All Players', icon: 'fas fa-users' },
  { id: 'poster', label: 'Original Poster', icon: 'fas fa-image' }
];

export default function Navbar({ activeTab, onTabChange }) {
  return (
    <nav className="tournament-nav-bar">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`nav-tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <i className={`${tab.icon} text-amber-300`}></i>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

