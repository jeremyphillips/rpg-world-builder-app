import { describe, expect, it } from 'vitest'

import { collectSlotIdentities } from './form-slot-identities'

describe('collectSlotIdentities', () => {
  it('counts a repeated static name separately from a different name', () => {
    const source = `
      function fields() {
        return [
          { kind: 'slot', name: 'castingAbility', render: () => null },
          { kind: 'slot', name: 'castingAbility', render: () => null },
          { kind: 'slot', name: 'frequency', render: () => null },
        ]
      }
    `
    expect(collectSlotIdentities(source, 'fields.tsx')).toEqual({
      'fields.tsx::castingAbility': 2,
      'fields.tsx::frequency': 1,
    })
  })

  it('uses the factory function when the name is a parameter', () => {
    const source = `
      function ownedSlot(name: string) {
        return { kind: 'slot', name, render: () => null }
      }
      function fields() {
        return { kind: 'slot', name: 'publishCatalogWriteGate', render: () => null }
      }
    `
    expect(collectSlotIdentities(source, 'monster.tsx')).toEqual({
      'monster.tsx::ownedSlot()': 1,
      'monster.tsx::publishCatalogWriteGate': 1,
    })
  })

  it('resolves a same-file string constant', () => {
    const source = `
      const MONSTER_FORM_AVAILABILITY_FIELD = 'formAvailability'
      function fields() {
        return { kind: 'slot', name: MONSTER_FORM_AVAILABILITY_FIELD }
      }
    `
    expect(collectSlotIdentities(source, 'forms.ts')).toEqual({
      'forms.ts::formAvailability': 1,
    })
  })

  it('reads string arguments from a name helper and ignores a ternary condition', () => {
    const source = `
      function organizationFields() {
        return { kind: 'slot', name: fieldPath(prefix, 'startingPointId') }
      }
      function validationFields(method: string) {
        return {
          kind: 'slot' as const,
          name: method === 'standard-array' ? 'fixedScoresAssignment' : 'manualAbilitiesAssignment',
        }
      }
    `
    expect(collectSlotIdentities(source, 'fields.ts')).toEqual({
      'fields.ts::startingPointId': 1,
      'fields.ts::fixedScoresAssignment': 1,
      'fields.ts::manualAbilitiesAssignment': 1,
    })
  })

  it('uses the static tail of a template name', () => {
    const source = `
      function abilityField(input: { sourcePath: string }) {
        return { kind: 'slot', name: \`\${input.sourcePath}.castingAbility\` }
      }
    `
    expect(collectSlotIdentities(source, 'save.tsx')).toEqual({
      'save.tsx::castingAbility': 1,
    })
  })
})
