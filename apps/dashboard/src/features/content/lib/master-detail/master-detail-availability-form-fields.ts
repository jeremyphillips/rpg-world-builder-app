import {
  buildCampaignAvailabilityFields,
  resolveVocabularyAvailabilitySummary,
} from '@/lib/campaign-availability/campaign-availability-form-fields'

/** Availability-only dialog fields for form-embedded master-detail rows. */
export function buildMasterDetailAvailabilityFormFields(fieldId: string) {
  return buildCampaignAvailabilityFields({
    groupId: `md-availability-${fieldId}`,
    pending: false,
    summaryDependsOn: ['available'],
    resolveSummary: (values) => resolveVocabularyAvailabilitySummary(Boolean(values.available)),
    presentation: 'dialog',
  })
}
