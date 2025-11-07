"""add totp fields to users

Revision ID: 0003_add_totp_fields
Revises: 0002_add_user_profile_fields
Create Date: 2025-02-14 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0003_add_totp_fields"
down_revision = "0002_add_user_profile_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("totp_secret", sa.String(length=255), nullable=True))
    op.add_column(
        "users",
        sa.Column("totp_secret_pending", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column(
            "totp_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
    op.execute("UPDATE users SET totp_enabled = FALSE WHERE totp_enabled IS NULL")
    op.alter_column("users", "totp_enabled", server_default=None)


def downgrade() -> None:
    op.drop_column("users", "totp_enabled")
    op.drop_column("users", "totp_secret_pending")
    op.drop_column("users", "totp_secret")
