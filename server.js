'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT || 4173);
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:latest';
const ROOT = __dirname;
const MAX_BODY = 64 * 1024;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function send(res, status, data, type = 'application/json; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer'
  });
  res.end(type.startsWith('application/json') ? JSON.stringify(data) : data);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (Buffer.byteLength(raw) > MAX_BODY) {
        reject(Object.assign(new Error('Request too large (64 KB maximum).'), { status: 413 }));
        req.destroy();
      }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); }
      catch { reject(Object.assign(new Error('Invalid JSON body.'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}

async function ollama(pathname, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5 * 60 * 1000);
  try {
    const response = await fetch(new URL(pathname, OLLAMA_URL), {
      ...options,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { error: text.slice(0, 1000) }; }
    if (!response.ok) throw Object.assign(new Error(data.error || 'Ollama request failed.'), { status: response.status });
    return data;
  } finally {
    clearTimeout(timer);
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${HOST}:${PORT}`);

  if (req.method === 'GET' && url.pathname === '/api/health') {
    try {
      const data = await ollama('/api/tags');
      return send(res, 200, {
        ok: true,
        mode: 'local-ollama',
        ollama: OLLAMA_URL,
        model: DEFAULT_MODEL,
        models: (data.models || []).map(m => m.name)
      });
    } catch (error) {
      return send(res, 503, {
        ok: false,
        mode: 'local-ollama',
        error: 'Ollama is not reachable. Start Ollama and confirm it is running.',
        detail: error.message
      });
    }
  }

  if (req.method === 'GET' && url.pathname === '/api/models') {
    try {
      const data = await ollama('/api/tags');
      return send(res, 200, { models: (data.models || []).map(m => m.name), defaultModel: DEFAULT_MODEL });
    } catch (error) {
      return send(res, 503, { error: 'Cannot read local Ollama models.', detail: error.message });
    }
  }

  if (req.method === 'POST' && url.pathname === '/api/chat') {
    try {
      const body = await readJson(req);
      const message = typeof body.message === 'string' ? body.message.trim() : '';
      const model = typeof body.model === 'string' && /^[a-zA-Z0-9._:-]{1,100}$/.test(body.model)
        ? body.model : DEFAULT_MODEL;
      if (!message) return send(res, 400, { error: 'Message is required.' });
      if (message.length > 12000) return send(res, 400, { error: 'Message is too long (12,000 characters maximum).' });
      const result = await ollama('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          model,
          stream: false,
          messages: [{ role: 'user', content: message }]
        })
      });
      return send(res, 200, {
        model: result.model || model,
        response: result.message?.content || '',
        done: Boolean(result.done)
      });
    } catch (error) {
      const status = error.status || (error.name === 'AbortError' ? 504 : 502);
      return send(res, status, { error: error.message || 'Local model request failed.' });
    }
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, { error: 'Method not allowed.' });
  }

  let pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const filePath = path.resolve(ROOT, '.' + pathname);
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== path.join(ROOT, 'index.html')) {
    return send(res, 403, { error: 'Forbidden.' });
  }

  fs.readFile(filePath, (error, buffer) => {
    if (error) return send(res, 404, { error: 'Not found.' });
    res.writeHead(200, {
      'Content-Type': mime[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer'
    });
    res.end(req.method === 'HEAD' ? undefined : buffer);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Nova local mode: http://${HOST}:${PORT}`);
  console.log(`Ollama endpoint: ${OLLAMA_URL}`);
  console.log(`Model: ${DEFAULT_MODEL}`);
  console.log('Local-only binding: this server is not exposed to your network.');
});
