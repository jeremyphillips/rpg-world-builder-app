import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const repoRoot = join(fileURLToPath(import.meta.url), '../../../../../..')

const ACTION_WRAPPER_FILES = [
  'packages/ui/src/components/ui/collection-add-control.client.tsx',
  'packages/ui/src/components/ui/split-button.client.tsx',
  'packages/ui/src/components/ui/catalog-picker-auxiliary-action.client.tsx',
  'packages/ui/src/components/ui/optional-field-disclosure.client.tsx',
  'packages/ui/src/form/renderers/array/array-item-shell.client.tsx',
  'packages/ui/src/components/ui/content-card-parts.client.tsx',
  'packages/ui/src/components/ui/data-table.client.tsx',
] as const

const BANNED_ACTION_GLYPH_IMPORT =
  /import\s*\{[^}]*\b(?:Plus|Pencil|Trash2)\b[^}]*\}\s*from\s*['"]lucide-react['"]/

function readRepoFile(relPath: string): string {
  return readFileSync(join(repoRoot, relPath), 'utf8')
}

describe('icon registry ban', () => {
  it('forbids direct Plus/Pencil/Trash2 imports in migrated action wrappers', () => {
    const failures: string[] = []

    for (const relPath of ACTION_WRAPPER_FILES) {
      const content = readRepoFile(relPath)
      if (BANNED_ACTION_GLYPH_IMPORT.test(content)) {
        failures.push(relPath)
      }
    }

    expect(failures).toEqual([])
  })
})
