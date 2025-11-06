from __future__ import annotations

from contextlib import contextmanager

CONTENT_TYPE_LATEST = "text/plain; version=0.0.4; charset=utf-8"


class _Metric:
    def __init__(self, *args, **kwargs) -> None:
        self._labels = {}

    def labels(self, **kwargs):
        self._labels.update(kwargs)
        return self

    def inc(self, amount: float = 1.0) -> None:
        pass

    @contextmanager
    def time(self):
        yield


class Counter(_Metric):
    pass


class Histogram(_Metric):
    pass


def generate_latest() -> bytes:
    return b""


__all__ = ["Counter", "Histogram", "generate_latest", "CONTENT_TYPE_LATEST"]
