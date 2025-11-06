.PHONY: install run test lint migrate upgrade

install:
poetry install

run:
poetry run uvicorn app.main:app --reload

test:
poetry run pytest

migrate:
poetry run alembic revision --autogenerate -m "update"

upgrade:
poetry run alembic upgrade head

