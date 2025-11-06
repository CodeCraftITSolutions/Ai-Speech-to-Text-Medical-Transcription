from __future__ import annotations

from typing import BinaryIO

try:
    import boto3  # type: ignore
    from botocore.client import Config  # type: ignore
except ModuleNotFoundError:  # pragma: no cover
    class Config:  # type: ignore[no-redef]
        def __init__(self, signature_version: str | None = None) -> None:
            self.signature_version = signature_version

    class _FakeClient:
        def put_object(self, **kwargs):  # pragma: no cover
            return None

        def upload_fileobj(self, *args, **kwargs):  # pragma: no cover
            return None

        def generate_presigned_url(self, *args, **kwargs):  # pragma: no cover
            return "https://example.com/mock"

        def delete_object(self, *args, **kwargs):  # pragma: no cover
            return None

    class _BotoStub:
        def client(self, *args, **kwargs):
            return _FakeClient()

    boto3 = _BotoStub()  # type: ignore

from app.settings import get_settings

settings = get_settings()


class StorageClient:
    def __init__(self):
        self._client = boto3.client(
            "s3",
            endpoint_url=settings.STORAGE_ENDPOINT,
            aws_access_key_id=settings.STORAGE_KEY,
            aws_secret_access_key=settings.STORAGE_SECRET,
            config=Config(signature_version="s3v4"),
        )
        self.bucket = settings.STORAGE_BUCKET

    def put_bytes(self, key: str, data: bytes, content_type: str | None = None) -> str:
        extra_args = {"ContentType": content_type} if content_type else {}
        self._client.put_object(Bucket=self.bucket, Key=key, Body=data, **extra_args)
        return key

    def upload_fileobj(self, key: str, fileobj: BinaryIO, content_type: str | None = None) -> str:
        extra_args = {"ContentType": content_type} if content_type else {}
        self._client.upload_fileobj(fileobj, self.bucket, key, ExtraArgs=extra_args)
        return key

    def get_signed_url(self, key: str, expires_in: int = 3600) -> str:
        return self._client.generate_presigned_url(
            "get_object", Params={"Bucket": self.bucket, "Key": key}, ExpiresIn=expires_in
        )

    def delete_file(self, key: str) -> None:
        self._client.delete_object(Bucket=self.bucket, Key=key)


storage_client = StorageClient()

