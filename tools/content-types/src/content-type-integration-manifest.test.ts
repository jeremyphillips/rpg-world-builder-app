import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  API_CONTENT_TYPE_KEYS,
  CONTENT_TYPE_KEYS,
  HOMEBREW_SUMMARY_CONTENT_TYPE_KEYS,
} from '@rpg/contracts'

import {
  CONTENT_TYPE_INTEGRATION_MANIFEST,
  catalogPackageNameToSrcPath,
  contentTypeKeysWithApiRegistration,
  contentTypeKeysWithCatalogPackage,
  contentTypeKeysWithoutBundledContent,
  contentTypeKeysWithFormDefinition,
  contentTypeKeysWithRequiredCapabilities,
  contentTypeKeysWithRouteSection,
  contentTypeKeysWithVisibleInSidebar,
  integrationManifestEntries,
} from './index'
import { resolveRepoRoot } from './repo-root'

describe('CONTENT_TYPE_INTEGRATION_MANIFEST', () => {
  const repoRoot = resolveRepoRoot()

  it('covers every ContentTypeKey exactly once', () => {
    expect(Object.keys(CONTENT_TYPE_INTEGRATION_MANIFEST).sort()).toEqual(
      [...CONTENT_TYPE_KEYS].sort(),
    )
  })

  it('resolves every declared API registration path', () => {
    for (const [key, entry] of integrationManifestEntries()) {
      if (!entry.api) continue
      const absolute = join(repoRoot, entry.api.registrationPath)
      expect(
        existsSync(absolute),
        `${key} api.registrationPath missing: ${entry.api.registrationPath}`,
      ).toBe(true)
    }
  })

  it('resolves every declared dashboard folder and form definition path', () => {
    for (const [key, entry] of integrationManifestEntries()) {
      const dashboard = entry.dashboard
      if (!dashboard) continue

      const folderPath = join(repoRoot, 'apps/dashboard/src/features/content', dashboard.folder)
      expect(existsSync(folderPath), `${key} dashboard.folder missing: ${dashboard.folder}`).toBe(
        true,
      )

      if (dashboard.formDefinitionPath) {
        expect(
          existsSync(join(repoRoot, dashboard.formDefinitionPath)),
          `${key} dashboard.formDefinitionPath missing: ${dashboard.formDefinitionPath}`,
        ).toBe(true)
      }
    }
  })

  it('resolves every declared catalog package to a catalog src folder', () => {
    for (const { key, packageName } of contentTypeKeysWithCatalogPackage()) {
      const srcPath = join(repoRoot, catalogPackageNameToSrcPath(packageName))
      expect(existsSync(srcPath), `${key} catalog package missing: ${packageName}`).toBe(true)
    }
  })

  it('only requires packages for entries with bundled content', () => {
    expect(contentTypeKeysWithoutBundledContent()).toEqual(['organizations'])
    expect(contentTypeKeysWithCatalogPackage().map(({ key }) => key)).toEqual(
      CONTENT_TYPE_KEYS.filter(
        (key) => CONTENT_TYPE_INTEGRATION_MANIFEST[key].catalog.bundledContent === 'bundled',
      ).sort(),
    )
  })

  it('declares API registrations for every runtime API content type today', () => {
    expect(contentTypeKeysWithApiRegistration()).toEqual([...API_CONTENT_TYPE_KEYS].sort())
  })

  it('declares form definitions for every type with dashboard authoring today', () => {
    expect(contentTypeKeysWithFormDefinition()).toEqual(
      [...HOMEBREW_SUMMARY_CONTENT_TYPE_KEYS].sort(),
    )
  })

  it('declares sidebar visibility for every homebrew-summary type today', () => {
    expect(contentTypeKeysWithVisibleInSidebar()).toEqual(
      [...HOMEBREW_SUMMARY_CONTENT_TYPE_KEYS].sort(),
    )
  })

  it('declares route sections for every type with dashboard routes today', () => {
    expect(contentTypeKeysWithRouteSection().map(({ key }) => key)).toEqual(
      [...HOMEBREW_SUMMARY_CONTENT_TYPE_KEYS].sort(),
    )
  })

  it('requires capabilities entries for every registered type today', () => {
    expect(contentTypeKeysWithRequiredCapabilities()).toEqual([...CONTENT_TYPE_KEYS].sort())
  })
})
