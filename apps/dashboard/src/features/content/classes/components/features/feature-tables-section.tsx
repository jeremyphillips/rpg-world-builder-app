import type { ReactNode } from 'react'

import { ActionButton, EmptyPanel, cn, fieldAnatomyStackVariants } from '@rpg/ui'
import { ArrayLikeSectionHeader, resolveFormDensity, useFormSectionContext } from '@rpg/ui/form'

import {
  FEATURE_TABLES_ADD_LABEL,
  FEATURE_TABLES_EMPTY_MESSAGE,
  FEATURE_TABLES_SECTION_HINT,
  FEATURE_TABLES_SECTION_LABEL,
} from './feature-tables-section-copy'
export type FeatureTablesSectionProps = {
  tables?: readonly ReactNode[]
  onAddTable?: () => void
}

export function FeatureTablesSection({ tables = [], onAddTable }: FeatureTablesSectionProps) {
  const { density } = useFormSectionContext()
  const { size } = resolveFormDensity(density)

  const addAction = onAddTable ? (
    <ActionButton action="add" variant="outline" size="sm" onClick={onAddTable}>
      {FEATURE_TABLES_ADD_LABEL}
    </ActionButton>
  ) : undefined

  return (
    <section
      className={cn('min-w-0', fieldAnatomyStackVariants({ size }))}
      aria-labelledby="feature-tables-section-heading"
    >
      <ArrayLikeSectionHeader
        id="feature-tables-section-heading"
        label={FEATURE_TABLES_SECTION_LABEL}
        hint={FEATURE_TABLES_SECTION_HINT}
        size={size}
        action={addAction}
        wrapper="none"
      />
      <div className="flex flex-col gap-2">
        {tables.length === 0 ? <EmptyPanel>{FEATURE_TABLES_EMPTY_MESSAGE}</EmptyPanel> : tables}
      </div>
    </section>
  )
}
