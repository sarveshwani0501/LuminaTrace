import * as logRepo from "./logsRepository.js";

function getIntervalForWindow(timeRange) {
  if (timeRange === "30m" || timeRange === "1h") return "1 minute";
  if (timeRange === "6h") return "5 minutes";

  if (timeRange === "24h") return "15 minutes";

  if (timeRange === "7d") return "2 hours";

  return "6 hours";
}

function parseTimeRange(timeRange) {
  const now = new Date();

  const durations = {
    "30m": 30 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "6h": 6 * 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
  };

  const duration = durations[timeRange];

  if (!duration) {
    throw new Error(`Invalid timeRange: ${timeRange}`);
  }

  const from = new Date(now.getTime() - duration);

  const to = now;

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

// GET  /logs?projectId=X&timerange=1h&level=ERROR&serverId=Y&limit=100&offset=0
// GET  /logs/recent?projectId=X&limit=100
// GET  /logs/stats?projectId=X
// GET  /logs/routes?projectId=X&window=1h

export async function getLogs(projectId, filters) {
  if (!projectId) {
    throw {
      statusCode: 404,
      message: "Project not found",
    };
  }
  const { timerange, level, serverId, limit, offset } = filters;

  const { from, to } = parseTimeRange(timerange);

  const res = await logRepo.getLogs(projectId, {
    from,
    to,
    level,
    serverId,
    limit,
    offset,
  });

  return res;
}

export async function getRecentLogs(projectId, limit) {
  if (!projectId) {
    throw {
      statusCode: 404,
      message: "Project not found",
    };
  }
  const res = await logRepo.getRecentLogsFromRedis(projectId, limit);

  return res;
}

export async function getStats(projectId) {
  if (!projectId) {
    throw {
      statusCode: 404,
      message: "Project not found",
    };
  }
  const res = await logRepo.getStatsFromRedis(projectId);

  return res;
}

export async function getTopRoutesHandler(projectId, timeRange, limit, sortBy) {
  if (!projectId) {
    throw {
      statusCode: 404,
      message: "Project not found",
    };
  }
  const { from, to } = parseTimeRange(timeRange);
  const res = await logRepo.getTopRoutes(projectId, from, to, limit, sortBy);
  return res;
}

export async function getErrorRateOverTime(projectId, timeRange) {
  if (!projectId) {
    throw {
      statusCode: 404,
      message: "Project not found",
    };
  }
  const { from, to } = parseTimeRange(timeRange);

  const windowDuration = getIntervalForWindow(timeRange);

  const res = await logRepo.getErrorRateOverTime(
    projectId,
    windowDuration,
    from,
    to,
  );
}

export async function getLogVolume(projectId, timeRange) {
  if (!projectId) {
    throw {
      statusCode: 404,
      message: "Project not found",
    };
  }

  const { from, to } = parseTimeRange(timeRange);

  const interval = getIntervalForWindow(timeRange);

  const res = await logRepo.getLogVolumeOverTime(projectId, interval, from, to);
}



