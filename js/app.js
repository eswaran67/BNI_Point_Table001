/**
 * Tournament Management & Points Table Engine
 * Complete interactive logic for 5-Teams Line-up, Standings, Fixtures,
 * Individual Player Points, and PERMANENT SQLite Database Integration.
 */

class TournamentApp {
  constructor() {
    this.teams = [];
    this.fixtures = [];
    this.activeTab = "lineup"; // 'lineup' | 'table' | 'playerpoints' | 'fixtures' | 'members'
    this.playerFilterTeam = "all";
    this.playerSortMode = "points"; // 'points' | 'team'
    this.searchQuery = "";
    this.storageKey = "bni_tournament_data_v2";

    // Permanent Database Connection State
    this.isServerConnected = false;
    this.isSaving = false;
    this.lastSavedTimestamp = null;
    this.pollTimer = null;

    this.init();
  }

  async init() {
    // 1. Load local cache immediately for instant render (0ms delay)
    this.loadLocalCache();
    this.bindEvents();
    this.render();

    // 2. Connect to Permanent SQLite Database on server
    await this.connectToPermanentDatabase();

    // 3. Start background live sync (every 6 seconds)
    this.startBackgroundSync();
  }

  // Load from local storage cache
  loadLocalCache() {
    try {
      let saved = localStorage.getItem(this.storageKey) || localStorage.getItem("bni_tournament_data_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        this.teams = parsed.teams || DEFAULT_TEAMS;
        this.fixtures = parsed.fixtures || DEFAULT_FIXTURES;
      } else {
        this.teams = JSON.parse(JSON.stringify(DEFAULT_TEAMS));
        this.fixtures = JSON.parse(JSON.stringify(DEFAULT_FIXTURES));
      }
    } catch (e) {
      console.warn("Error loading cached data, using defaults:", e);
      this.teams = JSON.parse(JSON.stringify(DEFAULT_TEAMS));
      this.fixtures = JSON.parse(JSON.stringify(DEFAULT_FIXTURES));
    }
    this.ensurePlayerStructure();
  }

  // Connect to backend API & SQLite Database
  async connectToPermanentDatabase() {
    const statusText = document.getElementById("dbStatusText");
    const statusDot = document.querySelector("#dbStatusBadge span:first-child");
    const saveStatus = document.getElementById("dbSaveStatus");

    try {
      const res = await fetch("/api/tournament", {
        headers: { "Accept": "application/json" },
        cache: "no-store"
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          this.isServerConnected = true;
          this.teams = json.data.teams || this.teams;
          this.fixtures = json.data.fixtures || this.fixtures;
          this.ensurePlayerStructure();

          // Update local cache
          localStorage.setItem(this.storageKey, JSON.stringify({
            teams: this.teams,
            fixtures: this.fixtures,
            updatedAt: json.data.updatedAt
          }));

          // Update UI Status to Green
          if (statusText) statusText.textContent = "Permanent SQLite Database Connected";
          if (statusDot) {
            statusDot.className = "status-dot-green";
          }
          if (saveStatus) {
            saveStatus.innerHTML = `<i class="fas fa-database text-green-400"></i> <span>Permanent DB Active (data/tournament.sqlite)</span>`;
          }

          this.render();
          console.log("Connected to SQLite Database permanently. Data loaded.");
          return;
        }
      }
      throw new Error("API responded with non-200");
    } catch (err) {
      // Offline / standalone file mode fallback
      this.isServerConnected = false;
      if (statusText) statusText.textContent = "Local Browser Mode (Run 'npm run dev' for SQLite Database)";
      if (statusDot) {
        statusDot.className = "status-dot-orange";
      }
      if (saveStatus) {
        saveStatus.innerHTML = `<i class="fas fa-hdd text-amber-400"></i> <span>Local Storage Active</span>`;
      }
      console.log("Running in offline local mode (localStorage active)");
    }
  }

  // Background sync for multi-device real-time updates
  startBackgroundSync() {
    if (this.pollTimer) clearInterval(this.pollTimer);

    this.pollTimer = setInterval(async () => {
      // Only sync if server is connected and we are not currently saving
      if (!this.isServerConnected || this.isSaving) return;

      try {
        const res = await fetch("/api/tournament", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && json.data.updatedAt) {
            // Check if server has newer data
            if (this.lastSavedTimestamp && json.data.updatedAt > this.lastSavedTimestamp) {
              this.teams = json.data.teams;
              this.fixtures = json.data.fixtures;
              this.ensurePlayerStructure();
              this.render();
              console.log("Background sync: Loaded updated standings from server.");
            }
          }
        }
      } catch (e) {
        // Silent catch for background poll
      }
    }, 6000);
  }

  ensurePlayerStructure() {
    this.teams.forEach(team => {
      if (team.stats.played < 0) team.stats.played = 0;
      if (team.stats.won < 0) team.stats.won = 0;
      if (team.stats.lost < 0) team.stats.lost = 0;
      if (team.stats.points < 0) team.stats.points = 0;

      if (!team.players || !Array.isArray(team.players) || team.players.length === 0) {
        team.players = [];
        if (team.captain) team.players.push({ name: team.captain, role: "Captain", points: 0 });
        if (team.viceCaptain) team.players.push({ name: team.viceCaptain, role: "Vice Captain", points: 0 });
        if (Array.isArray(team.members)) {
          team.members.forEach(m => {
            const memberName = typeof m === "string" ? m : (m.name || "Member");
            const memberPts = typeof m === "object" && m.points !== undefined ? m.points : 0;
            team.players.push({ name: memberName, role: "Member", points: memberPts });
          });
        }
      } else {
        team.players.forEach(p => {
          if (typeof p.points !== "number" || isNaN(p.points) || p.points < 0) {
            p.points = 0;
          }
        });
      }

      team.members = team.players.filter(p => p.role === "Member").map(p => p.name);
    });
  }

  // Save data to BOTH LocalStorage AND Permanent SQLite Database
  async saveData() {
    const timestamp = new Date().toISOString();
    this.lastSavedTimestamp = timestamp;

    // 1. Save to localStorage immediately
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({
        teams: this.teams,
        fixtures: this.fixtures,
        updatedAt: timestamp
      }));
    } catch (e) {
      console.error("Local storage save error:", e);
    }

    // 2. Save permanently to SQLite Database via REST API
    if (this.isServerConnected) {
      this.isSaving = true;
      const saveStatus = document.getElementById("dbSaveStatus");
      if (saveStatus) {
        saveStatus.innerHTML = `<i class="fas fa-spinner fa-spin text-yellow-400"></i> <span>Saving to SQLite DB...</span>`;
      }

      try {
        const res = await fetch("/api/tournament", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teams: this.teams,
            fixtures: this.fixtures
          })
        });

        if (res.ok) {
          if (saveStatus) {
            saveStatus.innerHTML = `<i class="fas fa-check-circle text-green-400"></i> <span>Saved Permanently to SQLite</span>`;
          }
        }
      } catch (err) {
        console.warn("Could not reach SQLite server API:", err);
        if (saveStatus) {
          saveStatus.innerHTML = `<i class="fas fa-exclamation-triangle text-amber-400"></i> <span>Saved to Local Cache</span>`;
        }
      } finally {
        this.isSaving = false;
      }
    }
  }

  async resetData() {
    if (confirm("Ellaa points-um original line-up-ilekkum reset cheyyano? (Reset all points & database to default?)")) {
      if (this.isServerConnected) {
        try {
          await fetch("/api/reset", { method: "POST" });
          await this.connectToPermanentDatabase();
          this.showToast("Database & Standings reset to default successfully!", "info");
          return;
        } catch (e) {
          console.warn("Server reset failed, falling back to local reset:", e);
        }
      }

      localStorage.removeItem("bni_tournament_data_v1");
      localStorage.removeItem(this.storageKey);
      this.teams = JSON.parse(JSON.stringify(DEFAULT_TEAMS));
      this.fixtures = JSON.parse(JSON.stringify(DEFAULT_FIXTURES));
      this.ensurePlayerStructure();
      await this.saveData();
      this.render();
      this.showToast("Data reset to default successfully!", "info");
    }
  }

  // Recalculate Points Table from completed fixtures (Win = 1 pt)
  recalculatePointsFromMatches() {
    this.teams.forEach(t => {
      t.stats.played = 0;
      t.stats.won = 0;
      t.stats.lost = 0;
      t.stats.tied = 0;
      t.stats.points = (t.stats.bonus || 0);
      t.stats.form = [];
    });

    this.fixtures.forEach(match => {
      if (match.status === "completed") {
        const teamA = this.teams.find(t => t.id === match.teamAId);
        const teamB = this.teams.find(t => t.id === match.teamBId);

        if (teamA && teamB) {
          teamA.stats.played += 1;
          teamB.stats.played += 1;

          if (match.isTie) {
            teamA.stats.tied += 1;
            teamB.stats.tied += 1;
            teamA.stats.points += TOURNAMENT_SETTINGS.tiePoints;
            teamB.stats.points += TOURNAMENT_SETTINGS.tiePoints;
            teamA.stats.form.push("T");
            teamB.stats.form.push("T");
          } else if (match.winnerId === teamA.id) {
            teamA.stats.won += 1;
            teamB.stats.lost += 1;
            teamA.stats.points += 1; // +1 point for win!
            teamA.stats.form.push("W");
            teamB.stats.form.push("L");
          } else if (match.winnerId === teamB.id) {
            teamB.stats.won += 1;
            teamA.stats.lost += 1;
            teamB.stats.points += 1; // +1 point for win!
            teamB.stats.form.push("W");
            teamA.stats.form.push("L");
          }
        }
      }
    });

    this.saveData();
  }

  // Sort teams for leaderboard
  getSortedTeams() {
    return [...this.teams].sort((a, b) => {
      if (b.stats.points !== a.stats.points) {
        return b.stats.points - a.stats.points;
      }
      if (b.stats.won !== a.stats.won) {
        return b.stats.won - a.stats.won;
      }
      return a.name.localeCompare(b.name);
    });
  }

  // Get all players flattened
  getAllPlayers() {
    let list = [];
    this.teams.forEach(t => {
      if (Array.isArray(t.players)) {
        t.players.forEach(p => {
          list.push({
            teamId: t.id,
            teamName: t.name,
            teamAccent: t.accentColor,
            name: p.name,
            role: p.role,
            points: p.points || 0
          });
        });
      }
    });
    return list;
  }

  // Event bindings
  bindEvents() {
    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetTab = btn.getAttribute("data-tab");
        this.switchTab(targetTab);
      });
    });

    const searchInput = document.getElementById("playerSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.highlightOrFilterSearch();
      });
    }

    document.querySelectorAll(".modal-close-trigger").forEach(el => {
      el.addEventListener("click", () => this.closeModals());
    });

    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) this.closeModals();
      });
    });
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    document.querySelectorAll(".nav-tab-btn").forEach(b => {
      b.classList.toggle("active", b.getAttribute("data-tab") === tabName);
    });

    document.querySelectorAll(".tab-content-panel").forEach(panel => {
      panel.style.display = panel.id === `tab-${tabName}` ? "block" : "none";
    });

    this.render();
  }

  render() {
    this.renderLineupPoster();
    this.renderPointsTable();
    this.renderPlayerPointsTab();
    this.renderFixtures();
    this.renderMembersDirectory();
  }

  findPlayer(teamId, playerName) {
    const team = this.teams.find(t => t.id === teamId);
    if (!team || !team.players) return null;
    return team.players.find(p => p.name === playerName);
  }

  // =========================================================================
  // 1. INDIVIDUAL PLAYER POINTS ACTIONS
  // =========================================================================
  async addPlayerPoint(teamId, playerName, delta, autoSync = false) {
    const player = this.findPlayer(teamId, playerName);
    if (!player) return;

    player.points = Math.max(0, (player.points || 0) + delta);
    this.render();

    if (delta > 0) {
      this.triggerConfetti();
      this.showToast(`+${delta} Point added to ${playerName}! (${player.points} pts)`, "success");
    } else {
      this.showToast(`Point updated for ${playerName} (${player.points} pts)`, "info");
    }

    if (autoSync) {
      this.syncTeamPointsFromPlayers(teamId);
    } else {
      await this.saveData();
    }
  }

  async setPlayerPoint(teamId, playerName, exactVal) {
    const val = parseInt(exactVal);
    const player = this.findPlayer(teamId, playerName);
    if (!player) return;

    player.points = isNaN(val) ? 0 : Math.max(0, val);
    this.render();
    await this.saveData();
    this.showToast(`Points set to ${player.points} for ${playerName}`, "success");
  }

  promptEditPlayerPoint(teamId, playerName) {
    const player = this.findPlayer(teamId, playerName);
    if (!player) return;

    const input = prompt(`${playerName}-nte puthiya points enter cheyyuka (Current: ${player.points}):`, player.points);
    if (input !== null) {
      this.setPlayerPoint(teamId, playerName, input);
    }
  }

  // Calculate & Sync Team Total Points from all its Players
  async syncTeamPointsFromPlayers(targetTeamId = null) {
    const teamsToSync = targetTeamId ? this.teams.filter(t => t.id === targetTeamId) : this.teams;

    teamsToSync.forEach(team => {
      const totalPlayerPoints = (team.players || []).reduce((sum, p) => sum + (p.points || 0), 0);
      team.stats.points = totalPlayerPoints;
    });

    this.render();
    await this.saveData();
    this.triggerConfetti();
    this.showToast("All individual player points synced to Team Points Table & Database!", "success");
  }

  // =========================================================================
  // 2. TEAM POINTS TABLE ACTIONS (WIN = 1 POINT)
  // =========================================================================
  async quickAddWin(teamId) {
    const team = this.teams.find(t => t.id === teamId);
    if (!team) return;
    team.stats.played += 1;
    team.stats.won += 1;
    team.stats.points += 1; // 1 point for Win!
    team.stats.form.push("W");
    this.render();
    await this.saveData();
    this.triggerConfetti();
    this.showToast(`+1 Point added to ${team.name} for Win! (Total: ${team.stats.points} pts)`, "success");
  }

  async quickAddLoss(teamId) {
    const team = this.teams.find(t => t.id === teamId);
    if (!team) return;
    team.stats.played += 1;
    team.stats.lost += 1;
    team.stats.form.push("L");
    this.render();
    await this.saveData();
    this.showToast(`Loss match recorded for ${team.name}`, "info");
  }

  async quickAdjustTeamPts(teamId, delta) {
    const team = this.teams.find(t => t.id === teamId);
    if (!team) return;
    team.stats.points = Math.max(0, (team.stats.points || 0) + delta);
    this.render();
    await this.saveData();
    if (delta > 0) this.triggerConfetti();
    this.showToast(`${delta > 0 ? '+1' : '-1'} Point adjusted for ${team.name} (Total: ${team.stats.points})`, "info");
  }

  async quickRevertMatch(teamId) {
    const team = this.teams.find(t => t.id === teamId);
    if (!team || team.stats.played <= 0) {
      this.showToast("Cannot revert: No matches recorded yet!", "info");
      return;
    }

    const lastForm = team.stats.form.pop();
    team.stats.played = Math.max(0, team.stats.played - 1);

    if (lastForm === "W") {
      team.stats.won = Math.max(0, team.stats.won - 1);
      team.stats.points = Math.max(0, team.stats.points - 1);
    } else if (lastForm === "L") {
      team.stats.lost = Math.max(0, team.stats.lost - 1);
    } else if (lastForm === "T") {
      team.stats.tied = Math.max(0, team.stats.tied - 1);
    }

    this.render();
    await this.saveData();
    this.showToast(`Last match reverted for ${team.name}`, "info");
  }

  // =========================================================================
  // 3. RENDER 5-COLUMNS LINE-UP (POSTER VIEW) WITH PLAYER POINTS
  // =========================================================================
  renderLineupPoster() {
    const container = document.getElementById("posterGridContainer");
    if (!container) return;

    let html = "";
    this.teams.forEach(team => {
      const q = this.searchQuery;
      const captainObj = (team.players || []).find(p => p.role === "Captain") || { name: team.captain, points: 0 };
      const vcObj = (team.players || []).find(p => p.role === "Vice Captain") || { name: team.viceCaptain, points: 0 };
      const memberList = (team.players || []).filter(p => p.role === "Member");

      const isCaptainMatch = q && captainObj.name.toLowerCase().includes(q);
      const isVcMatch = q && vcObj.name.toLowerCase().includes(q);

      html += `
        <div class="poster-team-card" data-team-id="${team.id}">
          <div class="team-poster-header logo-${team.id}">
            <div class="tamil-title">${team.tamilName}</div>
            ${team.subtitleBadge ? `<span class="sub-badge-boss">${team.subtitleBadge}</span>` : ''}
          </div>

          <div class="team-name-pill">
            <span>${team.name}</span>
          </div>

          <div class="poster-card-body">
            <!-- CAPTAIN -->
            <div class="poster-role-badge">CAPTAIN</div>
            <div class="poster-player-row">
              <div class="poster-person-name ${isCaptainMatch ? 'player-highlight' : ''}">${captainObj.name}</div>
              <div class="player-score-ctrl">
                <span class="player-pts-pill" onclick="app.promptEditPlayerPoint('${team.id}', '${captainObj.name}')" title="Click to edit points">
                  ⭐ <strong>${captainObj.points || 0}</strong> pts
                </span>
                <button class="btn-micro-gold" onclick="app.addPlayerPoint('${team.id}', '${captainObj.name}', 1)" title="+1 Point">+</button>
                <button class="btn-micro-red" onclick="app.addPlayerPoint('${team.id}', '${captainObj.name}', -1)" title="-1 Point">-</button>
              </div>
            </div>

            <!-- VICE CAPTAIN -->
            <div class="poster-role-badge">VICE CAPTAIN</div>
            <div class="poster-player-row">
              <div class="poster-person-name ${isVcMatch ? 'player-highlight' : ''}">${vcObj.name}</div>
              <div class="player-score-ctrl">
                <span class="player-pts-pill" onclick="app.promptEditPlayerPoint('${team.id}', '${vcObj.name}')" title="Click to edit points">
                  ⭐ <strong>${vcObj.points || 0}</strong> pts
                </span>
                <button class="btn-micro-gold" onclick="app.addPlayerPoint('${team.id}', '${vcObj.name}', 1)" title="+1 Point">+</button>
                <button class="btn-micro-red" onclick="app.addPlayerPoint('${team.id}', '${vcObj.name}', -1)" title="-1 Point">-</button>
              </div>
            </div>

            <div class="poster-members-divider"></div>

            <!-- MEMBERS LIST -->
            <ul class="poster-members-list">
              ${memberList.map((member, idx) => {
                const isMemberMatch = q && member.name.toLowerCase().includes(q);
                return `
                  <li class="poster-member-item">
                    <span class="member-name-text ${isMemberMatch ? 'player-highlight' : ''}" title="Member #${idx + 1}">
                      ${member.name}
                    </span>
                    <div class="player-score-ctrl">
                      <span class="player-pts-pill" onclick="app.promptEditPlayerPoint('${team.id}', '${member.name}')" title="Click to edit points">
                        <strong>${member.points || 0}</strong>
                      </span>
                      <button class="btn-micro-gold" onclick="app.addPlayerPoint('${team.id}', '${member.name}', 1)" title="+1 Point">+</button>
                      <button class="btn-micro-red" onclick="app.addPlayerPoint('${team.id}', '${member.name}', -1)" title="-1 Point">-</button>
                    </div>
                  </li>
                `;
              }).join("")}
            </ul>

            <div style="margin-top: 0.85rem; width: 100%; display: flex; flex-direction: column; gap: 0.35rem; align-items: center;">
              <button class="btn-gold" style="font-size: 0.72rem; padding: 0.25rem 0.6rem; border-radius: 6px; width: 90%; justify-content: center;" onclick="app.syncTeamPointsFromPlayers('${team.id}')">
                <i class="fas fa-sync-alt"></i> Sync Pts to Team Table
              </button>
              <button class="btn-secondary" style="font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 6px; background: rgba(180, 83, 9, 0.12); color: #78350f; border-color: rgba(180, 83, 9, 0.25);" onclick="app.openTeamEditorModal('${team.id}')">
                <i class="fas fa-edit"></i> Edit Roster
              </button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // =========================================================================
  // 4. RENDER POINTS TABLE / STANDINGS (WIN = 1 POINT)
  // =========================================================================
  renderPointsTable() {
    const tableBody = document.getElementById("pointsTableBody");
    const leaderPodium = document.getElementById("leaderPodiumDisplay");
    if (!tableBody) return;

    const sorted = this.getSortedTeams();

    if (leaderPodium && sorted.length > 0) {
      const topLeader = sorted[0];
      const hasPlayedAny = sorted.some(t => t.stats.played > 0 || t.stats.points > 0);

      leaderPodium.innerHTML = `
        <div class="podium-badge">
          <i class="fas fa-crown text-yellow-400 text-xl"></i>
          <span>${hasPlayedAny && topLeader.stats.points > 0 ? 'CURRENT TABLE TOPPER' : 'DEFENDING CHAMPION'} : </span>
          <span style="color: #fff; font-weight: 900; letter-spacing: 1px; margin-left: 5px;">${topLeader.name}</span>
          <span style="background: rgba(246, 207, 102, 0.25); border: 1px solid #f6cf66; font-size: 0.82rem; padding: 2px 10px; border-radius: 9999px; margin-left: 8px;">
            ${topLeader.stats.points} PTS
          </span>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="btn-gold" style="font-size: 0.8rem; padding: 0.35rem 0.75rem;" onclick="app.syncTeamPointsFromPlayers()" title="Sum all player points into team points">
            <i class="fas fa-calculator"></i> Sync from Player Points
          </button>
          <button class="btn-secondary" style="font-size: 0.8rem; padding: 0.35rem 0.75rem;" onclick="app.openManualPointsModal()">
            <i class="fas fa-sliders-h"></i> Edit Table
          </button>
          <button class="btn-secondary" style="font-size: 0.8rem; padding: 0.35rem 0.75rem;" onclick="app.resetData()">
            <i class="fas fa-redo"></i> Reset DB
          </button>
        </div>
      `;
    }

    let rowsHtml = "";
    sorted.forEach((team, index) => {
      const rank = index + 1;
      let rankClass = "rank-normal";
      if (rank === 1) rankClass = "rank-1";
      else if (rank === 2) rankClass = "rank-2";
      else if (rank === 3) rankClass = "rank-3";

      const formHtml = team.stats.form && team.stats.form.length > 0 
        ? team.stats.form.slice(-5).map(res => `<span class="form-pill form-${res === 'W' ? 'win' : res === 'L' ? 'loss' : 'tie'}">${res}</span>`).join("")
        : `<span style="color: #64748b; font-size: 0.75rem;">-</span>`;

      const totalPlayerPts = (team.players || []).reduce((sum, p) => sum + (p.points || 0), 0);

      rowsHtml += `
        <tr class="team-row-${team.id}">
          <td style="text-align: center; width: 55px;">
            <div class="rank-badge ${rankClass}">#${rank}</div>
          </td>
          <td>
            <div class="team-cell">
              <div class="team-avatar-mini">${team.name.substring(0, 2)}</div>
              <div class="team-cell-info">
                <div class="team-main-name">${team.name}</div>
                <div class="team-sub-info">Capt: ${team.captain} | Player Points Sum: <strong style="color: #f6cf66;">${totalPlayerPts}</strong></div>
              </div>
            </div>
          </td>
          <td style="font-weight: 700; text-align: center;">${team.stats.played}</td>
          <td style="font-weight: 700; color: #34d399; text-align: center;">${team.stats.won}</td>
          <td style="font-weight: 700; color: #f87171; text-align: center;">${team.stats.lost}</td>
          <td style="font-weight: 700; color: #fbbf24; text-align: center;">${team.stats.tied || 0}</td>
          <td style="text-align: center;">${formHtml}</td>
          <td style="text-align: center;">
            <span class="pts-highlight">${team.stats.points}</span>
          </td>
          <td style="text-align: right;">
            <div style="display: inline-flex; gap: 0.35rem; align-items: center; flex-wrap: nowrap;">
              <button class="btn-gold" style="padding: 0.32rem 0.65rem; font-size: 0.78rem;" title="Add 1 Win (+1 Point)" onclick="app.quickAddWin('${team.id}')">
                <i class="fas fa-plus"></i> Win (+1)
              </button>
              <button class="btn-red" style="padding: 0.32rem 0.6rem; font-size: 0.78rem;" title="Record Loss (0 Points)" onclick="app.quickAddLoss('${team.id}')">
                <i class="fas fa-times"></i> Loss
              </button>
              <button class="btn-gold" style="padding: 0.32rem 0.5rem; font-size: 0.75rem; background: rgba(245, 158, 11, 0.2); color: #fef08a;" title="Direct +1 Point" onclick="app.quickAdjustTeamPts('${team.id}', 1)">
                +1 Pt
              </button>
              <button class="btn-secondary" style="padding: 0.32rem 0.5rem; font-size: 0.75rem;" title="Direct -1 Point" onclick="app.quickAdjustTeamPts('${team.id}', -1)">
                -1 Pt
              </button>
              <button class="btn-secondary" style="padding: 0.32rem 0.45rem; font-size: 0.72rem; color: #94a3b8;" title="Undo / Revert last match" onclick="app.quickRevertMatch('${team.id}')">
                <i class="fas fa-undo"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = rowsHtml;
  }

  // =========================================================================
  // 5. RENDER DEDICATED INDIVIDUAL PLAYER POINTS TAB
  // =========================================================================
  renderPlayerPointsTab() {
    const container = document.getElementById("playerPointsContainer");
    if (!container) return;

    let players = this.getAllPlayers();

    if (this.playerFilterTeam !== "all") {
      players = players.filter(p => p.teamId === this.playerFilterTeam);
    }

    if (this.searchQuery) {
      players = players.filter(p =>
        p.name.toLowerCase().includes(this.searchQuery) ||
        p.teamName.toLowerCase().includes(this.searchQuery) ||
        p.role.toLowerCase().includes(this.searchQuery)
      );
    }

    if (this.playerSortMode === "points") {
      players.sort((a, b) => (b.points || 0) - (a.points || 0));
    } else {
      players.sort((a, b) => a.teamName.localeCompare(b.teamName) || (b.points || 0) - (a.points || 0));
    }

    let html = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4 bg-red-950/40 border border-yellow-600/30 p-3 rounded-xl">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-bold text-yellow-300 uppercase mr-1">Filter Team:</span>
          <button class="player-filter-btn ${this.playerFilterTeam === 'all' ? 'active' : ''}" onclick="app.setPlayerTeamFilter('all')">All Teams (${this.getAllPlayers().length})</button>
          ${this.teams.map(t => `
            <button class="player-filter-btn ${this.playerFilterTeam === t.id ? 'active' : ''}" onclick="app.setPlayerTeamFilter('${t.id}')">
              ${t.name}
            </button>
          `).join("")}
        </div>

        <div class="flex items-center gap-2">
          <button class="btn-gold" style="font-size: 0.8rem;" onclick="app.syncTeamPointsFromPlayers()">
            <i class="fas fa-sync-alt"></i> Sync All to Team Table
          </button>
          <button class="btn-secondary" style="font-size: 0.8rem;" onclick="app.togglePlayerSort()">
            <i class="fas fa-sort-amount-down"></i> Sort: ${this.playerSortMode === 'points' ? 'Top Scorers (MVP)' : 'By Team'}
          </button>
        </div>
      </div>

      <div class="player-points-card">
        <div class="table-responsive">
          <table class="points-table">
            <thead>
              <tr>
                <th style="width: 50px; text-align: center;">Rank</th>
                <th>Player Name</th>
                <th>Team</th>
                <th>Role</th>
                <th style="text-align: center;">Total Points</th>
                <th style="text-align: right;">Quick Adjust (+ / -)</th>
              </tr>
            </thead>
            <tbody>
    `;

    if (players.length === 0) {
      html += `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem; color: #94a3b8;">
            No players found matching your search!
          </td>
        </tr>
      `;
    } else {
      players.forEach((player, idx) => {
        const rank = idx + 1;
        let rankBadge = `<span style="color: #cbd5e1; font-weight: 700;">#${rank}</span>`;
        if (this.playerSortMode === "points") {
          if (rank === 1 && player.points > 0) rankBadge = `<span class="rank-badge rank-1">🥇</span>`;
          else if (rank === 2 && player.points > 0) rankBadge = `<span class="rank-badge rank-2">🥈</span>`;
          else if (rank === 3 && player.points > 0) rankBadge = `<span class="rank-badge rank-3">🥉</span>`;
        }

        let roleBadgeStyle = "background: rgba(255,255,255,0.08); color: #cbd5e1;";
        if (player.role === "Captain") roleBadgeStyle = "background: #ad181e; color: #fff; font-weight: 700;";
        else if (player.role === "Vice Captain") roleBadgeStyle = "background: #b45309; color: #fff; font-weight: 700;";

        html += `
          <tr>
            <td style="text-align: center;">${rankBadge}</td>
            <td>
              <div style="font-weight: 700; color: #fff; font-size: 1rem;">
                ${player.name}
              </div>
            </td>
            <td>
              <span style="font-weight: 700; color: #f6cf66; font-family: var(--font-heading); font-size: 0.95rem;">
                ${player.teamName}
              </span>
            </td>
            <td>
              <span style="font-size: 0.72rem; padding: 2px 8px; border-radius: 9999px; ${roleBadgeStyle}">
                ${player.role}
              </span>
            </td>
            <td style="text-align: center;">
              <input 
                type="number" 
                class="player-score-input" 
                value="${player.points || 0}" 
                min="0"
                onchange="app.setPlayerPoint('${player.teamId}', '${player.name}', this.value)"
              >
            </td>
            <td style="text-align: right;">
              <div style="display: inline-flex; gap: 0.35rem; align-items: center;">
                <button class="btn-micro-gold" style="width: 26px; height: 26px; font-size: 0.9rem;" onclick="app.addPlayerPoint('${player.teamId}', '${player.name}', 1)" title="+1 Point">+</button>
                <button class="btn-micro-red" style="width: 26px; height: 26px; font-size: 0.9rem;" onclick="app.addPlayerPoint('${player.teamId}', '${player.name}', -1)" title="-1 Point">-</button>
                <button class="btn-gold" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;" onclick="app.addPlayerPoint('${player.teamId}', '${player.name}', 5)" title="+5 Points Bonus">+5</button>
              </div>
            </td>
          </tr>
        `;
      });
    }

    html += `
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  setPlayerTeamFilter(teamId) {
    this.playerFilterTeam = teamId;
    this.renderPlayerPointsTab();
  }

  togglePlayerSort() {
    this.playerSortMode = this.playerSortMode === "points" ? "team" : "points";
    this.renderPlayerPointsTab();
  }

  // =========================================================================
  // 6. RENDER MATCH FIXTURES & SCORECARD
  // =========================================================================
  renderFixtures() {
    const container = document.getElementById("fixturesContainer");
    if (!container) return;

    let html = "";
    this.fixtures.forEach(match => {
      const teamA = this.teams.find(t => t.id === match.teamAId) || { name: match.teamAId };
      const teamB = this.teams.find(t => t.id === match.teamBId) || { name: match.teamBId };

      const isDone = match.status === "completed";
      const aWon = isDone && match.winnerId === teamA.id;
      const bWon = isDone && match.winnerId === teamB.id;
      const isTie = isDone && match.isTie;

      html += `
        <div class="fixture-card" id="match-card-${match.id}">
          <div class="fixture-header">
            <span style="font-weight: 700; color: #f6cf66;"><i class="fas fa-trophy mr-1"></i> Match #${match.matchNo} • ${match.round}</span>
            <span class="badge" style="background: ${isDone ? '#065f46' : 'rgba(255,255,255,0.1)'}; color: ${isDone ? '#34d399' : '#cbd5e1'}; padding: 2px 8px; border-radius: 9999px; font-size: 0.72rem; text-transform: uppercase;">
              ${isDone ? (isTie ? 'TIED' : 'COMPLETED') : 'UPCOMING'}
            </span>
          </div>

          <div class="fixture-body">
            <div class="fixture-team ${aWon ? 'winner' : ''}">
              <div class="team-avatar-mini" style="margin-bottom: 4px;">${teamA.name.substring(0, 2)}</div>
              <div class="fixture-team-name">${teamA.name}</div>
              ${match.teamAScore ? `<div style="font-size: 0.85rem; color: #fbbf24; font-weight: 700; margin-top: 2px;">${match.teamAScore}</div>` : ''}
              ${aWon ? '<span style="font-size: 0.7rem; color: #34d399; font-weight: 700;"><i class="fas fa-crown"></i> WINNER (+1 Pt)</span>' : ''}
            </div>

            <div class="fixture-vs">
              <div class="vs-badge">VS</div>
            </div>

            <div class="fixture-team ${bWon ? 'winner' : ''}">
              <div class="team-avatar-mini" style="margin-bottom: 4px;">${teamB.name.substring(0, 2)}</div>
              <div class="fixture-team-name">${teamB.name}</div>
              ${match.teamBScore ? `<div style="font-size: 0.85rem; color: #fbbf24; font-weight: 700; margin-top: 2px;">${match.teamBScore}</div>` : ''}
              ${bWon ? '<span style="font-size: 0.7rem; color: #34d399; font-weight: 700;"><i class="fas fa-crown"></i> WINNER (+1 Pt)</span>' : ''}
            </div>
          </div>

          <div class="fixture-footer">
            <span style="font-size: 0.75rem; color: #94a3b8;">${match.notes || 'Tournament Match'}</span>
            <button class="btn-gold" style="font-size: 0.75rem; padding: 0.3rem 0.7rem;" onclick="app.openScoreEntryModal('${match.id}')">
              <i class="fas fa-edit"></i> ${isDone ? 'Edit Result' : 'Enter Result'}
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // =========================================================================
  // 7. RENDER ALL PLAYERS DIRECTORY
  // =========================================================================
  renderMembersDirectory() {
    const container = document.getElementById("membersDirectoryContainer");
    if (!container) return;

    let allPlayers = this.getAllPlayers();

    if (this.searchQuery) {
      allPlayers = allPlayers.filter(p => 
        p.name.toLowerCase().includes(this.searchQuery) ||
        p.teamName.toLowerCase().includes(this.searchQuery) ||
        p.role.toLowerCase().includes(this.searchQuery)
      );
    }

    let html = `
      <div style="margin-bottom: 1rem; color: #cbd5e1; font-size: 0.9rem;">
        Total Players in Directory: <strong style="color: #f6cf66;">${allPlayers.length}</strong>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
    `;

    allPlayers.forEach(person => {
      let roleBg = "rgba(255,255,255,0.1)";
      let roleColor = "#cbd5e1";
      if (person.role === "Captain") {
        roleBg = "linear-gradient(135deg, #ad181e, #800e13)";
        roleColor = "#fef08a";
      } else if (person.role === "Vice Captain") {
        roleBg = "rgba(180, 83, 9, 0.4)";
        roleColor = "#fde68a";
      }

      html += `
        <div style="background: rgba(20, 2, 4, 0.9); border: 1.5px solid rgba(212, 175, 55, 0.35); border-radius: 12px; padding: 1rem; display: flex; align-items: center; gap: 0.85rem;">
          <div class="team-avatar-mini" style="width: 44px; height: 44px; font-size: 1rem;">
            ${person.name.charAt(0).toUpperCase()}
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 700; color: #fff; font-size: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${person.name}
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 3px;">
              <span style="font-size: 0.72rem; padding: 1px 7px; border-radius: 9999px; background: ${roleBg}; color: ${roleColor}; font-weight: 700; border: 1px solid rgba(212, 175, 55, 0.3);">
                ${person.role}
              </span>
              <span style="font-size: 0.75rem; color: #f6cf66; font-weight: 600;">
                ${person.teamName}
              </span>
            </div>
          </div>
          <div style="text-align: right;">
            <div class="player-pts-pill" onclick="app.promptEditPlayerPoint('${person.teamId}', '${person.name}')" title="Click to edit points">
              ⭐ ${person.points || 0} pts
            </div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }

  // =========================================================================
  // 8. MODALS & FORMS
  // =========================================================================
  openScoreEntryModal(matchId) {
    const match = this.fixtures.find(m => m.id === matchId);
    if (!match) return;

    const teamA = this.teams.find(t => t.id === match.teamAId);
    const teamB = this.teams.find(t => t.id === match.teamBId);

    const modalBody = document.getElementById("scoreEntryModalBody");
    document.getElementById("scoreEntryModalTitle").textContent = "Enter Match Result";

    modalBody.innerHTML = `
      <form id="scoreEntryForm" onsubmit="event.preventDefault(); app.saveScoreEntry('${match.id}');">
        <div style="text-align: center; margin-bottom: 1.25rem;">
          <span style="background: rgba(212, 175, 55, 0.2); color: #fef08a; padding: 3px 12px; border-radius: 9999px; font-size: 0.8rem; font-weight: 700;">
            Match #${match.matchNo}: ${teamA.name} vs ${teamB.name}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.2rem;">
          <div style="background: #110204; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 8px; padding: 0.75rem; text-align: center;">
            <div style="font-weight: 800; color: #f6cf66; margin-bottom: 0.5rem;">${teamA.name}</div>
            <label class="form-label" style="font-size: 0.75rem;">Score / Notes</label>
            <input type="text" id="score_teamA" class="form-input" placeholder="e.g. 85/4" value="${match.teamAScore || ''}">
          </div>

          <div style="background: #110204; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 8px; padding: 0.75rem; text-align: center;">
            <div style="font-weight: 800; color: #f6cf66; margin-bottom: 0.5rem;">${teamB.name}</div>
            <label class="form-label" style="font-size: 0.75rem;">Score / Notes</label>
            <input type="text" id="score_teamB" class="form-input" placeholder="e.g. 82/6" value="${match.teamBScore || ''}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Match Outcome / Winner (+1 Point)</label>
          <select id="match_winner" class="form-select">
            <option value="pending" ${match.status === 'upcoming' ? 'selected' : ''}>Upcoming / Not Played Yet</option>
            <option value="${teamA.id}" ${match.winnerId === teamA.id ? 'selected' : ''}>Winner: ${teamA.name} (+1 Pt)</option>
            <option value="${teamB.id}" ${match.winnerId === teamB.id ? 'selected' : ''}>Winner: ${teamB.name} (+1 Pt)</option>
            <option value="tie" ${match.isTie ? 'selected' : ''}>Match Tied / Draw (0.5 pt each)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Match Notes</label>
          <input type="text" id="match_notes" class="form-input" placeholder="e.g. Won by 4 runs" value="${match.notes || ''}">
        </div>

        <div class="modal-footer" style="padding: 1rem 0 0; border-top: 1px solid rgba(212,175,55,0.2);">
          <button type="button" class="btn-secondary" onclick="app.closeModals()">Cancel</button>
          <button type="submit" class="btn-gold"><i class="fas fa-save"></i> Save Match Result</button>
        </div>
      </form>
    `;

    this.openModal("scoreEntryModal");
  }

  async saveScoreEntry(matchId) {
    const match = this.fixtures.find(m => m.id === matchId);
    if (!match) return;

    const winnerVal = document.getElementById("match_winner").value;
    match.teamAScore = document.getElementById("score_teamA").value.trim();
    match.teamBScore = document.getElementById("score_teamB").value.trim();
    match.notes = document.getElementById("match_notes").value.trim();

    if (winnerVal === "pending") {
      match.status = "upcoming";
      match.winnerId = null;
      match.isTie = false;
    } else if (winnerVal === "tie") {
      match.status = "completed";
      match.winnerId = null;
      match.isTie = true;
    } else {
      match.status = "completed";
      match.winnerId = winnerVal;
      match.isTie = false;
    }

    this.recalculatePointsFromMatches();
    this.closeModals();
    this.render();
    this.triggerConfetti();
    this.showToast("Match result saved to SQLite Database (+1 Pt for winner)!", "success");
  }

  openManualPointsModal() {
    const body = document.getElementById("scoreEntryModalBody");
    document.getElementById("scoreEntryModalTitle").textContent = "Direct Points Table Editor";

    let formHtml = `
      <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 1rem;">
        Directly customize Played, Won, Lost, and Points for each team in the database:
      </div>
      <form id="manualPointsForm" onsubmit="event.preventDefault(); app.saveManualPointsAll();">
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
    `;

    this.teams.forEach(team => {
      formHtml += `
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(212,175,55,0.3); border-radius: 8px; padding: 0.6rem 0.85rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
          <div style="font-weight: 800; color: #f6cf66; width: 110px;">${team.name}</div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <div>
              <span style="font-size: 0.7rem; color: #94a3b8; display: block;">Played</span>
              <input type="number" id="p_played_${team.id}" value="${team.stats.played}" min="0" style="width: 50px;" class="form-input text-center">
            </div>
            <div>
              <span style="font-size: 0.7rem; color: #34d399; display: block;">Won</span>
              <input type="number" id="p_won_${team.id}" value="${team.stats.won}" min="0" style="width: 50px;" class="form-input text-center">
            </div>
            <div>
              <span style="font-size: 0.7rem; color: #f87171; display: block;">Lost</span>
              <input type="number" id="p_lost_${team.id}" value="${team.stats.lost}" min="0" style="width: 50px;" class="form-input text-center">
            </div>
            <div>
              <span style="font-size: 0.7rem; color: #fef08a; display: block; font-weight: 700;">PTS</span>
              <input type="number" id="p_pts_${team.id}" value="${team.stats.points}" min="0" style="width: 55px; border-color: #f6cf66; font-weight: 800;" class="form-input text-center">
            </div>
          </div>
        </div>
      `;
    });

    formHtml += `
        </div>
        <div class="modal-footer" style="padding: 1rem 0 0; border-top: 1px solid rgba(212,175,55,0.2); margin-top: 1rem;">
          <button type="button" class="btn-secondary" onclick="app.closeModals()">Cancel</button>
          <button type="submit" class="btn-gold"><i class="fas fa-check"></i> Save Standings to Database</button>
        </div>
      </form>
    `;

    body.innerHTML = formHtml;
    this.openModal("scoreEntryModal");
  }

  async saveManualPointsAll() {
    this.teams.forEach(team => {
      const p = Math.max(0, parseInt(document.getElementById(`p_played_${team.id}`).value) || 0);
      const w = Math.max(0, parseInt(document.getElementById(`p_won_${team.id}`).value) || 0);
      const l = Math.max(0, parseInt(document.getElementById(`p_lost_${team.id}`).value) || 0);
      const pts = Math.max(0, parseInt(document.getElementById(`p_pts_${team.id}`).value) || 0);

      team.stats.played = p;
      team.stats.won = w;
      team.stats.lost = l;
      team.stats.points = pts;
    });

    this.closeModals();
    this.render();
    await this.saveData();
    this.showToast("Team points saved permanently to SQLite Database!", "success");
  }

  openTeamEditorModal(teamId) {
    const team = this.teams.find(t => t.id === teamId);
    if (!team) return;

    const body = document.getElementById("scoreEntryModalBody");
    document.getElementById("scoreEntryModalTitle").textContent = `Edit Team: ${team.name}`;

    const captainObj = (team.players || []).find(p => p.role === "Captain") || { name: team.captain, points: 0 };
    const vcObj = (team.players || []).find(p => p.role === "Vice Captain") || { name: team.viceCaptain, points: 0 };
    const memberLines = (team.players || []).filter(p => p.role === "Member").map(p => p.name).join("\n");

    body.innerHTML = `
      <form id="teamEditForm" onsubmit="event.preventDefault(); app.saveTeamEdit('${team.id}');">
        <div class="form-group">
          <label class="form-label">Captain Name</label>
          <input type="text" id="edit_captain" class="form-input" value="${captainObj.name}" required>
        </div>

        <div class="form-group">
          <label class="form-label">Vice Captain Name</label>
          <input type="text" id="edit_viceCaptain" class="form-input" value="${vcObj.name}" required>
        </div>

        <div class="form-group">
          <label class="form-label">Team Members (One per line)</label>
          <textarea id="edit_members" class="form-input" rows="7" style="resize: vertical;">${memberLines}</textarea>
          <span style="font-size: 0.75rem; color: #94a3b8;">Enter each member's name on a separate line.</span>
        </div>

        <div class="modal-footer" style="padding: 1rem 0 0; border-top: 1px solid rgba(212,175,55,0.2);">
          <button type="button" class="btn-secondary" onclick="app.closeModals()">Cancel</button>
          <button type="submit" class="btn-gold"><i class="fas fa-save"></i> Save Roster to Database</button>
        </div>
      </form>
    `;

    this.openModal("scoreEntryModal");
  }

  async saveTeamEdit(teamId) {
    const team = this.teams.find(t => t.id === teamId);
    if (!team) return;

    const newCapName = document.getElementById("edit_captain").value.trim();
    const newVcName = document.getElementById("edit_viceCaptain").value.trim();
    const membersText = document.getElementById("edit_members").value;

    const newMemberNames = membersText
      .split("\n")
      .map(m => m.trim())
      .filter(m => m.length > 0);

    const existingPointsMap = {};
    (team.players || []).forEach(p => {
      existingPointsMap[p.name] = p.points || 0;
    });

    team.captain = newCapName;
    team.viceCaptain = newVcName;
    team.players = [];

    team.players.push({
      name: newCapName,
      role: "Captain",
      points: existingPointsMap[newCapName] || 0
    });

    team.players.push({
      name: newVcName,
      role: "Vice Captain",
      points: existingPointsMap[newVcName] || 0
    });

    newMemberNames.forEach(mName => {
      team.players.push({
        name: mName,
        role: "Member",
        points: existingPointsMap[mName] || 0
      });
    });

    team.members = newMemberNames;

    this.closeModals();
    this.render();
    await this.saveData();
    this.showToast(`Updated roster for ${team.name} in Database!`, "success");
  }

  highlightOrFilterSearch() {
    this.renderLineupPoster();
    this.renderPlayerPointsTab();
    this.renderMembersDirectory();
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add("active");
  }

  closeModals() {
    document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("active"));
  }

  showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
      <i class="fas ${type === 'success' ? 'fa-check-circle text-green-400' : 'fa-info-circle text-yellow-400'}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(50px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  triggerConfetti() {
    if (typeof confetti === "function") {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ffe082', '#f6cf66', '#d4af37', '#ad181e', '#ffffff']
      });
    }
  }

  printTable() {
    window.print();
  }
}

// Global instance
let app;
document.addEventListener("DOMContentLoaded", () => {
  app = new TournamentApp();
});
