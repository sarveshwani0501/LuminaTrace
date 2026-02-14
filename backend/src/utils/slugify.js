import slugify from "slugify";
import fp from "fastify-plugin";

async function slug(fastify) {
  fastify.decorate("slugify", (text) => {
    slugify(text, {
      lower: true,
      strict: true,
      trim: true,
    });
  });
}

export default fp(slug);
