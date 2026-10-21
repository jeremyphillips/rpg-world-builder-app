import { Table2 } from 'lucide-react'
import type { ReactNode } from 'react'

import { ActionButton, Badge, Card, CardContent, IconContainer, Text } from '@rpg/ui'

import { DetailEntityRowActions } from '../../../lib/detail/row/entity/detail-entity-row-actions'

export type FeatureTableRowModel = {
  title: string
  metadata: string
  typeLabel?: string
}

export type FeatureTableRowProps = FeatureTableRowModel & {
  editLabel?: string
  onEdit?: () => void
  overflowActions?: ReactNode
}

export function FeatureTableRow({
  title,
  metadata,
  typeLabel,
  editLabel = 'Edit',
  onEdit,
  overflowActions,
}: FeatureTableRowProps) {
  return (
    <Card tone="subtle" density="compact">
      <CardContent className="flex min-w-0 items-center gap-3">
        <IconContainer>
          <Table2 />
        </IconContainer>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="truncate font-medium text-foreground">{title}</div>
          <Text as="div" variant="caption" className="truncate">
            {metadata}
          </Text>
        </div>
        {typeLabel || onEdit || overflowActions ? (
          <div className="flex shrink-0 items-center gap-4">
            {typeLabel ? (
              <Badge appearance="soft" tone="info" size="sm" className="shrink-0">
                {typeLabel}
              </Badge>
            ) : null}
            {onEdit || overflowActions ? (
              <DetailEntityRowActions className="flex shrink-0 items-center gap-3">
                {onEdit ? (
                  <ActionButton action="edit" variant="outline" size="sm" onClick={onEdit}>
                    {editLabel}
                  </ActionButton>
                ) : null}
                {overflowActions}
              </DetailEntityRowActions>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
