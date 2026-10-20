import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect, it } from 'vitest'

const REPO_ROOT = join(__dirname, '../../../../../../..')
const FEATURE_ROOT = join(REPO_ROOT, 'apps/dashboard/src/features')
const INTERNAL_ENTITY_FRAME_FILES = new Set([
  'content/lib/entity/surfaces/cards/content/content-entity-card.tsx',
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
  it('does not import retired ContentCard shell components from @rpg/ui', () => {
    for (const path of featureImplementationFiles()) {
      const relativePath = relative(FEATURE_ROOT, path)
      const source = readFileSync(path, 'utf8')
      expect(source, `${relativePath} must not import retired ContentCard shell`).not.toMatch(
        /\bimport\s+\{[^}]*\b(?:ContentCard|ContentCardBody|ContentCardHeading)\b/,
      )
    }
  })

  it('does not expose EntityCardFrame outside entity internals', () => {
    for (const path of featureImplementationFiles()) {
      const relativePath = relative(FEATURE_ROOT, path)
      if (
        relativePath.startsWith('content/lib/entity/') ||
        INTERNAL_ENTITY_FRAME_FILES.has(relativePath)
      )
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
        relativePath,
        'grant-local card/header presentation components are forbidden',
      ).not.toMatch(/(?:grant-card|grant-item-header)\.client\.tsx$/i)
      expect(
        source,
        `${relativePath} must not target entity surfaces with descendants`,
      ).not.toMatch(/\[&_[^\]]*(?:entity-|EntityAnatomyHost|EntityCard)/)
      expect(source, `${relativePath} must not use !important`).not.toMatch(/!important/)
    }
  })

  it('keeps entity-backed grant arrays on DisclosureEntityCard shells', () => {
    const grantFormFields = join(FEATURE_ROOT, 'content/lib/forms/grants/grant-form-fields.ts')
    const startingEquipmentFields = join(
      FEATURE_ROOT,
      'content/classes/lib/character-creation/class-starting-equipment-form-fields.ts',
    )

    for (const path of [grantFormFields, startingEquipmentFields]) {
      const relativePath = relative(FEATURE_ROOT, path)
      const source = readFileSync(path, 'utf8')
      expect(source, `${relativePath} must render entity-backed rows via DEC shell`).toMatch(
        /renderShell/,
      )
      expect(source, `${relativePath} must not compose ArrayItemShell`).not.toMatch(
        /\bArrayItemShell\b/,
      )
    }
  })

  it('does not use legacy entity trailing or heading link props in feature code', () => {
    const legacyPropPattern =
      /\b(?:EntityAnatomyHost|EntityCard|DetailEntityRow)[^;\n]*\b(?:action=|href=|endSlot=)/

    for (const path of featureImplementationFiles()) {
      const relativePath = relative(FEATURE_ROOT, path)
      if (relativePath.startsWith('content/lib/entity/')) continue

      const source = readFileSync(path, 'utf8')
      expect(
        source,
        `${relativePath} must use trailing/headingHref on entity surfaces`,
      ).not.toMatch(legacyPropPattern)
    }
  })

  it('does not import entity anatomy internals outside allowlist', () => {
    const allowlist = new Set([
      'content/lib/entity/surfaces/cards/content/content-entity-card.tsx',
      'content/lib/entity/surfaces/cards/disclosure/disclosure-entity-card.tsx',
      'content/lib/detail/row/entity/detail-entity-row.tsx',
      'content/lib/entity/surfaces/drawer/drawer-entity-block.tsx',
    ])

    for (const path of featureImplementationFiles()) {
      const relativePath = relative(FEATURE_ROOT, path)
      if (relativePath.startsWith('content/lib/entity/') || allowlist.has(relativePath)) continue

      const source = readFileSync(path, 'utf8')
      expect(
        source,
        `${relativePath} must not compose EntityAnatomy or EntityLeadingRail`,
      ).not.toMatch(/\bEntityAnatomy\b|\bEntityLeadingRail\b/)
    }
  })
})
