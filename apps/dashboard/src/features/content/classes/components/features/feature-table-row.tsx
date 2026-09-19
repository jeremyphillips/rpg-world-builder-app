import { Pencil, Table2 } from 'lucide-react'
import type { ReactNode } from 'react'

import { Badge, Button, IconContainer } from '@rpg/ui'

import { DetailEntityRowActions } from '../../../lib/detail/row/entity/detail-entity-row-actions'
import {
  featureTableRowActionsClasses,
  featureTableRowCopyClasses,
  featureTableRowLayoutClasses,
  featureTableRowMetadataClasses,
  featureTableRowShellClasses,
  featureTableRowTitleClasses,
  featureTableRowTrailingClasses,
} from './feature-table-row.variants'

export type FeatureTableRowModel = {
  title: string
  metadata: string
  typeLabel?: string
}

export type FeatureTableRowProps = FeatureTableRowModel & {
  onEdit?: () => void
  overflowActions?: ReactNode
}

export function FeatureTableRow({
  title,
  metadata,
  typeLabel,
  onEdit,
  overflowActions,
}: FeatureTableRowProps) {
  return (
    <div className={featureTableRowShellClasses}>
      <div className={featureTableRowLayoutClasses}>
        <IconContainer>
          <Table2 />
        </IconContainer>
        <div className={featureTableRowCopyClasses}>
          <div className={featureTableRowTitleClasses}>{title}</div>
          <div className={featureTableRowMetadataClasses}>{metadata}</div>
        </div>
        {typeLabel || onEdit || overflowActions ? (
          <div className={featureTableRowTrailingClasses}>
            {typeLabel ? (
              <Badge appearance="soft" tone="info" size="sm" className="shrink-0">
                {typeLabel}
              </Badge>
            ) : null}
            {onEdit || overflowActions ? (
              <DetailEntityRowActions className={featureTableRowActionsClasses}>
                {onEdit ? (
                  <Button type="button" variant="outline" size="sm" onClick={onEdit}>
                    <Pencil aria-hidden />
                    Edit
                  </Button>
                ) : null}
                {overflowActions}
              </DetailEntityRowActions>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
