# Job Application Portal

A full-stack LinkedIn/Indeed-inspired job application platform — Portfolio Project 23.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.2, Java 17 |
| Primary DB | PostgreSQL 16 (Users, Companies, Jobs, Applications) |
| Document DB | MongoDB 7 (Resumes, Job Descriptions) |
| Cache | Redis 7 (job search, 5-min TTL) |
| Auth | JWT (JJWT 0.12.3) + Spring Security RBAC |
| File Storage | AWS S3 (resumes, avatars, logos) |
| Email | Spring Mail — async status notifications |
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| State | Zustand + TanStack Query |
| Docker | Docker Compose (all 5 services) |

## Features

**Seeker** — search/filter jobs, save jobs, apply with cover letter, resume upload (PDF parsed for skills), application timeline dashboard, skill-matched recommendations

**Employer** — post jobs (rich descriptions in MongoDB), Kanban board (Applied → Screening → Interview → Offered/Rejected), auto email on every status change

**General** — dual-role registration, company profiles, Redis-cached search, JWT auth with user ID as subject

## Local Development

Prerequisites: Java 21, Maven, Node 20+, PostgreSQL, MongoDB, Redis running locally.

```bash
# Backend — uses ./mvnw wrapper (forces Java 21; system default may differ)
cd backend && ./mvnw spring-boot:run
# → http://localhost:8080

# Frontend — Vite proxies /api → 8080 (no CORS config needed)
cd frontend && npm install && npm run dev
# → http://localhost:5173
```

Default database connections (override via env vars):
- PostgreSQL: `localhost:5432/jobportal` (`POSTGRES_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`)
- MongoDB: `localhost:27017/jobportal` (`MONGODB_URI`)
- Redis: `localhost:6379` (`REDIS_HOST`, `REDIS_PORT`)

## Docker — Full Stack

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/api |
| PostgreSQL | localhost:5432 |
| MongoDB | localhost:27017 |
| Redis | localhost:6379 |

**Optional env vars** (create a `.env` file at project root):

```env
JWT_SECRET=<base64 string, min 64 chars>
MAIL_HOST=smtp.gmail.com
MAIL_USERNAME=you@gmail.com
MAIL_PASSWORD=your-app-password
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=jobportal-resumes
AWS_REGION=us-east-1
```

S3 and email both degrade gracefully when credentials are missing (S3 falls back to default credentials chain; email simply fails silently).

## Project Structure

```
JobApplicationPortal/
├── backend/src/main/java/com/jobportal/
│   ├── config/          # SecurityConfig, RedisConfig, S3Config
│   ├── controller/      # 6 REST controllers
│   ├── document/        # MongoDB: Resume, JobDescription
│   ├── dto/             # Request / Response DTOs
│   ├── entity/          # JPA: User, Job, Application, Company
│   ├── exception/       # GlobalExceptionHandler
│   ├── repository/      # Spring Data JPA + MongoDB repos
│   ├── security/        # JwtUtil, JwtAuthFilter, UserDetailsServiceImpl
│   └── service/         # 8 services (Auth, Job, Application, Company,
│                        #             User, Resume, Email, Recommendation)
├── frontend/src/
│   ├── api/             # Axios clients (auth, jobs, applications, companies)
│   ├── components/      # Navbar, JobCard
│   ├── pages/           # HomePage, JobList, JobDetail, SeekerDashboard,
│   │                    #   EmployerDashboard, KanbanBoard, JobPostForm,
│   │                    #   Login, Register, Companies
│   ├── store/           # Zustand auth store (persisted)
│   └── types/           # Shared TypeScript types
├── docker-compose.yml
└── README.md
```

## Key API Endpoints

| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register (seeker or employer) |
| POST | `/api/auth/login` | Public | Login → JWT |
| GET | `/api/jobs` | Public | Paginated search with filters |
| GET | `/api/jobs/:id` | Public | Job detail + MongoDB description |
| POST | `/api/jobs` | Employer | Create job |
| PATCH | `/api/jobs/:id/close` | Employer | Close listing |
| POST | `/api/jobs/:id/save` | Seeker | Toggle saved |
| GET | `/api/recommendations` | Seeker | Skill-matched jobs |
| POST | `/api/applications` | Seeker | Apply to a job |
| PATCH | `/api/applications/:id/status` | Employer | Kanban status update |
| POST | `/api/users/resume` | Seeker | Upload + parse PDF resume |
| GET | `/api/companies/:id/profile` | Public | Company + open jobs |
