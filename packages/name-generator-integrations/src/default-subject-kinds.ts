import type { NamingConventionKey } from '@rpg/contracts/name-generator'
import type { NameSubjectKind } from '@rpg/contracts/name-generator'

const DEFAULT_SUBJECT_KINDS_BY_KEY = {
  personal: ['person'],
  family: ['family'],
  clan: ['clan'],
  settlement: ['settlement'],
  landmark: ['landmark'],
  faction: ['faction', 'organization'],
} as const satisfies Record<NamingConventionKey, readonly NameSubjectKind[]>

export function getDefaultSubjectKinds(key: NamingConventionKey): readonly NameSubjectKind[] {
  return DEFAULT_SUBJECT_KINDS_BY_KEY[key]
}
