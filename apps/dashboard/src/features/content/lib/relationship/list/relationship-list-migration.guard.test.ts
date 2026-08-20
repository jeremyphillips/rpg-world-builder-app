import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const REPO_ROOT = join(__dirname, '../../../../../../../..')

const RELATIONSHIP_SECTION_FILES = [
  'apps/dashboard/src/features/content/organizations/components/members/organization-members-section.client.tsx',
  'apps/dashboard/src/features/content/organizations/components/location-connections/organization-location-connections-section.client.tsx',
  'apps/dashboard/src/features/content/locations/components/location-people-and-organizations-section.client.tsx',
  'apps/dashboard/src/features/content/locations/components/location-territorial-authority-section.client.tsx',
] as const

const LEGACY_PATTERNS = [
  /RelationshipContentRow/,
  /RelationshipFieldGroupRow/,
  /relationship-content-row/,
  /relationship-field-group-row/,
  /CrossContentRelationshipRow/,
  /DetailSectionGroup/,
  /space-y-1/,
] as const

function walkFiles(dir: string, matcher: RegExp, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    const stat = statSync(path)
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist') continue
      walkFiles(path, matcher, files)
      continue
    }
    if (matcher.test(path)) files.push(path)
  }
  return files
}

describe('relationship list migration guard', () => {
  it('has zero legacy relationship list patterns in typed-edge sections', () => {
    for (const relativePath of RELATIONSHIP_SECTION_FILES) {
      const source = readFileSync(join(REPO_ROOT, relativePath), 'utf8')
      for (const pattern of LEGACY_PATTERNS) {
        expect(source, `${relativePath} must not match ${pattern}`).not.toMatch(pattern)
      }
      expect(source, `${relativePath} must use RelationshipList`).toMatch(/RelationshipList/)
    }
  })

  it('has zero legacy relationship list component references in dashboard src', () => {
    const dashboardSrc = join(REPO_ROOT, 'apps/dashboard/src')
    const legacyComponentPatterns = [
      /RelationshipContentRow/,
      /RelationshipFieldGroupRow/,
      /relationship-content-row\.client/,
      /relationship-field-group-row\.client/,
    ]

    const tsFiles = walkFiles(dashboardSrc, /\.(ts|tsx)$/)
    const violations: string[] = []

    for (const file of tsFiles) {
      if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) continue
      const source = readFileSync(file, 'utf8')
      for (const pattern of legacyComponentPatterns) {
        if (pattern.test(source)) {
          violations.push(`${file.replace(REPO_ROOT + '/', '')} matches ${pattern}`)
        }
      }
    }

    expect(violations).toEqual([])
  })
})
