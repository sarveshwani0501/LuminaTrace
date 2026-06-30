# LuminaTrace

LuminaTrace is an open-source application monitoring system for Node.js services. You instrument your app with a small SDK, and everything — logs, metrics, distributed traces, and alerts — shows up in a real-time dashboard. No agents to manage, no external SaaS dependency.

The project has two parts: the platform you deploy (this repository) and the [Node.js SDK](https://github.com/sarveshwani0501/luminatrace-js) your applications install.

---

## What it does

**Real-time log streaming.** Every log your service writes is streamed to the dashboard the moment it happens. You can filter by severity level, search by message or trace ID, and inspect the full metadata attached to each entry.

**Metrics and performance charts.** The dashboard tracks CPU usage, memory, response time, throughput, error rate, and active connections for every server in your fleet. Charts update live and support time windows from 15 minutes to 7 days.

**Distributed tracing.** Each request gets a trace ID that follows it through every function or service it touches. You can see the full span waterfall — what ran, in what order, and how long each step took.

**Threshold alerts.** You define a rule: if metric X on server Y crosses value Z, send an email. When the metric recovers, the alert resolves itself automatically. Rules are managed from the dashboard.

**Uptime monitoring.** Add any public URL and LuminaTrace will check it continuously. You get an incident recorded the moment it goes down, with response time history.

**Server health.** Every server running the SDK registers itself automatically on first run. You can see online/offline status, CPU load, and memory usage across your entire fleet in one view.

**Multi-tenant workspaces.** You can create an organization, invite teammates by email, and manage multiple projects. Each project gets its own isolated data and API key.

---

## Architecture

```
Your Node.js App
  └── luminatrace SDK
        ├── HTTP ingest  ──► POST /ingest/logs
        ├── HTTP ingest  ──► POST /ingest/metrics
        └── HTTP ingest  ──► POST /ingest/spans
                                  │
                             Fastify Backend
                                  │
                            Kafka (KRaft mode)
                    ┌─────────────┼─────────────┐
               logsWorker   metricsWorker   spansWorker
                    │             │               │
                         TimescaleDB
                                  │
                    Fastify REST API + Socket.io
                                  │
                           React Frontend
```

Data flows in one direction. The SDK sends HTTP requests to the ingest endpoints. The backend publishes those to three Kafka topics (`luminatrace.logs`, `luminatrace.metrics`, `luminatrace.spans`). Three workers consume those topics, persist data to TimescaleDB, evaluate alert rules, and emit Socket.io events so the frontend updates live without polling.

Redis is used for OTP codes (email verification, password reset) and session-adjacent caching.

---

## Tech stack

**Backend**
- [Fastify](https://fastify.dev/) — HTTP server and REST API
- [KafkaJS](https://kafka.js.org/) — Kafka producer and consumers
- [Socket.io](https://socket.io/) — real-time push to the frontend
- [TimescaleDB](https://www.timescale.com/) — time-series data on top of PostgreSQL
- [Redis](https://redis.io/) — OTP storage and ephemeral state
- [Nodemailer](https://nodemailer.com/) — alert emails and OTP delivery

**Frontend**
- [React](https://react.dev/) with [Vite](https://vitejs.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/) for global state (auth, org, project)
- [React Router v6](https://reactrouter.com/) for client-side routing
- [Recharts](https://recharts.org/) for metrics charts
- Vanilla CSS with a custom design token system

**Infrastructure**
- [Docker Compose](https://docs.docker.com/compose/) — runs all services together
- [Nginx](https://nginx.org/) — reverse proxy and SSL termination
- [Certbot](https://certbot.eff.org/) — Let's Encrypt certificate management
- [Apache Kafka 3.7](https://kafka.apache.org/) in KRaft mode (no Zookeeper)

---

## Repository structure

```
LuminaTrace/
├── backend/
│   ├── src/
│   │   ├── modules/         # Feature modules (auth, logs, metrics, alerts, etc.)
│   │   │   ├── auth/
│   │   │   ├── ingest/
│   │   │   ├── logs/
│   │   │   ├── metrics/
│   │   │   ├── spans/
│   │   │   ├── alerts/
│   │   │   ├── servers/
│   │   │   ├── uptime/
│   │   │   ├── organizations/
│   │   │   ├── projects/
│   │   │   └── invites/
│   │   ├── kafka/
│   │   │   ├── workers/     # logsWorker, metricsWorker, spansWorker
│   │   │   ├── producer.js
│   │   │   ├── consumer.js
│   │   │   └── topics.js
│   │   └── server.js
│   ├── database/
│   │   └── init.sql         # Schema — all tables including TimescaleDB hypertables
│   └── Dockerfile
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── app/         # Dashboard, Logs, Metrics, Alerts, Servers, Settings
│       │   └── public/      # LandingPage, Docs, Pricing, Changelog, Legal
│       ├── components/
│       │   ├── layout/      # AppLayout, PrivateLayout, PublicLayout, Sidebar
│       │   ├── ui/          # Button, Badge, and other shared components
│       │   └── projects/    # CreateProjectModal, EmptyProjectState, etc.
│       ├── store/
│       │   └── slices/      # authSlice, orgSlice, projectSlice
│       └── api/             # API client modules per feature
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
└── .env.example
```

---

## Getting started

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (only needed if you want to run the frontend outside Docker)
- A Gmail account with an App Password, or any SMTP credentials

### 1. Clone the repository

```bash
git clone https://github.com/sarveshwani0501/LuminaTrace-Application-Log-Monitoring-System.git
cd LuminaTrace-Application-Log-Monitoring-System
```

### 2. Configure environment variables

Copy the example file and fill in your values.

```bash
cp .env.example .env
```

Open `.env` and set:

```env
# Database
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=luminatrace

# Redis
REDIS_PASSWORD=your_redis_password

# Security — generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=
SESSION_SECRET=

# The URL where your frontend is hosted (used in email links)
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

# SMTP — Gmail App Password works here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=LuminaTrace <your_email@gmail.com>
```

### 3. Start the backend and infrastructure

```bash
docker compose up -d
```

This starts TimescaleDB, Redis, Kafka, and the backend API. The database schema is applied automatically from `backend/database/init.sql` on first run.

The backend will be available at `http://localhost:3000`.

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server starts at `http://localhost:5173`.

### 5. Create an account

Open the frontend in your browser, click "Get started free", sign up, and verify your email with the OTP that gets sent. Create an organization and a project. The project creation dialog will show you a one-time API key — save it, you need it for the SDK.

---

## Using the SDK

Install the SDK in your Node.js app:

```bash
npm install luminatrace
```

Initialize it at the top of your entry file:

```javascript
import LuminaTrace from 'luminatrace';

const lumina = new LuminaTrace({
  apiKey: 'lt_your_project_api_key',
  serverName: 'my-api-server',   // optional — shows up in the Servers view
});
```

If you are using Express, add the middleware to get automatic request tracing and metrics:

```javascript
app.use(lumina.middleware());
```

For manual logging:

```javascript
lumina.log('info', 'User signed in', { userId: '123' });
lumina.log('error', 'Payment failed', { orderId: '8821', reason: 'timeout' });
```

For custom spans inside a trace:

```javascript
const span = lumina.startSpan('db.query', parentSpanId);
// ... do your work ...
lumina.endSpan(span.spanId, { rowCount: 42 });
```

The SDK sends data to your self-hosted backend over HTTP. The `apiKey` tells the backend which project the data belongs to. Metrics for CPU, memory, and active connections are collected and sent automatically on a regular interval — you do not need to instrument these manually.

The full SDK documentation is at [github.com/sarveshwani0501/luminatrace-js](https://github.com/sarveshwani0501/luminatrace-js).

---

## How data flows through the system

1. Your app calls the SDK, which makes an HTTP POST to `/ingest/logs`, `/ingest/metrics`, or `/ingest/spans`.
2. The backend validates the request, identifies the project from the API key, and publishes the payload to the corresponding Kafka topic.
3. One of the three Kafka workers (`logsWorker`, `metricsWorker`, `spansWorker`) picks up the message, writes it to TimescaleDB, and emits a Socket.io event on the project's room channel.
4. The frontend, if the user is on the matching dashboard page, receives the Socket.io event and updates the UI immediately — no polling.
5. The logs worker also evaluates all active alert rules for the project. If a metric crosses a configured threshold, it creates an alert event in the database and sends an email notification.

---

## Alert rules

In the dashboard, go to Alerts and create a rule. You set:

- The metric to watch (e.g. `cpu_usage`, `error_rate`, `response_time`)
- The condition (`>`, `<`, `>=`, `<=`, `==`)
- The threshold value
- The email address to notify
- Which server the rule applies to (or all servers in the project)

When a rule fires, LuminaTrace records the event with the timestamp and the value that triggered it. When the metric returns within bounds, the event is automatically resolved and the resolved timestamp is recorded. The Alerts page shows both active and resolved events, and computes the mean time to resolve across your history.

---

## Production deployment

The `docker-compose.yml` includes Nginx and Certbot for production use.

1. Point your domain's DNS to your server.
2. Update `nginx/nginx.conf` with your domain name.
3. Run Certbot to obtain a certificate:
   ```bash
   docker compose run --rm certbot certonly --webroot \
     -w /var/www/certbot \
     -d yourdomain.com
   ```
4. Start everything:
   ```bash
   docker compose up -d
   ```

In production, the database, Redis, and Kafka ports are not exposed to the host — they are only reachable inside the Docker network. Only ports 80 and 443 (Nginx) are public.

---

## Local development without Docker

If you want to run the backend directly without Docker during development:

```bash
cd backend
npm install
npm run dev
```

You still need TimescaleDB, Redis, and Kafka running. The easiest way is to start just the infrastructure services:

```bash
docker compose up -d timescaledb redis kafka
```

Then run the backend and frontend with `npm run dev` in their respective directories.

---

## Environment variables reference

| Variable | Required | Description |
|---|---|---|
| `DB_USER` | Yes | PostgreSQL username |
| `DB_PASSWORD` | Yes | PostgreSQL password |
| `DB_NAME` | Yes | Database name (default: `luminatrace`) |
| `REDIS_PASSWORD` | Yes | Redis auth password |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `SESSION_SECRET` | Yes | Secret for session signing |
| `CORS_ORIGIN` | Yes | Frontend URL allowed by CORS |
| `FRONTEND_URL` | Yes | Base URL used in email links |
| `SMTP_HOST` | Yes | SMTP server hostname |
| `SMTP_PORT` | Yes | SMTP port (587 for TLS) |
| `SMTP_EMAIL` | Yes | Sender email address |
| `SMTP_PASSWORD` | Yes | SMTP password or app password |
| `SMTP_FROM` | No | Display name in sent emails |

---

## Contributing

Pull requests are welcome. If you are adding a new feature, open an issue first so we can discuss the approach. The SDK has its own repository — SDK-related issues and PRs should go there.

---

## License

MIT
