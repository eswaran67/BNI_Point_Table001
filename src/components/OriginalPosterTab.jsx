import React from 'react';

export default function OriginalPosterTab() {
  return (
    <div className="tab-content-panel">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-yellow-300 font-['Rajdhani']">
            <i className="fas fa-image mr-2 text-yellow-400"></i> ORIGINAL 5-TEAMS POSTER DESIGN
          </h2>
          <a
            href="/assets/lineup-poster.jpg"
            download="BNI-5-Teams-Lineup.jpg"
            className="btn-gold text-xs"
          >
            <i className="fas fa-download mr-1"></i> Download Poster Image
          </a>
        </div>
        <div className="border-4 border-yellow-500/70 rounded-2xl overflow-hidden shadow-2xl shadow-yellow-500/20">
          <img
            src="/assets/lineup-poster.jpg"
            alt="FIVE TEAMS MEMBER LINE-UP POSTER"
            className="w-full h-auto object-contain block hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              if (!e.target.src.includes('assets/lineup-poster.jpg')) {
                e.target.src = 'assets/lineup-poster.jpg';
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

