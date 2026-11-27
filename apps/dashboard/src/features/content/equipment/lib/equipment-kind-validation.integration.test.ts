import { describe, expect, it } from 'vitest'
import {
  collectCurrentFormValidationProducerIssues,
  compileFormOwnership,
  createEmptyFormValidationProducerSession,
  replaceFormValidationProducerSlot,
} from '@rpg/ui/form'

import { evaluateContentPublishFormIssues } from '../../lib/forms/validation/content-publish-validation.lib'
import { equipmentEconomyFormDefaults } from './equipment-economy-form-values'
import { buildEquipmentFields, resolveEquipmentFormSchema } from './equipment-form-fields'

describe('equipment kind validation pilot', () => {
  it('compiles weapon range ownership that armor topology does not claim', () => {
    const weaponFields = buildEquipmentFields({ equipmentKind: 'weapon' })
    const armorFields = buildEquipmentFields({ equipmentKind: 'armor' })
    const weaponOwned = compileFormOwnership(weaponFields, {})
    const armorOwned = compileFormOwnership(armorFields, {})

    expect(weaponOwned.paths.has('range.normal')).toBe(true)
    expect(armorOwned.paths.has('range.normal')).toBe(false)
    expect(armorOwned.paths.has('armorCategory')).toBe(true)
    expect(weaponOwned.paths.has('armorCategory')).toBe(false)
  })

  it('drops stale weapon interactive issues when the snapshot stamp advances for a new kind', () => {
    let session = createEmptyFormValidationProducerSession()
    session = replaceFormValidationProducerSlot(session, 'interactive', 1, [
      {
        path: 'range.normal',
        message: 'Range is required.',
        severity: 'field',
      },
    ])
    session = replaceFormValidationProducerSlot(session, 'interactive', 2, [
      {
        path: 'armorCategory',
        message: 'Choose an armor category.',
        severity: 'field',
      },
    ])

    const issues = collectCurrentFormValidationProducerIssues(session, 2)
    expect(issues.some((issue) => issue.path === 'range.normal')).toBe(false)
    expect(issues.some((issue) => issue.path === 'armorCategory')).toBe(true)
  })

  it('evaluates armor publish without weapon-only paths', () => {
    const armorFields = buildEquipmentFields({ equipmentKind: 'armor' })
    const schema = resolveEquipmentFormSchema({ equipmentKind: 'armor' }, 'publish')
    const values = {
      kind: 'armor' as const,
      name: '',
      armorCategory: 'light' as const,
      ...equipmentEconomyFormDefaults('armor'),
      cost: { amount: 1, currency: 'gp' as const },
    }

    const issues = evaluateContentPublishFormIssues(schema, values, armorFields)
    expect(issues).not.toBeNull()
    for (const issue of issues ?? []) {
      expect(issue.path.startsWith('range.')).toBe(false)
      expect(issue.path.startsWith('damage')).toBe(false)
    }
  })
})
