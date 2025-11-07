"""add patients and transcriptions tables"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "patients",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("patient_identifier", sa.String(length=64), nullable=False),
        sa.Column("patient_name", sa.String(length=255), nullable=False),
        sa.Column("patient_date_of_birth", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index(
        "ix_patients_patient_identifier",
        "patients",
        ["patient_identifier"],
        unique=True,
    )
    op.create_index("ix_patients_id", "patients", ["id"], unique=False)

    op.create_table(
        "transcriptions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("patient_id", sa.Integer(), nullable=False),
        sa.Column("doctor_specialty", sa.String(length=255), nullable=True),
        sa.Column("transcript_text", sa.Text(), nullable=False),
        sa.Column("receptionist_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["patient_id"], ["patients.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["receptionist_id"], ["users.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_transcriptions_id", "transcriptions", ["id"], unique=False)
    op.create_index(
        "ix_transcriptions_patient_id",
        "transcriptions",
        ["patient_id"],
        unique=False,
    )
    op.create_index(
        "ix_transcriptions_receptionist_id",
        "transcriptions",
        ["receptionist_id"],
        unique=False,
    )

    op.alter_column("patients", "created_at", server_default=None)
    op.alter_column("patients", "updated_at", server_default=None)
    op.alter_column("transcriptions", "created_at", server_default=None)
    op.alter_column("transcriptions", "updated_at", server_default=None)


def downgrade() -> None:
    op.drop_index("ix_transcriptions_receptionist_id", table_name="transcriptions")
    op.drop_index("ix_transcriptions_patient_id", table_name="transcriptions")
    op.drop_index("ix_transcriptions_id", table_name="transcriptions")
    op.drop_table("transcriptions")

    op.drop_index("ix_patients_id", table_name="patients")
    op.drop_index("ix_patients_patient_identifier", table_name="patients")
    op.drop_table("patients")
