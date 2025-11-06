from prometheus_client import Counter, Histogram

REQUEST_COUNT = Counter(
    "api_request_total",
    "Total number of HTTP requests",
    ["method", "endpoint", "http_status"],
)

REQUEST_LATENCY = Histogram(
    "api_request_latency_seconds",
    "Latency of HTTP requests in seconds",
    ["method", "endpoint"],
)


async def record_metrics(request, call_next):
    method = request.method
    endpoint = request.url.path
    with REQUEST_LATENCY.labels(method=method, endpoint=endpoint).time():
        response = await call_next(request)
    REQUEST_COUNT.labels(method=method, endpoint=endpoint, http_status=response.status_code).inc()
    return response

