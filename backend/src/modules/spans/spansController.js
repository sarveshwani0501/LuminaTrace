import * as spansService from "./spansService.js";

export async function getSpansByTraceHandler(req, reply) {
  try {
    const { projectId } = req.query;
    const { traceId } = req.params;

    const res = await spansService.getSpansByTrace(traceId, projectId);

    return reply.code(200).send(res);
  } catch (err) {
    req.log.error(err);

    return reply
      .code(err.statusCode || 500)
      .send({ message: err.message || "Internal Server Error" });
  }
}
