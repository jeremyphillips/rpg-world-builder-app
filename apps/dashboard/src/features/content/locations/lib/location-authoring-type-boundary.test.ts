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
  'location-create-session.ts',
  'location-create-session.test.ts',
  'location-create-bypass.test.ts',
  'location-settlement-structure.lib.ts',
  'location-settlement-structure.lib.test.ts',
  'location-structure.lib.ts',
  'location-structure.lib.test.ts',
  'location-form-fields.ts',
  'location-form-fields.test.ts',
  'location-form-ctx.ts',
  'location-form-values.ts',
  'location-form-values.test.ts',
  'location-form-sync.ts',
  'location-form-sync.test.ts',
  'location-form-def.test.ts',
  'location-parent-picker.ts',
  'location-parent-picker.test.ts',
  'location-classification-form-fields.ts',
  'location-classification-form-fields.test.ts',
  'location-connected-party-character-options.lib.ts',
  'location-create.tsx',
  'location-create-page.tsx',
  'location-create-page.lib.ts',
  'location-create-page.lib.test.ts',
  'location-create-actions.tsx',
  'location-create-launcher.tsx',
  'location-settlement-create-setup.lib.ts',
  'location-settlement-create-setup.lib.test.ts',
  'location-settlement-create-setup.tsx',
  'location-settlement-create-setup.test.tsx',
  'location-region-create-setup.lib.ts',
  'location-region-create-setup.tsx',
  'location-site-create-setup.lib.ts',
  'location-site-create-setup.tsx',
  'location-create-setup-host.tsx',
  'location-add-child-menu.tsx',
  'location-add-child-menu.test.tsx',
  'location-children-section.tsx',
  'location-children-section.test.tsx',
  'location-create-modal.tsx',
  'location-create-modal.test.tsx',
  'location-create-form.tsx',
  'location-create-modal-setup.lib.ts',
  'location-create-modal-setup.lib.test.ts',
  'location-create-authoring-capabilities.lib.ts',
  'location-create-authoring-capabilities.lib.test.ts',
  'location-building-create-setup.lib.ts',
  'location-building-create-setup.lib.test.ts',
  'location-create-draft.lib.ts',
  'location-create-draft.lib.test.ts',
  'location-create-draft-prune.tsx',
  'location-create-setup-session.tsx',
  'location-create-setup-session.test.tsx',
  'location-create-setup-session-structural-drift.test.ts',
  'location-create-setup-host.test.tsx',
  'location-create-page.test.tsx',
  'location-site-create-setup.test.tsx',
  'location-form-fields.compose.test.ts',
  'location-settlement-create-composition.lib.ts',
  'location-settlement-create-composition.lib.test.ts',
  'location-settlement-starting-districts-slot.tsx',
  'settlement-create-composition-context.tsx',
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
