// Servidor local para probar el prototipo sin Vercel: node server.js
// Sirve los archivos estáticos y la ruta /api/chat usando las variables de .env
const http = require('http');
const fs = require('fs');
const path = require('path');

// Carga simple de .env (sin dependencias)
try {
  fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
} catch (e) { console.warn('No se encontró .env; usa las variables de entorno del sistema.'); }

const handler = require('./api/chat.js');
const PORT = process.env.PORT || 3000;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json' };

http.createServer((req, res) => {
  // Adaptadores mínimos para usar el mismo handler que en Vercel
  res.status = c => { res.statusCode = c; return res; };
  res.json = o => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); };

  if (req.url.startsWith('/api/chat')) {
    let raw = '';
    req.on('data', c => { raw += c; if (raw.length > 50_000) req.destroy(); });
    req.on('end', () => { try { req.body = JSON.parse(raw || '{}'); } catch (e) { req.body = {}; } handler(req, res); });
    return;
  }
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(__dirname, urlPath === '/' ? 'index.html' : urlPath);
  if (!file.startsWith(__dirname) || file.includes(`${path.sep}api${path.sep}`) || path.basename(file).startsWith('.')) { res.statusCode = 403; res.end('Prohibido'); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.statusCode = 404; res.end('No encontrado'); return; }
    res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
}).listen(PORT, () => console.log(`Matex prototipo en http://localhost:${PORT}`));
