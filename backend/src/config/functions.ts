export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";
export function httpFunction(
  handler: string,
  method: HttpMethod,
  path: string,
) {
  return { handler, events: [{ httpApi: { method, path } }] };
}
export function scheduledFunction(
  handler: string,
  rate: string,
  memorySize = 512,
) {
  return {
    handler,
    timeout: 900,
    memorySize,
    ...(process.env.JOB_RESERVED_CONCURRENCY
      ? { reservedConcurrency: Number(process.env.JOB_RESERVED_CONCURRENCY) }
      : {}),
    events: [{ schedule: rate }],
  };
}
