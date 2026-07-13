import { describe, expect, it } from 'vitest'

import { pickClass } from '../../../lib/fixtures/pick'
import { startingEquipmentToFormValues } from './class-starting-equipment-form-values'
import { findProficiencyEquipmentReferences } from './class-proficiency-equipment-references.lib'

describe('findProficiencyEquipmentReferences', () => {
  const monkStartingEquipment = startingEquipmentToFormValues(
    pickClass('monk').characterCreation!.startingEquipment!,
  )

  it('returns standard package reference for class-tools', () => {
    expect(findProficiencyEquipmentReferences(monkStartingEquipment, 'class-tools')).toEqual([
      expect.objectContaining({
        choiceId: 'class-tools',
        packageId: 'standard',
        packageLabel: 'Standard Equipment',
      }),
    ])
  })

  it('does not match unrelated choice ids', () => {
    expect(findProficiencyEquipmentReferences(monkStartingEquipment, 'other-choice')).toEqual([])
  })

  it('does not treat gold-only packages as linked grants', () => {
    const references = findProficiencyEquipmentReferences(monkStartingEquipment, 'class-tools')
    expect(references.some((reference) => reference.packageId === 'gold')).toBe(false)
  })
})
