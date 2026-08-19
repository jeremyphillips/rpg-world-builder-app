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
})
