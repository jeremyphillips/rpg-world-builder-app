import { describe, expect, it } from 'vitest'
import { resolveArrayItemFieldOrder, type FormItem, type GroupConfig } from '@rpg/ui/form'

import {
  amountOptionsForEffect,
  outcomeApplicationsResolverItemFields,
  outcomeBranchBodyFields,
  outcomeNoteFields,
  resolutionOutcomeApplicationsResolverFields,
} from './resolution-outcome-form-fields'
import { RESOLUTION_FIELD_LABELS, RESOLUTION_SECTION_LABELS } from './resolution-form-labels'
import { RESOLUTION_FIELD_NAME } from './resolution-form-values'

function findGroup(fields: FormItem[]): GroupConfig {
  const groupField = fields.find((field) => 'kind' in field && field.kind === 'group')
  if (!groupField || groupField.kind !== 'group') {
    throw new Error('Expected group field')
  }
  return groupField
}

describe('outcomeNoteFields', () => {
  it('exposes the additional behavior textarea behind optional disclosure', () => {
    expect(outcomeNoteFields()).toEqual([
      {
        type: 'textarea',
        name: 'note',
        label: RESOLUTION_FIELD_LABELS.hitNote,
        placeholder: RESOLUTION_SECTION_LABELS.outcomeNotePlaceholder,
        rows: 3,
        width: 'full',
        size: 'sm',
        optionalDisclosure: {
          addLabel: RESOLUTION_SECTION_LABELS.addOutcomeNote,
          removeLabel: 'Remove',
          expandWhenPopulated: true,
        },
      },
    ])
  })
})

describe('outcomeBranchBodyFields', () => {
  it('wraps application section slot and note in a rhythm group', () => {
    const group = findGroup(outcomeBranchBodyFields(1, true))

    expect(group.legend).toBe('')
    expect(group.fields).toHaveLength(2)
    expect(group.fields[0]).toMatchObject({
      kind: 'slot',
      name: '_outcomeApplicationSection',
    })
    expect(group.fields[1]).toEqual(outcomeNoteFields()[0])
  })
})

describe('outcomeApplicationsResolverItemFields', () => {
  it('registers leaf field order for invalid-submit navigation', () => {
    expect(resolveArrayItemFieldOrder(outcomeApplicationsResolverItemFields())).toEqual([
      'effectId',
      'amount',
    ])
  })

  it('filters amount options to full-only for non-partial effect kinds', () => {
    expect(
      amountOptionsForEffect({
        id: 'healing',
        kind: 'healing',
        roll: { dice: { count: 2, faces: 8 } },
      }).map((option) => option.value),
    ).toEqual(['full'])
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
