import { DEFAULT_SYSTEM_RULESET_ID, type ClassStored } from '@rpg/contracts'

import { CONTENT_TIMESTAMP } from '../../constants'
import { pickClass } from '../../pick'

const DEFAULT_CLASS_STORED = {
  id: `${DEFAULT_SYSTEM_RULESET_ID}:test-class`,
  slug: 'test-class',
  rulesetId: DEFAULT_SYSTEM_RULESET_ID,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: CONTENT_TIMESTAMP,
  updatedAt: CONTENT_TIMESTAMP,
  name: 'Test Class',
  primaryAbilities: ['str'],
  hitDie: 10,
  proficiencies: {
    savingThrows: ['str', 'con'],
    armor: { categories: ['light', 'medium'], items: [] },
    weapons: { categories: ['simple', 'martial'], items: [] },
    skills: { categories: [], items: [] },
  },
  features: [],
} satisfies ClassStored

export function makeClassStored(overrides: Partial<ClassStored> = {}): ClassStored {
  const slug = overrides.slug ?? DEFAULT_CLASS_STORED.slug
  const rulesetId = overrides.rulesetId ?? DEFAULT_CLASS_STORED.rulesetId

  return {
    ...DEFAULT_CLASS_STORED,
    ...overrides,
    id: overrides.id ?? `${rulesetId}:${slug}`,
    slug,
    rulesetId,
  }
}

/** Fighter catalog class with builder skill-choice overlay for character-builder fixtures. */
export const storedFighterClassStored = makeClassStored({
  ...pickClass('fighter'),
  primaryAbilities: ['str'],
  characterCreation: {
    proficiencies: {
      skills: {
        choices: [{ id: 'class-skills', choose: 2, from: ['athletics'] }],
      },
    },
  },
})

/** Druid with starting-equipment options for equipment package switch tests. */
export const storedDruidClassStored = makeClassStored({
  slug: 'druid',
  name: 'Druid',
  primaryAbilities: ['wis'],
  hitDie: 8,
  proficiencies: {
    savingThrows: ['int', 'wis'],
    armor: { categories: ['light', 'shields'], items: [] },
    weapons: { categories: ['simple'], items: [] },
    skills: { categories: [], items: [] },
  },
  characterCreation: {
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'standard-equipment',
          label: 'Standard Equipment',
          items: [
            { kind: 'grant', target: { source: 'equipment', equipmentSlug: 'rope' }, quantity: 1 },
          ],
          wealth: { gp: 9, sp: 5, cp: 3 },
        },
        {
          id: 'starting-gold',
          label: 'Starting Gold',
          items: [],
          wealth: { gp: 50 },
        },
      ],
    },
  },
})
