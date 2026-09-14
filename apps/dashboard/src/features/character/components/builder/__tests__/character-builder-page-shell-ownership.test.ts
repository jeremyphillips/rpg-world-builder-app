import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const REPO_ROOT = join(import.meta.dirname, '../../../../../../../..')

const BUILDER_HOSTS = [
  'apps/dashboard/src/features/character/routes/character-create.tsx',
  'apps/dashboard/src/features/character/npc/routes/npc-create.tsx',
  'apps/dashboard/src/features/campaign/components/onboarding/campaign-onboarding-new-character-panel.tsx',
] as const

describe('CharacterBuilderPageShell ownership', () => {
  it.each(BUILDER_HOSTS)('%s does not import ViewportWorkspace or WidePage', (relativePath) => {
    const source = readFileSync(join(REPO_ROOT, relativePath), 'utf8')

    expect(source).not.toMatch(/ViewportWorkspace/)
    expect(source).not.toMatch(/WidePage/)
    expect(source).toMatch(/CharacterBuilderPageShell/)
  })
})
