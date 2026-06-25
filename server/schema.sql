CREATE TABLE IF NOT EXISTS assets (
  id            TEXT PRIMARY KEY,
  category      TEXT          NOT NULL,
  name          TEXT          NOT NULL,
  ticker        TEXT          NOT NULL DEFAULT '',
  institution   TEXT          NOT NULL DEFAULT '',
  quantity      DECIMAL(24,8) NOT NULL DEFAULT 0,
  buy_price     DECIMAL(24,4) NOT NULL DEFAULT 0,
  manual_value  DECIMAL(24,4),
  current_price DECIMAL(24,4) NOT NULL DEFAULT 0,
  logo_url      TEXT,
  last_updated  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO settings (key, value) VALUES ('usd_to_idr', '15800')
  ON CONFLICT (key) DO NOTHING;
