import {
  defineContentUsage,
  type ContentUsageRegistration,
  type ContentUsageSurfaceKey,
} from './define-content-usage'
import {
  characterClassSource,
  characterEquipmentSource,
  characterFeatSource,
  characterOrganizationSource,
  characterSkillProficiencySource,
  characterSpeciesSource,
  characterSpellSource,
  characterSubclassSource,
} from './content-usage-sources'

const CHARACTER_SUMMARY_LABELS = { singular: 'character', plural: 'characters' } as const

const CONTENT_USAGE_REGISTRATIONS_LIST = [
  defineContentUsage({
    contentType: 'classes',
    sources: [{ source: characterClassSource, entry: true, batch: true }],
    summaryLabels: CHARACTER_SUMMARY_LABELS,
    overviewUsageScope: 'characters',
  }),
  defineContentUsage({
    contentType: 'subclasses',
    sources: [{ source: characterSubclassSource, entry: true, batch: true }],
    summaryLabels: CHARACTER_SUMMARY_LABELS,
    overviewUsageScope: 'characters',
  }),
  defineContentUsage({
    contentType: 'species',
    sources: [{ source: characterSpeciesSource, entry: true, batch: true }],
    summaryLabels: CHARACTER_SUMMARY_LABELS,
    overviewUsageScope: 'characters',
  }),
  defineContentUsage({
    contentType: 'spells',
    sources: [{ source: characterSpellSource, entry: true, batch: true }],
    summaryLabels: CHARACTER_SUMMARY_LABELS,
    overviewUsageScope: 'characters',
  }),
  defineContentUsage({
    contentType: 'feats',
    sources: [{ source: characterFeatSource, entry: true, batch: true }],
    summaryLabels: CHARACTER_SUMMARY_LABELS,
    overviewUsageScope: 'characters',
  }),
  defineContentUsage({
    contentType: 'equipment',
    sources: [{ source: characterEquipmentSource, entry: true, batch: true }],
    summaryLabels: CHARACTER_SUMMARY_LABELS,
    overviewUsageScope: 'characters',
  }),
  defineContentUsage({
    contentType: 'organizations',
    sources: [{ source: characterOrganizationSource, entry: true, batch: true }],
    summaryLabels: CHARACTER_SUMMARY_LABELS,
    overviewUsageScope: 'characters',
  }),
  defineContentUsage({
    contentType: 'skill-proficiencies',
    sources: [{ source: characterSkillProficiencySource, entry: true, batch: true }],
    summaryLabels: CHARACTER_SUMMARY_LABELS,
    lookupKey: 'slug',
    overviewUsageScope: 'characters',
  }),
] as const satisfies readonly ContentUsageRegistration[]

export const CONTENT_USAGE_REGISTRATIONS: Record<
  ContentUsageSurfaceKey,
  ContentUsageRegistration | undefined
> = Object.fromEntries(
  CONTENT_USAGE_REGISTRATIONS_LIST.map((registration) => [registration.contentType, registration]),
) as Record<ContentUsageSurfaceKey, ContentUsageRegistration | undefined>

export function getContentUsageRegistration(
  contentType: ContentUsageSurfaceKey,
): ContentUsageRegistration {
  const registration = CONTENT_USAGE_REGISTRATIONS[contentType]
  if (!registration) {
    throw new Error(`Missing content usage registration for "${contentType}".`)
  }
  return registration
}

export function hasContentUsageRegistration(
  contentType: string,
): contentType is ContentUsageSurfaceKey {
  return (
    contentType in CONTENT_USAGE_REGISTRATIONS &&
    CONTENT_USAGE_REGISTRATIONS[contentType as ContentUsageSurfaceKey] != null
  )
}
