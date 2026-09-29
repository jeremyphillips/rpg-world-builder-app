import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const REPO_ROOT = join(__dirname, '../../../../../../..')

const ENTITY_ROW_LIST_CONSUMER_FILES = [
  'apps/dashboard/src/features/content/organizations/components/members/organization-members-section.tsx',
  'apps/dashboard/src/features/content/organizations/components/location-connections/organization-location-connections-section.tsx',
  'apps/dashboard/src/features/content/locations/components/connected-parties/location-people-and-organizations-section.tsx',
  'apps/dashboard/src/features/content/locations/components/connected-parties/location-territorial-authority-section.tsx',
  'apps/dashboard/src/features/campaign/components/overview/campaign-overview-members-section.tsx',
  'apps/dashboard/src/features/campaign/components/overview/campaign-overview-party-section.tsx',
  'apps/dashboard/src/features/campaign/components/overview/campaign-overview-invitations-section.tsx',
  'apps/dashboard/src/features/character/components/detail/connections/character-connections-section.tsx',
  'apps/dashboard/src/features/character/components/builder/steps/connections/connections-step-section.tsx',
] as const

const GROUPED_COLLECTION_BODY_FORBIDDEN = [
  /DetailCollectionGroup/,
  /detail-collection-group\.client/,
  /DetailCollectionRowList/,
  /detail-collection-row-list\.client/,
] as const

const ENTITY_ROW_LIST_BODY_REQUIRED = [/EntityRowList\.Group/] as const

const ENTITY_ROW_LIST_FORBIDDEN = [
  /RelationshipList/,
  /CrossContentRelationshipRow/,
  /cross-content-relationship-row/,
  /relationship\/list\/relationship-list/,
] as const

const HAND_ROLLED_RECORD_LIST_FORBIDDEN = [
  /detailCollectionRecordSeparatorVariants/,
  /<ul[^>]*className=\{cn\(detailCollectionRecordSeparatorVariants/,
] as const

describe('detail collection grammar guard', () => {
  it('known entity-row-list consumers use EntityRowList.Group, not grouped collection body', () => {
    for (const relativePath of ENTITY_ROW_LIST_CONSUMER_FILES) {
      const source = readFileSync(join(REPO_ROOT, relativePath), 'utf8')

      for (const pattern of GROUPED_COLLECTION_BODY_FORBIDDEN) {
        expect(source, `${relativePath} must not match ${pattern}`).not.toMatch(pattern)
      }

      for (const pattern of ENTITY_ROW_LIST_BODY_REQUIRED) {
        expect(source, `${relativePath} must use EntityRowList.Group`).toMatch(pattern)
      }

      for (const pattern of ENTITY_ROW_LIST_FORBIDDEN) {
        expect(source, `${relativePath} must not match ${pattern}`).not.toMatch(pattern)
      }

      for (const pattern of HAND_ROLLED_RECORD_LIST_FORBIDDEN) {
        expect(
          source,
          `${relativePath} must not recreate EntityRowList collection separators locally`,
        ).not.toMatch(pattern)
      }
    }
  })

  it('EntityRowList imports shared collection chrome only, not private group/row-list variants', () => {
    const source = readFileSync(
      join(
        REPO_ROOT,
        'apps/dashboard/src/features/content/lib/entity/row-list/entity-row-list.tsx',
      ),
      'utf8',
    )

    expect(source).toMatch(/detail-collection-chrome\.variants/)
    expect(source).not.toMatch(/detail-collection-group\.variants/)
    expect(source).not.toMatch(/detail-collection-row-list\.variants/)
  })
})
