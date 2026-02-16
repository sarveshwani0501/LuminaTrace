import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import fp from "fastify-plugin";
import config from "../config/index.js";

async function jwtPlugin(fastify, opt) {
  await fastify.register(fastifyCookie);

  await fastify.register(fastifyJwt, {
    secret: config.security.jwtSecret,
    cookie: {
      cookieName: "token",
      signed: false,
    },
  });

  fastify.decorateReply("setAuthCookie", function (token) {
    return this.setCookie("token", token, {
      path: "/",
      httpOnly: true,
      secure: config.app.env === "production",
      sameSite: "strict",
      maxAge: 86400,
    });
  });
}

export default fp(jwtPlugin);
