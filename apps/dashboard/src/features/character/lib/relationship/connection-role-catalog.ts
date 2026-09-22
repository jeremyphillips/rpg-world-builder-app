import type { CharacterRelationshipEdgeKind, DirectedPersonRelationshipRole } from '@rpg/contracts'
import {
  CHARACTER_LOCATION_CONNECTION_ENTRIES,
  type CharacterLocationConnectionKind,
} from '@rpg/contracts'

export type PersonRoleGroupId = 'family' | 'social' | 'guidance'

export type PersonConnectionRoleId =
  | 'parent'
  | 'child'
  | 'sibling'
  | 'partner'
  | 'friend'
  | 'ally'
  | 'rival'
  | 'enemy'
  | 'mentor'
  | 'student'

export type PersonConnectionRoleOption = {
  id: PersonConnectionRoleId
  label: string
  group: PersonRoleGroupId
  shortcutLabel: string
  kind: CharacterRelationshipEdgeKind
  directedRole?: DirectedPersonRelationshipRole
}

export const PERSON_ROLE_GROUP_LABELS: Record<PersonRoleGroupId, string> = {
  family: 'Family',
  social: 'Social',
  guidance: 'Guidance',
}

export const PERSON_CONNECTION_ROLE_OPTIONS: readonly PersonConnectionRoleOption[] = [
  {
    id: 'parent',
    label: 'Parent',
    group: 'family',
    shortcutLabel: 'Add parent',
    kind: 'parentOf',
    directedRole: 'child',
  },
  {
    id: 'child',
    label: 'Child',
    group: 'family',
    shortcutLabel: 'Add child',
    kind: 'parentOf',
    directedRole: 'parent',
  },
  {
    id: 'sibling',
    label: 'Sibling',
    group: 'family',
    shortcutLabel: 'Add sibling',
    kind: 'siblingOf',
  },
  {
    id: 'partner',
    label: 'Spouse / Partner',
    group: 'family',
    shortcutLabel: 'Add spouse or partner',
    kind: 'partnerOf',
  },
  {
    id: 'friend',
    label: 'Friend',
    group: 'social',
    shortcutLabel: 'Add friend',
    kind: 'friendOf',
  },
  {
    id: 'ally',
    label: 'Ally',
    group: 'social',
    shortcutLabel: 'Add ally',
    kind: 'allyOf',
  },
  {
    id: 'rival',
    label: 'Rival',
    group: 'social',
    shortcutLabel: 'Add rival',
    kind: 'rivalOf',
  },
  {
    id: 'enemy',
    label: 'Enemy',
    group: 'social',
    shortcutLabel: 'Add enemy',
    kind: 'enemyOf',
  },
  {
    id: 'mentor',
    label: 'Mentor',
    group: 'guidance',
    shortcutLabel: 'Add mentor',
    kind: 'mentorOf',
    directedRole: 'student',
  },
  {
    id: 'student',
    label: 'Student',
    group: 'guidance',
    shortcutLabel: 'Add student',
    kind: 'mentorOf',
    directedRole: 'mentor',
  },
]

export type PlaceConnectionRoleId = 'hometown' | 'birthplace' | 'residence'

export type PlaceConnectionRoleOption = {
  id: PlaceConnectionRoleId
  label: string
  shortcutLabel: string
  kind: Extract<CharacterRelationshipEdgeKind, 'hometown' | 'birthplace' | 'resides_at'>
}

export const PLACE_CONNECTION_ROLE_OPTIONS: readonly PlaceConnectionRoleOption[] = [
  { id: 'hometown', label: 'Hometown', shortcutLabel: 'Add hometown', kind: 'hometown' },
  { id: 'birthplace', label: 'Birthplace', shortcutLabel: 'Add birthplace', kind: 'birthplace' },
  { id: 'residence', label: 'Residence', shortcutLabel: 'Add residence', kind: 'resides_at' },
]

export type PropertyConnectionRoleId = CharacterLocationConnectionKind

export type PropertyConnectionRoleOption = {
  id: PropertyConnectionRoleId
  label: string
  shortcutLabel: string
  kind: PropertyConnectionRoleId
}

export const PROPERTY_CONNECTION_ROLE_OPTIONS: readonly PropertyConnectionRoleOption[] = (
  ['owns', 'tenant', 'operator', 'works_at'] as const
).map((kind) => ({
  id: kind,
  label: CHARACTER_LOCATION_CONNECTION_ENTRIES[kind].label,
  shortcutLabel: `Add ${CHARACTER_LOCATION_CONNECTION_ENTRIES[kind].label.toLowerCase()}`,
  kind,
}))

export function listPersonRolesByGroup(
  group: PersonRoleGroupId,
): readonly PersonConnectionRoleOption[] {
  return PERSON_CONNECTION_ROLE_OPTIONS.filter((option) => option.group === group)
}

export function getPersonConnectionRoleOption(
  roleId: PersonConnectionRoleId,
): PersonConnectionRoleOption | undefined {
  return PERSON_CONNECTION_ROLE_OPTIONS.find((option) => option.id === roleId)
}

export const PERSON_SHORTCUT_MENU_GROUPS: ReadonlyArray<{
  id: string
  label?: string
  roleIds: readonly PersonConnectionRoleId[]
}> = [
  {
    id: 'family',
    label: 'Family',
    roleIds: ['parent', 'child', 'partner', 'sibling'],
  },
  {
    id: 'other',
    label: 'Other relationships',
    roleIds: ['friend', 'ally', 'rival', 'enemy', 'mentor', 'student'],
  },
]
