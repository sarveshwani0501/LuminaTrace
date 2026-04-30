export function getIntervalForWindow(timeRange) {
  const intervals = {
    "15m": "1 minute",
    "30m": "5 minutes",
    "1h": "5 minutes",
    "6h": "15 minutes",
    "24h": "1 hour",
    "7d": "6 hours",
    "30d": "1 day",
  };

  return intervals[timeRange] || "1 hour";
}

export function parseTimeRange(timeRange) {
  const now = new Date();

  const durations = {
    "15m": 15 * 60 * 1000,
    "30m": 30 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "6h": 6 * 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
  };

  const duration = durations[timeRange];

  if (!duration) {
    throw new Error(`Invalid timeRange: ${timeRange}`);
  }

  const from = new Date(now.getTime() - duration);

  const to = now;

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export function getCorrectInterval(interval) {
  const intervals = {
    "5m": "5 minutes",
    "15m": "15 minutes",
    "30m": "30 minutes",
    "1h": "1 hour",
    "6h": "6 hours",
    "24h": "24 hours",
  };

  return intervals[interval] || "5 minutes";
}
