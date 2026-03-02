import * as logRepo from "./logsRepository.js";
import {getIntervalForWindow, parseTimeRange} from "../../utils/timeWindow.js"

// GET  /logs?projectId=X&timerange=1h&level=ERROR&serverId=Y&limit=100&offset=0
// GET  /logs/recent?projectId=X&limit=100
// GET  /logs/stats?projectId=X
// GET  /logs/routes?projectId=X&window=1h

export async function getLogs(projectId, filters) {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  const { timerange, level, serverId, limit, offset } = filters;

  const timeRange = timerange || "1h";
  const { from, to } = parseTimeRange(timeRange);

  const logs = await logRepo.getLogs(projectId, {
    from,
    to,
    level: level || null,
    serverId: serverId || null,
    limit,
    offset,
  });

  const total = await logRepo.getLogCount(projectId, {
    from,
    to,
    level: level || null,
    serverId: serverId || null,
  });

  return { logs, total, limit, offset };
}

export async function getRecentLogs(projectId, limit) {
  if (!projectId) {
    throw new Error("Project ID is required");
  }
  const logs = await logRepo.getRecentLogsFromRedis(projectId, limit);

  return { logs };
}

export async function getStats(projectId) {
  if (!projectId) {
    throw new Error("Project ID is required");
  }
  const stats = await logRepo.getStatsFromRedis(projectId);

  return stats;
}

export async function getTopRoutesHandler(
  projectId,
  timeRange,
  limit = 10,
  sortBy = "count",
) {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  const range = timeRange || "24h";
  const { from, to } = parseTimeRange(range);
  const routes = await logRepo.getTopRoutes(projectId, from, to, limit, sortBy);

  return { routes };
}

export async function getErrorRateOverTime(projectId, timeRange) {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  const range = timeRange || "1h";
  const { from, to } = parseTimeRange(range);
  const interval = getIntervalForWindow(range);

  const data = await logRepo.getErrorRateOverTime(
    projectId,
    interval,
    from,
    to,
  );

  return { data, interval, from, to };
}

export async function getLogVolume(projectId, timeRange) {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  const range = timeRange || "1h";
  const { from, to } = parseTimeRange(range);
  const interval = getIntervalForWindow(range);

  const data = await logRepo.getLogVolumeOverTime(
    projectId,
    interval,
    from,
    to,
  );

  return { data, interval, from, to };
}
