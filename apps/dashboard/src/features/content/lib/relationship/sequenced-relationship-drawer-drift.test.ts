import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const SEQUENCED_ADD_DRAWER_FILES = [
  fileURLToPath(
    new URL(
      '../../organizations/components/organization-location-connection-link-drawer.client.tsx',
      import.meta.url,
    ),
  ),
  fileURLToPath(
    new URL(
      '../../locations/components/location-inverse-people-connection-link-drawer.client.tsx',
      import.meta.url,
    ),
  ),
] as const

const NESTED_CREATE_DRAWER_FILES = [
  ...SEQUENCED_ADD_DRAWER_FILES,
  fileURLToPath(
    new URL(
      '../../locations/components/location-inverse-organization-connection-link-drawer.client.tsx',
      import.meta.url,
    ),
  ),
] as const

const NESTED_CREATE_RESOLVER_IMPORT =
  "from '../../lib/relationship/relationship-picker-create-intents.lib'"
const NESTED_CREATE_ORG_RESOLVER_IMPORT =
  "from '../../lib/relationship/relationship-picker-nested-create.lib'"
const NESTED_CREATE_CHARACTER_RESOLVER_IMPORT = 'resolveRelationshipPickerCharacterCreateIntents'

describe('sequenced relationship drawer drift', () => {
  for (const filePath of SEQUENCED_ADD_DRAWER_FILES) {
    const label = filePath.split('/').at(-1)

    it(`${label} uses SelectionSummaryCard and LocationConnectionKindField`, () => {
      const source = readFileSync(filePath, 'utf8')

      expect(source).toContain('SelectionSummaryCard')
      expect(source).toContain('LocationConnectionKindField')
    })

    it(`${label} does not import collapse chrome or LocationConnectionKindStep`, () => {
      const source = readFileSync(filePath, 'utf8')

      expect(source).not.toContain('ChooserSummaryCard')
      expect(source).not.toContain('CollapsibleRadioCardField')
      expect(source).not.toContain('LocationConnectionKindStep')
    })
  }

  const nestedCreateDrawerExpectations: Record<
    string,
    {
      resolverImport: string
      usesNestedCreateHook: boolean
      characterResolverImport?: string
    }
  > = {
    'organization-location-connection-link-drawer.client.tsx': {
      resolverImport: NESTED_CREATE_RESOLVER_IMPORT,
      usesNestedCreateHook: true,
    },
    'location-inverse-organization-connection-link-drawer.client.tsx': {
      resolverImport: NESTED_CREATE_ORG_RESOLVER_IMPORT,
      usesNestedCreateHook: true,
    },
    'location-inverse-people-connection-link-drawer.client.tsx': {
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
  }
})
