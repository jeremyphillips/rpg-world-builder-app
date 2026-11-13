export type MonsterActionNameAuthority = 'derived' | 'authored'
export type MonsterActionDescriptionAuthority = 'generated' | 'authored'
export type MonsterActionSourceKind = 'equipment' | 'vocabulary' | 'none'

/** How an action is named and described. Derived from kind and preset, not a second registry. */
export type MonsterActionAuthoring = {
  name: MonsterActionNameAuthority
  description: MonsterActionDescriptionAuthority
  source: MonsterActionSourceKind
}

type AuthoringSubject = {
  kind: string
  preset?: string
  profile?: string
}

const AUTHORED_NAME: MonsterActionAuthoring = {
  name: 'authored',
  description: 'generated',
  source: 'none',
}

const DERIVED_VOCABULARY: MonsterActionAuthoring = {
  name: 'derived',
  description: 'generated',
  source: 'vocabulary',
}

/**
 * Name and description authority for a monster action.
 * An unknown preset stays derived so a custom name cannot turn a broken source into an authored action.
 */
export function monsterActionAuthoring(action: AuthoringSubject): MonsterActionAuthoring {
  if (action.kind === 'weapon') {
    return { name: 'derived', description: 'generated', source: 'equipment' }
  }
  if (action.kind === 'special') {
    return { name: 'authored', description: 'authored', source: 'none' }
  }
  if (action.kind === 'parry') {
    return { name: 'authored', description: 'generated', source: 'none' }
  }
  if (action.kind === 'spell' && action.profile === 'primary') {
    return { name: 'derived', description: 'generated', source: 'none' }
  }
  if (action.kind === 'attack' || action.kind === 'spell' || action.kind === 'action-reference') {
    return AUTHORED_NAME
  }
  if (action.kind === 'natural-weapon' || action.kind === 'save' || action.kind === 'multiattack') {
    if (action.preset) return DERIVED_VOCABULARY
    return AUTHORED_NAME
  }
  return { name: 'authored', description: 'authored', source: 'none' }
}

export const MONSTER_ACTION_USAGE_PRESENTATIONS = ['none', 'included', 'optional'] as const
export type MonsterActionUsagePresentation = (typeof MONSTER_ACTION_USAGE_PRESENTATIONS)[number]
export type MonsterActionUsageKind = 'recharge' | 'uses'

/** Which usage editor an action shows, and which existing `limitedUse.kind` values it can write. */
export type MonsterActionUsageCapability = {
  presentation: MonsterActionUsagePresentation
  kinds: readonly MonsterActionUsageKind[]
}

const NO_USAGE = { presentation: 'none', kinds: [] } as const satisfies MonsterActionUsageCapability
const OPTIONAL_RECHARGE = {
  presentation: 'optional',
  kinds: ['recharge'],
} as const satisfies MonsterActionUsageCapability
const INCLUDED_RECHARGE = {
  presentation: 'included',
  kinds: ['recharge'],
} as const satisfies MonsterActionUsageCapability
const OPTIONAL_FULL_LIMIT = {
  presentation: 'optional',
  kinds: ['recharge', 'uses'],
} as const satisfies MonsterActionUsageCapability

/**
 * Usage editor for an action. Preset ids distinguish the three save roles.
 * A preset's `defaults.limitedUse` is not an edit policy.
 */
export function monsterActionUsageCapability(
  action: AuthoringSubject,
): MonsterActionUsageCapability {
  if (action.kind === 'natural-weapon' || action.kind === 'attack') return OPTIONAL_RECHARGE
  if (action.kind === 'special' || action.kind === 'spell') return OPTIONAL_FULL_LIMIT
  if (action.kind !== 'save') return NO_USAGE
  if (action.preset === 'breath-weapon') return INCLUDED_RECHARGE
  if (action.preset === 'constrict') return NO_USAGE
  return OPTIONAL_FULL_LIMIT
}
