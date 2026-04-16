import * as metricService from "../metrics/metricsService.js";

export async function getTimeSeriesData(req, reply) {
  try {
    const { projectId, timerange, metricName, serverId } = req.query;

    const res = await metricService.getTimeseriesData(
      projectId,
      metricName,
      timerange,
      serverId,
    );

    return reply.code(200).send(res);
  } catch (err) {
    req.log.error({ err }, "Error fetching time series data");
    return reply.code(err.statusCode || 500).send({
      error: err.message || "Error fetching time series data",
    });
  }
}

export async function getLatestMetricData(req, reply) {
  try {
    const { projectId, serverId } = req.query;
    const res = await metricService.getLatestMetrics(projectId, serverId);

    return reply.code(200).send(res);
  } catch (err) {
    req.log.error({ err }, "Error fetching latest metric data");
    return reply.code(err.statusCode || 500).send({
      error: err.message || "Error fetching latest metric data",
    });
  }
}

export async function getTimeSeriesP99Handler(req, reply) {
  try {
    const { projectId, timerange, serverId } = req.query;
    const res = await metricService.getTimeSeriesP99(projectId, timerange, serverId);
    return reply.code(200).send(res);
  } catch (err) {
    req.log.error({ err }, "Error fetching time series p99 data");
    return reply.code(err.statusCode || 500).send({
      error: err.message || "Error fetching time series p99 data",
    });
  }
}