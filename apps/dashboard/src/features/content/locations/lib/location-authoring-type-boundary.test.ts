import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const locationsRoot = fileURLToPath(new URL('.', import.meta.url))

const AUTHORING_TYPE_ALLOWED_SUFFIXES = new Set([
  'location-authoring-type.ts',
  'location-authoring-type.test.ts',
  'location-authoring-type-boundary.test.ts',
  'location-create-shortcuts.ts',
  'location-create-shortcuts.test.ts',
  'location-form-fields.ts',
  'location-form-values.ts',
  'location-form-values.test.ts',
  'location-form-sync.ts',
  'location-form-sync.test.ts',
  'location-form-def.test.ts',
  'location-parent-picker.ts',
  'location-parent-picker.test.ts',
  'location-classification-form-fields.ts',
  'location-classification-form-fields.test.ts',
  'location-party-authoring-policy.ts',
  'location-party-authoring-policy.test.ts',
  'location-relationship-capabilities.ts',
  'location-relationship-capabilities.test.ts',
  'location-party-associations.lib.ts',
  'location-party-form-values.test.ts',
  'territorial-authority.lib.ts',
  'territorial-authority.lib.test.ts',
  'territorial-authority-section.client.tsx',
  'territorial-authority-picker-drawer.client.tsx',
  'territorial-authority-detail-section.client.tsx',
  'territorial-authority-detail-section.test.tsx',
  'use-territorial-authority-picker-drawer.client.ts',
  'location-create.tsx',
  'location-create-actions.client.tsx',
  'location-add-child-menu.client.tsx',
])

function collectSourceFiles(directory: string): string[] {
  const entries = readdirSync(directory, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const absolutePath = join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(absolutePath))
      continue
    }

    if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.stories.tsx')) {
      files.push(absolutePath)
    }
  }

  return files
}

describe('location authoring type boundary', () => {
  it('keeps authoringType references within the form and create shortcut layer', () => {
    const offenders: string[] = []

    for (const filePath of collectSourceFiles(locationsRoot)) {
      const relativePath = relative(locationsRoot, filePath)
      const suffix = relativePath.split('/').at(-1)
      if (!suffix || !readFileSync(filePath, 'utf8').includes('authoringType')) {
        continue
      }

      if (!AUTHORING_TYPE_ALLOWED_SUFFIXES.has(suffix)) {
        offenders.push(relativePath)
      }
    }

    expect(offenders).toEqual([])
  })
})
