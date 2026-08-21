import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const REPO_ROOT = join(__dirname, '../../../../../../..')

const RELATIONSHIP_COLLECTION_SECTION_FILES = [
  'apps/dashboard/src/features/content/organizations/components/members/organization-members-section.tsx',
  'apps/dashboard/src/features/content/organizations/components/location-connections/organization-location-connections-section.tsx',
  'apps/dashboard/src/features/content/locations/components/connected-parties/location-people-and-organizations-section.tsx',
  'apps/dashboard/src/features/content/locations/components/connected-parties/location-territorial-authority-section.tsx',
] as const

const GROUPED_COLLECTION_BODY_FORBIDDEN = [
  /DetailCollectionGroup/,
  /detail-collection-group\.client/,
  /DetailCollectionRowList/,
  /detail-collection-row-list\.client/,
] as const

const RELATIONSHIP_BODY_REQUIRED = [/RelationshipList/] as const

const RELATIONSHIP_ROW_IMPORT_FORBIDDEN = [
  /CrossContentRelationshipRow/,
  /cross-content-relationship-row/,
  /relationship\/list\/row\//,
] as const

describe('detail collection grammar guard', () => {
  it('typed-edge relationship sections use RelationshipList, not grouped collection body', () => {
    for (const relativePath of RELATIONSHIP_COLLECTION_SECTION_FILES) {
      const source = readFileSync(join(REPO_ROOT, relativePath), 'utf8')

      for (const pattern of GROUPED_COLLECTION_BODY_FORBIDDEN) {
        expect(source, `${relativePath} must not match ${pattern}`).not.toMatch(pattern)
      }

      for (const pattern of RELATIONSHIP_BODY_REQUIRED) {
        expect(source, `${relativePath} must use RelationshipList`).toMatch(pattern)
      }

      for (const pattern of RELATIONSHIP_ROW_IMPORT_FORBIDDEN) {
        expect(source, `${relativePath} must not match ${pattern}`).not.toMatch(pattern)
      }
    }
  })

  it('RelationshipList imports shared collection chrome only, not private group/row-list variants', () => {
    const source = readFileSync(
      join(
        REPO_ROOT,
        'apps/dashboard/src/features/content/lib/relationship/list/relationship-list.tsx',
      ),
      'utf8',
    )

    expect(source).toMatch(/detail-collection-chrome\.variants/)
    expect(source).not.toMatch(/detail-collection-group\.variants/)
    expect(source).not.toMatch(/detail-collection-row-list\.variants/)
  })
})
