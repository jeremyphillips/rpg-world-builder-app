import type { NamingConventionKey } from '@rpg/contracts/name-generator'
import type { NameSubjectKind } from '@rpg/contracts/name-generator'

const DEFAULT_SUBJECT_KINDS_BY_KEY = {
  personal: ['person'],
  settlement: ['settlement'],
  clan: ['clan'],
} as const satisfies Record<NamingConventionKey, readonly NameSubjectKind[]>

export function getDefaultSubjectKinds(key: NamingConventionKey): readonly NameSubjectKind[] {
  return DEFAULT_SUBJECT_KINDS_BY_KEY[key]
}
