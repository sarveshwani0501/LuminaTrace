-- ============================================
-- LUMINATRACE TEST DATA
-- Comprehensive test data for Logs & Metrics modules
-- Includes data across multiple time ranges for TimescaleDB testing
-- ============================================

-- Clean up existing test data (optional - uncomment if needed)
-- DELETE FROM logs WHERE project_id IN (SELECT id FROM projects WHERE name = 'Test Project');
-- DELETE FROM metrics WHERE project_id IN (SELECT id FROM projects WHERE name = 'Test Project');
-- DELETE FROM servers WHERE project_id IN (SELECT id FROM projects WHERE name = 'Test Project');
-- DELETE FROM projects WHERE name = 'Test Project';
-- DELETE FROM organization_members WHERE organization_id IN (SELECT id FROM organizations WHERE name = 'Test Organization');
-- DELETE FROM organizations WHERE name = 'Test Organization';
-- DELETE FROM users WHERE email = 'test@luminatrace.com';

-- ============================================
-- STEP 1: Create Test User, Organization, Project
-- ============================================

-- Insert Test User
INSERT INTO users (id, full_name, email, password_hash, is_email_verified, created_at)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Test User',
    'test@luminatrace.com',
    '$2a$10$abcdefghijklmnopqrstuv',  -- Dummy hash
    true,
    NOW() - INTERVAL '30 days'
) ON CONFLICT (email) DO NOTHING;

-- Insert Test Organization
INSERT INTO organizations (id, name, slug, plan, created_at)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Test Organization',
    'test-org',
    'Pro',
    NOW() - INTERVAL '30 days'
) ON CONFLICT (id) DO NOTHING;

-- Link User to Organization
INSERT INTO organization_members (user_id, organization_id, role, joined_at)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'owner',
    NOW() - INTERVAL '30 days'
) ON CONFLICT (organization_id, user_id) DO NOTHING;

-- Insert Test Project
INSERT INTO projects (id, organization_id, name, slug, description, api_key, api_key_preview, created_by, created_at)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'Test Project',
    'test-project',
    'Project for comprehensive testing of logs and metrics',
    'test_api_key_1234567890abcdefghijklmnopqrstuv',
    'test_api_key',
    '11111111-1111-1111-1111-111111111111',
    NOW() - INTERVAL '25 days'
) ON CONFLICT (id) DO NOTHING;

-- Insert Test Servers (3 servers: production, staging, development)
INSERT INTO servers (id, project_id, name, hostname, ip_address, environment, status, last_seen_at, created_at)
VALUES 
    (
        '44444444-4444-4444-4444-444444444444',
        '33333333-3333-3333-3333-333333333333',
        'Production Web Server',
        'prod-web-01.luminatrace.com',
        '192.168.1.100',
        'production',
        'active',
        NOW(),
        NOW() - INTERVAL '25 days'
    ),
    (
        '55555555-5555-5555-5555-555555555555',
        '33333333-3333-3333-3333-333333333333',
        'Production API Server',
        'prod-api-01.luminatrace.com',
        '192.168.1.101',
        'production',
        'active',
        NOW(),
        NOW() - INTERVAL '25 days'
    ),
    (
        '66666666-6666-6666-6666-666666666666',
        '33333333-3333-3333-3333-333333333333',
        'Staging Server',
        'staging-web-01.luminatrace.com',
        '192.168.2.100',
        'staging',
        'active',
        NOW(),
        NOW() - INTERVAL '20 days'
    )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 2: Insert LOGS Data
-- ============================================
-- Distribution:
-- - Last 30 minutes: Dense logs (every minute)
-- - Last 1 hour: Medium density
-- - Last 6 hours: Regular logs
-- - Last 24 hours: Include error spike
-- - Last 7 days: Sparse historical data
-- ============================================

-- Last 30 minutes: Dense logs (Production Web Server)
INSERT INTO logs (time, project_id, server_id, level, message, trace_id, metadata)
SELECT 
    NOW() - (interval '1 minute' * generate_series(0, 29)),
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    CASE 
        WHEN random() < 0.7 THEN 'info'
        WHEN random() < 0.9 THEN 'warn'
        ELSE 'error'
    END,
    CASE 
        WHEN random() < 0.5 THEN 'Request processed successfully'
        WHEN random() < 0.7 THEN 'Cache miss for key: user_session_' || floor(random() * 1000)::text
        WHEN random() < 0.85 THEN 'Database query took ' || (random() * 500)::int || 'ms'
        ELSE 'Connection timeout to external service'
    END,
    gen_random_uuid(),
    jsonb_build_object('response_time_ms', (random() * 500)::int, 'status_code', 200);

-- Last 1 hour: API Server logs with some errors
INSERT INTO logs (time, project_id, server_id, level, message, trace_id, metadata)
SELECT 
    NOW() - (interval '2 minutes' * generate_series(0, 29)),
    '33333333-3333-3333-3333-333333333333',
    '55555555-5555-5555-5555-555555555555',
    CASE 
        WHEN random() < 0.65 THEN 'info'
        WHEN random() < 0.88 THEN 'warn'
        WHEN random() < 0.95 THEN 'error'
        ELSE 'debug'
    END,
    CASE 
        WHEN random() < 0.3 THEN 'API request: GET /api/users'
        WHEN random() < 0.5 THEN 'API request: POST /api/logs'
        WHEN random() < 0.7 THEN 'Authentication successful for user'
        WHEN random() < 0.85 THEN 'Rate limit warning for IP 203.0.113.42'
        ELSE 'Failed to connect to Redis cache'
    END,
    gen_random_uuid(),
    jsonb_build_object('endpoint', '/api/users', 'method', 'GET', 'response_time_ms', (random() * 300)::int);

-- Last 6 hours: Regular activity with occasional errors
INSERT INTO logs (time, project_id, server_id, level, message, trace_id, metadata)
SELECT 
    NOW() - (interval '5 minutes' * generate_series(0, 71)),
    '33333333-3333-3333-3333-333333333333',
    CASE 
        WHEN random() < 0.6 THEN '44444444-4444-4444-4444-444444444444'
        ELSE '55555555-5555-5555-5555-555555555555'
    END,
    CASE 
        WHEN random() < 0.75 THEN 'info'
        WHEN random() < 0.92 THEN 'warn'
        ELSE 'error'
    END,
    CASE 
        WHEN random() < 0.4 THEN 'Scheduled task completed'
        WHEN random() < 0.6 THEN 'User session created'
        WHEN random() < 0.75 THEN 'Email sent successfully'
        WHEN random() < 0.88 THEN 'High memory usage detected: ' || (70 + random() * 20)::int || '%'
        ELSE 'Database connection pool exhausted'
    END,
    gen_random_uuid(),
    jsonb_build_object('module', 'background_worker', 'duration_ms', (random() * 1000)::int);

-- Last 24 hours: Include ERROR SPIKE (simulate incident 12 hours ago)
-- Normal logs
INSERT INTO logs (time, project_id, server_id, level, message, trace_id, metadata)
SELECT 
    NOW() - (interval '15 minutes' * generate_series(0, 95)),
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    CASE 
        WHEN random() < 0.8 THEN 'info'
        WHEN random() < 0.94 THEN 'warn'
        ELSE 'error'
    END,
    'Application heartbeat',
    gen_random_uuid(),
    jsonb_build_object('uptime_seconds', (random() * 86400)::int);

-- ERROR SPIKE: 12 hours ago (30-minute incident window)
INSERT INTO logs (time, project_id, server_id, level, message, trace_id, metadata)
SELECT 
    NOW() - INTERVAL '12 hours' - (interval '1 minute' * generate_series(0, 29)),
    '33333333-3333-3333-3333-333333333333',
    '55555555-5555-5555-5555-555555555555',
    'error',
    CASE 
        WHEN random() < 0.4 THEN 'Database connection refused'
        WHEN random() < 0.7 THEN 'Internal server error: NullPointerException'
        ELSE 'Service unavailable: timeout after 30s'
    END,
    gen_random_uuid(),
    jsonb_build_object('error_code', 'DB_CONNECTION_ERROR', 'retry_attempt', (random() * 5)::int);

-- Last 7 days: Sparse historical data (every 2 hours)
INSERT INTO logs (time, project_id, server_id, level, message, trace_id, metadata)
SELECT 
    NOW() - (interval '2 hours' * generate_series(0, 83)),
    '33333333-3333-3333-3333-333333333333',
    CASE 
        WHEN random() < 0.5 THEN '44444444-4444-4444-4444-444444444444'
        WHEN random() < 0.8 THEN '55555555-5555-5555-5555-555555555555'
        ELSE '66666666-6666-6666-6666-666666666666'
    END,
    CASE 
        WHEN random() < 0.85 THEN 'info'
        WHEN random() < 0.95 THEN 'warn'
        ELSE 'error'
    END,
    'Daily backup completed successfully',
    gen_random_uuid(),
    jsonb_build_object('backup_size_mb', (random() * 1000)::int, 'duration_seconds', (random() * 300)::int);

-- Staging server logs (last 24 hours, less frequent)
INSERT INTO logs (time, project_id, server_id, level, message, trace_id, metadata)
SELECT 
    NOW() - (interval '30 minutes' * generate_series(0, 47)),
    '33333333-3333-3333-3333-333333333333',
    '66666666-6666-6666-6666-666666666666',
    CASE 
        WHEN random() < 0.6 THEN 'info'
        WHEN random() < 0.85 THEN 'warn'
        WHEN random() < 0.95 THEN 'debug'
        ELSE 'error'
    END,
    CASE 
        WHEN random() < 0.5 THEN 'Deployment test started'
        WHEN random() < 0.7 THEN 'Integration test passed'
        ELSE 'Staging environment health check'
    END,
    gen_random_uuid(),
    jsonb_build_object('environment', 'staging', 'test_suite', 'integration');

-- ============================================
-- STEP 3: Insert METRICS Data
-- ============================================
-- Metrics: cpu_usage, memory_usage, disk_usage, response_time, request_count, error_count
-- Distribution spans 7 days for time_bucket testing
-- ============================================

-- CPU Usage: Last 30 minutes (every minute) - Production Web Server
INSERT INTO metrics (time, project_id, server_id, metric_name, value, unit, tags)
SELECT 
    NOW() - (interval '1 minute' * generate_series(0, 29)),
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    'cpu_usage',
    40 + (random() * 30)::numeric(5,2),  -- 40-70% range with occasional spikes
    'percent',
    '{"core": "aggregate"}'::jsonb
FROM generate_series(1, 1);

-- CPU Usage with SPIKE (simulate high load 2 hours ago)
INSERT INTO metrics (time, project_id, server_id, metric_name, value, unit, tags)
SELECT 
    NOW() - INTERVAL '2 hours' - (interval '1 minute' * generate_series(0, 14)),
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    'cpu_usage',
    85 + (random() * 12)::numeric(5,2),  -- 85-97% spike
    'percent',
    '{"core": "aggregate", "alert": "high"}'::jsonb
FROM generate_series(1, 1);

-- Memory Usage: Last 6 hours (every 5 minutes)
INSERT INTO metrics (time, project_id, server_id, metric_name, value, unit, tags)
SELECT 
    NOW() - (interval '5 minutes' * generate_series(0, 71)),
    '33333333-3333-3333-3333-333333333333',
    server_id,
    'memory_usage',
    50 + (random() * 35)::numeric(5,2),  -- 50-85% range
    'percent',
    '{"type": "ram"}'::jsonb
FROM (
    VALUES 
        ('44444444-4444-4444-4444-444444444444'),
        ('55555555-5555-5555-5555-555555555555'),
        ('66666666-6666-6666-6666-666666666666')
) AS servers(server_id);

-- Disk Usage: Last 24 hours (every 30 minutes) - Slowly increasing
INSERT INTO metrics (time, project_id, server_id, metric_name, value, unit, tags)
SELECT 
    NOW() - (interval '30 minutes' * series),
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    'disk_usage',
    65 + (series * 0.1) + (random() * 2)::numeric(5,2),  -- Slowly growing 65% -> 70%
    'percent',
    '{"mount": "/var/log"}'::jsonb
FROM generate_series(0, 47) AS series;

-- Response Time: Last 1 hour (every 2 minutes) - API Server
INSERT INTO metrics (time, project_id, server_id, metric_name, value, unit, tags)
SELECT 
    NOW() - (interval '2 minutes' * generate_series(0, 29)),
    '33333333-3333-3333-3333-333333333333',
    '55555555-5555-5555-5555-555555555555',
    'response_time',
    50 + (random() * 150)::numeric(6,2),  -- 50-200ms
    'milliseconds',
    jsonb_build_object('endpoint', '/api/users', 'method', 'GET')
FROM generate_series(1, 1);

-- Response Time SPIKE (12 hours ago during error incident)
INSERT INTO metrics (time, project_id, server_id, metric_name, value, unit, tags)
SELECT 
    NOW() - INTERVAL '12 hours' - (interval '1 minute' * generate_series(0, 29)),
    '33333333-3333-3333-3333-333333333333',
    '55555555-5555-5555-5555-555555555555',
    'response_time',
    2000 + (random() * 3000)::numeric(6,2),  -- 2-5 seconds (very slow!)
    'milliseconds',
    jsonb_build_object('endpoint', '/api/users', 'method', 'GET', 'status', 'degraded')
FROM generate_series(1, 1);

-- Request Count: Last 6 hours (every 5 minutes)
INSERT INTO metrics (time, project_id, server_id, metric_name, value, unit, tags)
SELECT 
    NOW() - (interval '5 minutes' * generate_series(0, 71)),
    '33333333-3333-3333-3333-333333333333',
    CASE 
        WHEN random() < 0.6 THEN '44444444-4444-4444-4444-444444444444'
        ELSE '55555555-5555-5555-5555-555555555555'
    END,
    'request_count',
    (100 + random() * 400)::numeric(8,2),  -- 100-500 requests per interval
    'count',
    '{"type": "http"}'::jsonb
FROM generate_series(1, 1);

-- Error Count: Last 24 hours (correlate with error spike)
INSERT INTO metrics (time, project_id, server_id, metric_name, value, unit, tags)
SELECT 
    NOW() - (interval '15 minutes' * series),
    '33333333-3333-3333-3333-333333333333',
    '55555555-5555-5555-5555-555555555555',
    'error_count',
    CASE 
        -- Error spike 12 hours ago
        WHEN series BETWEEN 45 AND 48 THEN (50 + random() * 100)::numeric(6,2)
        ELSE (random() * 10)::numeric(6,2)  -- Normal: 0-10 errors
    END,
    'count',
    '{"severity": "error"}'::jsonb
FROM generate_series(0, 95) AS series;

-- Network I/O: Last 7 days (every 1 hour) for time_bucket testing
INSERT INTO metrics (time, project_id, server_id, metric_name, value, unit, tags)
SELECT 
    NOW() - (interval '1 hour' * generate_series(0, 167)),
    '33333333-3333-3333-3333-333333333333',
    server_id,
    metric_name,
    (random() * 1000)::numeric(8,2),
    'mbps',
    '{"interface": "eth0"}'::jsonb
FROM (
    VALUES 
        ('44444444-4444-4444-4444-444444444444'),
        ('55555555-5555-5555-5555-555555555555')
) AS servers(server_id)
CROSS JOIN (
    VALUES ('network_in'), ('network_out')
) AS metrics(metric_name);

-- Latency: Last 7 days (every 2 hours) - Shows daily patterns
INSERT INTO metrics (time, project_id, server_id, metric_name, value, unit, tags)
SELECT 
    time_val,
    '33333333-3333-3333-3333-333333333333',
    '55555555-5555-5555-5555-555555555555',
    'latency',
    -- Simulate daily pattern: higher latency during business hours (9am-5pm)
    CASE 
        WHEN EXTRACT(HOUR FROM time_val) BETWEEN 9 AND 17 THEN 100 + (random() * 200)::numeric(6,2)
        ELSE 30 + (random() * 70)::numeric(6,2)
    END,
    'milliseconds',
    '{"measurement": "p95"}'::jsonb
FROM (
    SELECT NOW() - (interval '2 hours' * generate_series(0, 83)) AS time_val
) AS time_series;

-- Database Connection Pool: Last 24 hours (every 10 minutes)
INSERT INTO metrics (time, project_id, server_id, metric_name, value, unit, tags)
SELECT 
    NOW() - (interval '10 minutes' * generate_series(0, 143)),
    '33333333-3333-3333-3333-333333333333',
    '55555555-5555-5555-5555-555555555555',
    'db_connections',
    (10 + random() * 40)::numeric(5,0),  -- 10-50 connections
    'count',
    '{"pool": "main", "max": "100"}'::jsonb
FROM generate_series(1, 1);

-- Throughput: Last 7 days (aggregate metric for testing)
INSERT INTO metrics (time, project_id, server_id, metric_name, value, unit, tags)
SELECT 
    NOW() - (interval '3 hours' * generate_series(0, 55)),
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    'throughput',
    (500 + random() * 1500)::numeric(8,2),  -- 500-2000 req/sec
    'requests_per_second',
    '{"aggregation": "sum"}'::jsonb
FROM generate_series(1, 1);

-- ============================================
-- STEP 4: Summary Statistics
-- ============================================

SELECT 
    'Test Data Inserted Successfully!' AS status,
    (SELECT COUNT(*) FROM logs WHERE project_id = '33333333-3333-3333-3333-333333333333') AS total_logs,
    (SELECT COUNT(*) FROM metrics WHERE project_id = '33333333-3333-3333-3333-333333333333') AS total_metrics,
    (SELECT COUNT(DISTINCT server_id) FROM logs WHERE project_id = '33333333-3333-3333-3333-333333333333') AS servers_with_logs,
    (SELECT COUNT(DISTINCT metric_name) FROM metrics WHERE project_id = '33333333-3333-3333-3333-333333333333') AS unique_metrics;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify time distribution of logs
SELECT 
    CASE 
        WHEN time > NOW() - INTERVAL '30 minutes' THEN 'Last 30 min'
        WHEN time > NOW() - INTERVAL '1 hour' THEN 'Last 1 hour'
        WHEN time > NOW() - INTERVAL '6 hours' THEN 'Last 6 hours'
        WHEN time > NOW() - INTERVAL '24 hours' THEN 'Last 24 hours'
        ELSE 'Older than 24h'
    END AS time_bucket,
    COUNT(*) AS log_count,
    COUNT(*) FILTER (WHERE level = 'error') AS error_count
FROM logs 
WHERE project_id = '33333333-3333-3333-3333-333333333333'
GROUP BY time_bucket
ORDER BY 
    CASE time_bucket
        WHEN 'Last 30 min' THEN 1
        WHEN 'Last 1 hour' THEN 2
        WHEN 'Last 6 hours' THEN 3
        WHEN 'Last 24 hours' THEN 4
        ELSE 5
    END;

-- Verify metric types
SELECT 
    metric_name,
    COUNT(*) AS data_points,
    ROUND(AVG(value), 2) AS avg_value,
    ROUND(MIN(value), 2) AS min_value,
    ROUND(MAX(value), 2) AS max_value
FROM metrics
WHERE project_id = '33333333-3333-3333-3333-333333333333'
GROUP BY metric_name
ORDER BY metric_name;

-- ============================================
-- READY FOR TESTING!
-- ============================================
-- Test IDs for API calls:
-- Project ID: 33333333-3333-3333-3333-333333333333
-- Servers:
--   - Production Web: 44444444-4444-4444-4444-444444444444
--   - Production API: 55555555-5555-5555-5555-555555555555
--   - Staging:        66666666-6666-6666-6666-666666666666
-- ============================================
