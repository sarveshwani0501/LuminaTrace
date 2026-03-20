import * as serverController from "./serverController.js";
import { listServersSchema, getServerSchema } from "./serverSchema.js";
import authenticate from "../../middlewares/authenticate.js";
import authorise from "../../middlewares/authorise.js";
export default function registerServerRoute(fastify, options, done) {
  fastify.get(
    "/servers",
    {
      schema: listServersSchema,
      preHandler: [authenticate, authorise("member")],
    },
    serverController.listServers,
  );

  fastify.get(
    "/servers/:serverId",
    {
      schema: getServerSchema,
      preHandler: [authenticate, authorise("member")],
    },
    serverController.getServerDetail,
  );
  done();
}
