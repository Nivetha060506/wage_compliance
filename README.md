# Tamil Nadu Labour Department Wage Compliance Monitoring & Inspection Portal

A decision-support prototype for managing the wage-compliance journey: registration, verification, compliance reporting, explainable risk assessment, inspection assignment, findings, notices and corrective actions. It deliberately preserves human judgment: a Compliance Risk Score recommends priority review; it is not a legal conclusion.

## What is included

- Role-secured JWT API for Super Admin, District Admin, Inspector and Employer
- District-scoped records and server-side authorization checks
- Deterministic, versioned and explainable 0–100 Compliance Risk Engine
- Inspection priority queue, registration verification, compliance submission, inspection reporting and notice APIs
- Audit entries and in-app notification records
- Responsive React administration dashboard connected to live API data
- Demo data across low, medium, high and critical risk levels

## Risk methodology

The engine stores each score, maximum and reason. Configured factor maxima total 100: unresolved confirmed findings (25), reported wage concerns (25), overdue notices (15), missing records (10), late submissions (10), time since inspection (10), and reporting anomalies (5). Levels: Low 0–30, Medium 31–60, High 61–80, Critical 81–100. Inputs produce identical results every time.

`Compliance Risk Score is an administrative decision-support indicator generated from available system data. It does not establish that an establishment has violated any law. Final inspection and enforcement decisions remain with authorized Labour Department officials.`

## Run locally

1. Copy `backend/.env.example` to `backend/.env` and set a strong `JWT_SECRET`.
2. Run `npm install` from the repository root.
3. Run `npm run dev`.
4. Open `http://localhost:5173`.

The current portable demo uses an in-memory seeded repository so it runs immediately without infrastructure; `MONGODB_URI` is reserved for production persistence. Before production, attach Mongoose repository implementations to a managed MongoDB deployment, use object storage for evidence, rotate secrets, and configure a restrictive CORS origin.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Labour Department Officer | officer@example.com | Demo@123 |
| Labour Inspector | inspector@example.com | Demo@123 |
| Employer | employer@example.com | Demo@123 |

## API groups

`/api/auth`, `/api/dashboard`, `/api/establishments`, `/api/compliance`, `/api/risk/priority-queue`, `/api/inspections`, `/api/notices`, and `/api/audit-logs` return `{ success, message, data }`. Sensitive routes require a Bearer token and verify role/scope on the server.

## Tests

Run `npm test` to verify the risk engine's clean case, maximum cap, deterministic output and level boundaries.

## Domain and security notes

Legal-reference fields are configurable; demo content uses **Sample / Demonstration Reference** only. The API applies Helmet, CORS, rate limiting, password hashing, JWT expiry, validation and authorization. Add virus scanning, MIME-sniffed evidence upload, refresh-token storage, database backups and full correction approval controls before any operational deployment.
