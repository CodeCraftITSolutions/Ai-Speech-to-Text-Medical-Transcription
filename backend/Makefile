.PHONY: install run test lint migrate upgrade

POETRY ?= $(shell command -v poetry)

ifeq ($(POETRY),)
$(error Poetry is not installed or not on your PATH. Install it with `pipx install poetry` or `pip install --user poetry` and retry.)
endif

install:
$(POETRY) install

run:
$(POETRY) run uvicorn app.main:app --reload

test:
$(POETRY) run pytest

migrate:
$(POETRY) run alembic revision --autogenerate -m "update"

upgrade:
$(POETRY) run alembic upgrade head
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

