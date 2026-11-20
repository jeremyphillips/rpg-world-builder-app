import { MONSTER_SPELLCASTING_ACTION_NAME } from '../../content/monster/spell-casting-source'
import type { MonsterAction, MonsterBonusAction } from '../../content/monster/action/index'
import type { MonsterReferencedSpell } from './reaction-trigger'

export const MULTIATTACK_PATTERN_CLASSES = [
  'fixed-single-group',
  'fixed-multi-group-and',
  'any-combination',
  'simple-replacement',
  'lettered-replacement',
  'pinned-spell-replacement',
  'replacement-with-any-combination',
  'replacement-budget-two',
  'unpinned-spell-replacement',
  'replacement-any-attack',
  'targeted-replacement-when-available',
  'use-after-attacks',
  'use-between-groups',
  'use-twice',
  'use-optional',
  'use-optional-pinned-spell',
  'use-choice',
  'use-choice-when-available',
  'use-when-available',
  'alternative-attack-led',
  'alternative-use-led',
  'alternative-after-using',
] as const

export type MultiattackPatternClass = (typeof MULTIATTACK_PATTERN_CLASSES)[number]

export type MultiattackPatternFixture = {
  id: `multiattack-pattern/${MultiattackPatternClass}`
  patternClass: MultiattackPatternClass
  slug: string
  monsterName: string
  multiattack: Extract<MonsterAction, { kind: 'multiattack' }>
  peerActions: MonsterAction[]
  bonusActions?: MonsterBonusAction[]
  expectedSentence: string
  spellsById?: ReadonlyMap<string, MonsterReferencedSpell>
}

const SPELL_GUIDING = 'srd-cc-5.2.1:guiding-bolt'
const SPELL_SCORCHING = 'srd-cc-5.2.1:scorching-ray'
const SPELL_FAERIE = 'srd-cc-5.2.1:faerie-fire'

function spellLookup(
  entries: Record<string, { name: string; level: number }>,
): ReadonlyMap<string, MonsterReferencedSpell> {
  return new Map(
    Object.entries(entries).map(([id, row]) => [
      id,
      {
        name: row.name,
        level: row.level,
        castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
      },
    ]),
  )
}

function nw(id: string, name: string): MonsterAction {
  return {
    id,
    kind: 'natural-weapon',
    name,
    mode: 'melee',
    reach: 5,
    damage: { dice: { count: 1, faces: 6 } },
    damageType: 'piercing',
  } as MonsterAction
}

function sp(id: string, name: string): MonsterAction {
  return {
    id,
    kind: 'special',
    name,
    description: '<p>Special rules.</p>',
  }
}

function spellcasting(
  id: string,
  spells: { spellId: string; castAtLevel?: number }[],
): Extract<MonsterAction, { kind: 'spell' }> {
  return {
    id,
    kind: 'spell',
    profile: 'primary',
    name: MONSTER_SPELLCASTING_ACTION_NAME,
    castingAbility: { kind: 'ability', ability: 'cha' },
    spells,
  }
}

function ma(
  steps: Extract<MonsterAction, { kind: 'multiattack' }>['steps'],
  extra?: Pick<Extract<MonsterAction, { kind: 'multiattack' }>, 'replacement' | 'alternative'>,
): Extract<MonsterAction, { kind: 'multiattack' }> {
  return {
    id: 'multiattack',
    kind: 'multiattack',
    name: 'Multiattack',
    steps,
    ...extra,
  }
}

export const MULTIATTACK_PATTERN_FIXTURES: readonly MultiattackPatternFixture[] = [
  {
    id: 'multiattack-pattern/fixed-single-group',
    patternClass: 'fixed-single-group',
    slug: 'hell-hound',
    monsterName: 'Hell Hound',
    peerActions: [nw('bite', 'Bite')],
    multiattack: ma([{ count: 2, actionIds: ['bite'] }]),
    expectedSentence: 'The hell hound makes two Bite attacks.',
  },
  {
    id: 'multiattack-pattern/fixed-multi-group-and',
    patternClass: 'fixed-multi-group-and',
    slug: 'bearded-devil',
    monsterName: 'Bearded Devil',
    peerActions: [nw('beard', 'Beard'), nw('glaive', 'Infernal Glaive')],
    multiattack: ma([
      { count: 1, actionIds: ['beard'] },
      { count: 1, actionIds: ['glaive'] },
    ]),
    expectedSentence: 'The bearded devil makes one Beard attack and one Infernal Glaive attack.',
  },
  {
    id: 'multiattack-pattern/any-combination',
    patternClass: 'any-combination',
    slug: 'knight',
    monsterName: 'Knight',
    peerActions: [nw('sword', 'Greatsword'), nw('crossbow', 'Heavy Crossbow')],
    multiattack: ma([{ count: 2, actionIds: ['sword', 'crossbow'] }]),
    expectedSentence:
      'The knight makes two attacks, using Greatsword or Heavy Crossbow in any combination.',
  },
  {
    id: 'multiattack-pattern/simple-replacement',
    patternClass: 'simple-replacement',
    slug: 'roc',
    monsterName: 'Roc',
    peerActions: [nw('beak', 'Beak'), nw('talons', 'Talons')],
    multiattack: ma([{ count: 2, actionIds: ['beak'] }], {
      replacement: { count: 1, choices: [{ actionId: 'talons' }] },
    }),
    expectedSentence:
      'The roc makes two Beak attacks. It can replace one attack with a Talons attack.',
  },
  {
    id: 'multiattack-pattern/lettered-replacement',
    patternClass: 'lettered-replacement',
    slug: 'ancient-gold-dragon',
    monsterName: 'Ancient Gold Dragon',
    peerActions: [
      nw('rend', 'Rend'),
      spellcasting('spellcasting', [{ spellId: SPELL_GUIDING, castAtLevel: 4 }]),
      sp('weakening-breath', 'Weakening Breath'),
    ],
    multiattack: ma([{ count: 3, actionIds: ['rend'] }], {
      replacement: {
        count: 1,
        choices: [
          { actionId: 'spellcasting', spellId: SPELL_GUIDING },
          { actionId: 'weakening-breath' },
        ],
      },
    }),
    spellsById: spellLookup({ [SPELL_GUIDING]: { name: 'Guiding Bolt', level: 1 } }),
    expectedSentence:
      'The ancient gold dragon makes three Rend attacks. It can replace one attack with a use of (A) Spellcasting to cast Guiding Bolt (level 4 version) or (B) Weakening Breath.',
  },
  {
    id: 'multiattack-pattern/pinned-spell-replacement',
    patternClass: 'pinned-spell-replacement',
    slug: 'ancient-red-dragon',
    monsterName: 'Ancient Red Dragon',
    peerActions: [
      nw('rend', 'Rend'),
      spellcasting('spellcasting', [{ spellId: SPELL_SCORCHING, castAtLevel: 3 }]),
    ],
    multiattack: ma([{ count: 3, actionIds: ['rend'] }], {
      replacement: {
        count: 1,
        choices: [{ actionId: 'spellcasting', spellId: SPELL_SCORCHING }],
      },
    }),
    spellsById: spellLookup({ [SPELL_SCORCHING]: { name: 'Scorching Ray', level: 2 } }),
    expectedSentence:
      'The ancient red dragon makes three Rend attacks. It can replace one attack with a use of Spellcasting to cast Scorching Ray (level 3 version).',
  },
  {
    id: 'multiattack-pattern/replacement-with-any-combination',
    patternClass: 'replacement-with-any-combination',
    slug: 'werebear',
    monsterName: 'Werebear',
    peerActions: [nw('handaxe', 'Handaxe'), nw('rend', 'Rend'), nw('bite', 'Bite')],
    multiattack: ma([{ count: 2, actionIds: ['handaxe', 'rend'] }], {
      replacement: { count: 1, choices: [{ actionId: 'bite' }] },
    }),
    expectedSentence:
      'The werebear makes two attacks, using Handaxe or Rend in any combination. It can replace one attack with a Bite attack.',
  },
  {
    id: 'multiattack-pattern/replacement-budget-two',
    patternClass: 'replacement-budget-two',
    slug: 'young-brass-dragon',
    monsterName: 'Young Brass Dragon',
    peerActions: [nw('rend', 'Rend'), sp('sleep-breath', 'Sleep Breath')],
    multiattack: ma([{ count: 3, actionIds: ['rend'] }], {
      replacement: { count: 2, choices: [{ actionId: 'sleep-breath' }] },
    }),
    expectedSentence:
      'The young brass dragon makes three Rend attacks. It can replace two attacks with a use of Sleep Breath.',
  },
  {
    id: 'multiattack-pattern/unpinned-spell-replacement',
    patternClass: 'unpinned-spell-replacement',
    slug: 'oni',
    monsterName: 'Oni',
    peerActions: [nw('claw', 'Claw'), spellcasting('spellcasting', [{ spellId: SPELL_FAERIE }])],
    multiattack: ma([{ count: 1, actionIds: ['claw'] }], {
      replacement: { count: 1, choices: [{ actionId: 'spellcasting' }] },
    }),
    spellsById: spellLookup({ [SPELL_FAERIE]: { name: 'Faerie Fire', level: 1 } }),
    expectedSentence:
      'The oni makes one Claw attack. It can replace one attack with a use of Spellcasting.',
  },
  {
    id: 'multiattack-pattern/replacement-any-attack',
    patternClass: 'replacement-any-attack',
    slug: 'guardian-naga',
    monsterName: 'Guardian Naga',
    peerActions: [nw('bite', 'Bite'), sp('poisonous-spittle', 'Poisonous Spittle')],
    multiattack: ma([{ count: 2, actionIds: ['bite'] }], {
      replacement: { count: 1, attackWord: 'any', choices: [{ actionId: 'poisonous-spittle' }] },
    }),
    expectedSentence:
      'The guardian naga makes two Bite attacks. It can replace any attack with a use of Poisonous Spittle.',
  },
  {
    id: 'multiattack-pattern/targeted-replacement-when-available',
    patternClass: 'targeted-replacement-when-available',
    slug: 'chimera',
    monsterName: 'Chimera',
    peerActions: [
      nw('ram', 'Ram'),
      nw('bite', 'Bite'),
      nw('claw', 'Claw'),
      sp('fire-breath', 'Fire Breath'),
    ],
    multiattack: ma(
      [
        { count: 1, actionIds: ['ram'] },
        { count: 1, actionIds: ['bite'] },
        { count: 1, actionIds: ['claw'] },
      ],
      {
        replacement: {
          count: 1,
          replacesActionId: 'claw',
          whenAvailable: true,
          choices: [{ actionId: 'fire-breath' }],
        },
      },
    ),
    expectedSentence:
      'The chimera makes one Ram attack, one Bite attack, and one Claw attack. It can replace the Claw attack with a use of Fire Breath if available.',
  },
  {
    id: 'multiattack-pattern/use-after-attacks',
    patternClass: 'use-after-attacks',
    slug: 'behir',
    monsterName: 'Behir',
    peerActions: [nw('bite', 'Bite'), sp('constrict', 'Constrict')],
    multiattack: ma([
      { count: 1, actionIds: ['bite'] },
      { kind: 'use', mode: 'single', actionId: 'constrict' },
    ]),
    expectedSentence: 'The behir makes one Bite attack and uses Constrict.',
  },
  {
    id: 'multiattack-pattern/use-between-groups',
    patternClass: 'use-between-groups',
    slug: 'roper',
    monsterName: 'Roper',
    peerActions: [nw('tentacle', 'Tentacle'), sp('reel', 'Reel'), nw('bite', 'Bite')],
    multiattack: ma([
      { count: 2, actionIds: ['tentacle'] },
      { kind: 'use', mode: 'single', actionId: 'reel' },
      { count: 2, actionIds: ['bite'] },
    ]),
    expectedSentence:
      'The roper makes two Tentacle attacks, uses Reel, and makes two Bite attacks.',
  },
  {
    id: 'multiattack-pattern/use-twice',
    patternClass: 'use-twice',
    slug: 'rust-monster',
    monsterName: 'Rust Monster',
    peerActions: [nw('bite', 'Bite'), sp('antennae', 'Antennae')],
    multiattack: ma([
      { count: 1, actionIds: ['bite'] },
      { kind: 'use', mode: 'single', actionId: 'antennae', count: 2 },
    ]),
    expectedSentence: 'The rust monster makes one Bite attack and uses Antennae twice.',
  },
  {
    id: 'multiattack-pattern/use-optional',
    patternClass: 'use-optional',
    slug: 'erinyes',
    monsterName: 'Erinyes',
    peerActions: [nw('sword', 'Longsword'), sp('rope', 'Magic Rope')],
    multiattack: ma([
      { count: 1, actionIds: ['sword'] },
      { kind: 'use', mode: 'single', actionId: 'rope', optional: true },
    ]),
    expectedSentence: 'The erinyes makes one Longsword attack and can use Magic Rope.',
  },
  {
    id: 'multiattack-pattern/use-optional-pinned-spell',
    patternClass: 'use-optional-pinned-spell',
    slug: 'dryad',
    monsterName: 'Dryad',
    peerActions: [nw('club', 'Club'), spellcasting('spellcasting', [{ spellId: SPELL_FAERIE }])],
    multiattack: ma([
      { count: 1, actionIds: ['club'] },
      {
        kind: 'use',
        mode: 'single',
        actionId: 'spellcasting',
        spellId: SPELL_FAERIE,
        optional: true,
      },
    ]),
    spellsById: spellLookup({ [SPELL_FAERIE]: { name: 'Faerie Fire', level: 1 } }),
    expectedSentence:
      'The dryad makes one Club attack and can use Spellcasting to cast Faerie Fire.',
  },
  {
    id: 'multiattack-pattern/use-choice',
    patternClass: 'use-choice',
    slug: 'glabrezu',
    monsterName: 'Glabrezu',
    peerActions: [
      nw('pincer', 'Pincer'),
      sp('teleport', 'Teleport'),
      spellcasting('spellcasting', [{ spellId: SPELL_FAERIE }]),
    ],
    multiattack: ma([
      { count: 2, actionIds: ['pincer'] },
      {
        kind: 'use',
        mode: 'choice',
        choices: [{ actionId: 'teleport' }, { actionId: 'spellcasting' }],
      },
    ]),
    expectedSentence: 'The glabrezu makes two Pincer attacks and uses Teleport or Spellcasting.',
  },
  {
    id: 'multiattack-pattern/use-choice-when-available',
    patternClass: 'use-choice-when-available',
    slug: 'aboleth',
    monsterName: 'Aboleth',
    peerActions: [
      nw('tentacle', 'Tentacle'),
      sp('consume-memories', 'Consume Memories'),
      sp('dominate-mind', 'Dominate Mind'),
    ],
    multiattack: ma([
      { count: 2, actionIds: ['tentacle'] },
      {
        kind: 'use',
        mode: 'choice',
        whenAvailable: true,
        choices: [{ actionId: 'consume-memories' }, { actionId: 'dominate-mind' }],
      },
    ]),
    expectedSentence:
      'The aboleth makes two Tentacle attacks and uses Consume Memories or Dominate Mind if available.',
  },
  {
    id: 'multiattack-pattern/use-when-available',
    patternClass: 'use-when-available',
    slug: 'doppelganger',
    monsterName: 'Doppelganger',
    peerActions: [nw('slam', 'Slam'), sp('read-thoughts', 'Read Thoughts')],
    multiattack: ma([
      { count: 1, actionIds: ['slam'] },
      { kind: 'use', mode: 'single', actionId: 'read-thoughts', whenAvailable: true },
    ]),
    expectedSentence: 'The doppelganger makes one Slam attack and uses Read Thoughts if available.',
  },
  {
    id: 'multiattack-pattern/alternative-attack-led',
    patternClass: 'alternative-attack-led',
    slug: 'barbed-devil',
    monsterName: 'Barbed Devil',
    peerActions: [nw('claws', 'Claws'), nw('tail', 'Tail'), nw('hurl-flame', 'Hurl Flame')],
    multiattack: ma(
      [
        { count: 1, actionIds: ['claws'] },
        { count: 1, actionIds: ['tail'] },
      ],
      {
        alternative: { steps: [{ count: 2, actionIds: ['hurl-flame'] }] },
      },
    ),
    expectedSentence:
      'The barbed devil makes one Claws attack and one Tail attack, or it makes two Hurl Flame attacks.',
  },
  {
    id: 'multiattack-pattern/alternative-use-led',
    patternClass: 'alternative-use-led',
    slug: 'planetar',
    monsterName: 'Planetar',
    peerActions: [nw('sword', 'Radiant Sword'), sp('holy-burst', 'Holy Burst')],
    multiattack: ma([{ count: 3, actionIds: ['sword'] }], {
      alternative: {
        steps: [{ kind: 'use', mode: 'single', actionId: 'holy-burst', count: 2 }],
      },
    }),
    expectedSentence:
      'The planetar makes three Radiant Sword attacks, or it uses Holy Burst twice.',
  },
  {
    id: 'multiattack-pattern/alternative-after-using',
    patternClass: 'alternative-after-using',
    slug: 'clay-golem',
    monsterName: 'Clay Golem',
    peerActions: [nw('slam', 'Slam')],
    bonusActions: [
      {
        id: 'hasten',
        kind: 'take-actions',
        name: 'Hasten',
        standardActions: ['dash', 'disengage'],
        combination: 'one',
      },
    ] as MonsterBonusAction[],
    multiattack: ma([{ count: 2, actionIds: ['slam'] }], {
      alternative: {
        steps: [{ count: 3, actionIds: ['slam'] }],
        afterUsingActionId: 'hasten',
      },
    }),
    expectedSentence:
      'The clay golem makes two Slam attacks, or it makes three Slam attacks if it used Hasten this turn.',
  },
]
