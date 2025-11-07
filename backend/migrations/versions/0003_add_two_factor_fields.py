"""Add two-factor authentication fields to users.

Revision ID: 0003_add_two_factor_fields
Revises: 0002_add_user_profile_fields
Create Date: 2024-05-20 00:00:00.000000
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0003_add_two_factor_fields"
down_revision = "0002_add_user_profile_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "two_factor_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
    op.add_column(
        "users",
        sa.Column("two_factor_challenge_token", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("two_factor_challenge_expires_at", sa.DateTime(), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("two_factor_shared_secret", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("two_factor_confirmed_at", sa.DateTime(), nullable=True),
    )

    op.execute("UPDATE users SET two_factor_enabled = FALSE WHERE two_factor_enabled IS NULL")
    op.alter_column("users", "two_factor_enabled", server_default=None)


def downgrade() -> None:
    op.drop_column("users", "two_factor_challenge_token")
    op.drop_column("users", "two_factor_confirmed_at")
    op.drop_column("users", "two_factor_shared_secret")
    op.drop_column("users", "two_factor_challenge_expires_at")
    op.drop_column("users", "two_factor_enabled")
