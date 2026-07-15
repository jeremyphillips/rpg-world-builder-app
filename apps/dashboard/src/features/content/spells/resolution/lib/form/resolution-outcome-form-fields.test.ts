import { describe, expect, it } from 'vitest'
import type { ArrayConfig, FormItem, GroupConfig } from '@rpg/ui/form'

import {
  amountOptionsForEffect,
  outcomeApplicationsArrayFields,
  outcomeBranchBodyFields,
  outcomeNoteFields,
  resolutionOutcomeApplicationsResolverFields,
} from './resolution-outcome-form-fields'
import { RESOLUTION_FIELD_LABELS, RESOLUTION_SECTION_LABELS } from './resolution-form-labels'
import { RESOLUTION_FIELD_NAME } from './resolution-form-values'

function findApplicationsArray(
  fields: ReturnType<typeof outcomeApplicationsArrayFields>,
): ArrayConfig {
  const arrayField = fields.find((field) => 'kind' in field && field.kind === 'array')
  if (!arrayField || arrayField.kind !== 'array') {
    throw new Error('Expected applications array field')
  }
  return arrayField
}

function findGroup(fields: FormItem[]): GroupConfig {
  const groupField = fields.find((field) => 'kind' in field && field.kind === 'group')
  if (!groupField || groupField.kind !== 'group') {
    throw new Error('Expected group field')
  }
  return groupField
}

describe('outcomeNoteFields', () => {
  it('exposes the additional behavior textarea', () => {
    expect(outcomeNoteFields()).toEqual([
      {
        type: 'textarea',
        name: 'note',
        label: RESOLUTION_FIELD_LABELS.hitNote,
        rows: 3,
        width: 'full',
        size: 'sm',
      },
    ])
  })
})

describe('outcomeBranchBodyFields', () => {
  it('wraps applications, add slot, and note in a rhythm group', () => {
    const group = findGroup(outcomeBranchBodyFields(1, true))

    expect(group.legend).toBe('')
    expect(group.fields).toHaveLength(3)
    expect(group.fields[0]).toMatchObject({ kind: 'array', name: 'applications' })
    expect(group.fields[1]).toMatchObject({
      kind: 'slot',
      name: '_outcomeApplicationAdd',
    })
    expect(group.fields[2]).toEqual(outcomeNoteFields()[0])
  })

  it('omits the applications array when none are configured', () => {
    const group = findGroup(outcomeBranchBodyFields(0, false))

    expect(group.fields).toEqual([
      expect.objectContaining({
        kind: 'slot',
        name: '_outcomeApplicationAdd',
      }),
      ...outcomeNoteFields(),
    ])
  })
})

describe('outcomeApplicationsArrayFields', () => {
  it('hides the generic add control for an external outcome add slot', () => {
    const arrayField = findApplicationsArray(outcomeApplicationsArrayFields())

    expect(arrayField.hideAddAction).toBe(true)
    expect(arrayField.reorder).toBe(false)
    expect(arrayField.itemHeader?.summaryDependsOn).toContain(`${RESOLUTION_FIELD_NAME}.effects`)
    expect(arrayField.filterSelectDependsOn).toContain(`${RESOLUTION_FIELD_NAME}.effects`)
  })

  it('filters amount options to full-only for non-partial effect kinds', () => {
    const arrayField = findApplicationsArray(outcomeApplicationsArrayFields())

    expect(
      arrayField.filterSelectOptions?.({
        arrayItems: [{ effectId: 'healing', amount: 'full' }],
        rowIndex: 0,
        fieldName: 'amount',
        options: [
          { value: 'full', label: 'Full' },
          { value: 'half', label: 'Half' },
        ],
        watchedValues: {
          [`${RESOLUTION_FIELD_NAME}.effects`]: [
            {
              id: 'healing',
              kind: 'healing',
              roll: { dice: { count: 2, faces: 8 } },
            },
          ],
        },
      }),
    ).toEqual([{ value: 'full', label: 'Full' }])
  })

  it('exposes amount field labels for resolver registration', () => {
    const arrayField = findApplicationsArray(outcomeApplicationsArrayFields())

    expect(arrayField.fields).toEqual([
      expect.objectContaining({
        kind: 'slot',
        name: 'effectId',
      }),
      expect.objectContaining({
        type: 'select',
        name: 'amount',
        label: RESOLUTION_FIELD_LABELS.outcomeApplicationAmount,
      }),
    ])
  })
})

describe('amountOptionsForEffect', () => {
  it('allows half for damage effects', () => {
    expect(
      amountOptionsForEffect({
        id: 'damage',
        kind: 'damage',
        roll: { dice: { count: 1, faces: 10 } },
        damageType: 'force',
      }).map((option) => option.value),
    ).toEqual(['full', 'half'])
  })
})

function resolverArrayName(field: FormItem): string {
  return 'kind' in field && field.kind === 'array' ? field.name : ''
}

describe('resolutionOutcomeApplicationsResolverFields', () => {
  it('registers resolver paths for each outcome branch slot', () => {
    const resolverFields = resolutionOutcomeApplicationsResolverFields()

    expect(resolverFields).toHaveLength(3)
    expect(resolverFields.map(resolverArrayName)).toEqual([
      `${RESOLUTION_FIELD_NAME}.outcomes.0.applications`,
      `${RESOLUTION_FIELD_NAME}.outcomes.1.applications`,
      `${RESOLUTION_FIELD_NAME}.outcomes.2.applications`,
    ])
    expect(resolverFields[0]).toMatchObject({
      legend: RESOLUTION_SECTION_LABELS.appliedEffects,
    })
  })
})
