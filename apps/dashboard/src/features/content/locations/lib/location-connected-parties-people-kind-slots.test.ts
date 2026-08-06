import { describe, expect, it } from 'vitest'

import {
  buildPeopleKindSlots,
  resolvePeopleKindSlotAddLabel,
  resolvePeopleKindSlotSelectableSubjectTypes,
} from './location-connected-parties-people-kind-slots'

describe('buildPeopleKindSlots', () => {
  it('merges organization and character kinds that share the same heading', () => {
    const slots = buildPeopleKindSlots({
      organizationKinds: ['owns', 'tenant', 'headquarters', 'operator'],
      characterKinds: ['owns', 'tenant', 'resides_at', 'operator', 'works_at'],
    })

    expect(slots.map((slot) => slot.heading)).toEqual([
      'Owner',
      'Tenant',
      'Headquarters',
      'Operator',
      'Resident',
      'Works at',
    ])

    const ownerSlot = slots.find((slot) => slot.heading === 'Owner')
    expect(ownerSlot?.bindings).toEqual([
      { subjectType: 'organization', kind: 'owns' },
      { subjectType: 'character', kind: 'owns' },
    ])

    const tenantSlot = slots.find((slot) => slot.heading === 'Tenant')
    expect(tenantSlot?.bindings).toEqual([
      { subjectType: 'organization', kind: 'tenant' },
      { subjectType: 'character', kind: 'tenant' },
    ])

    const operatorSlot = slots.find((slot) => slot.heading === 'Operator')
    expect(operatorSlot?.bindings).toEqual([
      { subjectType: 'organization', kind: 'operator' },
      { subjectType: 'character', kind: 'operator' },
    ])
  })

  it('skips territorial authority organization kinds', () => {
    const slots = buildPeopleKindSlots({
      organizationKinds: ['governs', 'operates_in'],
      characterKinds: [],
    })

    expect(slots).toEqual([
      {
        heading: 'Operates in',
        bindings: [{ subjectType: 'organization', kind: 'operates_in' }],
      },
    ])
  })
})

describe('people kind slot helpers', () => {
  const ownerSlot = {
    heading: 'Owner',
    bindings: [
      { subjectType: 'organization' as const, kind: 'owns' as const },
      { subjectType: 'character' as const, kind: 'owns' as const },
    ],
  }

  it('resolves a single add label for merged slots', () => {
    expect(resolvePeopleKindSlotAddLabel(ownerSlot)).toBe('Add owner')
  })

  it('orders selectable subject types with character first', () => {
    expect(
      resolvePeopleKindSlotSelectableSubjectTypes({
        slot: ownerSlot,
        canAddOrganization: true,
        canAddCharacter: true,
      }),
    ).toEqual(['character', 'organization'])
  })
})
