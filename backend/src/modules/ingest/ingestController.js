import * as ingestService from "./ingestService.js";
import { send } from "../../kafka/producer.js";
import { topics } from "../../kafka/topics.js";
import logger from "../../utils/logger.js";
export async function ingestLogs(req, reply) {
  try {
    const logs = req.body.logs;
    const projectId = req.projectId;
    const enrichedLogs = logs.map((log) =>
      ingestService.enrichLog(log, projectId),
    );

    await send(topics.LOGS, enrichedLogs);

    return reply.code(202).send({
      message: "Logs Accepted",
      accepted: enrichedLogs.length,
    });
  } catch (error) {
    throw error;
  }
}

export async function ingestMetrics(req, reply) {
  try {
    const metrics = req.body.metrics;

    const projectId = req.projectId;

    const enrichedMetrics = metrics.map((metric) =>
      ingestService.enrichMetrics(metric, projectId),
    );

    await send(topics.METRICS, enrichedMetrics);

    return reply.code(202).send({
      message: "Metrics Accepted",
      accepted: enrichedMetrics.length,
    });
  } catch (error) {
    throw error;
  }
}

export async function heartbeat(req, reply) {
  try {
    const projectId = req.projectId;
    const serverData = req.body;
    logger.info({ projectId, serverData });
    const serverId = await ingestService.updateServerHeartBeat(
      projectId,
      serverData,
    );

    return reply.code(200).send({
      message: "Heartbeat recorded",
      serverId: serverId,
    });
  } catch (error) {
    throw error;
  }
}

export async function ingestSpans(req, reply) {
  try {
    const projectId = req.projectId;
    const spans = req.body.spans;
    const enrichedSpans = spans.map((span) =>
      ingestService.enrichSpan(projectId, span)
    );

    await send(topics.SPANS, enrichedSpans);

    return reply.code(202).send({
      message: "Spans Accepted",
      accepted: enrichedSpans.length,
    });
  } catch (error) {
    throw error;
  }
}