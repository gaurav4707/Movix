# Movix

Full-stack demo showcasing a MySQL-backed movie database plus a modern Vite/React UI.

## Project Structure

```
./
├── backend/                  # Flask API that proxies SQL queries to MySQL
│   └── server.py             # Handles /query endpoint with CORS headers
├── database/                 # Raw SQL assets
│   └── init.sql              # Schema + seed data for movix_db
├── movix-database-showcase/  # Frontend (Vite + React + Tailwind)
│   ├── src/pages/Index.tsx   # Contains SQL Runner UI wired to backend
│   ├── src/components/       # UI primitives (buttons, cards, etc.)
│   └── package.json          # Frontend dependencies/scripts
└── README.md
```

## Getting Started

1. **Install dependencies**
   ```powershell
   cd movix-database-showcase
   npm install
   ```
2. **Configure MySQL credentials** (used by `backend/server.py`):
   ```powershell
   cd ..\backend
   $env:DB_PASSWORD = "your_mysql_password"
   # optionally DB_USER, DB_HOST, DB_NAME
   ```
3. **Run the backend**
   ```powershell
   C:\Users\gkv47\Downloads\krish\.venv\Scripts\python.exe server.py
   ```
4. **Run the frontend**
   ```powershell
   cd ..\movix-database-showcase
   npm run dev
   ```
5. Visit the dev server (usually `http://localhost:5173`) and use the SQL Runner at the bottom of the page.

## Deployment Notes

- The SQL Runner issues requests to `http://localhost:5000/query`. Update that URL or provide a proxy when deploying.
- Backend enforces CORS via an `after_request` hook; tighten origins before production.
- Database credentials are sourced from environment variables (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
