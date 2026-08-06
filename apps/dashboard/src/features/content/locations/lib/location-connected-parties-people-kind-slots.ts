import type {
  CharacterLocationConnectionKind,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import {
  getCharacterLocationConnectionLabel,
  getOrganizationLocationConnectionFamily,
  getOrganizationLocationConnectionLabel,
} from '@rpg/contracts'

import {
  LOCATION_INVERSE_CHARACTER_SURFACE_COPY,
  LOCATION_INVERSE_ORGANIZATION_SURFACE_COPY,
} from './location-connection-surface-copy'

export type PeopleKindBinding =
  | {
      subjectType: 'organization'
      kind: OrganizationLocationConnectionKind
    }
  | {
      subjectType: 'character'
      kind: CharacterLocationConnectionKind
    }

export type PeopleKindSlot = {
  heading: string
  bindings: readonly PeopleKindBinding[]
}

export function peopleKindBindingKey(binding: PeopleKindBinding): string {
  return `${binding.subjectType}:${binding.kind}`
}

export function peopleKindSlotKey(slot: PeopleKindSlot): string {
  return slot.heading
}

export type PeopleConnectionSubjectType = PeopleKindBinding['subjectType']

export function peopleKindSlotHasMultipleSubjectTypes(slot: PeopleKindSlot): boolean {
  const subjectTypes = new Set(slot.bindings.map((binding) => binding.subjectType))
  return subjectTypes.size > 1
}

export function resolvePeopleKindSlotBinding(
  slot: PeopleKindSlot,
  subjectType: PeopleConnectionSubjectType,
): PeopleKindBinding | undefined {
  return slot.bindings.find((binding) => binding.subjectType === subjectType)
}

export function resolvePeopleKindSlotSelectableSubjectTypes(input: {
  slot: PeopleKindSlot
  canAddOrganization: boolean
  canAddCharacter: boolean
}): PeopleConnectionSubjectType[] {
  const subjectTypes: PeopleConnectionSubjectType[] = []
  const hasCharacterBinding = input.slot.bindings.some(
    (binding) => binding.subjectType === 'character',
  )
  const hasOrganizationBinding = input.slot.bindings.some(
    (binding) => binding.subjectType === 'organization',
  )

  if (input.canAddCharacter && hasCharacterBinding) {
    subjectTypes.push('character')
  }
  if (input.canAddOrganization && hasOrganizationBinding) {
    subjectTypes.push('organization')
  }

  return subjectTypes
}

export function resolvePeopleKindSlotSubjectTypeFieldLabel(slot: PeopleKindSlot): string {
  return `${slot.heading} type`
}

export function resolvePeopleKindSlotAddLabel(slot: PeopleKindSlot): string {
  const organizationBinding = resolvePeopleKindSlotBinding(slot, 'organization')
  if (organizationBinding?.subjectType === 'organization') {
    return LOCATION_INVERSE_ORGANIZATION_SURFACE_COPY[organizationBinding.kind].add
  }

  const characterBinding = resolvePeopleKindSlotBinding(slot, 'character')
  if (characterBinding?.subjectType === 'character') {
    return LOCATION_INVERSE_CHARACTER_SURFACE_COPY[characterBinding.kind].add
  }

  return `Add ${slot.heading.toLowerCase()}`
}

export function buildPeopleKindSlots(input: {
  organizationKinds: readonly OrganizationLocationConnectionKind[]
  characterKinds: readonly CharacterLocationConnectionKind[]
}): PeopleKindSlot[] {
  const bindingsByHeading = new Map<string, PeopleKindBinding[]>()
  const headingOrder: string[] = []

  const addBinding = (heading: string, binding: PeopleKindBinding) => {
    const existing = bindingsByHeading.get(heading) ?? []
    if (!bindingsByHeading.has(heading)) {
      headingOrder.push(heading)
    }
    existing.push(binding)
    bindingsByHeading.set(heading, existing)
  }

  for (const kind of input.organizationKinds) {
    if (getOrganizationLocationConnectionFamily(kind) === 'territorial_authority') {
      continue
    }
    addBinding(getOrganizationLocationConnectionLabel(kind), {
      subjectType: 'organization',
      kind,
    })
  }

  for (const kind of input.characterKinds) {
    addBinding(getCharacterLocationConnectionLabel(kind), {
      subjectType: 'character',
      kind,
    })
  }

  return headingOrder.map((heading) => ({
    heading,
    bindings: bindingsByHeading.get(heading) ?? [],
  }))
}
