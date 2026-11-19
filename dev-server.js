#!/usr/bin/env node

/**
 * FinSight Zero-Dependency Live Development Server
 * Features:
 * - Native Node.js HTTP server (zero npm dependencies)
 * - Auto Live Reloading via Server-Sent Events (SSE)
 * - Instant CSS hot-reloading without full page refresh
 * - Dynamic port fallback if 5500 is in use
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const DEFAULT_PORT = 5500;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Connected live-reload clients
const sseClients = new Set();

// Client script injected into HTML files
const LIVE_RELOAD_SCRIPT = `
<!-- FinSight Live Reload -->
<script>
(function() {
  const evtSource = new EventSource('/__live_reload_stream');
  evtSource.onmessage = function(e) {
    if (e.data === 'reload') {
      console.log('[LiveServer] Reloading page...');
      window.location.reload();
    } else if (e.data === 'css-reload') {
      console.log('[LiveServer] Hot-reloading CSS...');
      const links = document.querySelectorAll('link[rel="stylesheet"]');
      links.forEach(link => {
        const url = new URL(link.href, window.location.href);
        url.searchParams.set('_v', Date.now());
        link.href = url.href;
      });
    }
  };
  evtSource.onerror = function() {
    // Attempt reconnection automatically handled by EventSource
  };
})();
</script>
`;

/**
 * File watcher setup
 */
let debounceTimer = null;
function setupWatcher() {
  try {
    fs.watch(ROOT_DIR, { recursive: true }, (eventType, filename) => {
      if (!filename) return;

      // Ignore dotfiles, git, vscode configs
      if (filename.startsWith('.') || filename.includes('/.') || filename.includes('\\.')) return;
      if (filename === 'dev-server.js') return;

      const ext = path.extname(filename).toLowerCase();
      if (!['.html', '.css', '.js', '.svg'].includes(ext)) return;

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const isCss = ext === '.css';
        const msg = isCss ? 'css-reload' : 'reload';
        console.log(`[LiveServer] File changed (${filename}) -> Triggering ${msg}`);
        sseClients.forEach(client => {
          client.write(`data: ${msg}\n\n`);
        });
      }, 80);
    });
  } catch (err) {
    console.warn('[LiveServer] Watcher warning:', err.message);
  }
}

/**
 * HTTP Request Handler
 */
function handleRequest(req, res) {
  // Live reload SSE endpoint
  if (req.url === '/__live_reload_stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write('retry: 1500\ndata: connected\n\n');
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  // Parse path
  let safePath = path.normalize(decodeURI(req.url.split('?')[0]));
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(ROOT_DIR, safePath);

  // Security check: ensure within root
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 handler
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <div style="font-family: system-ui, sans-serif; padding: 40px; text-align: center;">
          <h2>404 — Resource Not Found</h2>
          <p>Requested: <code>${safePath}</code></p>
          <a href="/index.html" style="color: #7c3aed; font-weight: bold;">Return to Dashboard</a>
        </div>
      `);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Server Error');
        return;
      }

      // Inject live reload script for HTML files
      if (ext === '.html') {
        let htmlStr = content.toString('utf8');
        if (htmlStr.includes('</body>')) {
          htmlStr = htmlStr.replace('</body>', `${LIVE_RELOAD_SCRIPT}\n</body>`);
        } else {
          htmlStr += LIVE_RELOAD_SCRIPT;
        }
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache'
        });
        res.end(htmlStr);
      } else {
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache'
        });
        res.end(content);
      }
    });
  });
}

/**
 * Start Server with Port Fallback
 */
function startServer(port) {
  const server = http.createServer(handleRequest);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[LiveServer] Port ${port} is occupied, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('[LiveServer] Fatal error:', err);
    }
  });

  server.listen(port, () => {
    setupWatcher();
    console.log('\n======================================================');
    console.log('⚡ FinSight Live Development Server Running!');
    console.log(`🌐 Dashboard:     http://localhost:${port}/index.html`);
    console.log(`🏦 Accounts Hub:  http://localhost:${port}/accounts.html`);
    console.log(`🎯 Goals Hub:     http://localhost:${port}/goals.html`);
    console.log(`💸 Transactions:  http://localhost:${port}/transactions.html`);
    console.log(`📈 Analytics:     http://localhost:${port}/analytics.html`);
    console.log('======================================================');
    console.log('👀 Watching files for live auto-reloading (Ctrl+C to stop)\n');
  });
}

// Start
startServer(DEFAULT_PORT);

