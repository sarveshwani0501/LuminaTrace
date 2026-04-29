import * as spansRepo from "../spans/spansRepository.js";

export async function getSpansByTrace(traceId, projectId) {
  if (!traceId) {
    throw new Error("TraceId is required");
  }
  if (!projectId) {
    throw new Error("ProjectId is required");
  }

  const spans = await spansRepo.getSpansByTraceId(traceId, projectId);

  if (!spans || spans.length === 0) {
    return [];
  }

  const traceStartTime = new Date(spans[0].start_time).getTime();

  const spansMap = new Map();

  const rootSpans = [];

  spans.forEach((span) => {
    spansMap.set(span.span_id, {
      id: span.span_id,
      parent: span.parent_span_id,
      name: span.name,
      service: span.server_name || span.server_hostname || "unknown-service",
      offset: new Date(span.start_time).getTime() - traceStartTime,
      duration: span.duration_ms,
      level: span.metadata?.level || "INFO",
      depth: 0,
      meta: span.metadata ? JSON.stringify(span.metadata) : "",
      children: [],
    });
  });

  spans.forEach((span) => {
    const mappedSpan = spansMap.get(span.span_id);
    if (span.parent_span_id && spansMap.has(span.parent_span_id)) {
      spansMap.get(span.parent_span_id).children.push(mappedSpan);
    } else {
      rootSpans.push(mappedSpan);
    }
  });

  const flatOrderedSpans = [];

  function flattenTree(spanNode, currDepth) {
    spanNode.depth = currDepth;

    const { children, ...cleanSpan } = spanNode;

    flatOrderedSpans.push(cleanSpan);

    // recursion

    for (const child of children) {
      flattenTree(child, currDepth + 1);
    }
  }

  for (const root of rootSpans) {
    flattenTree(root, 0);
  }

  return flatOrderedSpans;
}

export async function insertSpans(span) {
  const res = spansRepo.insertSpans(span);
  return res;
}
