import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const repoRoot = join(fileURLToPath(import.meta.url), '../../../../..')

/** Folders fully migrated to ActionIcon / ActionButton — expand as clusters complete. */
const MIGRATED_ACTION_SCOPES = [
  'apps/dashboard/src/components/layout/sidebar/lib/sidebar-nav-icons.ts',
  'apps/dashboard/src/features/character/components/builder/steps/shared/choice-section',
  'apps/dashboard/src/features/character/components/builder/inventory',
  'apps/dashboard/src/lib/campaign-availability/campaign-availability-change-affordance.tsx',
  'apps/dashboard/src/features/content/lib/relationship/list/relationship-list.tsx',
  'apps/dashboard/src/features/content/lib/detail/detail-overflow-menu.tsx',
  'apps/dashboard/src/features/content/components/table-builder',
  'apps/dashboard/src/features/content/components/master-detail',
  'apps/dashboard/src/features/content/lib/forms/preview',
  'apps/dashboard/src/features/message/components/workspace',
  'apps/dashboard/src/features/character/components/detail/connections',
  'apps/dashboard/src/features/character/components/builder/preview',
  'apps/dashboard/src/features/campaign/components/overview',
  'apps/dashboard/src/features/character/components/builder/steps/connections/connections-step-section.tsx',
  'apps/dashboard/src/features/character/components/detail/connections/character-connections-add-menu.tsx',
  'apps/dashboard/src/features/character/components/picker/catalog-toolbar-reset-action.tsx',
  'apps/dashboard/src/features/content/spells/resolution/components',
  'apps/dashboard/src/features/content/locations/components/hierarchy',
  'apps/dashboard/src/features/content/locations/components/create/composition/location-settlement-starting-districts-slot.tsx',
  'apps/dashboard/src/features/content/classes/components/features',
  'apps/dashboard/src/features/campaign/components/slot-progressions-field.tsx',
  'apps/dashboard/src/features/campaign/components/campaign-switcher.tsx',
  'apps/dashboard/src/features/campaign/components/xp-thresholds-field.tsx',
  'apps/dashboard/src/features/character/components/equipment/inventory/row',
  'apps/dashboard/src/features/content/feats/components/requirement-editor.tsx',
  'apps/dashboard/src/features/admin',
  'apps/dashboard/src/features/game-terms/components/vocabulary-row-actions.tsx',
] as const

const BANNED_ACTION_IMPORT =
  /import\s*\{[^}]*\b(?:Plus|Pencil|Trash2|RotateCcw)\b[^}]*\}\s*from\s*['"]lucide-react['"]/

function collectTsFiles(scopePath: string, files: string[] = []): string[] {
  const full = join(repoRoot, scopePath)
  let stat: ReturnType<typeof statSync>
  try {
    stat = statSync(full)
  } catch {
    return files
  }
  if (stat.isFile()) {
    if (full.endsWith('.ts') || full.endsWith('.tsx')) {
      if (
        !full.endsWith('.test.ts') &&
        !full.endsWith('.test.tsx') &&
        !full.endsWith('.stories.tsx')
      ) {
        files.push(full)
      }
    }
    return files
  }
  for (const entry of readdirSync(full)) {
    if (entry === 'node_modules') continue
    collectTsFiles(join(scopePath, entry), files)
  }
  return files
}

describe('icon registry positive scopes', () => {
  it('forbids raw Plus/Pencil/Trash2/RotateCcw imports in migrated dashboard scopes', () => {
    const failures: string[] = []

    for (const scope of MIGRATED_ACTION_SCOPES) {
      for (const file of collectTsFiles(scope)) {
        const content = readFileSync(file, 'utf8')
        if (BANNED_ACTION_IMPORT.test(content)) {
          failures.push(relative(repoRoot, file))
        }
      }
    }

    expect(failures).toEqual([])
  })
})
