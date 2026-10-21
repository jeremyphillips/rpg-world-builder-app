import { describe, expect, it } from 'vitest'

import { classStringViolatesMigratedStacks } from '@rpg/ui/lib/typography/text-style-stack-ratchet'

/**
 * Full-repo scan lives in `@rpg/ui` (`text-style-stack-ratchet.repo.test.ts`).
 * This smoke test keeps the policy on the dashboard vitest graph.
 */
describe('text-style stack ratchet (dashboard graph)', () => {
  it('imports typography policy from @rpg/ui', () => {
    expect(classStringViolatesMigratedStacks('text-style-small')).toMatch(/retired/)
  })
})
