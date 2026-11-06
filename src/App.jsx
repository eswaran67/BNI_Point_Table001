import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import DbStatusBar from './components/DbStatusBar';
import SearchBar from './components/SearchBar';
import Navbar from './components/Navbar';
import LineupTab from './components/LineupTab';
import PointsTableTab from './components/PointsTableTab';
import PlayerPointsTab from './components/PlayerPointsTab';
import FixturesTab from './components/FixturesTab';
import MembersDirectoryTab from './components/MembersDirectoryTab';
import OriginalPosterTab from './components/OriginalPosterTab';
import ScoreEntryModal from './components/ScoreEntryModal';
import ManualPointsModal from './components/ManualPointsModal';
import TeamEditorModal from './components/TeamEditorModal';
import PlayerPointModal from './components/PlayerPointModal';
import ToastContainer from './components/ToastContainer';

import {
  loadInitialData,
  fetchTournamentData,
  saveTournamentData,
  resetTournamentData,
  fireConfetti
} from './services/api';

export default function App() {
  const initial = loadInitialData();
  const [teams, setTeams] = useState(initial.teams);
  const [fixtures, setFixtures] = useState(initial.fixtures);
  const [activeTab, setActiveTab] = useState('lineup');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Modals state
  const [scoreModalMatch, setScoreModalMatch] = useState(null);
  const [isManualEditOpen, setIsManualEditOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [playerPointEdit, setPlayerPointEdit] = useState(null);

  const lastSaveTimeRef = useRef(null);

  // Toast helper
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  // Save changes to local cache & SQLite database
  const persistChanges = useCallback(async (newTeams, newFixtures, toastMsg = null) => {
    setIsSaving(true);
    lastSaveTimeRef.current = new Date().toISOString();
    try {
      const res = await saveTournamentData(newTeams, newFixtures);
      if (toastMsg) {
        showToast(toastMsg, 'success');
      }
    } catch (e) {
      console.warn('Save failed:', e);
    } finally {
      setIsSaving(false);
    }
  }, [showToast]);

  // Connect to backend on mount & start sync
  useEffect(() => {
    async function initConnect() {
      const res = await fetchTournamentData();
      if (res.isConnected) {
        setIsConnected(true);
        if (res.teams) setTeams(res.teams);
        if (res.fixtures) setFixtures(res.fixtures);
      }
    }
    initConnect();

    // Background sync every 6 seconds
    const interval = setInterval(async () => {
      const res = await fetchTournamentData();
      if (res.isConnected) {
        setIsConnected(true);
        if (res.updatedAt && lastSaveTimeRef.current && res.updatedAt > lastSaveTimeRef.current) {
          if (res.teams) setTeams(res.teams);
          if (res.fixtures) setFixtures(res.fixtures);
        }
      }
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // 1. ADD / SUBTRACT INDIVIDUAL PLAYER POINT
  const handleAddPlayerPoint = useCallback((teamId, playerName, delta) => {
    setTeams((prevTeams) => {
      const updated = prevTeams.map((team) => {
        if (team.id !== teamId) return team;
        const updatedPlayers = (team.players || []).map((player) => {
          if (player.name !== playerName) return player;
          const currentPts = player.points || 0;
          const newPts = Math.max(0, currentPts + delta);
          return { ...player, points: newPts };
        });
        return { ...team, players: updatedPlayers };
      });

      persistChanges(updated, fixtures);
      return updated;
    });

    if (delta > 0) {
      fireConfetti();
      showToast(`+${delta} Point added to ${playerName}!`, 'success');
    } else {
      showToast(`Point adjusted for ${playerName}`, 'info');
    }
  }, [fixtures, persistChanges, showToast]);

  // 2. SET EXACT PLAYER POINT
  const handleSetPlayerPoint = useCallback((teamId, playerName, exactVal) => {
    const val = Math.max(0, parseInt(exactVal, 10) || 0);
    setTeams((prevTeams) => {
      const updated = prevTeams.map((team) => {
        if (team.id !== teamId) return team;
        const updatedPlayers = (team.players || []).map((player) => {
          if (player.name !== playerName) return player;
          return { ...player, points: val };
        });
        return { ...team, players: updatedPlayers };
      });

      persistChanges(updated, fixtures);
      return updated;
    });
    setPlayerPointEdit(null);
    showToast(`Points updated for ${playerName} (${val} pts)`, 'success');
  }, [fixtures, persistChanges, showToast]);

  // 3. SYNC TEAM POINTS FROM ITS PLAYERS (Single Team)
  const handleSyncTeamPoints = useCallback((teamId) => {
    setTeams((prevTeams) => {
      const updated = prevTeams.map((team) => {
        if (team.id !== teamId) return team;
        const sum = (team.players || []).reduce((acc, p) => acc + (p.points || 0), 0);
        return {
          ...team,
          stats: {
            ...team.stats,
            points: sum
          }
        };
      });

      persistChanges(updated, fixtures, `Synced player points to ${teamId.toUpperCase()} official score!`);
      fireConfetti();
      return updated;
    });
  }, [fixtures, persistChanges]);

  // 4. SYNC ALL TEAMS POINTS FROM THEIR PLAYERS
  const handleSyncAllPlayerPoints = useCallback(() => {
    setTeams((prevTeams) => {
      const updated = prevTeams.map((team) => {
        const sum = (team.players || []).reduce((acc, p) => acc + (p.points || 0), 0);
        return {
          ...team,
          stats: {
            ...team.stats,
            points: sum
          }
        };
      });

      persistChanges(updated, fixtures, 'All player points synced to Tournament Points Table!');
      fireConfetti();
      return updated;
    });
  }, [fixtures, persistChanges]);

  // 5. QUICK LEADERBOARD ACTIONS (+Win = 1 pt)
  const handleQuickAddWin = useCallback((teamId) => {
    setTeams((prevTeams) => {
      const updated = prevTeams.map((team) => {
        if (team.id !== teamId) return team;
        return {
          ...team,
          stats: {
            ...team.stats,
            played: (team.stats.played || 0) + 1,
            won: (team.stats.won || 0) + 1,
            points: (team.stats.points || 0) + 1,
            form: [...(team.stats.form || []), 'W']
          }
        };
      });

      persistChanges(updated, fixtures);
      fireConfetti();
      const tObj = updated.find(t => t.id === teamId);
      showToast(`+1 Point added to ${tObj?.name} for Win!`, 'success');
      return updated;
    });
  }, [fixtures, persistChanges, showToast]);

  const handleQuickAddLoss = useCallback((teamId) => {
    setTeams((prevTeams) => {
      const updated = prevTeams.map((team) => {
        if (team.id !== teamId) return team;
        return {
          ...team,
          stats: {
            ...team.stats,
            played: (team.stats.played || 0) + 1,
            lost: (team.stats.lost || 0) + 1,
            form: [...(team.stats.form || []), 'L']
          }
        };
      });

      persistChanges(updated, fixtures);
      const tObj = updated.find(t => t.id === teamId);
      showToast(`Loss recorded for ${tObj?.name}`, 'info');
      return updated;
    });
  }, [fixtures, persistChanges, showToast]);

  const handleQuickAdjustPts = useCallback((teamId, delta) => {
    setTeams((prevTeams) => {
      const updated = prevTeams.map((team) => {
        if (team.id !== teamId) return team;
        const newPts = Math.max(0, (team.stats.points || 0) + delta);
        return {
          ...team,
          stats: {
            ...team.stats,
            points: newPts
          }
        };
      });

      persistChanges(updated, fixtures);
      if (delta > 0) fireConfetti();
      const tObj = updated.find(t => t.id === teamId);
      showToast(`${delta > 0 ? '+1' : '-1'} Point adjusted for ${tObj?.name}`, 'info');
      return updated;
    });
  }, [fixtures, persistChanges, showToast]);

  const handleQuickRevertMatch = useCallback((teamId) => {
    setTeams((prevTeams) => {
      const target = prevTeams.find(t => t.id === teamId);
      if (!target || (target.stats.played || 0) <= 0) {
        showToast('No matches to revert!', 'info');
        return prevTeams;
      }

      const updated = prevTeams.map((team) => {
        if (team.id !== teamId) return team;
        const formArr = [...(team.stats.form || [])];
        const lastResult = formArr.pop();
        const newPlayed = Math.max(0, (team.stats.played || 0) - 1);
        let newWon = team.stats.won || 0;
        let newLost = team.stats.lost || 0;
        let newTied = team.stats.tied || 0;
        let newPts = team.stats.points || 0;

        if (lastResult === 'W') {
          newWon = Math.max(0, newWon - 1);
          newPts = Math.max(0, newPts - 1);
        } else if (lastResult === 'L') {
          newLost = Math.max(0, newLost - 1);
        } else if (lastResult === 'T') {
          newTied = Math.max(0, newTied - 1);
          newPts = Math.max(0, newPts - 0.5);
        }

        return {
          ...team,
          stats: {
            ...team.stats,
            played: newPlayed,
            won: newWon,
            lost: newLost,
            tied: newTied,
            points: newPts,
            form: formArr
          }
        };
      });

      persistChanges(updated, fixtures);
      showToast(`Last match reverted for ${target.name}`, 'info');
      return updated;
    });
  }, [fixtures, persistChanges, showToast]);

  // 6. SAVE MATCH RESULT (Auto calculate table)
  const handleSaveScoreEntry = useCallback((matchId, { teamAScore, teamBScore, outcome, notes }) => {
    let updatedFixtures = fixtures.map((m) => {
      if (m.id !== matchId) return m;
      let status = 'completed';
      let winnerId = null;
      let isTie = false;

      if (outcome === 'pending') {
        status = 'upcoming';
      } else if (outcome === 'tie') {
        isTie = true;
      } else {
        winnerId = outcome;
      }

      return {
        ...m,
        status,
        winnerId,
        isTie,
        teamAScore,
        teamBScore,
        notes
      };
    });

    // Recalculate team standings from all completed fixtures
    const updatedTeams = teams.map((team) => {
      let played = 0;
      let won = 0;
      let lost = 0;
      let tied = 0;
      let points = team.stats.bonus || 0;
      let form = [];

      updatedFixtures.forEach((match) => {
        if (match.status === 'completed') {
          if (match.teamAId === team.id || match.teamBId === team.id) {
            played += 1;
            if (match.isTie) {
              tied += 1;
              points += 0.5;
              form.push('T');
            } else if (match.winnerId === team.id) {
              won += 1;
              points += 1; // +1 pt for win!
              form.push('W');
            } else {
              lost += 1;
              form.push('L');
            }
          }
        }
      });

      return {
        ...team,
        stats: {
          ...team.stats,
          played,
          won,
          lost,
          tied,
          points,
          form
        }
      };
    });

    setFixtures(updatedFixtures);
    setTeams(updatedTeams);
    setScoreModalMatch(null);
    persistChanges(updatedTeams, updatedFixtures, 'Match result saved to SQLite Database (+1 Pt for winner)!');
    fireConfetti();
  }, [fixtures, teams, persistChanges]);

  // 7. SAVE MANUAL POINTS ALL
  const handleSaveManualPoints = useCallback((statsMap) => {
    setTeams((prevTeams) => {
      const updated = prevTeams.map((team) => {
        const custom = statsMap[team.id];
        if (!custom) return team;
        return {
          ...team,
          stats: {
            ...team.stats,
            played: custom.played,
            won: custom.won,
            lost: custom.lost,
            points: custom.points
          }
        };
      });

      persistChanges(updated, fixtures, 'Standings saved permanently to SQLite Database!');
      return updated;
    });
    setIsManualEditOpen(false);
  }, [fixtures, persistChanges]);

  // 8. SAVE TEAM ROSTER
  const handleSaveTeamRoster = useCallback((teamId, { captain, viceCaptain, members }) => {
    setTeams((prevTeams) => {
      const updated = prevTeams.map((team) => {
        if (team.id !== teamId) return team;

        const pointsMap = {};
        (team.players || []).forEach(p => {
          pointsMap[p.name] = p.points || 0;
        });

        const newPlayers = [
          { name: captain, role: 'Captain', points: pointsMap[captain] || 0 },
          { name: viceCaptain, role: 'Vice Captain', points: pointsMap[viceCaptain] || 0 },
          ...members.map(m => ({ name: m, role: 'Member', points: pointsMap[m] || 0 }))
        ];

        return {
          ...team,
          captain,
          viceCaptain,
          members,
          players: newPlayers
        };
      });

      persistChanges(updated, fixtures, `Updated roster for ${teamId.toUpperCase()} in database!`);
      return updated;
    });
    setEditingTeam(null);
  }, [fixtures, persistChanges]);

  // 9. RESET DATABASE
  const handleResetData = useCallback(async () => {
    if (window.confirm("Ellaa points-um original line-up-ilekkum reset cheyyano? (Reset all points & database to default?)")) {
      const res = await resetTournamentData();
      if (res.teams) setTeams(res.teams);
      if (res.fixtures) setFixtures(res.fixtures);
      showToast('Database reset to defaults successfully!', 'info');
    }
  }, [showToast]);

  return (
    <div className="min-h-screen text-slate-100 relative">
      {/* Background Lighting & Crowd FX */}
      <div className="bg-ambient-glow"></div>
      <div className="bg-light-beams"></div>
      <div className="crowd-silhouette"></div>

      {/* Main Header */}
      <Header />

      {/* Search & Navigation Controls */}
      <div className="max-w-6xl mx-auto px-4 mt-2 mb-4">
        {/* Permanent Database Status Bar */}
        <DbStatusBar
          isConnected={isConnected}
          isSaving={isSaving}
          onReset={handleResetData}
        />

        {/* Live Search Bar */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Navigation Tabs */}
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Main Content Stage */}
      <main className="main-stage-container">
        {activeTab === 'lineup' && (
          <section className="tab-content-panel">
            <LineupTab
              teams={teams}
              searchQuery={searchQuery}
              onAddPlayerPoint={handleAddPlayerPoint}
              onEditPlayerPoint={(teamId, name, pts) => setPlayerPointEdit({ teamId, name, points: pts })}
              onSyncTeamPoints={handleSyncTeamPoints}
              onOpenTeamEditor={(teamId) => setEditingTeam(teams.find(t => t.id === teamId))}
            />
          </section>
        )}

        {activeTab === 'table' && (
          <PointsTableTab
            teams={teams}
            onQuickAddWin={handleQuickAddWin}
            onQuickAddLoss={handleQuickAddLoss}
            onQuickAdjustPts={handleQuickAdjustPts}
            onQuickRevertMatch={handleQuickRevertMatch}
            onSyncAllPlayerPoints={handleSyncAllPlayerPoints}
            onOpenManualEdit={() => setIsManualEditOpen(true)}
            onResetData={handleResetData}
          />
        )}

        {activeTab === 'playerpoints' && (
          <PlayerPointsTab
            teams={teams}
            searchQuery={searchQuery}
            onAddPlayerPoint={handleAddPlayerPoint}
            onSetPlayerPoint={handleSetPlayerPoint}
            onSyncAllPlayerPoints={handleSyncAllPlayerPoints}
          />
        )}

        {activeTab === 'fixtures' && (
          <FixturesTab
            fixtures={fixtures}
            teams={teams}
            onOpenScoreModal={(matchId) => setScoreModalMatch(fixtures.find(m => m.id === matchId))}
            onSwitchTab={setActiveTab}
          />
        )}

        {activeTab === 'members' && (
          <MembersDirectoryTab
            teams={teams}
            searchQuery={searchQuery}
            onEditPlayerPoint={(teamId, name, pts) => setPlayerPointEdit({ teamId, name, points: pts })}
          />
        )}

        {activeTab === 'poster' && (
          <OriginalPosterTab />
        )}
      </main>

      {/* Modals */}
      <ScoreEntryModal
        isOpen={Boolean(scoreModalMatch)}
        match={scoreModalMatch}
        teams={teams}
        onClose={() => setScoreModalMatch(null)}
        onSave={handleSaveScoreEntry}
      />

      <ManualPointsModal
        isOpen={isManualEditOpen}
        teams={teams}
        onClose={() => setIsManualEditOpen(false)}
        onSave={handleSaveManualPoints}
      />

      <TeamEditorModal
        isOpen={Boolean(editingTeam)}
        team={editingTeam}
        onClose={() => setEditingTeam(null)}
        onSave={handleSaveTeamRoster}
      />

      <PlayerPointModal
        isOpen={Boolean(playerPointEdit)}
        playerInfo={playerPointEdit}
        onClose={() => setPlayerPointEdit(null)}
        onSave={handleSetPlayerPoint}
      />

      {/* Toast Feedback */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

