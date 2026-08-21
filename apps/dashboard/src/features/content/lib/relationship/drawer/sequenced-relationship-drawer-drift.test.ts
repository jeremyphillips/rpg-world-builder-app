import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const NESTED_CREATE_DRAWER_FILES = [
  fileURLToPath(
    new URL(
      '../../../organizations/components/location-connections/organization-location-connection-link-drawer.tsx',
      import.meta.url,
    ),
  ),
  fileURLToPath(
    new URL(
      '../../../locations/components/connected-parties/location-inverse-organization-connection-link-drawer.tsx',
      import.meta.url,
    ),
  ),
  fileURLToPath(
    new URL(
      '../../../locations/components/connected-parties/location-inverse-people-connection-link-drawer.tsx',
      import.meta.url,
    ),
  ),
] as const

const NESTED_CREATE_RESOLVER_IMPORT =
  "from '../../../lib/relationship/nested-create/relationship-picker-create-intents.lib'"
const NESTED_CREATE_ORG_RESOLVER_IMPORT =
  "from '../../../lib/relationship/nested-create/relationship-picker-nested-create.lib'"
const NESTED_CREATE_CHARACTER_RESOLVER_IMPORT = 'resolveRelationshipPickerCharacterCreateIntents'

/**
 * Sequenced-Add / change-kind / replace drawer grammars are behavior-tested in co-located
 * `*-connection-link-drawer.test.tsx` files — not via JSX-order or import-string guards here.
 */
describe('sequenced relationship drawer drift', () => {
  const nestedCreateDrawerExpectations: Record<
    string,
    {
      resolverImport: string
      usesNestedCreateHook: boolean
      characterResolverImport?: string
    }
  > = {
    'organization-location-connection-link-drawer.tsx': {
      resolverImport: NESTED_CREATE_RESOLVER_IMPORT,
      usesNestedCreateHook: true,
    },
    'location-inverse-organization-connection-link-drawer.tsx': {
      resolverImport: NESTED_CREATE_ORG_RESOLVER_IMPORT,
      usesNestedCreateHook: true,
    },
    'location-inverse-people-connection-link-drawer.tsx': {
      resolverImport: NESTED_CREATE_ORG_RESOLVER_IMPORT,
      usesNestedCreateHook: true,
      characterResolverImport: NESTED_CREATE_CHARACTER_RESOLVER_IMPORT,
    },
  }

  for (const filePath of NESTED_CREATE_DRAWER_FILES) {
    const label = filePath.split('/').at(-1)
    const expectation = nestedCreateDrawerExpectations[label ?? '']

    it(`${label} wires nested create through shared resolver and hook`, () => {
      expect(expectation).toBeDefined()
      const source = readFileSync(filePath, 'utf8')

      expect(source).toContain(expectation!.resolverImport)
      if ('characterResolverImport' in expectation! && expectation.characterResolverImport) {
        expect(source).toContain(expectation.characterResolverImport)
      }
      if (expectation!.usesNestedCreateHook) {
        expect(source).toContain('useRelationshipPickerNestedCreate')
      }
    })

    it(`${label} does not wire nested-create busy state into picker loading`, () => {
      const source = readFileSync(filePath, 'utf8')

      expect(source).not.toMatch(/loading=\{[^}]*nestedCreateBusy[^}]*\}/)
      expect(source).not.toMatch(/loading=\{[^}]*characterNestedCreateBusy[^}]*\}/)
      expect(source).not.toMatch(/loading=\{[^}]*phase[^}]*\}/)
    })
  }

  it('organization forward drawer passes nestedCreateContext instead of ad-hoc suppression props', () => {
    const source = readFileSync(NESTED_CREATE_DRAWER_FILES[0], 'utf8')

    expect(source).toContain('nestedCreateContext')
    expect(source).not.toMatch(/hideOrganizations|suppressOrganizations|hideConnectionsTab/)
  })

  // Policy: inverse drawers never launch location nested create — nestedCreateContext omitted by design.
  // See apps/dashboard/docs/cross-content-relationship-ui.md §Relationship picker nested create.
  it('inverse organization drawer omits nestedCreateContext because location create is out of scope', () => {
    const source = readFileSync(
      fileURLToPath(
        new URL(
          '../../../locations/components/connected-parties/location-inverse-organization-connection-link-drawer.tsx',
          import.meta.url,
        ),
      ),
      'utf8',
    )

    expect(source).not.toContain('nestedCreateContext')
  })
})
