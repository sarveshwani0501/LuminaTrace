# Configuration Module

Single source of truth for all environment variables in the LuminaTrace backend.

## Usage

```javascript
import config from "./src/config/index.js";

// Access any configuration value
const port = config.app.port;
const dbHost = config.database.host;
const jwtSecret = config.security.jwtSecret;
```

## Configuration Structure

### Application

- `config.app.env` - Environment (development/production)
- `config.app.port` - Application port
- `config.app.name` - Application name

### Database

- `config.database.host` - Database host
- `config.database.port` - Database port
- `config.database.user` - Database username
- `config.database.password` - Database password
- `config.database.name` - Database name
- `config.database.url` - Full connection URL (alternative)
- `config.database.pool.max` - Max pool connections
- `config.database.pool.min` - Min pool connections
- `config.database.pool.idle` - Idle timeout

### Redis

- `config.redis.host` - Redis host
- `config.redis.port` - Redis port
- `config.redis.password` - Redis password (optional)
- `config.redis.db` - Redis database number

### Kafka

- `config.kafka.broker` - Kafka broker address
- `config.kafka.clientId` - Kafka client ID
- `config.kafka.groupId` - Kafka consumer group ID

### Security

- `config.security.jwtSecret` - JWT signing secret
- `config.security.jwtExpiresIn` - JWT expiration time
- `config.security.sessionSecret` - Session secret
- `config.security.bcryptRounds` - Bcrypt hashing rounds

### API

- `config.api.rateLimit` - Rate limit per window
- `config.api.rateLimitWindow` - Rate limit window (ms)

### Logging

- `config.logging.level` - Log level (info/debug/warn/error)
- `config.logging.format` - Log format (json/pretty)

### CORS

- `config.cors.origin` - CORS origin
- `config.cors.credentials` - CORS credentials enabled

### Feature Flags

- `config.features.enableMetrics` - Enable metrics collection
- `config.features.enableTracing` - Enable distributed tracing
- `config.features.enableAlerts` - Enable alerting system

## Validation

The config module automatically validates:

1. **Required variables** - Throws error if critical variables are missing
2. **Production safety** - Ensures secrets are changed in production
3. **Type checking** - Validates integers are valid numbers
4. **Database config** - Ensures either URL or individual params are provided

## Environment Variables

All environment variables are loaded from `backend/.env` file.

### Required for Production

These MUST be changed in production:

- `JWT_SECRET`
- `SESSION_SECRET`
- `CORS_ORIGIN` (should not be "\*")

### Development Defaults

The config provides sensible defaults for development:

- Port: 3000
- Database: localhost:5433
- Redis: localhost:6379
- Kafka: localhost:9094

## Examples

### Database Connection

```javascript
import pg from "pg";
import config from "./src/config/index.js";

const pool = new pg.Pool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  max: config.database.pool.max,
});
```

### Redis Connection

```javascript
import Redis from "ioredis";
import config from "./src/config/index.js";

const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db,
});
```

### Feature Flags

```javascript
import config from "./src/config/index.js";

if (config.features.enableMetrics) {
  // Initialize metrics collection
  startMetricsCollection();
}
```

## Benefits

✅ Single source of truth for all configuration
✅ Type safety with validation
✅ Automatic environment variable parsing
✅ Clear error messages for missing variables
✅ Production safety checks
✅ Development-friendly defaults
✅ No configuration scattered across codebase
