"""test migration

Revision ID: ec087e3eb4c2
Revises: 7480fe7e7356
Create Date: 2025-10-22 18:07:10.331238

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'ec087e3eb4c2'
down_revision = '7480fe7e7356'
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
