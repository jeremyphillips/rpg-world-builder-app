import { formatExtendedLevelRange, formatStandardLevelRange } from '@rpg/contracts'
import type { DisplayConfig } from '@rpg/ui/form'

export function standardLevelRangeSummaryDisplay(): DisplayConfig {
  return {
    kind: 'display',
    id: 'standard-level-range-summary',
    resolve: {
      dependsOn: ['maxCharacterLevel', 'extendedProgressionEnabled'],
      contentWhen: (values) => {
        if (values.extendedProgressionEnabled === true) return undefined
        const standardMax =
          typeof values.maxCharacterLevel === 'number' ? values.maxCharacterLevel : 20
        return {
          variant: 'text',
          text: formatStandardLevelRange(standardMax),
          role: 'muted',
          live: 'polite',
        }
      },
    },
  }
}

export function extendedLevelRangeSummaryDisplay(): DisplayConfig {
  return {
    kind: 'display',
    id: 'extended-level-range-summary',
    resolve: {
      dependsOn: [
        'maxCharacterLevel',
        'extendedProgressionEnabled',
        'extendedTierName',
        'extendedMaxLevel',
      ],
      contentWhen: (values) => {
        if (values.extendedProgressionEnabled !== true) return undefined
        const standardMax =
          typeof values.maxCharacterLevel === 'number' ? values.maxCharacterLevel : 20
        return {
          variant: 'text',
          text: formatExtendedLevelRange({
            maxCharacterLevel: standardMax,
            extendedTierName:
              typeof values.extendedTierName === 'string' ? values.extendedTierName : undefined,
            extendedMaxLevel:
              typeof values.extendedMaxLevel === 'number' ? values.extendedMaxLevel : undefined,
          }),
          role: 'muted',
          live: 'polite',
        }
      },
    },
  }
}
