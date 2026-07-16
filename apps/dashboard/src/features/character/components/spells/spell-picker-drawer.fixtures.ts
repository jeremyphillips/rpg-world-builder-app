import {
  DEFAULT_SYSTEM_RULESET_ID,
  buildSpellPickerCompactSummary,
  type ChoiceSet,
  type Spell,
  type SpellPickerItem,
} from '@rpg/contracts'

const baseSpellMeta = {
  rulesetId: DEFAULT_SYSTEM_RULESET_ID,
  source: 'system' as const,
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  classIds: ['wizard'],
}

export const spellPickerCureWoundsFixture = {
  ...baseSpellMeta,
  id: `${DEFAULT_SYSTEM_RULESET_ID}:cure-wounds`,
  slug: 'cure-wounds',
  name: 'Cure Wounds',
  description:
    '<p>A creature you touch regains 2d8 + modifier Hit Points.</p><p><strong>Using a Higher-Level Spell Slot.</strong> The healing increases by 2d8 for each spell slot level above 1.</p>',
  school: 'evocation',
  level: 1,
  tags: { roles: ['healing'] },
  castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
  range: { kind: 'touch' },
  duration: { kind: 'instantaneous' },
  components: {
    verbal: true,
    somatic: true,
  },
} as Spell

export const spellPickerDetectMagicFixture = {
  ...baseSpellMeta,
  id: `${DEFAULT_SYSTEM_RULESET_ID}:detect-magic`,
  slug: 'detect-magic',
  name: 'Detect Magic',
  description: '<p>For the duration, you sense the presence of magic within 30 feet of you.</p>',
  school: 'divination',
  level: 0,
  tags: { roles: ['detection'] },
  castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: true },
  range: { kind: 'self' },
  duration: {
    kind: 'timed',
    value: 10,
    unit: 'minute',
    concentration: true,
    upTo: true,
  },
  components: {
    verbal: true,
    somatic: true,
  },
} as Spell

export const spellPickerMageHandFixture = {
  ...baseSpellMeta,
  id: `${DEFAULT_SYSTEM_RULESET_ID}:mage-hand`,
  slug: 'mage-hand',
  name: 'Mage Hand',
  description: '<p>A spectral, floating hand appears at a point you choose within range.</p>',
  school: 'conjuration',
  level: 0,
  castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
  range: { kind: 'distance', value: { value: 30, unit: 'ft' } },
  duration: { kind: 'timed', value: 1, unit: 'minute' },
  components: {
    verbal: true,
    somatic: true,
  },
} as Spell

export const spellPickerCantripChoiceSetFixture = {
  id: `${DEFAULT_SYSTEM_RULESET_ID}:fixture-wizard:cantrips`,
  sourceType: 'spellcasting',
  sourceId: `${DEFAULT_SYSTEM_RULESET_ID}:fixture-wizard`,
  choiceType: 'cantrip',
  label: 'Choose Cantrips',
  min: 2,
  max: 2,
  options: [
    { id: spellPickerMageHandFixture.id, label: spellPickerMageHandFixture.name },
    { id: spellPickerDetectMagicFixture.id, label: spellPickerDetectMagicFixture.name },
    { id: spellPickerCureWoundsFixture.id, label: spellPickerCureWoundsFixture.name },
  ],
  required: true,
} as ChoiceSet

export const spellPickerItemsFixture: SpellPickerItem[] = [
  {
    spell: spellPickerMageHandFixture,
    searchText: 'Mage Hand conjuration cantrip spectral floating hand',
    compactSummary: buildSpellPickerCompactSummary(spellPickerMageHandFixture),
    state: {
      isAvailable: true,
      isRecommended: false,
      isAlreadySelected: true,
      isSelectionFull: true,
      canSelect: false,
      disabledReasons: [],
    },
  },
  {
    spell: spellPickerDetectMagicFixture,
    searchText: 'Detect Magic divination ritual concentration detection',
    compactSummary: buildSpellPickerCompactSummary(spellPickerDetectMagicFixture),
    state: {
      isAvailable: true,
      isRecommended: false,
      isAlreadySelected: true,
      isSelectionFull: true,
      canSelect: false,
      disabledReasons: [],
    },
  },
  {
    spell: spellPickerCureWoundsFixture,
    searchText: 'Cure Wounds evocation healing touch',
    compactSummary: buildSpellPickerCompactSummary(spellPickerCureWoundsFixture),
    state: {
      isAvailable: true,
      isRecommended: false,
      isAlreadySelected: false,
      isSelectionFull: true,
      canSelect: false,
      disabledReasons: ['Selection full'],
    },
  },
]

export const spellPickerOpenItemsFixture: SpellPickerItem[] = [
  {
    ...spellPickerItemsFixture[0]!,
    state: {
      isAvailable: true,
      isRecommended: false,
      isAlreadySelected: false,
      isSelectionFull: false,
      canSelect: true,
      disabledReasons: [],
    },
  },
  {
    ...spellPickerItemsFixture[1]!,
    state: {
      isAvailable: true,
      isRecommended: false,
      isAlreadySelected: false,
      isSelectionFull: false,
      canSelect: true,
      disabledReasons: [],
    },
  },
  {
    ...spellPickerItemsFixture[2]!,
    state: {
      isAvailable: true,
      isRecommended: false,
      isAlreadySelected: false,
      isSelectionFull: false,
      canSelect: true,
      disabledReasons: [],
    },
  },
]
