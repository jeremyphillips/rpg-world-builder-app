import type { SkillProficiency } from '@rpg/contracts'

import { syntheticContentId, syntheticContentMeta } from './shared-content-meta'

export type SkillProficiencyOverrides = Partial<SkillProficiency>

const DEFAULT_SKILL_PROFICIENCY = {
  ...syntheticContentMeta,
  id: syntheticContentId('test-skill'),
  slug: 'test-skill',
  name: 'Test Skill',
  ability: 'str',
  examples: ['Perform a synthetic test skill check'],
} satisfies SkillProficiency

export function makeSkillProficiency(overrides: SkillProficiencyOverrides = {}): SkillProficiency {
  const slug = overrides.slug ?? DEFAULT_SKILL_PROFICIENCY.slug

  return {
    ...DEFAULT_SKILL_PROFICIENCY,
    id: overrides.id ?? syntheticContentId(slug),
    slug,
    name: overrides.name ?? DEFAULT_SKILL_PROFICIENCY.name,
    ...overrides,
  }
}
