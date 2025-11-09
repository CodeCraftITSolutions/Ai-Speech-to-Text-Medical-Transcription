"""update jobs with transcription links"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("jobs", schema=None) as batch_op:
        batch_op.drop_index("ix_jobs_user_id")
        batch_op.alter_column("user_id", new_column_name="created_by_id")
        batch_op.create_index("ix_jobs_created_by_id", ["created_by_id"])

        batch_op.add_column(sa.Column("assignee_id", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("transcription_id", sa.Integer(), nullable=True))

        batch_op.create_index("ix_jobs_assignee_id", ["assignee_id"])
        batch_op.create_index("ix_jobs_transcription_id", ["transcription_id"])

        batch_op.create_foreign_key(
            "fk_jobs_assignee_id_users",
            "users",
            ["assignee_id"],
            ["id"],
            ondelete="SET NULL",
        )
        batch_op.create_foreign_key(
            "fk_jobs_transcription_id_transcriptions",
            "transcriptions",
            ["transcription_id"],
            ["id"],
            ondelete="CASCADE",
        )


def downgrade() -> None:
    with op.batch_alter_table("jobs", schema=None) as batch_op:
        batch_op.drop_constraint(
            "fk_jobs_transcription_id_transcriptions", type_="foreignkey"
        )
        batch_op.drop_constraint("fk_jobs_assignee_id_users", type_="foreignkey")

        batch_op.drop_index("ix_jobs_transcription_id")
        batch_op.drop_index("ix_jobs_assignee_id")
        batch_op.drop_index("ix_jobs_created_by_id")

        batch_op.drop_column("transcription_id")
        batch_op.drop_column("assignee_id")

        batch_op.alter_column("created_by_id", new_column_name="user_id")
        batch_op.create_index("ix_jobs_user_id", ["user_id"])
