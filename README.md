# NetHubKe Monorepo

This monorepo contains the full scaffold for **NetHubKe**, a centralized Authorization Server and parent platform for your ecosystem of microservices. It integrates **Keycloak** for authentication and **FastAPI** for authorization, with a **Next.js frontend** for administration and user management.

---

## 📁 Repository Structure

```
NetHubKe/
├─ apps/
│  ├─ backend/               # FastAPI backend (Authorization Server)
│  ├─ frontend/              # Next.js frontend (Landing/Admin)
│  └─ services/              # Additional microservices (optional)
├─ packages/                 # Shared code (TypeScript types, utils)
├─ docker-compose.yml        # Local dev environment orchestration
├─ .env                      # Environment variables
├─ pnpm-workspace.yaml       # Monorepo package management
└─ README.md
```

### **Backend (`apps/backend`)**
- `main.py`: FastAPI app entrypoint. Mounts routers, handles middleware.
- `api/v1/`: Versioned API endpoints.
  - `users.py`: User-related endpoints.
  - `roles.py`: Role management endpoints.
  - `auth.py`: Authorization endpoints and token validation.
- `core/`
  - `config.py`: Environment configuration (DB, Keycloak, secrets).
  - `security.py`: JWT validation, permission checks, Keycloak utilities.
- `models/` & `schemas/`: Pydantic & SQLAlchemy models and schemas.
- `services/keycloak.py`: Abstraction layer for Keycloak API calls.
- `tests/`: Backend unit and integration tests.

### **Frontend (`apps/frontend`)**
- `pages/`: Next.js pages
  - `index.tsx`: Public landing page.
  - `login.tsx`: Login redirect / callback.
  - `admin/users.tsx`: Admin dashboard for managing users.
- `components/`: UI components (e.g., Layout, tables).
- `lib/auth.ts`: JWT handling and API wrapper.
- `styles/`: Tailwind CSS and other styles.

### **Shared Packages (`packages`)**
- `types/index.ts`: TypeScript interfaces shared between frontend and backend.

---

## ⚙️ Technology Stack

- **Backend**: FastAPI, Pydantic, SQLAlchemy/Postgres
- **Frontend**: Next.js, TypeScript, Tailwind CSS, Radix UI
- **Authentication**: Keycloak (OIDC/JWT)
- **Authorization**: FastAPI middleware (role & permission checks)
- **Database**: PostgreSQL (dev or production)
- **Optional**: Redis for caching roles and sessions

---

## 🚀 Getting Started (Development)

1. **Copy environment variables**  

```bash
cp .env.example .env
```

Update `.env` with your Keycloak, DB, and secret settings.

2. **Install dependencies**

**Backend:**

```bash
cd apps/backend
pip install -r requirements.txt
```

**Frontend:**

```bash
cd apps/frontend
pnpm install   # or npm install
```

3. **Run services with Docker Compose**

```bash
docker-compose up -d
```

This will spin up:

* Keycloak
* PostgreSQL
* FastAPI backend
* Next.js frontend

4. **Access services**

* Frontend: `http://localhost:3000`
* FastAPI docs: `http://localhost:8000/docs`
* Keycloak admin: `http://localhost:8080`

---

## 🔑 Authentication & Authorization Flow

1. User accesses the frontend and logs in via Keycloak.
2. Keycloak issues a JWT.
3. Frontend sends the JWT with API requests to FastAPI backend.
4. FastAPI validates the JWT and enforces permissions before returning data.
5. Microservices rely on backend authorization decisions — they **do not** directly validate Keycloak tokens.

---

## 📝 Notes

* This scaffold is production-ready but requires configuration of:

  * Keycloak realms, clients, and roles
  * Backend environment variables
  * Frontend OIDC redirect URIs
* Microservices should trust backend authorization for secure access control.
* The monorepo supports additional microservices in `apps/services/` with shared types in `packages/types`.

---

## 📖 References

* [FastAPI](https://fastapi.tiangolo.com/)
* [Next.js](https://nextjs.org/)
* [Keycloak](https://www.keycloak.org/)
* [Tailwind CSS](https://tailwindcss.com/)
