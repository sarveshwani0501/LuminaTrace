import authenticate from "../../middlewares/authenticate.js";
import authorise from "../../middlewares/authorise.js";
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
      preHandler: [authenticate, authorise("member")],
    },
    metricsController.getTimeSeriesData,
  );

  fastify.get(
    "/metrics/latest",
    {
      schema: latestMetricsSchema,
      preHandler: [authenticate, authorise("member")],
    },
    metricsController.getLatestMetricData,
  );
}
