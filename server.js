const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const db = require('./db.js');

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.sqlite': 'application/vnd.sqlite3',
  '.woff': 'application/font-woff',
  '.woff2': 'font/woff2',
  '.ttf': 'application/font-ttf'
};

// Helper: parse request body
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 5 * 1024 * 1024) { // 5MB limit
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        resolve(parsed);
      } catch (err) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

// Helper: send JSON response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });
  res.end(JSON.stringify(data));
}

// Server request handler
const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // =========================================================================
  // REST API ENDPOINTS (PERMANENT SQLITE DATABASE)
  // =========================================================================

  // 1. GET /api/tournament - Load full tournament data from SQLite
  if (req.method === 'GET' && pathname === '/api/tournament') {
    try {
      const data = db.getFullTournamentData();
      sendJson(res, 200, {
        success: true,
        source: "sqlite",
        data: data
      });
    } catch (err) {
      console.error('Error fetching tournament data:', err);
      sendJson(res, 500, { success: false, error: err.message });
    }
    return;
  }

  // 2. POST /api/tournament - Save full tournament data to SQLite permanently
  if (req.method === 'POST' && pathname === '/api/tournament') {
    try {
      const payload = await parseJsonBody(req);
      db.saveFullTournamentData(payload);
      sendJson(res, 200, {
        success: true,
        message: "Data saved permanently to SQLite Database!",
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error saving tournament data:', err);
      sendJson(res, 500, { success: false, error: err.message });
    }
    return;
  }

  // 3. POST /api/player/point - Instant single player point update
  if (req.method === 'POST' && pathname === '/api/player/point') {
    try {
      const { teamId, playerName, delta, exactVal } = await parseJsonBody(req);
      db.updatePlayerPoint(teamId, playerName, delta, exactVal);
      sendJson(res, 200, {
        success: true,
        message: `Point updated in SQLite for ${playerName}`
      });
    } catch (err) {
      console.error('Error updating player point:', err);
      sendJson(res, 500, { success: false, error: err.message });
    }
    return;
  }

  // 4. POST /api/reset - Reset database to defaults
  if (req.method === 'POST' && pathname === '/api/reset') {
    try {
      db.resetDatabase();
      sendJson(res, 200, {
        success: true,
        message: "Database reset to defaults successfully!"
      });
    } catch (err) {
      console.error('Error resetting database:', err);
      sendJson(res, 500, { success: false, error: err.message });
    }
    return;
  }

  // 5. GET /api/status - Check database status and statistics
  if (req.method === 'GET' && pathname === '/api/status') {
    try {
      const stats = db.getDbStats();
      sendJson(res, 200, {
        success: true,
        database: stats,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
    }
    return;
  }

  // 6. GET /api/backup - Download raw SQLite database file
  if (req.method === 'GET' && pathname === '/api/backup') {
    const dbPath = path.join(__dirname, 'data', 'tournament.sqlite');
    if (fs.existsSync(dbPath)) {
      res.writeHead(200, {
        'Content-Type': 'application/vnd.sqlite3',
        'Content-Disposition': 'attachment; filename="tournament_backup.sqlite"'
      });
      fs.createReadStream(dbPath).pipe(res);
      return;
    }
  }

  // =========================================================================
  // STATIC ASSETS SERVING
  // =========================================================================
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname.replace(/^\//, ''));

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

// Helper: Get Local Network IP addresses
function getNetworkIps() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  return ips;
}

server.listen(PORT, '0.0.0.0', () => {
  const localUrl = `http://localhost:${PORT}`;
  const networkIps = getNetworkIps();

  console.log('\n===============================================================');
  console.log('🏆  BNI TOURNAMENT SERVER & PERMANENT DATABASE IS ACTIVE!');
  console.log('===============================================================');
  console.log(`👉 Local URL:     ${localUrl}`);
  networkIps.forEach(ip => {
    console.log(`📱 Mobile/Wi-Fi:  http://${ip}:${PORT} (Open from phone on same Wi-Fi!)`);
  });
  console.log(`💾 Permanent DB:  SQLite 3 (data/tournament.sqlite)`);
  console.log(`📄 JSON Backup:   data/tournament_backup.json`);
  console.log('===============================================================\n');

  // Auto-open browser on local machine
  const startCmd = process.platform === 'win32' ? `start ${localUrl}` : `open ${localUrl}`;
  exec(startCmd, err => {
    if (err) console.log(`Please open ${localUrl} in your browser.`);
  });
});
