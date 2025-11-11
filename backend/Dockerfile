# syntax=docker/dockerfile:1
# ------------------------
# Backend application image
# ------------------------
# Start from a slim Python base image that includes the runtime needed for FastAPI.
FROM python:3.11-slim

# Ensure Python output is sent straight to the terminal (useful for logging).
ENV PYTHONUNBUFFERED=1

# Set the working directory inside the container where the app will live.
WORKDIR /app

# ------------------------
# Install Python dependencies
# ------------------------
# Copy the project dependency definition files first so Docker can cache this layer.
COPY pyproject.toml poetry.lock* ./

# Install Poetry and use it to install application dependencies without creating a virtualenv.
RUN pip install --no-cache-dir poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-interaction --no-ansi 
    
RUN pip install psycopg2-binary
# ------------------------
# Copy application source code
# ------------------------
COPY app ./app
COPY migrations ./migrations
COPY alembic.ini ./alembic.ini

# ------------------------
# Runtime configuration
# ------------------------
# Expose the port used by Uvicorn and set the default command to run the API server.
EXPOSE 8000
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
CMD alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000

