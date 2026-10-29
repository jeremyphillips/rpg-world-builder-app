const DAGGER_ID = 'srd-cc-5.2.1:dagger'

export const minimalHomebrewMonsterInput = {
  slug: 'usage-test-monster',
  name: 'Usage Test Monster',
  size: 'small',
  creatureType: 'humanoid',
  alignment: 'n',
  abilityScores: { str: 8, dex: 12, con: 10, int: 8, wis: 8, cha: 8 },
  armorClass: {},
  hitPoints: { kind: 'hit-dice', count: 1 },
  movement: { walk: 30 },
  communication: {},
  challengeRating: '0',
  proficiencies: {
    savingThrows: [],
    skills: [],
    languages: [],
    weapons: [{ weaponId: DAGGER_ID }],
  },
  defenses: {
    vulnerabilities: [],
    resistances: [],
    immunities: [],
    conditionImmunities: [],
  },
  equipment: [
    {
      entryId: 'dagger',
      equipmentId: DAGGER_ID,
      quantity: 1,
      equipped: true,
    },
  ],
  traits: [],
  actions: [{ id: 'dagger', kind: 'weapon', equipmentEntryId: 'dagger' }],
  bonusActions: [],
  reactions: [],
} as const

export function minimalHomebrewMonsterReferencingEquipment(equipmentId: string) {
  return {
    ...minimalHomebrewMonsterInput,
    slug: `monster-ref-${equipmentId.slice(-8)}`,
    name: 'Monster Equipment Ref',
    equipment: [
      {
        entryId: 'gear',
        equipmentId,
        quantity: 1,
        equipped: true,
      },
    ],
    actions: [{ id: 'gear', kind: 'weapon', equipmentEntryId: 'gear' }],
  }
}
