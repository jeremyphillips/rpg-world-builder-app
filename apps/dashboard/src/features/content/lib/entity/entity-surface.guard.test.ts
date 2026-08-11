import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect, it } from 'vitest'

const REPO_ROOT = join(__dirname, '../../../../../../..')
const FEATURE_ROOT = join(REPO_ROOT, 'apps/dashboard/src/features')
const INTERNAL_ENTITY_FILES = new Set([
  'content/lib/content-entity-card.client.tsx',
  'content/lib/entity/entity-summary.client.tsx',
])

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return sourceFiles(path)
    return entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') ? [path] : []
  })
}

function featureImplementationFiles(): string[] {
  return sourceFiles(FEATURE_ROOT).filter(
    (path) => !/\.(test|stories|integration\.test)\.tsx?$/.test(path),
  )
}

describe('entity surface architecture guard', () => {
  it('keeps ContentCardHeading and ContentCardBody internal to entity surfaces', () => {
    for (const path of featureImplementationFiles()) {
      const relativePath = relative(FEATURE_ROOT, path)
      if (INTERNAL_ENTITY_FILES.has(relativePath)) continue

      const source = readFileSync(path, 'utf8')
      expect(source, `${relativePath} must not compose entity heading internals`).not.toMatch(
        /\bContentCardHeading\b|\bContentCardBody\b/,
      )
    }
  })

  it('does not expose EntityCardFrame outside entity internals', () => {
    for (const path of featureImplementationFiles()) {
      const relativePath = relative(FEATURE_ROOT, path)
      if (relativePath.startsWith('content/lib/entity/') || INTERNAL_ENTITY_FILES.has(relativePath))
        continue

      const source = readFileSync(path, 'utf8')
      expect(source, `${relativePath} must not compose EntityCardFrame`).not.toMatch(
        /\bEntityCardFrame\b/,
      )
    }
  })

  it('does not revive entity header components or styling escape hatches', () => {
    for (const path of featureImplementationFiles()) {
      const relativePath = relative(FEATURE_ROOT, path)
      const source = readFileSync(path, 'utf8')

      expect(relativePath, 'legacy ItemHeader component files are forbidden').not.toMatch(
        /(?:catalog|spell|equipment).*item-header\.client\.tsx$/i,
      )
      expect(
        source,
        `${relativePath} must not target entity surfaces with descendants`,
      ).not.toMatch(/\[&_[^\]]*(?:entity-|EntityItem|ContentEntityCard|DisclosureEntityCard)/)
      expect(source, `${relativePath} must not use !important`).not.toMatch(/!important/)
    }
  })
})
