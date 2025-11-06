"""Placeholder for websocket manager to stream live audio."""


class ConnectionManager:
    """TODO: Implement websocket broadcast for real-time transcription."""

    def __init__(self) -> None:
        self.active_connections = []

    async def connect(self, websocket):
        raise NotImplementedError("TODO: Implement websocket connections")

