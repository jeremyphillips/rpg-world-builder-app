import type { ReactNode } from 'react'

import { ActionButton, EmptyPanel } from '@rpg/ui'
import { ArrayLikeSectionHeader, resolveFormDensity, useFormSectionContext } from '@rpg/ui/form'

import {
  FEATURE_TABLES_ADD_LABEL,
  FEATURE_TABLES_EMPTY_MESSAGE,
  FEATURE_TABLES_SECTION_HINT,
  FEATURE_TABLES_SECTION_LABEL,
} from './feature-tables-section-copy'
import {
  featureTablesSectionBodyClasses,
  featureTablesSectionClasses,
} from './feature-tables-section.variants'

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
      className={featureTablesSectionClasses}
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
      <div className={featureTablesSectionBodyClasses}>
        {tables.length === 0 ? <EmptyPanel>{FEATURE_TABLES_EMPTY_MESSAGE}</EmptyPanel> : tables}
      </div>
    </section>
  )
}
