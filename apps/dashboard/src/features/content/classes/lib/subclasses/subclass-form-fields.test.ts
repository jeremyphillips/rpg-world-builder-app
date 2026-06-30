/**
 * Subclass form — round-trip and type-level drift guard.
 */
import { describe, expect, expectTypeOf, it } from 'vitest'
import { loadSeedSubclasses } from '@rpg/catalog/classes'
import { createSubclassInputSchema, type CreateSubclassInput } from '@rpg/contracts'

import { CHAMPION } from '../../fixtures'
import type { SubclassFormValues } from './subclass-form-fields'
import { subclassFormDef } from './subclass-form-values'

const SRD_SUBCLASSES = loadSeedSubclasses('srd-cc-5.2.1')

it('type: toInput return type matches CreateSubclassInput', () => {
  expectTypeOf(subclassFormDef.toInput).returns.toEqualTypeOf<CreateSubclassInput>()
})

describe('subclassFormDef round-trips', () => {
  for (const subclass of SRD_SUBCLASSES) {
    it(`${subclass.slug}: toFormValues → toInput → schema.parse`, () => {
      const formValues = subclassFormDef.toFormValues(subclass) as SubclassFormValues
      const input = subclassFormDef.toInput(formValues, subclass.classId)
      expect(() => createSubclassInputSchema.parse(input)).not.toThrow()
    })

    it(`${subclass.slug}: name is preserved`, () => {
      const formValues = subclassFormDef.toFormValues(subclass) as SubclassFormValues
      const input = subclassFormDef.toInput(formValues, subclass.classId)
      expect(input.name).toBe(subclass.name)
    })
  }

  it('update: omits slug and preserves feature ids when names change', () => {
    const formValues = subclassFormDef.toFormValues(CHAMPION) as SubclassFormValues
    const renamedFeatures = formValues.features.map((feature) => ({
      ...feature,
      name: `${feature.name} (edited)`,
    }))
    const input = subclassFormDef.toInput(
      { ...formValues, features: renamedFeatures },
      CHAMPION.classId,
      { entity: CHAMPION },
    )
    expect('slug' in input).toBe(false)
    if (CHAMPION.features.length > 0) {
      expect(input.features?.[0]?.id).toBe(CHAMPION.features[0]?.id)
    }
  })
})
