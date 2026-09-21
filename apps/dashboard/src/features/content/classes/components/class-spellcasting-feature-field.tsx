import { useWatch } from 'react-hook-form'
import { Text } from '@rpg/ui'

import { FeatureTableRow } from '@/lib/content-table-surface'

import type { ClassFormValues } from '../lib/class-form-fields'
import { spellcastingFeatureSummaryFromRows } from '../lib/class-spellcasting-lifecycle'

export function ClassSpellcastingFeatureField() {
  const features = useWatch<ClassFormValues, 'features'>({ name: 'features' }) ?? []
  const summary = spellcastingFeatureSummaryFromRows(features)

  if (!summary) {
    return (
      <Text variant="muted" className="text-sm">
        Add a Spellcasting feature on the Features tab, or turn spellcasting off and on again to
        create one automatically.
      </Text>
    )
  }

  return (
    <FeatureTableRow
      title={summary.name}
      metadata={`Level ${summary.level} · Edit on the Features tab`}
      typeLabel="Spellcasting feature"
    />
  )
}
