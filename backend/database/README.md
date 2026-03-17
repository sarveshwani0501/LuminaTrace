# LuminaTrace Test Data & Testing Tools

This directory contains comprehensive test data and tools for testing the Logs and Metrics modules.

## 📁 Files Overview

### Data Files

- **`test-data.sql`** - Complete SQL script with ~3500-4500 data points
  - Test user, organization, project, and servers
  - ~600-800 log entries spanning 7 days
  - ~3000-4000 metric data points across 11 metric types
  - Includes simulated incidents (error spike, CPU spike, response time degradation)

### Documentation

- **`TEST_GUIDE.md`** - Comprehensive testing guide
  - 35 detailed test scenarios
  - Expected results for each test
  - Edge cases and performance tests
  - Incident investigation workflows

### Testing Scripts

- **`load-test-data.ps1`** - PowerShell script to load test data (Windows)
- **`test-api.ps1`** - Automated API testing script (PowerShell)
- **`test-api.sh`** - curl-based test examples (Unix/Linux/Mac)

---

## 🚀 Quick Start

### Step 1: Load Test Data

**PowerShell (Windows):**

```powershell
cd backend\database
.\load-test-data.ps1
```

**Manual (Any OS):**

```bash
# From backend/database directory
cat test-data.sql | docker exec -i luminatrace-timescaledb-1 psql -U postgres -d luminatrace
```

### Step 2: Verify Data Loaded

```sql
docker exec luminatrace-timescaledb-1 psql -U postgres -d luminatrace -c "
  SELECT
    (SELECT COUNT(*) FROM logs WHERE project_id = '33333333-3333-3333-3333-333333333333') AS logs,
    (SELECT COUNT(*) FROM metrics WHERE project_id = '33333333-3333-3333-3333-333333333333') AS metrics;
"
```

Expected output: ~700 logs, ~3500 metrics

### Step 3: Start Backend

```powershell
cd ..
npm run dev
```

### Step 4: Test Endpoints

**Option A - Automated (PowerShell):**

```powershell
# Get auth token first
$login = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post `
  -Body (ConvertTo-Json @{email="test@luminatrace.com"; password="your_pass"}) `
  -ContentType "application/json"

.\database\test-api.ps1 -Token $login.token
```

**Option B - Manual Testing:**

- Use Postman, Thunder Client, or REST Client
- See `TEST_GUIDE.md` for detailed test scenarios
- See `test-api.sh` for curl command examples

---

## 🎯 Test IDs (Copy These!)

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "servers": {
    "production_web": "44444444-4444-4444-4444-444444444444",
    "production_api": "55555555-5555-5555-5555-555555555555",
    "staging": "66666666-6666-6666-6666-666666666666"
  }
}
```

---

## 📊 What's Included in Test Data

### Data Distribution

#### Logs (~700 total)

- **Last 30 min:** Dense logs (every 1 min) - 30 logs
- **Last 1 hour:** Medium density (every 2 min) - 30 logs
- **Last 6 hours:** Regular (every 5 min) - 72 logs
- **Last 24 hours:** Includes ERROR SPIKE - 96+ logs
- **Last 7 days:** Historical sparse data - 84+ logs
- **Staging server:** Less frequent logs - 48 logs

#### Metrics (~3500 total)

- **cpu_usage:** 45 data points with spike at ~2h ago
- **memory_usage:** 216 data points (3 servers × 72 intervals)
- **disk_usage:** 48 data points showing gradual growth
- **response_time:** 60 data points with spike at ~12h ago
- **request_count:** 72 data points
- **error_count:** 96 data points correlating with logs
- **network_in/out:** 1008 data points (2 metrics × 2 servers × 168h)
- **latency:** 84 data points showing daily patterns
- **db_connections:** 144 data points
- **throughput:** 56 data points

### Key Patterns to Validate

1. **CPU Spike** (~2 hours ago)
   - Server: Production Web (44444...)
   - Normal: 40-70%, Spike: 85-97%
   - Duration: ~15 minutes

2. **Error Incident** (~12 hours ago)
   - Server: Production API (55555...)
   - Duration: 30 minutes
   - 30 consecutive errors
   - Errors: Database connection refused, Internal server error, Service unavailable

3. **Response Time Degradation** (~12 hours ago)
   - Server: Production API (55555...)
   - Normal: 50-200ms
   - During incident: 2000-5000ms
   - Correlates with error spike

4. **Daily Latency Pattern**
   - Server: Production API
   - Business hours (9am-5pm): 100-300ms
   - Night hours: 30-100ms
   - Visible over 7-day span

5. **Disk Growth Trend**
   - Server: Production Web
   - Gradual increase: 65% → 70%
   - Over 24-hour period

---

## 🧪 Testing Scenarios Covered

### Logs Module (9 endpoints)

✅ Basic retrieval with pagination  
✅ Filtering (level, server, time range)  
✅ Full-text search  
✅ Recent logs (Redis cache)  
✅ Volume aggregation (TimescaleDB time_bucket)  
✅ Error rate calculation  
✅ Top errors grouping  
✅ Statistics (Redis aggregates)  
✅ Combined filters

### Metrics Module (2 endpoints, multiple use cases)

✅ Timeseries aggregation (avg, min, max)  
✅ Time bucket intervals (30m, 1h, 6h, 24h, 7d, 30d)  
✅ Server-specific vs aggregated  
✅ Latest values (Redis cache)  
✅ Latest values (DB fallback)  
✅ Server-specific latest values  
✅ Multiple metric types (11 different metrics)  
✅ Spike detection  
✅ Pattern recognition

### Advanced Testing

✅ Redis vs DB performance comparison  
✅ Empty result handling  
✅ Invalid input validation  
✅ Pagination correctness  
✅ Cross-correlation (logs ↔ metrics)  
✅ Incident investigation workflow

---

## 📖 Documentation

### For Comprehensive Testing

See **`TEST_GUIDE.md`** for:

- 35 detailed test scenarios
- Expected results and assertions
- Curl command examples
- Performance expectations
- Troubleshooting tips
- Success criteria checklist

### Quick Reference

All test scenarios use the same Project ID: `33333333-3333-3333-3333-333333333333`

---

## 🔍 Verification Queries

### Check Data Distribution

```sql
-- Log distribution by time range
SELECT
  CASE
    WHEN time > NOW() - INTERVAL '30 minutes' THEN 'Last 30 min'
    WHEN time > NOW() - INTERVAL '1 hour' THEN 'Last 1 hour'
    WHEN time > NOW() - INTERVAL '6 hours' THEN 'Last 6 hours'
    WHEN time > NOW() - INTERVAL '24 hours' THEN 'Last 24 hours'
    ELSE 'Older'
  END AS period,
  COUNT(*) AS log_count,
  COUNT(*) FILTER (WHERE level = 'error') AS errors
FROM logs
WHERE project_id = '33333333-3333-3333-3333-333333333333'
GROUP BY period;
```

### Check Metric Types

```sql
-- Summary of all metric types
SELECT
  metric_name,
  COUNT(*) AS data_points,
  COUNT(DISTINCT server_id) AS servers,
  MIN(time) AS oldest,
  MAX(time) AS newest,
  ROUND(AVG(value), 2) AS avg_value,
  ROUND(MIN(value), 2) AS min_value,
  ROUND(MAX(value), 2) AS max_value
FROM metrics
WHERE project_id = '33333333-3333-3333-3333-333333333333'
GROUP BY metric_name
ORDER BY metric_name;
```

### Find the CPU Spike

```sql
-- Locate CPU spike (~2 hours ago)
SELECT
  time,
  server_id,
  value,
  CASE WHEN value > 80 THEN '🔥 SPIKE' ELSE 'Normal' END AS status
FROM metrics
WHERE project_id = '33333333-3333-3333-3333-333333333333'
  AND metric_name = 'cpu_usage'
  AND time > NOW() - INTERVAL '3 hours'
ORDER BY value DESC
LIMIT 10;
```

### Find the Error Incident

```sql
-- Locate error incident (~12 hours ago)
SELECT
  time_bucket('5 minutes', time) AS bucket,
  COUNT(*) AS errors
FROM logs
WHERE project_id = '33333333-3333-3333-3333-333333333333'
  AND level = 'error'
  AND time > NOW() - INTERVAL '24 hours'
GROUP BY bucket
ORDER BY errors DESC
LIMIT 5;
```

---

## 🛠️ Troubleshooting

### No Data Returned from API?

1. Check backend is running: `curl http://localhost:3000/health`
2. Verify data exists: Run verification queries above
3. Check authentication: Token may be expired
4. Check project ID matches: `33333333-3333-3333-3333-333333333333`

### Redis Not Working?

```bash
# Check Redis is running
docker ps | grep redis

# Check keys exist
docker exec -it luminatrace-redis-1 redis-cli KEYS "*"

# Check specific key
docker exec -it luminatrace-redis-1 redis-cli HGETALL "latest_metric:33333333-3333-3333-3333-333333333333"
```

### Kafka Workers Not Populating Redis?

```bash
# Check worker logs
docker logs luminatrace-backend-1 --tail 100 | grep -i worker

# Check Kafka is running
docker ps | grep kafka
```

### Need Fresh Start?

```powershell
# Clear test data
docker exec luminatrace-timescaledb-1 psql -U postgres -d luminatrace -c "
  DELETE FROM logs WHERE project_id = '33333333-3333-3333-3333-333333333333';
  DELETE FROM metrics WHERE project_id = '33333333-3333-3333-3333-333333333333';
"

# Reload
.\load-test-data.ps1
```

---

## ✅ Success Criteria

After loading test data, you should be able to:

- [ ] Retrieve logs with various filters
- [ ] See error spike at ~12h ago
- [ ] See CPU spike at ~2h ago
- [ ] Get aggregated metrics with time_bucket
- [ ] Fetch latest metrics from Redis
- [ ] Correlate logs and metrics during incidents
- [ ] Test all 6 time ranges (30m, 1h, 6h, 24h, 7d, 30d)
- [ ] See daily latency patterns over 7 days
- [ ] Filter by server and get correct results
- [ ] Search logs and find relevant messages

---

## 📞 Need Help?

- **No data?** Run verification queries above
- **API errors?** Check `TEST_GUIDE.md` for expected responses
- **Performance issues?** Check Redis and TimescaleDB connections
- **Unexpected results?** Verify time zones (use UTC)

---

## 🎉 Happy Testing!

This test suite provides comprehensive coverage of both modules with realistic data patterns, edge cases, and incident scenarios. Use it to validate your implementation and ensure production readiness.
