import { createElement } from 'react'
import type { FormItem } from '@rpg/ui/form'

import {
  CAMPAIGN_ACCESS_DONE_LABEL,
  CAMPAIGN_ACCESS_SECTION_TOOLTIP,
  CAMPAIGN_ACCESS_SECTION_LEGEND,
} from '../../lib/campaign-access/campaign-access-labels'
import { CampaignAvailabilityChangeAffordance } from '@/lib/campaign-availability/campaign-availability-change-affordance'
import { resolveVocabularyAvailabilitySummary } from '@/lib/campaign-availability/campaign-availability-form-fields'
import { ClassSpellcastingFeatureAvailabilityField } from '../components/class-spellcasting-feature-availability-field'

export function buildSpellcastingFeatureAvailabilityFormFields(
  fieldId: string,
  namePrefix: string,
): FormItem[] {
  return [
    {
      kind: 'group',
      id: `md-availability-${fieldId}`,
      legend: CAMPAIGN_ACCESS_SECTION_LEGEND,
      density: 'compact',
      disclosure: {
        variant: 'dialog',
        openLabel: createElement(CampaignAvailabilityChangeAffordance),
        closeLabel: CAMPAIGN_ACCESS_DONE_LABEL,
        info: CAMPAIGN_ACCESS_SECTION_TOOLTIP,
        dialogHeadline: CAMPAIGN_ACCESS_SECTION_LEGEND,
        summaryDependsOn: ['available'],
        resolveSummary: (values) => resolveVocabularyAvailabilitySummary(Boolean(values.available)),
      },
      fields: [
        {
          kind: 'slot',
          name: 'spellcastingFeatureAvailability',
          render: () =>
            createElement(ClassSpellcastingFeatureAvailabilityField, {
              namePrefix,
            }),
        },
      ],
    },
  ]
}
