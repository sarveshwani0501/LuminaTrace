// GET  /metrics/timeseries?projectId=X&metricName=cpu_usage&timerange=6h&serverId=Y (optional)
// GET  /metrics/latest?projectId=X&serverId=Y (optional)

// GET /metrics/timeseries/p99?projectId=X&timerange=6h&serverId=Y (optional)

import {
  getMetricTimeSeries,
  getLatestMetricsFromDB,
  getLatestMetricsFromRedis,
  getMetricTimeSeriesP99
} from "./metricsRepository.js";
import {
  parseTimeRange,
  getIntervalForWindow,
} from "../../utils/timeWindow.js";

export async function getTimeseriesData(
  projectId,
  metricName,
  timerange,
  serverId,
) {
  try {
    if (!projectId) {
      throw new Error("Project ID is required");
    }
    if (!metricName) {
      throw new Error("Metric Name is Required");
    }
    if (!timerange) {
      timerange = "1h";
    }

    const { from, to } = parseTimeRange(timerange);

    const interval = getIntervalForWindow(timerange);

    const data = await getMetricTimeSeries(
      projectId,
      metricName,
      interval,
      from,
      to,
      serverId,
    );

    return {
      data,
      metric_name: metricName,
      interval,
      from,
      to,
      aggregation: null,
    };
  } catch (err) {
    console.log("Error", { err });
    throw {
      statusCode: 500,
      message: `Internal Server Error ${err}`,
    };
  }
}


export async function getTimeSeriesP99(projectId, timerange, serverId = null) {
  try {
    if (!projectId) {
      throw new Error("Project ID is required");
    }
    if (!timerange) {
      timerange = "1h";
    }

    const { from, to } = parseTimeRange(timerange);

    const interval = getIntervalForWindow(timerange);

    const data = await getMetricTimeSeriesP99(
      projectId,
      "response_time",
      interval,
      from,
      to,
      serverId,
    );

    return {
      data,
      metric_name: "response_time",
      interval,
      from,
      to,
      aggregation: "p99",
    };
  } catch (err) {
    console.log("Error", { err });
    throw {
      statusCode: 500,
      message: `Internal Server Error ${err}`,
    };
  }
}

export async function getLatestMetrics(projectId, serverId = null) {
  try {
    if (!projectId) {
      throw new Error("Project ID is required");
    }

    // If serverId provided, get specific server metrics from DB
    if (serverId) {
      const dbData = await getLatestMetricsFromDB(projectId, serverId);
      return {
        metrics: dbData,
        source: "database",
      };
    }

    // Try Redis first for aggregated project metrics
    const redisData = await getLatestMetricsFromRedis(projectId);

    if (Object.keys(redisData).length > 0) {
      // Transform Redis hash into array format for consistency
      const metricsArray = Object.keys(redisData).map((name) => ({
        name,
        value: redisData[name],
        unit: null,
        timestamp: new Date().toISOString(),
        server_id: null,
        server_name: null,
        server_hostname: null,
        server_environment: null,
      }));
      return {
        metrics: metricsArray,
        source: "redis",
      };
    }

    // Fallback to DB
    const dbData = await getLatestMetricsFromDB(projectId);
    return {
      metrics: dbData,
      source: "database",
    };
  } catch (err) {
    console.log("Error", { err });
    throw {
      statusCode: 500,
      message: `Internal Server Error ${err}`,
    };
  }
}
