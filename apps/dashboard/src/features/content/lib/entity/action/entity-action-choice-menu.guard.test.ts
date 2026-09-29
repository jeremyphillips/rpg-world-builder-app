import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const REPO_ROOT = join(__dirname, '../../../../../../../..')

/** Add-choice surfaces must compose EntityActionChoiceMenu — not raw DropdownMenu. */
const ADD_CHOICE_ENTRY_POINT_FILES = [
  'apps/dashboard/src/features/content/locations/components/hierarchy/location-add-child-menu.tsx',
  'apps/dashboard/src/features/content/lib/entity/action/entity-action-choice-menu.tsx',
] as const

const FORBIDDEN_DROPDOWN_IMPORT = /\bDropdownMenu\b/

describe('entity action choice menu entry points', () => {
  it('known add-choice files do not import DropdownMenu outside the shared primitive', () => {
    for (const relativePath of ADD_CHOICE_ENTRY_POINT_FILES) {
      const source = readFileSync(join(REPO_ROOT, relativePath), 'utf8')
      const isSharedPrimitive = relativePath.endsWith('entity-action-choice-menu.tsx')

      if (isSharedPrimitive) {
        expect(source, `${relativePath} must own DropdownMenu composition`).toMatch(
          FORBIDDEN_DROPDOWN_IMPORT,
        )
        expect(source).not.toMatch(/locations\/lib/)
        continue
      }

      expect(source, `${relativePath} must not import DropdownMenu directly`).not.toMatch(
        FORBIDDEN_DROPDOWN_IMPORT,
      )
      expect(source).toMatch(/EntityActionChoiceMenu/)
    }
  })
})
