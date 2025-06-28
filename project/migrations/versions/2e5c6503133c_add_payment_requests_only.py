"""Add payment_requests only

Revision ID: 2e5c6503133c
Revises: 
Create Date: 2025-06-26 07:32:06.981177
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '2e5c6503133c'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'payment_requests',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('shipment_id', sa.Integer(), nullable=False),
        sa.Column('amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('utr', sa.String(length=64), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=True, server_default='Pending'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['shedloadoverseas.users.id']),
        sa.ForeignKeyConstraint(['shipment_id'], ['shedloadoverseas.shipments.id']),
        schema='shedloadoverseas'
    )


def downgrade():
    op.drop_table('payment_requests', schema='shedloadoverseas')

