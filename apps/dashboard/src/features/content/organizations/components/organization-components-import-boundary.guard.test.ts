import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect, it } from 'vitest'

const REPO_ROOT = join(__dirname, '../../../../../../..')
const DASHBOARD_SRC = join(REPO_ROOT, 'apps/dashboard/src')

const ORGANIZATION_CREATE_MODAL_IMPORT =
  /organizations\/components\/create\/organization-create-modal/

function isForbiddenOrganizationComponentsImport(importPath: string): boolean {
  if (!importPath.includes('organizations/components/')) {
    return false
  }
  return !ORGANIZATION_CREATE_MODAL_IMPORT.test(importPath)
}

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

function collectImportPaths(source: string): string[] {
  const imports: string[] = []
  const importPattern = /from ['"]([^'"]+)['"]/g
  for (const match of source.matchAll(importPattern)) {
    imports.push(match[1]!)
  }
  return imports
}

describe('organization components import boundary guard', () => {
  it('allows Relationship nested-create to import only the Organization create modal entry', () => {
    const relationshipDir = join(DASHBOARD_SRC, 'features/content/lib/relationship')
    const violations: string[] = []

    for (const file of walkFiles(relationshipDir, /\.(ts|tsx)$/)) {
      const source = readFileSync(file, 'utf8')
      for (const importPath of collectImportPaths(source)) {
        if (!isForbiddenOrganizationComponentsImport(importPath)) continue
        violations.push(
          `${relative(REPO_ROOT, file)} imports forbidden organizations/components path: ${importPath}`,
        )
      }
    }

    expect(violations).toEqual([])
  })

  it('forbids Locations from importing Organization member UI internals', () => {
    const locationsDir = join(DASHBOARD_SRC, 'features/content/locations')
    const violations: string[] = []

    for (const file of walkFiles(locationsDir, /\.(ts|tsx)$/)) {
      const source = readFileSync(file, 'utf8')
      for (const importPath of collectImportPaths(source)) {
        if (!importPath.includes('organizations/components/members/')) continue
        violations.push(
          `${relative(REPO_ROOT, file)} imports forbidden organizations/components/members path: ${importPath}`,
        )
      }
    }

    expect(violations).toEqual([])
  })
})
