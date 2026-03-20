import * as serverService from "./serverService.js";

export async function listServers(req, reply) {
  try {
    const { projectId } = req.query;
    const result = await serverService.listAllServers(projectId);

    return reply.code(200).send(result);
  } catch (error) {
    req.log.error(error);
    return reply
      .code(error.statusCode || 500)
      .send({ message: error.message || "Internal Server Error" });
  }
}

export async function getServerDetail(req, reply) {
  try {
    const { serverId } = req.params;
    const { projectId } = req.query;

    const result = await serverService.getServerDetails(serverId, projectId);

    return reply.code(200).send(result);
  } catch (error) {
    req.log.error(error);
    return reply
      .code(error.statusCode || 500)
      .send({ message: error.message || "Internal Server Error" });
  }
}
