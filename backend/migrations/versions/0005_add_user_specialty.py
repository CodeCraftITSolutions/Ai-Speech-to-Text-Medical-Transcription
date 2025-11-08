"""add user specialty"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0005_add_user_specialty"
down_revision = "0004_add_patients_and_transcriptions"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("specialty", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "specialty")
