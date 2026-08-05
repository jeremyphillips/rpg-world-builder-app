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
  locationParentReferenceSource,
  locationPartyReferenceSource,
  locationTerritorialAuthorityReferenceSource,
  campaignPrimaryWorldReferenceSource,
} from './content-usage-sources'

const CHARACTER_SUMMARY_LABELS = { singular: 'character', plural: 'characters' } as const

export const CONTENT_USAGE_REGISTRATIONS_LIST = [
  defineContentUsage({
    contentType: 'classes',
    sources: [{ source: characterClassSource, entry: true, batch: true }],
    summaryLabels: CHARACTER_SUMMARY_LABELS,
    overviewUsageScope: 'characters',
    viewerCharacterRelationship: { strategy: 'fixed', kind: 'class' },
  }),
  defineContentUsage({
    contentType: 'subclasses',
    sources: [{ source: characterSubclassSource, entry: true, batch: true }],
    summaryLabels: CHARACTER_SUMMARY_LABELS,
    overviewUsageScope: 'characters',
    viewerCharacterRelationship: { strategy: 'fixed', kind: 'subclass' },
  }),
  defineContentUsage({
    contentType: 'species',
    sources: [{ source: characterSpeciesSource, entry: true, batch: true }],
    summaryLabels: CHARACTER_SUMMARY_LABELS,
    overviewUsageScope: 'characters',
    viewerCharacterRelationship: { strategy: 'fixed', kind: 'species' },
  }),
  defineContentUsage({
    contentType: 'spells',
    sources: [{ source: characterSpellSource, entry: true, batch: true }],
    summaryLabels: CHARACTER_SUMMARY_LABELS,
    overviewUsageScope: 'characters',
    viewerCharacterRelationship: { strategy: 'spell-selection' },
  }),
  defineContentUsage({
    contentType: 'feats',
    sources: [{ source: characterFeatSource, entry: true, batch: true }],
    summaryLabels: CHARACTER_SUMMARY_LABELS,
    overviewUsageScope: 'characters',
    viewerCharacterRelationship: { strategy: 'fixed', kind: 'has', hasNoun: 'feat' },
  }),
  defineContentUsage({
    contentType: 'equipment',
    sources: [{ source: characterEquipmentSource, entry: true, batch: true }],
    summaryLabels: CHARACTER_SUMMARY_LABELS,
    overviewUsageScope: 'characters',
    viewerCharacterRelationship: { strategy: 'fixed', kind: 'owns' },
  }),
  defineContentUsage({
    contentType: 'organizations',
    sources: [
      { source: characterOrganizationSource, entry: true, batch: true },
      { source: locationPartyReferenceSource, entry: true, batch: true },
      { source: locationTerritorialAuthorityReferenceSource, entry: true, batch: true },
    ],
    summaryLabels: CHARACTER_SUMMARY_LABELS,
    overviewUsageScope: 'characters',
    viewerCharacterRelationship: { strategy: 'fixed', kind: 'member' },
  }),
  defineContentUsage({
    contentType: 'locations',
    sources: [
      { source: locationParentReferenceSource, entry: true, batch: true },
      { source: campaignPrimaryWorldReferenceSource, entry: true, batch: true },
    ],
    summaryLabels: { singular: 'location', plural: 'locations' },
    overviewUsageScope: 'complete',
    viewerCharacterRelationship: { strategy: 'none' },
  }),
  defineContentUsage({
    contentType: 'skill-proficiencies',
    sources: [{ source: characterSkillProficiencySource, entry: true, batch: true }],
    summaryLabels: CHARACTER_SUMMARY_LABELS,
    lookupKey: 'slug',
    overviewUsageScope: 'characters',
    viewerCharacterRelationship: { strategy: 'fixed', kind: 'has', hasNoun: 'proficiency' },
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
