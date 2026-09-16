import type { ReactNode } from 'react'

import { Button, EmptyPanel } from '@rpg/ui'
import { FormSectionHeader } from '@rpg/ui/form'
import { Plus } from 'lucide-react'

import {
  FEATURE_TABLES_ADD_LABEL,
  FEATURE_TABLES_EMPTY_MESSAGE,
  FEATURE_TABLES_SECTION_HINT,
  FEATURE_TABLES_SECTION_LABEL,
} from './feature-tables-section-copy'
import { featureTablesSectionBodyClasses } from './feature-tables-section.variants'

export type FeatureTablesSectionProps = {
  tables?: readonly ReactNode[]
  onAddTable?: () => void
}

export function FeatureTablesSection({ tables = [], onAddTable }: FeatureTablesSectionProps) {
  const addAction = onAddTable ? (
    <Button type="button" variant="outline" size="sm" onClick={onAddTable}>
      <Plus aria-hidden />
      {FEATURE_TABLES_ADD_LABEL}
    </Button>
  ) : undefined

  return (
    <section className="flex flex-col gap-2" aria-labelledby="feature-tables-section-heading">
      <FormSectionHeader
        id="feature-tables-section-heading"
        label={FEATURE_TABLES_SECTION_LABEL}
        hint={FEATURE_TABLES_SECTION_HINT}
        tier="subsection"
        action={addAction}
      />
      <div className={featureTablesSectionBodyClasses}>
        {tables.length === 0 ? <EmptyPanel>{FEATURE_TABLES_EMPTY_MESSAGE}</EmptyPanel> : tables}
      </div>
    </section>
  )
}
