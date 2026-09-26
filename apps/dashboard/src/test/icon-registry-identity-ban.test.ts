import { readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const repoRoot = join(fileURLToPath(import.meta.url), '../../../../..')

/** Semantic alias consumers — must use contentIdentityIcon, not duplicate identity Lucide imports. */
const IDENTITY_ALIAS_CONSUMER_FILES: Readonly<Record<string, readonly RegExp[]>> = {
  'apps/dashboard/src/features/campaign/components/campaign-display-name.tsx': [/\bCastle\b/],
  'apps/dashboard/src/features/campaign/components/campaign-display-name-list.tsx': [/\bCastle\b/],
  'apps/dashboard/src/features/notification/lib/resolve-notification-preview-icon.tsx': [
    /\bCastle\b/,
  ],
  'apps/dashboard/src/features/content/lib/forms/content-form-tab-icons.ts': [
    /\bUser\b/,
    /\bListChecks\b/,
    /\bSparkles\b/,
    /\bTags\b/,
  ],
  'apps/dashboard/src/features/character/lib/relationship/connection-section-icons.tsx': [
    /\bUser\b/,
    /\bLandmark\b/,
    /\bMapPin\b/,
  ],
  'apps/dashboard/src/features/character/components/builder/steps/proficiencies/proficiency-category-icons.ts':
    [/\bListChecks\b/],
  'apps/dashboard/src/features/character/components/builder/steps/shared/builder-step-choose-class-prompt.tsx':
    [/\bWaypoints\b/, /\bBookOpen\b/],
  'apps/dashboard/src/components/layout/sidebar/lib/sidebar-nav-icons.ts': [
    /\bCONTENT_DISPLAY_FALLBACK_ICONS\b/,
  ],
}

function readRepoFile(relPath: string): string {
  return readFileSync(join(repoRoot, relPath), 'utf8')
}

describe('icon registry identity ban', () => {
  it('forbids direct identity glyph imports in semantic alias consumers', () => {
    const failures: string[] = []

    for (const [relPath, patterns] of Object.entries(IDENTITY_ALIAS_CONSUMER_FILES)) {
      const content = readRepoFile(relPath)
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          failures.push(`${relative(repoRoot, join(repoRoot, relPath))}: ${pattern}`)
        }
      }
    }

    expect(failures).toEqual([])
  })
})
