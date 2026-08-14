import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const dist = path.resolve(__dirname, '..', 'dist');
const port = Number(process.env.PORT || 4322);

const rules = fs.readFileSync(path.join(dist, '_headers'), 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'));

const grouped = {};
let currentPaths = [];
for (const line of rules) {
  if (line.startsWith('/')) {
    // Multiple comma-separated paths supported
    currentPaths = line.split(',').map((p) => p.trim()).filter(Boolean);
    for (const p of currentPaths) if (!grouped[p]) grouped[p] = [];
    continue;
  }
  const idx = line.indexOf(':');
  if (idx < 0) continue;
  const headerName = line.slice(0, idx).trim();
  const headerValue = line.slice(idx + 1).trim();
  if (!headerName) continue;
  for (const p of currentPaths) grouped[p].push([headerName, headerValue]);
}

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function matchRule(reqPath, rulePath) {
  if (rulePath === '/') return reqPath === '/' || reqPath.endsWith('/');
  if (rulePath.endsWith('/*')) return reqPath.startsWith(rulePath.slice(0, -2));
  if (rulePath.startsWith('/*.')) return reqPath.endsWith(rulePath.slice(1));
  return reqPath === rulePath || reqPath === rulePath + '/' || reqPath === rulePath + '/index.html';
}

function applyHeaders(req, res) {
  for (const rulePath of Object.keys(grouped)) {
    if (matchRule(req.url, rulePath)) {
      for (const [name, value] of grouped[rulePath]) res.setHeader(name, value);
    }
  }
}

function serve(req, res) {
  applyHeaders(req, res);
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  else if (!path.extname(p)) p += '/index.html';
  const filePath = path.join(dist, p);
  if (!filePath.startsWith(dist)) {
    res.writeHead(403); return res.end('Forbidden');
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA-style fallback to 404.html
      fs.readFile(path.join(dist, '404.html'), (e2, d2) => {
        if (e2) { res.writeHead(404); return res.end('Not Found'); }
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(d2);
      });
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

http.createServer(serve).listen(port, () => console.log(`preview (with _headers) on http://127.0.0.1:${port}`));