import type { MonsterActionKind } from '../../vocab/monster-action-kind'

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

const AUTHORED_GENERATED: MonsterActionAuthoring = {
  name: 'authored',
  description: 'generated',
  source: 'none',
}

const AUTHORED_FULL: MonsterActionAuthoring = {
  name: 'authored',
  description: 'authored',
  source: 'none',
}

const DERIVED_EQUIPMENT: MonsterActionAuthoring = {
  name: 'derived',
  description: 'generated',
  source: 'equipment',
}

/** Default policy for `{ kind }` without preset or spell profile overrides. */
const MONSTER_ACTION_AUTHORING_BY_KIND = {
  weapon: DERIVED_EQUIPMENT,
  'natural-weapon': AUTHORED_NAME,
  attack: AUTHORED_NAME,
  save: AUTHORED_NAME,
  multiattack: DERIVED_VOCABULARY,
  'action-reference': AUTHORED_NAME,
  parry: AUTHORED_GENERATED,
  leap: AUTHORED_GENERATED,
  teleport: AUTHORED_GENERATED,
  'take-actions': AUTHORED_GENERATED,
  'shape-shift': AUTHORED_GENERATED,
  special: AUTHORED_FULL,
  spell: AUTHORED_NAME,
} as const satisfies Record<MonsterActionKind, MonsterActionAuthoring>

const PRESET_DERIVED_VOCABULARY_KINDS = new Set<MonsterActionKind>(['natural-weapon', 'save'])

/**
 * Name and description authority for a monster action.
 * An unknown preset stays derived so a custom name cannot turn a broken source into an authored action.
 */
export function monsterActionAuthoring(action: AuthoringSubject): MonsterActionAuthoring {
  if (!action || typeof action.kind !== 'string') {
    return AUTHORED_FULL
  }
  if (action.kind === 'spell' && action.profile === 'primary') {
    return { name: 'derived', description: 'generated', source: 'none' }
  }
  if (action.preset && PRESET_DERIVED_VOCABULARY_KINDS.has(action.kind as MonsterActionKind)) {
    return DERIVED_VOCABULARY
  }
  if (action.kind in MONSTER_ACTION_AUTHORING_BY_KIND) {
    return MONSTER_ACTION_AUTHORING_BY_KIND[
      action.kind as keyof typeof MONSTER_ACTION_AUTHORING_BY_KIND
    ]
  }
  // Intentional catch-all for unknown kinds in dev catalogs — not used for acquisition menu paths.
  return AUTHORED_FULL
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

const MONSTER_ACTION_USAGE_CAPABILITY_BY_KIND = {
  weapon: NO_USAGE,
  'natural-weapon': OPTIONAL_RECHARGE,
  attack: OPTIONAL_RECHARGE,
  save: OPTIONAL_FULL_LIMIT,
  multiattack: NO_USAGE,
  'action-reference': NO_USAGE,
  parry: NO_USAGE,
  leap: OPTIONAL_FULL_LIMIT,
  teleport: OPTIONAL_FULL_LIMIT,
  'take-actions': OPTIONAL_FULL_LIMIT,
  'shape-shift': NO_USAGE,
  special: OPTIONAL_FULL_LIMIT,
  spell: OPTIONAL_FULL_LIMIT,
} as const satisfies Record<MonsterActionKind, MonsterActionUsageCapability>

/**
 * Usage editor for an action. Preset ids distinguish the three save roles.
 * A preset's `defaults.limitedUse` is not an edit policy.
 */
export function monsterActionUsageCapability(
  action: AuthoringSubject,
): MonsterActionUsageCapability {
  if (action.kind === 'save') {
    if (action.preset === 'breath-weapon') return INCLUDED_RECHARGE
    if (action.preset === 'constrict') return NO_USAGE
    return MONSTER_ACTION_USAGE_CAPABILITY_BY_KIND.save
  }
  if (action.kind in MONSTER_ACTION_USAGE_CAPABILITY_BY_KIND) {
    return MONSTER_ACTION_USAGE_CAPABILITY_BY_KIND[
      action.kind as keyof typeof MONSTER_ACTION_USAGE_CAPABILITY_BY_KIND
    ]
  }
  return NO_USAGE
}
