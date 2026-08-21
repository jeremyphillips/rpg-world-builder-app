import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect, it } from 'vitest'

const REPO_ROOT = join(__dirname, '../../../..')
const DASHBOARD_ROOT = join(REPO_ROOT, 'apps/dashboard')
const DOCS_ROOT = join(DASHBOARD_ROOT, 'docs')
const CONTENT_ROOT = join(DASHBOARD_ROOT, 'src/features/content')

const DRAWER_ARCHITECTURE_DOC = join(DOCS_ROOT, 'drawer-architecture.md')

const PRODUCTION_DRAWER_SURFACES: readonly { label: string; path: string }[] = [
  {
    label: 'EquipmentPickerDrawer',
    path: 'apps/dashboard/src/features/character/components/equipment/picker/drawer/equipment-picker-drawer.client.tsx',
  },
  {
    label: 'SpellPickerDrawer',
    path: 'apps/dashboard/src/features/character/components/spells/picker/spell-picker-drawer.client.tsx',
  },
  {
    label: 'ProficiencyPickerDrawer',
    path: 'apps/dashboard/src/features/character/components/proficiencies/picker/proficiency-picker-drawer.client.tsx',
  },
  {
    label: 'OrganizationPickerDrawer',
    path: 'apps/dashboard/src/features/character/components/connections/picker/organization-picker-drawer.client.tsx',
  },
  {
    label: 'OrganizationMemberPickerDrawer',
    path: 'apps/dashboard/src/features/content/organizations/components/members/organization-member-picker-drawer.client.tsx',
  },
  {
    label: 'OrgLocationConnectionLinkDrawer',
    path: 'apps/dashboard/src/features/content/organizations/components/location-connections/organization-location-connection-link-drawer.client.tsx',
  },
  {
    label: 'LocationInversePeopleConnLinkDrawer',
    path: 'apps/dashboard/src/features/content/locations/components/connected-parties/location-inverse-people-connection-link-drawer.client.tsx',
  },
  {
    label: 'LocationInverseOrgConnLinkDrawer',
    path: 'apps/dashboard/src/features/content/locations/components/connected-parties/location-inverse-organization-connection-link-drawer.client.tsx',
  },
  {
    label: 'LocationInverseCharacterConnLinkDrawer',
    path: 'apps/dashboard/src/features/content/locations/components/connected-parties/location-inverse-character-connection-link-drawer.client.tsx',
  },
  {
    label: 'LocationParentReplacementDrawer',
    path: 'apps/dashboard/src/features/content/locations/components/hierarchy/location-parent-replacement-drawer.client.tsx',
  },
  {
    label: 'VocabularyEntrySheet',
    path: 'apps/dashboard/src/features/game-terms/components/vocabulary-entry-sheet.client.tsx',
  },
  {
    label: 'EditOrganizationMembershipDrawer',
    path: 'apps/dashboard/src/features/character/components/connections/edit-organization-membership-drawer.client.tsx',
  },
  {
    label: 'OrganizationMembersDetailDrawers',
    path: 'apps/dashboard/src/features/content/organizations/components/members/organization-members-detail-drawers.client.tsx',
  },
  {
    label: 'LocationConnectedPartiesDrawers',
    path: 'apps/dashboard/src/features/content/locations/components/connected-parties/location-connected-parties-drawers.client.tsx',
  },
  {
    label: 'CharacterOrganizationMembershipDrawers',
    path: 'apps/dashboard/src/features/character/components/detail/memberships/character-organization-membership-drawers.client.tsx',
  },
  {
    label: 'DrawerShell',
    path: 'apps/dashboard/src/components/drawer/drawer-shell.client.tsx',
  },
  {
    label: 'CatalogEntityPickerSheet',
    path: 'apps/dashboard/src/features/content/lib/entity/surfaces/catalog/catalog-entity-picker-sheet.client.tsx',
  },
  {
    label: 'ContentFormDrawer',
    path: 'apps/dashboard/src/features/content/lib/forms/shells/host/content-form-drawer.client.tsx',
  },
  {
    label: 'BuilderOptionDetailsSheet',
    path: 'packages/ui/src/components/ui/builder-option-details-sheet.client.tsx',
  },
]

const CHARACTER_PICKER_CHROME_IMPORT_FORBIDDEN = [
  /from ['"]@\/features\/character\/components\/picker\//,
  /from ['"][^'"]*features\/character\/components\/picker\//,
  /import\(['"]@\/features\/character\/components\/picker\//,
] as const

function walkSourceFiles(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    const stat = statSync(path)
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist') continue
      walkSourceFiles(path, files)
      continue
    }
    if (/\.(ts|tsx)$/.test(entry) && !/\.(test|stories|integration\.test)\.tsx?$/.test(entry)) {
      files.push(path)
    }
  }
  return files
}

function resolveDocLink(linkTarget: string): string {
  return join(DOCS_ROOT, linkTarget)
}

describe('drawer architecture guard', () => {
  it('keeps drawer-architecture.md canonical links resolvable', () => {
    const source = readFileSync(DRAWER_ARCHITECTURE_DOC, 'utf8')
    const links = [...source.matchAll(/\]\((\.\.?\/[^)]+)\)/g)].map((match) => match[1]!)

    expect(links.length).toBeGreaterThan(0)

    for (const link of links) {
      const resolved = resolveDocLink(link)
      expect(statSync(resolved).isFile(), `${link} must resolve to a file`).toBe(true)
    }
  })

  it('lists every production drawer surface in the inventory appendix', () => {
    const source = readFileSync(DRAWER_ARCHITECTURE_DOC, 'utf8')

    for (const surface of PRODUCTION_DRAWER_SURFACES) {
      expect(source, `${surface.label} must appear in drawer-architecture.md`).toContain(
        surface.label,
      )
      expect(statSync(join(REPO_ROOT, surface.path)).isFile(), surface.path).toBe(true)
    }
  })

  it('forbids content imports of character picker chrome (promoted to @rpg/ui)', () => {
    for (const path of walkSourceFiles(CONTENT_ROOT)) {
      const source = readFileSync(path, 'utf8')
      const relativePath = relative(REPO_ROOT, path)

      for (const pattern of CHARACTER_PICKER_CHROME_IMPORT_FORBIDDEN) {
        expect(source, `${relativePath} must not import character/components/picker`).not.toMatch(
          pattern,
        )
      }
    }
  })

  it('does not introduce a second wrapper over CatalogEntityPickerSheet', () => {
    const catalogEntityPickerSheetPath = join(
      REPO_ROOT,
      'apps/dashboard/src/features/content/lib/entity/surfaces/catalog/catalog-entity-picker-sheet.client.tsx',
    )
    const source = readFileSync(catalogEntityPickerSheetPath, 'utf8')

    expect(source).toMatch(/export function CatalogEntityPickerSheet/)
    expect(source).not.toMatch(/CatalogEntityPickerSheetWrapper|EntityPickerDrawerShell/)
  })
})
