import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect, it } from 'vitest'

const REPO_ROOT = join(__dirname, '../../../../../../..')
const FEATURE_ROOT = join(REPO_ROOT, 'apps/dashboard/src/features')
const DRAWER_SURFACE_ROOT = join(FEATURE_ROOT, 'content/lib/entity/surfaces/drawer')
const RELATIONSHIP_DRAWER_ROOT = join(FEATURE_ROOT, 'content/lib/relationship/drawer')

const RELATIONSHIP_DRAWER_GENERIC_CONTEXT_FILES = new Set([
  'drawer-context.tsx',
  'drawer-context.types.ts',
  'drawer-context.variants.ts',
  'relationship-drawer-subject-field.tsx',
  'relationship-drawer-field-labels.ts',
])

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return sourceFiles(path)
    return entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') ? [path] : []
  })
}

function drawerSurfaceImplementationFiles(): string[] {
  return sourceFiles(DRAWER_SURFACE_ROOT).filter(
    (path) => !/\.(test|stories|integration\.test)\.tsx?$/.test(path),
  )
}

describe('entity drawer surface architecture guard', () => {
  it('keeps drawer base independent from replacement and relationship layers', () => {
    for (const path of drawerSurfaceImplementationFiles()) {
      const relativePath = relative(FEATURE_ROOT, path)
      if (relativePath.includes('/drawer/replacement/')) continue

      const source = readFileSync(path, 'utf8')
      expect(source, `${relativePath} must not import drawer replacement modules`).not.toMatch(
        /surfaces\/drawer\/replacement/,
      )
      expect(source, `${relativePath} must not import relationship drawer modules`).not.toMatch(
        /relationship\/drawer/,
      )
    }
  })

  it('keeps drawer replacement independent from relationship drawer modules', () => {
    for (const path of drawerSurfaceImplementationFiles()) {
      const relativePath = relative(FEATURE_ROOT, path)
      if (!relativePath.includes('/drawer/replacement/')) continue

      const source = readFileSync(path, 'utf8')
      expect(source, `${relativePath} must not import relationship drawer modules`).not.toMatch(
        /relationship\/drawer/,
      )
    }
  })

  it('keeps relationship drawer generic context off replacement surface imports', () => {
    for (const fileName of RELATIONSHIP_DRAWER_GENERIC_CONTEXT_FILES) {
      const path = join(RELATIONSHIP_DRAWER_ROOT, fileName)
      const source = readFileSync(path, 'utf8')
      expect(source, `${fileName} must not import drawer replacement modules`).not.toMatch(
        /surfaces\/drawer\/replacement/,
      )
    }
  })
})
