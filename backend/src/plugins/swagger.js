import swagger from "@fastify/swagger";
import fp from "fastify-plugin";
import swaggerUI from "@fastify/swagger-ui";

async function swaggerPlugin(fastify, options) {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: "Test swagger",
        description: "Testing the Fastify swagger API",
        version: "0.1.0",
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Development Server",
        },
      ],
    },
  });

  await fastify.register(swaggerUI, {
    routePrefix: "/docs",
  });
}

export default fp(swaggerPlugin);
