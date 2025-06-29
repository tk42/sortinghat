# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
SortingHat is a Japanese educational SaaS platform for teachers to solve student seat allocation and team formation using mathematical optimization. The system uses MI (Multiple Intelligence) scores and various constraints to create optimal student teams.

## Architecture
This is a multi-service application with three main components:

### Frontend (Next.js/React)
- **Path**: `frontend/`
- **Framework**: Next.js 14 with TypeScript, TailwindCSS, DaisyUI
- **Authentication**: Firebase Auth
- **Payment**: Stripe integration
- **Key Features**: Teacher dashboard, class management, survey creation, team matching visualization

### API (FastAPI)
- **Path**: `api/`
- **Framework**: FastAPI with Python
- **Core Service**: Mathematical optimization using PuLP library
- **Purpose**: Handles team matching algorithms and optimization logic

### Backend (GraphQL/Hasura)
- **Path**: `backend/`
- **Database**: PostgreSQL with Hasura GraphQL engine
- **Schema Management**: SQL migrations in `backend/sql/schema/`
- **Code Generation**: Uses SQLC for TypeScript type generation

## Development Commands

### Frontend Development
```bash
cd frontend
yarn dev          # Start development server on port 3000
yarn build        # Build for production
yarn start        # Start production server
yarn lint         # Run ESLint
```

### API Development
```bash
cd api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000  # Start API server
```

### Full Stack Development
```bash
# Start all services with Docker Compose
docker-compose -f docker-compose.local.yml up

# Services:
# - Frontend: http://localhost:3000
# - API: http://localhost:3001
# - Hasura GraphQL: http://localhost:8080
# - PostgreSQL: localhost:5432
```

### Database Operations
```bash
cd backend
# Generate TypeScript types from SQL
sqlc generate
```

## Key Data Models

### Student Constraints (`api/models/match.py`)
- MI scores (mi_a through mi_h): Multiple Intelligence assessments (1-8 scale)
- Demographics: sex, student_no, previous team assignments
- Preferences: leader capability, eyesight requirements
- Social constraints: student dislikes

### Optimization Constraints (`frontend/src/lib/interfaces.ts`)
- Team size limits (`members_per_team`)
- Gender balance requirements (`at_least_one_pair_sex`, `girl_geq_boy`, `boy_geq_girl`)
- Leadership requirements (`at_least_one_leader`)
- Previous team diversity (`unique_previous`)
- Score balancing coefficient (`group_diff_coeff`)

## Core Optimization Logic
The matching algorithm (`api/services/match.py`) uses linear programming with PuLP to:
1. Minimize score differences between teams
2. Enforce hard constraints (team size, gender balance, dislikes)
3. Apply soft constraints (eyesight grouping with penalty functions)
4. Handle previous team history to ensure variety

## GraphQL Integration
- Frontend communicates with Hasura GraphQL engine
- Database operations handled through `frontend/src/utils/actions/` 
- Type-safe operations using generated interfaces from `frontend/src/lib/interfaces.ts`

## Authentication & Payment
- Firebase Admin SDK for server-side auth (`frontend/src/utils/firebase/admin.ts`)
- Stripe integration for subscription management (`frontend/app/api/stripe/`)
- Japanese market focus with specialized payment methods

## CSV Data Processing
- Class roster uploads: `frontend/public/sample/class.csv`
- Survey data imports: `frontend/public/sample/survey.csv`
- Validation in `frontend/src/utils/actions/create_student_preferences.ts`

## Testing & Deployment
- Frontend uses Next.js built-in development tools
- No specific test framework configured - check with user before running tests
- Docker-based deployment with multi-stage builds
- Environment variables managed through `.env` files for each service