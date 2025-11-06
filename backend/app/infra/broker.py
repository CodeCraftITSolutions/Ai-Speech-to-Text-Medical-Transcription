import types

try:
    import redis  # type: ignore
except ModuleNotFoundError:  # pragma: no cover
    class _RedisStub:
        def __init__(self, url: str) -> None:
            self.url = url

    redis = types.SimpleNamespace(from_url=lambda url: _RedisStub(url))  # type: ignore

try:
    from rq import Queue  # type: ignore
except ModuleNotFoundError:  # pragma: no cover
    class Queue:  # type: ignore[no-redef]
        def __init__(self, name: str, connection: object):
            self.name = name
            self.connection = connection

        def enqueue(self, *args, **kwargs):  # pragma: no cover
            return None

from app.settings import get_settings

settings = get_settings()

redis_conn = redis.from_url(settings.BROKER_URL)


def get_queue(name: str = "default") -> Queue:
    return Queue(name, connection=redis_conn)


__all__ = ["redis_conn", "get_queue"]
