import {
  createEquipmentDraftInputSchema,
  createEquipmentInputSchema,
  fieldValidationMessages,
  formatFieldMessage,
  type WeaponEquipment,
} from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { equipmentFormToInput } from './equipment-form-values'
import {
  equipmentFormDraftSchema,
  equipmentFormSchema,
  weaponEquipmentDraftFormSchema,
  weaponEquipmentFormSchema,
} from './equipment-form-fields'
import { weaponFormValuesFromEntity } from '../weapons/lib/weapon-form-values'

const damageRollRequired = formatFieldMessage(
  fieldValidationMessages.requiredText({ label: 'Damage roll' }),
)
const damageTypeRequired = formatFieldMessage(
  fieldValidationMessages.requiredSelect({ label: 'Type' }),
)

function weaponForm(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Longsword',
    kind: 'weapon' as const,
    hasMarketPrice: false,
    cost: null,
    category: 'martial' as const,
    mode: 'melee' as const,
    mastery: 'sap' as const,
    properties: [] as string[],
    ...overrides,
  }
}

function issuePaths(
  schema: {
    safeParse: (value: unknown) => {
      success: boolean
      error?: { issues: { path: PropertyKey[]; message: string }[] }
    }
  },
  values: Record<string, unknown>,
) {
  const parsed = schema.safeParse(values)
  if (parsed.success) return []
  return parsed.error?.issues.map((issue) => issue.path.join('.')) ?? []
}

function issueMessage(values: Record<string, unknown>, path: string) {
  const parsed = weaponEquipmentFormSchema.safeParse(values)
  if (parsed.success) return undefined
  const issue = parsed.error.issues.find((entry) => entry.path.join('.') === path)
  return issue ? formatFieldMessage(issue.message) : undefined
}

describe('published weapon damage form', () => {
  it('rejects empty, partial, and unpaired damage', () => {
    expect(issueMessage(weaponForm(), 'damage')).toBe(damageRollRequired)
    expect(issueMessage(weaponForm(), 'damageType')).toBe(damageTypeRequired)
    expect(
      issueMessage(
        weaponForm({ damage: { dice: { count: 1 } }, damageType: 'slashing' }),
        'damage',
      ),
    ).toBe(damageRollRequired)
    expect(issuePaths(weaponEquipmentFormSchema, weaponForm({ damageType: 'slashing' }))).toContain(
      'damage',
    )
    expect(
      issuePaths(
        weaponEquipmentFormSchema,
        weaponForm({ damage: { dice: { count: 1, faces: 8 } } }),
      ),
    ).toEqual(['damageType'])
  })

  it('accepts dice with a signed modifier', () => {
    expect(
      weaponEquipmentFormSchema.safeParse(
        weaponForm({
          damage: { dice: { count: 1, faces: 8 }, flatOperator: '+', flatAmount: 2 },
          damageType: 'slashing',
        }),
      ).success,
    ).toBe(true)
  })

  it('keeps draft authoring optional on the kind and hub schemas', () => {
    expect(weaponEquipmentDraftFormSchema.safeParse(weaponForm()).success).toBe(true)
    expect(equipmentFormDraftSchema.safeParse(weaponForm()).success).toBe(true)
    expect(issuePaths(equipmentFormSchema, weaponForm())).toEqual(
      expect.arrayContaining(['damage', 'damageType']),
    )
  })
})

describe('weapon damage persistence', () => {
  const stored = {
    category: 'simple',
    mode: 'melee',
    mastery: 'nick',
    properties: [],
  } as unknown as WeaponEquipment

  it('hydrates omitted damage without a roll default', () => {
    const formValues = weaponFormValuesFromEntity(stored)
    expect(formValues.damage).toBeUndefined()
    expect(formValues.damageType).toBeUndefined()
    expect(formValues).not.toHaveProperty('hasDamage')
  })

  it('publishes a complete roll and lets a draft omit an empty one', () => {
    const complete = weaponForm({
      damage: { dice: { count: 2, faces: 6 }, flatOperator: '-', flatAmount: 1 },
      damageType: 'slashing',
    })
    const published = equipmentFormToInput(complete)
    expect(createEquipmentInputSchema.parse(published)).toMatchObject({
      damage: { dice: { count: 2, faces: 6 }, flat: -1 },
      damageType: 'slashing',
    })

    const drafted = equipmentFormToInput(weaponForm(), undefined, 'draft')
    expect(drafted).not.toHaveProperty('damage')
    expect(drafted).not.toHaveProperty('damageType')
    expect(createEquipmentDraftInputSchema.parse(drafted).kind).toBe('weapon')

    const partial = equipmentFormToInput(
      weaponForm({ damage: { dice: { count: 1 } }, damageType: 'slashing' }),
      undefined,
      'draft',
    )
    expect(partial).not.toHaveProperty('damage')
    expect(partial).not.toHaveProperty('damageType')
  })
})
