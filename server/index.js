require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// ── DB init ────────────────────────────────────────────────────────────────

async function initDb() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('Database schema ready');
}

// ── Helpers ────────────────────────────────────────────────────────────────

function rowToAsset(row) {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    ticker: row.ticker,
    institution: row.institution,
    quantity: parseFloat(row.quantity),
    buyPrice: parseFloat(row.buy_price),
    manualValue: row.manual_value != null ? parseFloat(row.manual_value) : undefined,
    currentPrice: parseFloat(row.current_price),
    logoUrl: row.logo_url ?? undefined,
    lastUpdated: row.last_updated instanceof Date
      ? row.last_updated.toISOString()
      : row.last_updated,
  };
}

// ── Assets ─────────────────────────────────────────────────────────────────

app.get('/api/assets', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM assets ORDER BY last_updated DESC'
    );
    res.json(rows.map(rowToAsset));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/assets', async (req, res) => {
  const a = req.body;
  try {
    await pool.query(
      `INSERT INTO assets
         (id, category, name, ticker, institution, quantity,
          buy_price, manual_value, current_price, logo_url, last_updated)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        a.id, a.category, a.name, a.ticker ?? '', a.institution ?? '',
        a.quantity ?? 0, a.buyPrice ?? 0,
        a.manualValue ?? null,
        a.currentPrice ?? 0,
        a.logoUrl ?? null,
        a.lastUpdated ?? new Date().toISOString(),
      ]
    );
    res.status(201).json(a);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/assets/:id', async (req, res) => {
  const a = req.body;
  const { id } = req.params;
  try {
    await pool.query(
      `UPDATE assets
         SET category=$1, name=$2, ticker=$3, institution=$4, quantity=$5,
             buy_price=$6, manual_value=$7, current_price=$8, logo_url=$9,
             last_updated=$10
       WHERE id=$11`,
      [
        a.category, a.name, a.ticker ?? '', a.institution ?? '',
        a.quantity ?? 0, a.buyPrice ?? 0,
        a.manualValue ?? null,
        a.currentPrice ?? 0,
        a.logoUrl ?? null,
        a.lastUpdated ?? new Date().toISOString(),
        id,
      ]
    );
    res.json(a);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/assets/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM assets WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Settings ───────────────────────────────────────────────────────────────

app.get('/api/settings', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT key, value FROM settings');
    const result = {};
    for (const row of rows) result[row.key] = row.value;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  const { key, value } = req.body;
  try {
    await pool.query(
      `INSERT INTO settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [key, String(value)]
    );
    res.json({ key, value });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Serve Expo web build ───────────────────────────────────────────────────

const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // SPA fallback — let expo-router handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) =>
    res.send('API is running. Build the web app first: npm run build:web')
  );
}

// ── Start ──────────────────────────────────────────────────────────────────

initDb()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => { console.error('DB init failed:', err); process.exit(1); });
