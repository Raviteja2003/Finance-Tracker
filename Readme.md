# 💰 Finance Tracker

A multi-account personal finance tracker with budgets, CSV import, analytics,
and an AI chatbot with real function-calling over your own financial data.

Built to go deep on **Redux Toolkit (slices) vs Context API** — domain data
lives in Redux, theme/UI state lives in Context, on purpose, as a learning
exercise.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite + Tailwind CSS v4 + Redux Toolkit + RTK Query + React Router |
| Backend | FastAPI + Python + SQLAlchemy + JWT Auth |
| Database | PostgreSQL |
| AI | Google Gemini API with function-calling |
| DevOps | Docker + Docker Compose + GitHub Actions |

---

## Project Structure

```text
finance-tracker/
├── docker-compose.yml
├── .env.example
├── .github/workflows/deploy.yml
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── config.py
│       ├── db.py
│       ├── models/         # user, account, transaction, category, budget, chat_session
│       ├── schemas/        # auth, account, transaction, category, budget, csv_import, chatbot
│       ├── services/       # csv_import_service, analytics_service, budget_service, chatbot_service
│       └── api/            # deps, auth, accounts, transactions, categories, budgets, analytics, chatbot
│
└── frontend/
    ├── Dockerfile
    ├── vite.config.ts       # Tailwind v4 via @tailwindcss/vite plugin
    ├── package.json
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css         # @theme tokens + @custom-variant dark
        ├── context/
        │   └── ThemeContext.tsx   # dark/light mode — Context API
        ├── store/
        │   ├── store.ts
        │   └── slices/            # auth, accounts, transactions, categories, budgets, filters, chatbot
        ├── api/
        │   └── baseApi.ts         # RTK Query base
        ├── components/            # Header, Sidebar, ProtectedRoute, AppLayout
        └── pages/                 # LandingPage, Login, Register, Dashboard, Accounts,
                                    # Transactions, Budgets, Analytics, ChatAssistant
```

---

## Getting Started

### Prerequisites
- Docker + Docker Compose
- A [Google Gemini API key](https://aistudio.google.com/app/apikey) (free tier)

### 1. Configure environment

```bash
cp .env.example .env
# then edit .env and fill in SECRET_KEY and GEMINI_API_KEY
```

### 2. Start the app

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

---

## Roadmap

- [ ] **Phase 1 — Foundation**: Docker Compose, FastAPI auth, React shell
      (ThemeContext, responsive Sidebar/Header, LandingPage), Redux store +
      authSlice + RTK Query base, Accounts CRUD
- [ ] **Phase 2 — Redux depth**: `filtersSlice` + selectors shared across
      Transactions/Analytics/Dashboard, optimistic updates
- [ ] **Phase 3 — Budgets**: CRUD, progress bars, overspend warnings
- [ ] **Phase 4 — CSV Import**: upload, column-mapping preview, dedup
- [ ] **Phase 5 — Analytics**: spending trends, category breakdown, net worth charts
- [ ] **Phase 6 — Chatbot**: Gemini function-calling, chat UI, session history

---

## Deployment

Target: **$0 cost**.

- Frontend → Netlify
- Backend → Render (free tier, cold starts after inactivity)
- Database → Supabase Postgres (free tier, pauses after 1 week idle)
- AI → Gemini free tier (rate-limited)

GitHub `production` Environment holds scoped secrets (`DATABASE_URL`,
`GEMINI_API_KEY`, `SECRET_KEY`, `RENDER_DEPLOY_HOOK_URL`, `NETLIFY_AUTH_TOKEN`,
`NETLIFY_SITE_ID`), restricted to deploys from `main`.

---

## License

MIT License — feel free to use, modify, and distribute.
