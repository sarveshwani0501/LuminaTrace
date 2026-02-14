CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users Table

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- Organizations Table

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    plan VARCHAR(20) DEFAULT 'Free',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Organization Members (Joins Organizations and Users table)

CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member'
         CHECK (role IN ('owner', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);


CREATE TABLE org_invites (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID         NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email           VARCHAR(255) NOT NULL,
    token           VARCHAR(64)  UNIQUE NOT NULL,
    role            VARCHAR(20)  NOT NULL DEFAULT 'member'
                    CHECK (role IN ('owner', 'member')),
    invited_by      UUID         REFERENCES users(id),
    accepted_at     TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ  NOT NULL,
    created_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- Each Organization can have multiple projects
-- Projects Table


CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    api_key VARCHAR(100) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    retention_days INTEGER DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users(id),
    UNIQUE (organization_id, slug)
);


-- Each Project can have multiple Servers
-- Servers Table

CREATE TABLE servers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    hostname VARCHAR(255),
    ip_address INET,
    environment VARCHAR(20) DEFAULT 'production',
    tags JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'unknown',
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOGS TABLE
CREATE TABLE logs (
    time TIMESTAMPTZ NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id),
    server_id UUID REFERENCES servers(id),
    level VARCHAR(10) NOT NULL,
    message TEXT NOT NULL,
    trace_id UUID,
    span_id UUID,
    metadata JSONB DEFAULT '{}'
);

-- hyper table for logs
SELECT create_hypertable('logs', 'time');


-- Metrics Table

CREATE TABLE metrics (
    time TIMESTAMPTZ NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id),
    server_id UUID REFERENCES servers(id),
    metric_name VARCHAR(50) NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(20),
    tags JSONB DEFAULT '{}'
);

-- hyper table for the metrics
SELECT create_hypertable('metrics', 'time');


-- Alert Rules to send notification to the organization when some metric goes above its described threshold value
CREATE TABLE alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    metric_name VARCHAR(50) NOT NULL,
    condition VARCHAR(10) NOT NULL,
    threshold DOUBLE PRECISION NOT NULL,
    notification_email VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert Events
-- Records the alerts that are sent through emails

CREATE TABLE alert_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_rule_id UUID NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    triggered_value DOUBLE PRECISION NOT NULL,
    status VARCHAR(20) DEFAULT 'firing',
    notification_sent_at TIMESTAMPTZ
);



-- Monitoring Endpoints for checking if the url is active or not
CREATE TABLE monitored_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    check_interval_seconds INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Uptime checks basically this is the log table logging everytime the url is pinged

CREATE TABLE uptime_checks (
    time TIMESTAMPTZ NOT NULL,
    endpoint_id UUID NOT NULL REFERENCES monitored_endpoints(id) ON DELETE CASCADE,
    is_up BOOLEAN NOT NULL,
    status_code INTEGER,
    response_time_ms DOUBLE PRECISION
);

SELECT create_hypertable('uptime_checks', 'time');



-- Indexes 
CREATE INDEX idx_logs_project_time ON logs (project_id, time DESC);

CREATE INDEX idx_logs_level ON logs (project_id, level, time DESC);

CREATE INDEX idx_metrics_project_name_time ON metrics (project_id, metric_name, time DESC);

CREATE INDEX idx_uptime_endpoint_time ON uptime_checks (endpoint_id, time DESC);

CREATE INDEX idx_org_invites_token
    ON org_invites (token);

CREATE INDEX idx_org_invites_email
    ON org_invites (organization_id, email);

