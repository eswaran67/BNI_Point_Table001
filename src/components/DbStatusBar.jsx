import React from 'react';

export default function DbStatusBar({ isConnected, isSaving, onReset, onBackup }) {
  return (
    <div className="db-status-bar flex flex-wrap items-center justify-between text-xs px-4 py-2 rounded-full mb-3">
      <div className="flex items-center gap-2 font-medium">
        <span className={isConnected ? "status-dot-green" : "status-dot-orange"}></span>
        <span className="text-yellow-200">
          {isConnected
            ? "Permanent SQLite Database Connected"
            : "Local Browser Mode (SQLite sync available when server is active)"}
        </span>
      </div>

      <div className="flex items-center gap-3 text-yellow-300/80 font-mono text-[11px]">
        <div className="flex items-center gap-1.5">
          {isSaving ? (
            <>
              <i className="fas fa-spinner fa-spin text-yellow-400"></i>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <i className={`fas fa-database ${isConnected ? 'text-green-400' : 'text-amber-400'}`}></i>
              <span>{isConnected ? "SQLite 3 (data/tournament.sqlite)" : "Local Storage Cache"}</span>
            </>
          )}
        </div>

        {isConnected && (
          <a
            href="/api/backup"
            download="tournament_backup.sqlite"
            className="text-yellow-300 hover:text-yellow-100 flex items-center gap-1 underline underline-offset-2 ml-2"
            title="Download SQLite Database File"
          >
            <i className="fas fa-download"></i> Backup DB
          </a>
        )}

        <button
          onClick={onReset}
          className="text-red-400 hover:text-red-200 flex items-center gap-1 ml-2 transition-colors"
          title="Reset tournament data to defaults"
        >
          <i className="fas fa-redo-alt text-[10px]"></i> Reset
        </button>
      </div>
    </div>
  );
}

