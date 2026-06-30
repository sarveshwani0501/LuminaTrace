import fp from "fastify-plugin";
import pkg from "pg";
import config from "./index.js";

const { Pool } = pkg;

const poolConfig = config.database.url
  ? {
      connectionString: config.database.url,
      ssl: { rejectUnauthorized: false },
      min: config.database.pool.min,
      max: config.database.pool.max,
      idleTimeoutMillis: config.database.pool.idle,
    }
  : {
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.name,
      min: config.database.pool.min,
      max: config.database.pool.max,
      idleTimeoutMillis: config.database.pool.idle,
    };


export const pool = new Pool(poolConfig);

async function postgresPlugin(fastify, options) {
  


  try {
    const result = await pool.query(
      "SELECT NOW() as time, version() as version",
    );
    fastify.log.info({
      msg: "PostgreSQL connected successfully",
      database: config.database.name,
      host: config.database.host,
      port: config.database.port,
      pool: {
        min: config.database.pool.min,
        max: config.database.pool.max,
      },
    });
  } catch (err) {
    fastify.log.error({
      msg: "PostgreSQL connection failed",
      error: err.message,
    });
    throw err;
  }

  pool.on("error", (err) => {
    fastify.log.error({
      msg: "Unexpected database pool error",
      error: err.message,
    });
  });

  fastify.decorate("pg", pool);

  fastify.addHook("onClose", async () => {
    fastify.log.info("Closing PostgreSQL connection pool");
    await pool.end();
  });
}

export default fp(postgresPlugin);
