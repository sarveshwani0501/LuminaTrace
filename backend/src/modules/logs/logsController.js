import * as logService from "./logsService.js";

// GET  /logs?projectId=X&timerange=1h&level=ERROR&serverId=Y&limit=100&offset=0
// GET  /logs/recent?projectId=X&limit=100
// GET  /logs/stats?projectId=X
// GET  /logs/routes?projectId=X&timerange=1h&limit=100&sortBy=count
// GET /logs/volume?projectId=X&timerange=30m
// GET /logs/error-rate?projectId=X&timerange=1h

export async function getAllLogs(req, reply) {
  try {
    const { projectId, timerange, level, serverId, limit, offset } = req.query;
    const res = await logService.getLogs(projectId, {
      timerange,
      level,
      serverId,
      limit,
      offset,
    });

    return reply.code(200).send(res);
  } catch (error) {
    req.log.error({ error }, "Error fetching logs");
    return reply.code(error.statusCode || 500).send({
      error: error.message || "Failed to fetch logs",
    });
  }
}

export async function getRecentLogs(req, reply) {
  try {
    const { projectId, limit } = req.query;
    const res = await logService.getRecentLogs(projectId, limit);

    return reply.code(200).send(res);
  } catch (error) {
    req.log.error({ error }, "Error fetching recent logs");
    return reply.code(error.statusCode || 500).send({
      error: error.message || "Failed to fetch recent logs",
    });
  }
}

export async function getLogsStats(req, reply) {
  try {
    const { projectId } = req.query;
    const res = await logService.getStats(projectId);
    return reply.code(200).send(res);
  } catch (error) {
    req.log.error({ error }, "Error fetching stats");
    return reply.code(error.statusCode || 500).send({
      error: error.message || "Failed to fetch stats",
    });
  }
}

export async function getTopRoutes(req, reply) {
  try {
    const { projectId, timerange, limit, sortBy } = req.query;
    const res = await logService.getTopRoutesHandler(
      projectId,
      timerange,
      limit,
      sortBy,
    );
    return reply.code(200).send(res);
  } catch (error) {
    req.log.error({ error }, "Error fetching top routes");
    return reply.code(error.statusCode || 500).send({
      error: error.message || "Failed to fetch top routes",
    });
  }
}

export async function getLogsVolume(req, reply) {
  try {
    const { projectId, timerange } = req.query;
    const res = await logService.getLogVolume(projectId, timerange);
    return reply.code(200).send(res);
  } catch (error) {
    req.log.error({ error }, "Error fetching log volume");
    return reply.code(error.statusCode || 500).send({
      error: error.message || "Failed to fetch log volume",
    });
  }
}

export async function getErrorRate(req, reply) {
  try {
    const { projectId, timerange } = req.query;
    const res = await logService.getErrorRateOverTime(projectId, timerange);
    return reply.code(200).send(res);
  } catch (error) {
    req.log.error({ error }, "Error fetching error rate");
    return reply.code(error.statusCode || 500).send({
      error: error.message || "Failed to fetch error rate",
    });
  }
}

export async function getLogsByTraceId(req, reply) {
  try {
    const { traceId } = req.params;
    const { projectId } = req.query;

    const logs = await logService.getLogsByTrace(projectId, traceId);
    return reply.code(200).send({ logs });
  } catch (error) {
    req.log.error({ error }, "Error fetching logs by trace");
    return reply.code(error.statusCode || 500).send({
      error: error.message || "Failed fetching logs by trace",
    });
  }
}
