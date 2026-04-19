import authenticate from "../../middlewares/authenticate.js";
import authorise from "../../middlewares/authorise.js";
import * as metricsController from "./metricsController.js";
import {
  metricsTimeseriesSchema,
  latestMetricsSchema,
  metricsTimeseriesP99Schema
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


  fastify.get("/metrics/timeseries/p99",
    {
      schema: metricsTimeseriesP99Schema,
      preHandler: [authenticate, authorise("member")]
    },
    metricsController.getTimeSeriesP99Handler
  );

  // Throughput: SUM(request_count) / interval_seconds per bucket = RPS
  fastify.get("/metrics/timeseries/throughput",
    {
      preHandler: [authenticate, authorise("member")]
    },
    metricsController.getThroughputHandler
  );

  // Error Rate: (error_count / request_count) * 100 per bucket
  fastify.get("/metrics/timeseries/error-rate",
    {
      preHandler: [authenticate, authorise("member")]
    },
    metricsController.getErrorRateHandler
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


