from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict, Mapping

from pydantic import BaseModel


class BaseSettings(BaseModel):
    class Config:
        env_file: str | None = None
        env_file_encoding: str = "utf-8"
        env_prefix: str = ""

    def __init__(self, **data: Any) -> None:
        env_values: Dict[str, Any] = {}
        config = getattr(self, "Config", BaseSettings.Config)
        if getattr(config, "env_file", None):
            env_path = Path(config.env_file)
            if env_path.exists():
                env_values.update(_read_env_file(env_path, getattr(config, "env_file_encoding", "utf-8")))
        env_values.update(os.environ)

        for field_name in self.model_fields:
            env_key = f"{getattr(config, 'env_prefix', '')}{field_name}".upper()
            if env_key in env_values and field_name not in data:
                data[field_name] = env_values[env_key]

        super().__init__(**data)


def _read_env_file(path: Path, encoding: str) -> Mapping[str, str]:
    values: Dict[str, str] = {}
    for line in path.read_text(encoding=encoding).splitlines():
        if not line or line.strip().startswith("#"):
            continue
        if "=" in line:
            key, value = line.split("=", 1)
            values[key.strip()] = value.strip()
    return values


__all__ = ["BaseSettings"]
