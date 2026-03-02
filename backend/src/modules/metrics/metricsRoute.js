import authenticate from "../../middlewares/authenticate.js";
import authoriseProject from "../../middlewares/authoriseProject.js";
import * as metricsController from "./metricsController.js";
import {
  metricsTimeseriesSchema,
  latestMetricsSchema,
} from "./metricsSchema.js";
export default function metricRoute(fastify) {
  fastify.get(
    "/metrics/timeseries",
    {
      schema: metricsTimeseriesSchema,
      preHandler: [authenticate, authoriseProject("member")],
    },
    metricsController.getTimeSeriesData,
  );

  fastify.get(
    "/metrics/latest",
    {
      schema: latestMetricsSchema,
      preHandler: [authenticate, authoriseProject("member")],
    },
    metricsController.getLatestMetricData,
  );
}
