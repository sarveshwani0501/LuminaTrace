# LuminaTrace Testing Guide

## 🚀 Quick Start

### 1. Load Test Data

```powershell
# From the backend directory
Get-Content .\database\test-data.sql | docker exec -i luminatrace-timescaledb-1 psql -U postgres -d luminatrace
```

### 2. Test Credentials

```
Email: test@luminatrace.com
Password: (You'll need to set this during registration or update the hash)
```

### 3. Test IDs (Use these in API calls)

```
Project ID:  33333333-3333-3333-3333-333333333333
Server IDs:
  - Production Web:  44444444-4444-4444-4444-444444444444
  - Production API:  55555555-5555-5555-5555-555555555555
  - Staging:         66666666-6666-6666-6666-666666666666
```

---

## 📊 LOGS MODULE - Test Scenarios

### Test 1: Get All Logs (Basic)

Tests recent logs with default pagination

**Endpoint:** `GET /logs`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "limit": 50,
  "page": 1
}
```

**Expected:** Returns 50 most recent logs with server details

---

### Test 2: Filter by Log Level

Tests level filtering and error tracking

**Endpoint:** `GET /logs`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "level": "error",
  "limit": 20,
  "page": 1
}
```

**Expected:** Returns only error logs, includes error spike from 12 hours ago

---

### Test 3: Filter by Server

Tests server-specific log retrieval

**Endpoint:** `GET /logs`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "serverId": "55555555-5555-5555-5555-555555555555",
  "limit": 30
}
```

**Expected:** Returns logs only from Production API Server

---

### Test 4: Search in Logs

Tests full-text search functionality

**Endpoint:** `GET /logs`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "search": "database",
  "limit": 25
}
```

**Expected:** Returns logs containing "database" in message

---

### Test 5: Time Range Filter

Tests time-based filtering

**Endpoint:** `GET /logs`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "timerange": "1h",
  "limit": 100
}
```

**Expected:** Returns only logs from last 1 hour

---

### Test 6: Recent Logs (Redis Cache)

Tests Redis caching mechanism

**Endpoint:** `GET /logs/recent`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "limit": 20
}
```

**Expected:** Fast response from Redis (if populated by worker), includes server details

---

### Test 7: Log Volume Over Time

Tests TimescaleDB time_bucket aggregation (30min interval)

**Endpoint:** `GET /logs/volume`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "timerange": "6h"
}
```

**Expected:** Returns bucketed log counts for last 6 hours

**Should show:** Varying volume across buckets

---

### Test 8: Error Rate Calculation

Tests error rate percentage with time buckets

**Endpoint:** `GET /logs/error-rate`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "timerange": "24h"
}
```

**Expected:** Returns error rate per bucket

**Should show:**

- Normal rate: 5-15%
- Spike at 12 hours ago: 50-100% error rate

---

### Test 9: Top Errors

Tests error grouping and counting

**Endpoint:** `GET /logs/top-errors`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "timerange": "24h",
  "limit": 10
}
```

**Expected:** Grouped error messages with counts

**Top errors should include:**

- "Database connection refused"
- "Internal server error: NullPointerException"
- "Service unavailable: timeout after 30s"

---

### Test 10: Log Stats (Redis)

Tests aggregated statistics from Redis

**Endpoint:** `GET /logs/stats`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333"
}
```

**Expected:**

- Total logs today
- Error count
- Average response time
- Error rate percentage

---

### Test 11: Pagination Test

Tests navigation through large result sets

**Endpoint:** `GET /logs`

**Scenario:** Call with page=1, then page=2, then page=3

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "limit": 50,
  "page": 1 // then 2, then 3
}
```

**Expected:** No duplicate logs, sequential pagination

---

### Test 12: Combined Filters

Tests multiple filters together

**Endpoint:** `GET /logs`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "level": "error",
  "serverId": "55555555-5555-5555-5555-555555555555",
  "timerange": "24h",
  "search": "connection",
  "limit": 20
}
```

**Expected:** Errors from API server in last 24h containing "connection"

---

## 📈 METRICS MODULE - Test Scenarios

### Test 13: CPU Usage Timeseries (30min buckets)

Tests basic metric timeseries with aggregation

**Endpoint:** `GET /metrics/timeseries`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "metricName": "cpu_usage",
  "timerange": "1h"
}
```

**Expected:**

- Bucketed CPU data (avg, min, max)
- Should show normal range (40-70%) with spike 2 hours ago if in range

---

### Test 14: CPU Spike Detection (Aggregated)

Tests detection of high CPU periods

**Endpoint:** `GET /metrics/timeseries`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "metricName": "cpu_usage",
  "timerange": "6h"
}
```

**Expected:**

- Should include spike period (~2 hours ago)
- Max values should reach 85-97% during spike
- Normal periods: 40-70%

---

### Test 15: Server-Specific Metrics

Tests filtering by specific server

**Endpoint:** `GET /metrics/timeseries`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "metricName": "memory_usage",
  "timerange": "6h",
  "serverId": "44444444-4444-4444-4444-444444444444"
}
```

**Expected:**

- Memory data only from Production Web Server
- Includes server details (name, hostname, environment)

---

### Test 16: Response Time Analysis

Tests response time metrics with incident correlation

**Endpoint:** `GET /metrics/timeseries`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "metricName": "response_time",
  "timerange": "24h",
  "serverId": "55555555-5555-5555-5555-555555555555"
}
```

**Expected:**

- Normal: 50-200ms
- Spike at ~12 hours ago: 2000-5000ms (matches error spike)

---

### Test 17: Time Bucket Testing - 30 minutes

Tests smallest bucket interval

**Endpoint:** `GET /metrics/timeseries`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "metricName": "cpu_usage",
  "timerange": "30m"
}
```

**Expected:**

- Fine-grained buckets (1-minute intervals aggregated to 30min buckets)
- Recent data with high resolution

---

### Test 18: Time Bucket Testing - 1 hour

Tests hourly aggregation

**Endpoint:** `GET /metrics/timeseries`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "metricName": "request_count",
  "timerange": "1h"
}
```

**Expected:** Aggregated request counts across 1 hour

---

### Test 19: Time Bucket Testing - 6 hours

Tests mid-range aggregation

**Endpoint:** `GET /metrics/timeseries`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "metricName": "memory_usage",
  "timerange": "6h"
}
```

**Expected:** Broader view with reasonable bucket size

---

### Test 20: Time Bucket Testing - 24 hours

Tests daily aggregation

**Endpoint:** `GET /metrics/timeseries`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "metricName": "error_count",
  "timerange": "24h"
}
```

**Expected:**

- Error spike visible around 12 hours ago
- Shows daily patterns

---

### Test 21: Time Bucket Testing - 7 days

Tests weekly view with larger buckets

**Endpoint:** `GET /metrics/timeseries`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "metricName": "latency",
  "timerange": "7d"
}
```

**Expected:**

- Weekly overview with daily patterns
- Higher latency during business hours (9am-5pm)
- Lower latency at night

---

### Test 22: Time Bucket Testing - 30 days

Tests monthly aggregation

**Endpoint:** `GET /metrics/timeseries`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "metricName": "disk_usage",
  "timerange": "30d"
}
```

**Expected:** Long-term trend showing gradual disk growth

---

### Test 23: Latest Metrics (Redis - Aggregated)

Tests fast retrieval of current values from Redis

**Endpoint:** `GET /metrics/latest`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333"
}
```

**Expected:**

- Fast response from Redis cache
- Current values for all metrics
- Source: "redis"
- No server details (aggregated)

---

### Test 24: Latest Metrics (DB Fallback - All Servers)

Tests database fallback when Redis empty

**Clear Redis first:** `docker exec -it luminatrace-redis-1 redis-cli FLUSHDB`

**Endpoint:** `GET /metrics/latest`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333"
}
```

**Expected:**

- Source: "database"
- Latest metrics from last 5 minutes
- Includes server details for each metric
- Multiple rows per metric (one per server)

---

### Test 25: Latest Metrics (Specific Server)

Tests server-specific latest values

**Endpoint:** `GET /metrics/latest`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "serverId": "55555555-5555-5555-5555-555555555555"
}
```

**Expected:**

- Source: "database" (skips Redis for server-specific query)
- Only metrics from Production API Server
- Includes server details

---

### Test 26: Multiple Metric Comparison

Tests viewing different metrics over same period

**Endpoints:** Call `GET /metrics/timeseries` multiple times with different metricNames

**Query Params Template:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "metricName": "cpu_usage", // then "memory_usage", "response_time"
  "timerange": "6h"
}
```

**Expected:** Correlate CPU spike with memory and response time changes

---

### Test 27: Network Metrics Over Week

Tests long-term network I/O patterns

**Endpoint:** `GET /metrics/timeseries`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "metricName": "network_in",
  "timerange": "7d"
}
```

**Expected:** Weekly network traffic patterns

---

### Test 28: Database Connections Monitoring

Tests infrastructure metrics

**Endpoint:** `GET /metrics/timeseries`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "metricName": "db_connections",
  "timerange": "24h",
  "serverId": "55555555-5555-5555-5555-555555555555"
}
```

**Expected:** Connection pool usage (10-50 connections)

---

### Test 29: High-Cardinality Metrics

Tests handling of metrics with tags/metadata

**Endpoint:** `GET /metrics/timeseries`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "metricName": "throughput",
  "timerange": "7d"
}
```

**Expected:** Aggregated throughput (500-2000 req/sec)

---

### Test 30: Cross-Server Metric Aggregation

Tests metrics aggregated across multiple servers

**Endpoint:** `GET /metrics/timeseries`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "metricName": "memory_usage",
  "timerange": "6h"
}
```

**Note:** Don't provide serverId

**Expected:**

- Aggregated avg/min/max across ALL servers
- No server details in response (aggregated view)

---

## 🔍 Edge Cases & Performance Tests

### Test 31: Empty Results

Test handling when no data matches filters

**Endpoint:** `GET /logs`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "timerange": "30d",
  "level": "critical"
}
```

**Expected:** Empty array, no errors

---

### Test 32: Invalid UUID

Test error handling

**Endpoint:** `GET /logs`

**Query Params:**

```json
{
  "projectId": "invalid-uuid",
  "limit": 10
}
```

**Expected:** 400 Bad Request with validation error

---

### Test 33: Large Result Set

Test pagination performance

**Endpoint:** `GET /logs`

**Query Params:**

```json
{
  "projectId": "33333333-3333-3333-3333-333333333333",
  "limit": 100,
  "timerange": "7d"
}
```

**Expected:** Fast response with proper limit enforcement

---

### Test 34: Redis vs DB Performance

Compare response times

1. **With Redis:** Call `/metrics/latest` (should be <50ms)
2. **Clear Redis:** `redis-cli FLUSHDB`
3. **Without Redis:** Call `/metrics/latest` (should be 100-300ms)

---

### Test 35: Concurrent Requests

Test system under load (use tool like Apache Bench or k6)

```powershell
# Example with curl in loop
for ($i=1; $i -le 10; $i++) {
    Invoke-RestMethod -Uri "http://localhost:3000/logs?projectId=33333333-3333-3333-3333-333333333333&limit=50" -Headers @{"Authorization"="Bearer YOUR_TOKEN"}
}
```

---

## 🎯 Incident Scenario Testing

### Scenario 1: Tracking the 12-Hour Incident

The test data includes a simulated incident ~12 hours ago. Test the full investigation flow:

1. **Detect Error Spike**
   - `GET /logs/error-rate?timerange=24h`
   - Should show spike around 12 hours ago

2. **Investigate Errors**
   - `GET /logs/top-errors?timerange=24h`
   - Should show database connection errors

3. **Check Specific Logs**
   - `GET /logs?level=error&timerange=24h&search=database`
   - Should show detailed error messages

4. **Correlate with Metrics**
   - `GET /metrics/timeseries?metricName=response_time&timerange=24h&serverId=55555555-5555-5555-5555-555555555555`
   - Should show response time spike

5. **Check Error Count Metric**
   - `GET /metrics/timeseries?metricName=error_count&timerange=24h`
   - Should show error count spike

---

## 📊 Expected Data Characteristics

### Logs Distribution

- **Total logs:** ~600-800
- **Last 30 min:** ~30 logs (dense)
- **Last 1 hour:** ~60 logs
- **Last 6 hours:** ~150 logs
- **Last 24 hours:** ~350 logs
- **Error spike:** 30 errors in 30-minute window (~12h ago)

### Metrics Distribution

- **Total metrics:** ~3000-4000 data points
- **Unique metric types:** 11 (cpu, memory, disk, response_time, etc.)
- **Time span:** 7 days
- **Servers:** 3 (2 production, 1 staging)

### Performance Expectations

- **Redis cached queries:** <50ms
- **Database queries (recent):** 100-300ms
- **TimescaleDB aggregations:** 200-500ms (depending on time range)
- **Complex filters:** 300-800ms

---

## 🛠️ Troubleshooting

### No data returned?

```sql
-- Verify data exists
SELECT COUNT(*) FROM logs WHERE project_id = '33333333-3333-3333-3333-333333333333';
SELECT COUNT(*) FROM metrics WHERE project_id = '33333333-3333-3333-3333-333333333333';
```

### Redis not working?

```powershell
# Check Redis is running
docker ps | Select-String redis

# Check keys exist
docker exec -it luminatrace-redis-1 redis-cli KEYS "*"
```

### Kafka workers not populating Redis?

```powershell
# Check worker logs
docker logs luminatrace-backend-1 --tail 100 | Select-String "worker"
```

---

## ✅ Success Criteria Checklist

- [ ] All 35 test scenarios pass
- [ ] Logs distributed across timeranges correctly
- [ ] Metrics show clear spike patterns
- [ ] Time_bucket aggregations work for all intervals (30m, 1h, 6h, 24h, 7d, 30d)
- [ ] Redis fallback to DB works correctly
- [ ] Server filtering returns correct data
- [ ] Error spike is detectable via multiple endpoints
- [ ] Response times meet expectations
- [ ] Pagination works without duplicates
- [ ] Combined filters work correctly

---

## 🚨 Known Patterns to Validate

1. **CPU Spike:** ~2 hours ago on Production Web Server (85-97%)
2. **Error Incident:** ~12 hours ago on Production API Server (30 mins duration)
3. **Response Time Degradation:** Correlates with error incident (2-5 seconds)
4. **Daily Latency Pattern:** Higher during business hours (9am-5pm)
5. **Disk Growth:** Gradual increase from 65% to 70% over 24 hours

Happy Testing! 🎉
