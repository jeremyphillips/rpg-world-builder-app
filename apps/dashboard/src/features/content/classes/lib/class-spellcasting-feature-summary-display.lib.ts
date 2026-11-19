import { joinInlineMetadata } from '@rpg/contracts/primitives'
import type { DisplayConfig } from '@rpg/ui/form'

import type { ClassFormValues } from './class-form-fields'
import { spellcastingFeatureSummaryFromRows } from './class-spellcasting-lifecycle'

const SPELLCASTING_FEATURE_MISSING_COPY =
  'Add a Spellcasting feature on the Features tab, or turn spellcasting off and on again to create one automatically.'

export function classSpellcastingFeatureSummaryDisplay(): DisplayConfig {
  return {
    kind: 'display',
    id: 'spellcasting-feature-summary',
    resolve: {
      dependsOn: ['features'],
      contentWhen: (values) => {
        const features = values.features
        const rows = Array.isArray(features) ? (features as ClassFormValues['features']) : []
        const summary = spellcastingFeatureSummaryFromRows(rows)
        if (!summary) {
          return {
            variant: 'text',
            text: SPELLCASTING_FEATURE_MISSING_COPY,
            role: 'supporting',
          }
        }
        return {
          variant: 'featureTableRow',
          title: summary.name,
          metadata: joinInlineMetadata([`Level ${summary.level}`, 'Edit on the Features tab']),
          typeLabel: 'Spellcasting feature',
        }
      },
    },
  }
}
