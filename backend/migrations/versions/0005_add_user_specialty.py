"""add user specialty"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("specialty", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "specialty")
