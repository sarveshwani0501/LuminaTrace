import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Validates that a required environment variable exists
 * @param {string} key - Environment variable name
 * @param {string} defaultValue - Optional default value
 * @returns {string} The environment variable value
 */
function getEnvVar(key, defaultValue = null) {
  const value = process.env[key] || defaultValue;

  if (value === null) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

/**
 * Validates and parses an integer environment variable
 * @param {string} key - Environment variable name
 * @param {number} defaultValue - Default value if not set
 * @returns {number} The parsed integer value
 */
function getEnvInt(key, defaultValue) {
  const value = process.env[key];

  if (!value) {
    return defaultValue;
  }

  const parsed = parseInt(value, 10);

  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid integer`);
  }

  return parsed;
}

const config = {
  app: {
    env: getEnvVar("NODE_ENV", "development"),
    port: getEnvInt("PORT", 3000),
    name: "LuminaTrace",
  },

  database: {
    host: getEnvVar("DB_HOST", "localhost"),
    port: getEnvInt("DB_PORT", 5433),
    user: getEnvVar("DB_USER", "luminatrace"),
    password: getEnvVar("DB_PASSWORD", "luminatrace_password_2026"),
    name: getEnvVar("DB_NAME", "luminatrace"),
    url: process.env.DATABASE_URL || null,
    pool: {
      // Neon free tier: max ~10 connections total. Keep headroom for migrations.
      // min: 0 is critical — releases idle connections so Neon scales to zero
      // and free compute hours are not burned while Render sleeps.
      max: getEnvInt("DB_POOL_MAX", 5),
      min: getEnvInt("DB_POOL_MIN", 0),
      idle: getEnvInt("DB_POOL_IDLE", 5000),
    },
  },

  redis: {
    host: getEnvVar("REDIS_HOST", "localhost"),
    port: getEnvInt("REDIS_PORT", 6379),
    password: process.env.REDIS_PASSWORD || null,
    db: getEnvInt("REDIS_DB", 0),
  },

  kafka: {
    broker: getEnvVar("KAFKA_BROKER", "localhost:9092"),
    clientId: getEnvVar("KAFKA_CLIENT_ID", "luminatrace-backend"),
    groupId: getEnvVar("KAFKA_GROUP_ID", "luminatrace-consumers"),
  },

  security: {
    jwtSecret: getEnvVar("JWT_SECRET", "dev-jwt-secret-change-in-production"),
    jwtExpiresIn: getEnvVar("JWT_EXPIRES_IN", "7d"),
    sessionSecret: getEnvVar(
      "SESSION_SECRET",
      "dev-session-secret-change-in-production",
    ),
    bcryptRounds: getEnvInt("BCRYPT_ROUNDS", 10),
  },

  api: {
    rateLimit: getEnvInt("API_RATE_LIMIT", 100),
    rateLimitWindow: getEnvInt("API_RATE_LIMIT_WINDOW", 15 * 60 * 1000),
  },

  logging: {
    level: getEnvVar("LOG_LEVEL", "info"),
    format: getEnvVar("LOG_FORMAT", "json"),
  },

  cors: {
    origin: getEnvVar(
      "CORS_ORIGIN",
      "http://localhost:5173,http://localhost:3000,http://localhost:5174",
    ).split(",").map((o) => o.trim().replace(/^['"]|['"]$/g, "")),
    credentials: getEnvVar("CORS_CREDENTIALS", "true") === "true",
  },

  features: {
    enableMetrics: getEnvVar("ENABLE_METRICS", "true") === "true",
    enableTracing: getEnvVar("ENABLE_TRACING", "true") === "true",
    enableAlerts: getEnvVar("ENABLE_ALERTS", "true") === "true",
  },
  smtp: {
    host: getEnvVar("SMTP_HOST", "smtp.gmail.com"),
    port: getEnvInt("SMTP_PORT", 587),
    user: getEnvVar("SMTP_EMAIL", ""),
    pass: getEnvVar("SMTP_PASSWORD", ""),
    from: getEnvVar("SMTP_FROM", getEnvVar("SMTP_EMAIL", "")),
    resendApiKey: getEnvVar("RESEND_API_KEY", ""),
  },

  app_url: {
    frontend: getEnvVar("FRONTEND_URL", "http://localhost:5173"),
  },
};

/**
 * Validates critical configuration
 */
function validateConfig() {
  const errors = [];

  // Validate production requirements
  if (config.app.env === "production") {
    const devSecrets = [
      "your-super-secret-jwt-key-change-this-in-production",
      "dev-jwt-secret-change-in-production",
      "your-session-secret-change-this-in-production",
      "dev-session-secret-change-in-production",
    ];

    if (devSecrets.includes(config.security.jwtSecret)) {
      errors.push("JWT_SECRET must be changed in production");
    }

    if (devSecrets.includes(config.security.sessionSecret)) {
      errors.push("SESSION_SECRET must be changed in production");
    }

    if (config.cors.origin === "*") {
      errors.push('CORS_ORIGIN should not be "*" in production');
    }
  }

  // Database validation - ensure we have either URL or individual params
  if (
    !config.database.url &&
    (!config.database.user || !config.database.password)
  ) {
    errors.push("Either DATABASE_URL or DB_USER and DB_PASSWORD must be set");
  }

  if (errors.length > 0) {
    throw new Error(
      `Configuration validation failed:\n${errors.map((e) => `  - ${e}`).join("\n")}`,
    );
  }
}

validateConfig();

export default config;

// some changes to be made once development done
