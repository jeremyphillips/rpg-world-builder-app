import type { NamePartRole, PersonalNameComponent } from '@rpg/contracts/name-generator'
import { NAME_PART_ROLES } from '@rpg/contracts/name-generator'

export const PERSONAL_COMPONENT_TO_PART_ROLES = {
  family: ['family'],
  clan: ['clan'],
  house: ['house'],
  virtue: ['virtue'],
  title: ['title'],
  epithet: ['epithet'],
} as const satisfies Record<PersonalNameComponent, readonly NamePartRole[]>

export function getPartRolesForPersonalNameComponent(
  component: PersonalNameComponent,
): readonly NamePartRole[] {
  return PERSONAL_COMPONENT_TO_PART_ROLES[component]
}

export function isValidMappedPartRole(role: NamePartRole): boolean {
  return NAME_PART_ROLES.includes(role)
}
