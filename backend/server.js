import { buildApp } from "./src/app.js";
import config from "./src/config/index.js";

async function start() {
  let app;

  try {
    // Build the Fastify app
    app = await buildApp();

    await app.listen({
      port: config.app.port,
      host: "0.0.0.0",
    });

    app.log.info(`Server running on http://localhost:${config.app.port}`);
    app.log.info(`Environment: ${config.app.env}`);
    //app.log.info(`Health check: http://localhost:${config.app.port}/health`);
  } catch (err) {
    if (app) {
      app.log.error(err);
    } else {
      console.error(err);
    }
    process.exit(1);
  }
}

start();
