import { isValidElement, type ReactElement, type ReactNode } from 'react'

import type { EntityAnatomyTrailing } from '@/features/content/lib/entity/anatomy/entity-anatomy-trailing.types'
import { EntityCard } from '@/features/content/lib/entity/surfaces/cards/content/entity-card'
import { ActionButton, Icon, IconContainer } from '@rpg/ui'

import { DetailEntityRowActions } from '../../../lib/detail/row/entity/detail-entity-row-actions'

export type FeatureTableRowModel = {
  title: string
  metadata?: string
  description?: ReactNode
  typeLabel?: string
}

export type FeatureTableRowProps = FeatureTableRowModel & {
  editLabel?: string
  onEdit?: () => void
  overflowActions?: ReactNode
}

function resolveTrailing(
  edit: ReactElement | null,
  overflowActions: ReactNode | undefined,
): EntityAnatomyTrailing | undefined {
  if (edit && overflowActions) {
    return {
      kind: 'action',
      content: (
        <DetailEntityRowActions>
          {edit}
          {overflowActions}
        </DetailEntityRowActions>
      ),
    }
  }

  if (edit) {
    return { kind: 'action', content: edit }
  }

  if (isValidElement(overflowActions)) {
    return { kind: 'utility', content: overflowActions }
  }

  if (overflowActions) {
    return {
      kind: 'utility',
      content: <DetailEntityRowActions>{overflowActions}</DetailEntityRowActions>,
    }
  }

  return undefined
}

export function FeatureTableRow({
  title,
  metadata,
  description,
  typeLabel,
  editLabel = 'Edit',
  onEdit,
  overflowActions,
}: FeatureTableRowProps) {
  const edit = onEdit ? (
    <ActionButton action="edit" variant="outline" size="sm" onClick={onEdit}>
      {editLabel}
    </ActionButton>
  ) : null

  return (
    <EntityCard
      density="compact"
      entity={{
        heading: title,
        supportingMetadata: description || !metadata ? undefined : [metadata],
        description,
        media: (
          <IconContainer>
            <Icon name="table" size="owner" />
          </IconContainer>
        ),
        status: typeLabel
          ? [{ kind: 'badge', label: typeLabel, appearance: 'soft', tone: 'info' }]
          : undefined,
      }}
      trailing={resolveTrailing(edit, overflowActions)}
    />
  )
}
