import { describe, expect, it } from 'vitest'
import { isFieldOptionGroup } from '@rpg/ui/form'
import {
  LOCATION_KIND_IDS,
  STRUCTURE_TYPE_IDS,
  type LocationKind,
  type StructureType,
} from '@rpg/contracts'

import {
  buildLocationAuthoringTypeOptions,
  canonicalFieldsForAuthoringType,
  LOCATION_AUTHORING_TYPE_IDS,
  resolveLocationAuthoringType,
  UNCLASSIFIED_STRUCTURE_AUTHORING_TYPE,
  UNCLASSIFIED_STRUCTURE_LABEL,
} from './location-authoring-type'

describe('location authoring type mapping', () => {
  it('covers every non-structure kind, structure type id, and unclassified structure', () => {
    const nonStructureKinds = LOCATION_KIND_IDS.filter((id) => id !== 'structure')
    for (const kind of nonStructureKinds) {
      expect(LOCATION_AUTHORING_TYPE_IDS).toContain(kind)
    }
    for (const structureType of STRUCTURE_TYPE_IDS) {
      expect(LOCATION_AUTHORING_TYPE_IDS).toContain(structureType)
    }
    expect(LOCATION_AUTHORING_TYPE_IDS).toContain(UNCLASSIFIED_STRUCTURE_AUTHORING_TYPE)
  })

  it('round-trips non-structure kinds through canonical projection', () => {
    const kinds = LOCATION_KIND_IDS.filter((id) => id !== 'structure') as Exclude<
      LocationKind,
      'structure'
    >[]

    for (const kind of kinds) {
      expect(resolveLocationAuthoringType({ kind })).toBe(kind)
      expect(canonicalFieldsForAuthoringType(kind)).toEqual({ kind })
    }
  })

  it('round-trips each structure type and unclassified structure', () => {
    for (const structureType of STRUCTURE_TYPE_IDS) {
      expect(resolveLocationAuthoringType({ kind: 'structure', structureType })).toBe(structureType)
      expect(canonicalFieldsForAuthoringType(structureType)).toEqual({
        kind: 'structure',
        structureType,
      })
    }

    expect(resolveLocationAuthoringType({ kind: 'structure' })).toBe(
      UNCLASSIFIED_STRUCTURE_AUTHORING_TYPE,
    )
    expect(canonicalFieldsForAuthoringType(UNCLASSIFIED_STRUCTURE_AUTHORING_TYPE)).toEqual({
      kind: 'structure',
    })
  })

  it('hydrates every legal persisted location shape (totality invariant)', () => {
    const nonStructureKinds = LOCATION_KIND_IDS.filter((id) => id !== 'structure') as Exclude<
      LocationKind,
      'structure'
    >[]

    for (const kind of nonStructureKinds) {
      expect(resolveLocationAuthoringType({ kind })).toBeTruthy()
    }

    for (const structureType of STRUCTURE_TYPE_IDS) {
      expect(resolveLocationAuthoringType({ kind: 'structure', structureType })).toBeTruthy()
    }

    expect(resolveLocationAuthoringType({ kind: 'structure' })).toBe(
      UNCLASSIFIED_STRUCTURE_AUTHORING_TYPE,
    )
  })

  it('projects grouped options from contracts labels with unclassified structure last', () => {
    const options = buildLocationAuthoringTypeOptions()
    const structuresGroup = options.find(
      (item) => isFieldOptionGroup(item) && item.label === 'Structures',
    )
    expect(structuresGroup).toBeDefined()
    if (!structuresGroup || !isFieldOptionGroup(structuresGroup)) {
      throw new Error('expected Structures option group')
    }

    expect(structuresGroup.options.map((option) => option.value)).toEqual([
      ...STRUCTURE_TYPE_IDS,
      UNCLASSIFIED_STRUCTURE_AUTHORING_TYPE,
    ])
    expect(structuresGroup.options.at(-1)?.label).toBe(UNCLASSIFIED_STRUCTURE_LABEL)
    expect(
      structuresGroup.options
        .slice(0, -1)
        .every((option) => STRUCTURE_TYPE_IDS.includes(option.value as StructureType)),
    ).toBe(true)
  })
})
