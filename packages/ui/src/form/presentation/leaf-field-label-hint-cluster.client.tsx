'use client'

import type { ReactNode } from 'react'

import { FieldLabelContent } from '../../components/ui/field-label-content'
import { shouldShowVisibleRequiredMarker } from '../../components/ui/field-required.lib'
import type { FieldSize } from '../../components/ui/field.client'
import { fieldLabelHintStackClasses, fieldLabelVariants } from '../../components/ui/field.variants'
import { Text } from '../../components/ui/text'
import type { FieldHintConfig } from '../field-config'
import { normalizeFieldHint } from '../field-config'
import { formSectionHeaderLabelRowClasses } from './form-section-header.variants'

export function renderLeafFieldHint(hint: string | FieldHintConfig | undefined): ReactNode {
  if (!hint) return null
  const normalized = normalizeFieldHint(hint)
  if (!normalized.text) return null
  return <Text variant="caption">{normalized.text}</Text>
}

export interface LeafFieldLabelHintClusterProps {
  label: string
  hint?: string | FieldHintConfig
  size?: FieldSize
  required?: boolean
  labelAccessory?: ReactNode
  showVisibleLabel?: boolean
  id?: string
}

/** Label + below-label hint stack — matches leaf `Field.Label` / `Field.Hint` typography. */
export function LeafFieldLabelHintCluster({
  label,
  hint,
  size = 'md',
  required,
  labelAccessory,
  showVisibleLabel = true,
  id,
}: LeafFieldLabelHintClusterProps) {
  const hintNode = renderLeafFieldHint(hint)
  const labelLine = showVisibleLabel ? (
    <div className={formSectionHeaderLabelRowClasses}>
      <span className={fieldLabelVariants({ size })}>
        <FieldLabelContent
          label={label}
          required={required}
          showRequiredMarker={shouldShowVisibleRequiredMarker(required ?? false, 'visible')}
        />
      </span>
      {labelAccessory}
    </div>
  ) : labelAccessory ? (
    <div className={formSectionHeaderLabelRowClasses}>{labelAccessory}</div>
  ) : null

  if (hintNode) {
    return (
      <div id={id} className={fieldLabelHintStackClasses}>
        {labelLine}
        {hintNode}
      </div>
    )
  }

  if (!labelLine) return null

  return <div id={id}>{labelLine}</div>
}
