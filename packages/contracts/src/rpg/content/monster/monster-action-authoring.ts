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
  if (action.kind === 'attack' || action.kind === 'spell') return AUTHORED_NAME
  if (action.kind === 'natural-weapon' || action.kind === 'save' || action.kind === 'multiattack') {
    if (action.preset) return DERIVED_VOCABULARY
    return AUTHORED_NAME
  }
  return { name: 'authored', description: 'authored', source: 'none' }
}
