import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect, it } from 'vitest'

const REPO_ROOT = join(__dirname, '../../../../../../..')
const FEATURE_ROOT = join(REPO_ROOT, 'apps/dashboard/src/features')

const PICKER_PATH_PATTERN =
  /(?:picker|connection-link-drawer|parent-replacement-drawer|building-organizations-composer)/

const PICKER_PROJECTOR_EXEMPT = new Set([
  'character/components/detail/connections/character-connection-entity-picker.tsx',
  'character/components/equipment/picker/browse/equipment-picker-disclosure-row.tsx',
  'character/components/spells/picker/spell-picker-drawer.tsx',
  'character/components/proficiencies/picker/proficiency-picker-drawer.tsx',
])

const FORBIDDEN_HEADING_ACTION_PATTERN =
  /(?:CatalogEntityRow|ContentEntityCard|DisclosureEntityCard|EntityAnatomyHost)[\s\S]{0,400}trailing=\{\{[\s\S]{0,120}kind:\s*['"]action['"][\s\S]{0,120}content:\s*<(?:Button|CatalogPickerSelectionActions)/

const LEGACY_DISPLAY_IMAGE_HELPERS = [
  'getContentImageUrl',
  'buildEntityMediaFromImageKey',
  'content-image-url',
  'fallback-content.png',
] as const

const NON_MEDIA_DETAIL_ROUTES = [
  'content/feats/routes/feat-detail.tsx',
  'content/spells/routes/spells-detail.tsx',
  'content/skill-proficiencies/routes/skill-proficiency-detail.tsx',
] as const

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

describe('entity surface config guard', () => {
  it('forbids heading inline Button actions on entity surfaces outside entity internals', () => {
    for (const path of featureImplementationFiles()) {
      const relativePath = relative(FEATURE_ROOT, path)
      if (relativePath.startsWith('content/lib/entity/')) continue

      const source = readFileSync(path, 'utf8')
      expect(
        source,
        `${relativePath} must use inlineAction instead of trailing action buttons on entity surfaces`,
      ).not.toMatch(FORBIDDEN_HEADING_ACTION_PATTERN)
    }
  })

  it('requires character/org/location picker rows to use display card projectors', () => {
    for (const path of featureImplementationFiles()) {
      const relativePath = relative(FEATURE_ROOT, path)
      if (!PICKER_PATH_PATTERN.test(relativePath)) continue
      if (relativePath.startsWith('content/lib/entity/')) continue
      if (PICKER_PROJECTOR_EXEMPT.has(relativePath)) continue
      if (!relativePath.endsWith('.tsx')) continue

      const source = readFileSync(path, 'utf8')
      if (!source.includes('CatalogEntityRow') && !source.includes('CatalogEntitySurfaceRow')) {
        continue
      }

      expect(source, `${relativePath} must not hand-build entity={{`).not.toMatch(/entity=\{\{/)
      expect(source, `${relativePath} must call a build*EntityCardModel projector`).toMatch(
        /build(?:Character|Location|Organization)EntityCardModel/,
      )
    }
  })

  it('forbids legacy placeholder image helpers in dashboard features', () => {
    for (const path of featureImplementationFiles()) {
      const relativePath = relative(FEATURE_ROOT, path)
      const source = readFileSync(path, 'utf8')
      for (const forbidden of LEGACY_DISPLAY_IMAGE_HELPERS) {
        expect(
          source,
          `${relativePath} must not reference legacy display helper ${forbidden}`,
        ).not.toContain(forbidden)
      }
    }
  })

  it('forbids imageKey on compact entity surface identity builders', () => {
    const projectorPaths = [
      join(FEATURE_ROOT, 'character/lib/display/character-entity-summary.lib.ts'),
      join(FEATURE_ROOT, 'content/locations/lib/location-display.ts'),
      join(FEATURE_ROOT, 'content/organizations/lib/organization-display.ts'),
    ]
    for (const path of projectorPaths) {
      const source = readFileSync(path, 'utf8')
      expect(
        source,
        `${relative(FEATURE_ROOT, path)} must not set imageKey on EntitySurfaceIdentity`,
      ).not.toMatch(/imageKey\s*[?:]/)
    }
  })

  it('forbids detail hero image UI on non-media catalog types', () => {
    for (const relativePath of NON_MEDIA_DETAIL_ROUTES) {
      const source = readFileSync(join(FEATURE_ROOT, relativePath), 'utf8')
      expect(source, `${relativePath} must not render content detail hero images`).not.toMatch(
        /displayImage|ContentMediaImage|getContentDisplayImage/,
      )
    }
  })
})
