'use client'

import type { ReactNode } from 'react'
import { Trash2 } from 'lucide-react'

import { Text } from '@rpg/ui'

import {
  builderInventoryRowActionsClasses,
  builderInventoryRowContentClasses,
  builderInventoryRowDenseRemoveButtonClasses,
  builderInventoryRowFooterClasses,
  builderInventoryRowHeaderClasses,
  builderInventoryRowMetaClasses,
  builderInventoryRowProvenanceClasses,
  builderInventoryRowRemoveButtonClasses,
  builderInventoryRowSourceClasses,
  builderInventoryRowVariants,
} from './builder-inventory-row.variants'

export const BUILDER_INVENTORY_ROW_REMOVE_LABEL_PREFIX = 'Remove' as const

export function formatBuilderInventoryRowRemoveLabel(label: string): string {
  return `${BUILDER_INVENTORY_ROW_REMOVE_LABEL_PREFIX} ${label}`
}

export type BuilderInventoryRowVariant = 'card' | 'dense'

export type BuilderInventoryRowProps = {
  variant?: BuilderInventoryRowVariant
  label: ReactNode
  /** Plain-text label used for the icon-only remove button aria-label when removeAriaLabel is omitted. */
  itemLabel: string
  provenance?: ReactNode
  meta?: ReactNode
  footer?: ReactNode
  sourceLabel?: string
  removeAriaLabel?: string
  onRemove?: () => void
}

function RemoveButton({
  ariaLabel,
  className,
  onRemove,
}: {
  ariaLabel: string
  className: string
  onRemove: () => void
}) {
  return (
    <button type="button" className={className} aria-label={ariaLabel} onClick={onRemove}>
      <Trash2 aria-hidden className="size-4" />
    </button>
  )
}

export function BuilderInventoryRow({
  variant = 'card',
  label,
  itemLabel,
  provenance,
  meta,
  footer,
  sourceLabel,
  removeAriaLabel,
  onRemove,
}: BuilderInventoryRowProps) {
  const resolvedRemoveLabel = removeAriaLabel ?? formatBuilderInventoryRowRemoveLabel(itemLabel)

  if (variant === 'dense') {
    return (
      <article className={builderInventoryRowVariants({ variant: 'dense' })}>
        <div className={builderInventoryRowHeaderClasses}>
          <div className={builderInventoryRowContentClasses}>
            <div className={builderInventoryRowMetaClasses}>
              {label}
              {meta}
            </div>
            {provenance ? (
              <div className={builderInventoryRowProvenanceClasses}>{provenance}</div>
            ) : null}
          </div>
          {onRemove ? (
            <RemoveButton
              ariaLabel={resolvedRemoveLabel}
              className={builderInventoryRowDenseRemoveButtonClasses}
              onRemove={onRemove}
            />
          ) : null}
        </div>
        {footer ? <div className={builderInventoryRowFooterClasses}>{footer}</div> : null}
      </article>
    )
  }

  return (
    <div className={builderInventoryRowVariants({ variant: 'card' })}>
      <div className={builderInventoryRowMetaClasses}>
        {label}
        {meta}
      </div>
      <div className={builderInventoryRowActionsClasses}>
        {sourceLabel ? (
          <Text variant="caption" className={builderInventoryRowSourceClasses}>
            {sourceLabel}
          </Text>
        ) : null}
        {onRemove ? (
          <RemoveButton
            ariaLabel={resolvedRemoveLabel}
            className={builderInventoryRowRemoveButtonClasses}
            onRemove={onRemove}
          />
        ) : null}
      </div>
    </div>
  )
}
