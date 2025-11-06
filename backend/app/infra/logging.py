import logging

from app.settings import get_settings

settings = get_settings()

LOG_LEVEL = logging.INFO if settings.ENV == "production" else logging.DEBUG

logging.basicConfig(
    level=LOG_LEVEL,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
)

logger = logging.getLogger(settings.APP_NAME)

