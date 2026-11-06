import React from 'react';

export default function Header() {
  return (
    <header className="poster-header-wrapper">
      <div className="header-banner-row">
        {/* Crowned BNI Group */}
        <div className="bni-crowned-group">
          <div className="crown-container" title="Championship Royal Crown">
            <svg width="58" height="44" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 38L10 16L24 28L32 6L40 28L54 16L60 38H4Z" fill="url(#crownGoldGrad)" stroke="#FFE89C" strokeWidth="2" strokeLinejoin="round"/>
              <circle cx="10" cy="14" r="3.5" fill="#FFE58F" stroke="#996515" strokeWidth="1.5"/>
              <circle cx="32" cy="5" r="4.5" fill="#FFFBEB" stroke="#996515" strokeWidth="1.5"/>
              <circle cx="54" cy="14" r="3.5" fill="#FFE58F" stroke="#996515" strokeWidth="1.5"/>
              <circle cx="24" cy="27" r="2.5" fill="#FFE58F"/>
              <circle cx="40" cy="27" r="2.5" fill="#FFE58F"/>
              <rect x="4" y="38" width="56" height="6" rx="2" fill="url(#crownBaseGrad)" stroke="#FFE89C" strokeWidth="1.5"/>
              <circle cx="16" cy="41" r="1.5" fill="#DC2626"/>
              <circle cx="32" cy="41" r="2" fill="#0284C7"/>
              <circle cx="48" cy="41" r="1.5" fill="#DC2626"/>
              <defs>
                <linearGradient id="crownGoldGrad" x1="4" y1="6" x2="60" y2="44" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFF3BF"/>
                  <stop offset="0.35" stopColor="#F6CF66"/>
                  <stop offset="0.7" stopColor="#D4AF37"/>
                  <stop offset="1" stopColor="#875C16"/>
                </linearGradient>
                <linearGradient id="crownBaseGrad" x1="4" y1="38" x2="60" y2="44" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFE082"/>
                  <stop offset="0.5" stopColor="#D4AF37"/>
                  <stop offset="1" stopColor="#78350F"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="bni-logo-badge" title="BNI Official Logo">
            <img src="/assets/bni-logo.png" alt="BNI Official Logo" className="bni-header-logo" onError={(e) => {
              // fallback if loaded from root relative
              if (!e.target.src.includes('assets/bni-logo.png')) {
                e.target.src = 'assets/bni-logo.png';
              }
            }} />
          </div>
        </div>

        {/* Grand Title Banner Pill */}
        <div className="grand-title-banner">
          {/* Left Laurel */}
          <svg className="laurel-leaf hidden sm:block" viewBox="0 0 48 48" fill="currentColor">
            <path d="M12 40C12 40 18 36 20 28C22 20 18 12 18 12C18 12 24 18 24 26C24 34 18 42 12 40Z" opacity="0.9"/>
            <path d="M8 32C8 32 14 29 15 22C16 15 12 8 12 8C12 8 17 14 17 21C17 28 12 34 8 32Z" opacity="0.7"/>
            <path d="M20 46C20 46 26 41 27 34C28 27 24 20 24 20C24 20 29 25 29 32C29 39 24 47 20 46Z" opacity="0.8"/>
          </svg>

          <h1 className="banner-title-text">
            FIVE TEAMS • MEMBER LINE-UP
          </h1>

          {/* Right Laurel */}
          <svg className="laurel-leaf transform scale-x-[-1] hidden sm:block" viewBox="0 0 48 48" fill="currentColor">
            <path d="M12 40C12 40 18 36 20 28C22 20 18 12 18 12C18 12 24 18 24 26C24 34 18 42 12 40Z" opacity="0.9"/>
            <path d="M8 32C8 32 14 29 15 22C16 15 12 8 12 8C12 8 17 14 17 21C17 28 12 34 8 32Z" opacity="0.7"/>
            <path d="M20 46C20 46 26 41 27 34C28 27 24 20 24 20C24 20 29 25 29 32C29 39 24 47 20 46Z" opacity="0.8"/>
          </svg>
        </div>
      </div>

      <div className="mt-2 text-xs md:text-sm tracking-widest uppercase font-semibold text-yellow-200/80">
        BNI CHAMPIONSHIP • OFFICIAL TOURNAMENT & LEADERBOARD PORTAL
      </div>
    </header>
  );
}

