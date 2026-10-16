// Función serverless (Vercel) que conecta el chat de la tienda con OpenRouter.
// La API key se lee de la variable de entorno OPENROUTER_API_KEY y nunca llega al navegador.
const SYSTEM_PROMPT = require('./_system-prompt.js');

const DEFAULT_FALLBACKS = [
  'nvidia/nemotron-3-super-120b-a12b:free',
  'openrouter/free',
  'google/gemma-4-31b-it:free'
];
const MAX_MSGS = 12;
const MAX_CHARS = 1200;

// Límite simple por IP (por instancia) para evitar abuso de la key en la demo
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter(t => now - t < 60_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 15;
}

function cleanMessages(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_MSGS)
    .map(m => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
}

function contextText(ctx) {
  if (!ctx || typeof ctx !== 'object') return '';
  const allowed = ['pagina', 'producto', 'color', 'precio', 'unidad', 'stock_color', 'carrito'];
  const lines = allowed.filter(k => ctx[k] !== undefined && ctx[k] !== '').map(k => `- ${k}: ${String(ctx[k]).slice(0, 200)}`);
  return lines.length ? `\n\n# CONTEXTO ACTUAL DE LA TIENDA (dato del sistema, no del usuario)\n${lines.join('\n')}` : '';
}

async function callModel(model, messages, key, referer) {
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': referer || 'https://matex-ecommerce.vercel.app',
      'X-Title': 'Matex Asesor Virtual (prototipo INACAP)'
    },
    body: JSON.stringify({ model, messages, temperature: 0.4, max_tokens: 600 })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((data.error && data.error.message) || `HTTP ${r.status}`);
  const text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  if (!text || !text.trim()) throw new Error('respuesta vacía');
  return text.trim();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Método no permitido' }); return; }
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) { res.status(500).json({ error: 'Falta configurar OPENROUTER_API_KEY en el servidor' }); return; }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'local';
  if (rateLimited(ip)) { res.status(429).json({ error: 'Demasiadas consultas, espera un minuto' }); return; }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const msgs = cleanMessages(body && body.messages);
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') { res.status(400).json({ error: 'Mensaje inválido' }); return; }

  const messages = [{ role: 'system', content: SYSTEM_PROMPT + contextText(body.context) }, ...msgs];
  const primary = process.env.OPENROUTER_MODEL || DEFAULT_FALLBACKS[0];
  const fallbacks = (process.env.OPENROUTER_FALLBACK_MODELS || DEFAULT_FALLBACKS.join(','))
    .split(',').map(s => s.trim()).filter(Boolean);
  const models = [primary, ...fallbacks.filter(m => m !== primary)];

  const errors = [];
  for (const model of models) {
    try {
      const reply = await callModel(model, messages, key, req.headers.origin);
      res.status(200).json({ reply, model });
      return;
    } catch (e) {
      errors.push(`${model}: ${e.message}`);
    }
  }
  console.error('Todos los modelos fallaron:', errors.join(' | '));
  res.status(502).json({ error: 'El asistente no está disponible en este momento' });
};
