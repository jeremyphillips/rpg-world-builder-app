import type { CreateEpicInput } from '@rpg/contracts/dev-bench'

import { normalizeEpicTitle } from '../aggregation/epic-aggregation'

export interface SeedEpic extends CreateEpicInput {
  /** Used for idempotent seed matching — not sent to API. */
  normalizedTitle: string
}

function seed(input: CreateEpicInput): SeedEpic {
  return {
    ...input,
    normalizedTitle: normalizeEpicTitle(input.title),
  }
}

/** Canonical seed epics — consumed by plan 07 `pnpm bench seed-epics`. */
export const SEED_EPICS: SeedEpic[] = [
  seed({
    title: 'Character Builder',
    area: 'character_builder',
    priority: 'high',
    status: 'active',
    goal: 'PC creation, species/class selection, and character sheet authoring',
    description:
      'End-to-end player character creation flows, species and class selection, and character sheet authoring.',
  }),
  seed({
    title: 'Rules Configuration',
    area: 'rules',
    priority: 'high',
    status: 'active',
    goal: 'Campaign rulesets, patches, and resolver configuration',
    description:
      'Configure campaign rulesets, apply patches, and wire resolver behavior for gameplay systems.',
  }),
  seed({
    title: 'Campaign Builder',
    area: 'campaigns',
    priority: 'medium',
    status: 'active',
    goal: 'Campaign setup, world context, and GM tooling',
    description:
      'Campaign setup workflows, world context management, and GM-facing builder tooling.',
  }),
  seed({
    title: 'Content Library',
    area: 'content',
    priority: 'medium',
    status: 'active',
    goal: 'Spells, items, creatures, and homebrew content management',
    description: 'Manage spells, items, creatures, and homebrew content in a shared library.',
  }),
  seed({
    title: 'Combat Simulator',
    area: 'combat',
    priority: 'medium',
    status: 'active',
    goal: 'Combat encounters, turn flow, and resolution tooling',
    description: 'Run combat encounters with turn flow, action resolution, and simulation tooling.',
  }),
]
