import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { MOVEMENT_MODES } from '@rpg/contracts'
import { isContainer, type ArrayConfig, type ChipsFieldConfig } from '@rpg/ui/form'

import {
  movementAlternativeChipOptions,
  movementAlternativeFormToSchema,
  movementAlternativeGroupField,
  movementAlternativeRecordToForm,
  movementArrayField,
  movementRowDraftFormSchema,
  movementRowFormSchema,
  movementRowsIncludeFly,
  movementRowsToRecord,
  movementRowsToRecordForPreview,
  movementWithHoverGroup,
  orderMovementAlternativeModes,
  refineMovementAlternativeForm,
  refineMovementRows,
} from './content-movement-form-fields'

function alternativeGroupFromFactory() {
  const monsterGroup = movementWithHoverGroup({ includeMovementAlternative: true })
  expect(isContainer(monsterGroup) && monsterGroup.kind === 'group').toBe(true)
  if (!isContainer(monsterGroup) || monsterGroup.kind !== 'group') {
    throw new Error('expected movementWithHoverGroup root group')
  }
  const alternativeGroup = monsterGroup.fields.find(
    (field) => isContainer(field) && field.kind === 'group' && field.name === 'movementAlternative',
  )
  if (!isContainer(alternativeGroup) || alternativeGroup.kind !== 'group') {
    throw new Error('expected movementAlternative group')
  }
  return alternativeGroup
}

describe('content movement form fields', () => {
  it('omits alternative movement on species and the default hover group', () => {
    const group = movementWithHoverGroup()
    expect(isContainer(group) && group.kind === 'group').toBe(true)
    if (!isContainer(group) || group.kind !== 'group') return
    const hasAlternative = group.fields.some(
      (field) =>
        isContainer(field) && field.kind === 'group' && field.name === 'movementAlternative',
    )
    expect(hasAlternative).toBe(false)
  })

  it('includes alternative movement only when the factory option is on', () => {
    const alternativeGroup = alternativeGroupFromFactory()
    expect(alternativeGroup.name).toBe('movementAlternative')
  })

  it('configures alternative modes as multi-select chips with min two selections', () => {
    const alternativeGroup = alternativeGroupFromFactory()
    const chips = alternativeGroup.fields.find(
      (field): field is ChipsFieldConfig => 'type' in field && field.type === 'chips',
    )
    expect(chips).toMatchObject({
      name: 'modes',
      min: 2,
      required: true,
      optionsResolve: { dependsOn: ['movement', 'movementAlternative'] },
    })
    expect(chips?.optionsResolve?.optionsWhen).toBe(movementAlternativeChipOptions)
  })

  it('excludes fixed movement from chip options but keeps conflicting selections visible', () => {
    const watched = {
      movement: [{ mode: 'walk', feet: 20 }],
      movementAlternative: { modes: [], feet: undefined },
    }
    const baseline = movementAlternativeChipOptions(watched).map((option) => option.value)
    expect(baseline).not.toContain('walk')

    const conflicting = {
      movement: [
        { mode: 'walk', feet: 20 },
        { mode: 'climb', feet: 10 },
      ],
      movementAlternative: { modes: ['climb', 'fly'], feet: 20 },
    }
    const options = movementAlternativeChipOptions(conflicting)
    expect(options.map((option) => option.value)).toContain('climb')
    expect(options.map((option) => option.value)).not.toContain('walk')
  })

  it('orders alternative modes in movement vocabulary order', () => {
    expect(orderMovementAlternativeModes(['fly', 'climb', 'burrow'])).toEqual([
      'fly',
      'climb',
      'burrow',
    ])
  })

  it('round-trips published alternatives through form values', () => {
    const published = { modes: ['fly', 'climb'] as const, feet: 20 as const }
    const form = movementAlternativeRecordToForm(published)
    expect(form).toEqual({ modes: ['fly', 'climb'], feet: 20 })
    expect(movementAlternativeFormToSchema(form)).toEqual(published)
  })

  it('rejects fewer than two modes on form refine', () => {
    const schema = z
      .object({ movementAlternative: z.object({ modes: z.array(z.string()), feet: z.number() }) })
      .superRefine((values, ctx) => {
        refineMovementAlternativeForm(values.movementAlternative, [{ mode: 'walk', feet: 20 }], ctx)
      })

    const result = schema.safeParse({ movementAlternative: { modes: ['fly'], feet: 20 } })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(
      result.error.issues.some((issue) => issue.path.join('.') === 'movementAlternative.modes'),
    ).toBe(true)
  })

  it('flags overlap on movementAlternative.modes regardless of edit direction', () => {
    const schema = z
      .object({ movement: z.array(movementRowDraftFormSchema), movementAlternative: z.any() })
      .superRefine((values, ctx) => {
        refineMovementAlternativeForm(values.movementAlternative, values.movement, ctx)
      })

    const result = schema.safeParse({
      movement: [
        { mode: 'walk', feet: 20 },
        { mode: 'climb', feet: 10 },
      ],
      movementAlternative: { modes: ['climb', 'fly'], feet: 20 },
    })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(
      result.error.issues.some((issue) => issue.path.join('.') === 'movementAlternative.modes'),
    ).toBe(true)
  })

  it('movementWithHoverGroup stacks movement array and hover without a section heading', () => {
    const group = movementWithHoverGroup()
    expect(isContainer(group) && group.kind === 'group').toBe(true)
    if (!isContainer(group) || group.kind !== 'group') return
    expect(group.heading).toBeUndefined()
    const hasHoverSwitch = group.fields.some(
      (field) =>
        ('type' in field && field.type === 'switch' && field.name === 'hover') ||
        (isContainer(field) &&
          field.kind === 'group' &&
          field.fields.some(
            (nested) => 'type' in nested && nested.type === 'switch' && nested.name === 'hover',
          )),
    )
    expect(hasHoverSwitch).toBe(true)
  })

  it('detects fly rows for hover visibility', () => {
    expect(movementRowsIncludeFly([{ mode: 'walk', feet: 30 }])).toBe(false)
    expect(
      movementRowsIncludeFly([
        { mode: 'walk', feet: 30 },
        { mode: 'fly', feet: 60 },
      ]),
    ).toBe(true)
  })

  it('appends empty mode and speed rows', () => {
    const field = movementArrayField() as ArrayConfig
    expect(field.appendDefaults?.([{ mode: 'walk', feet: 30 }])).toEqual({
      mode: '',
      feet: undefined,
    })
  })

  it('configures unique mode filtering and append defaults', () => {
    const field = movementArrayField() as ArrayConfig

    expect(field.headingScale).toBe('field')
    expect(field.emptyStatePrimary).toBe('No modes added.')
    expect(field.max).toBe(MOVEMENT_MODES.length)
    expect(field.appendDefaults?.([])).toEqual({ mode: '', feet: undefined })
    expect(field.filterSelect?.filter).toBeTypeOf('function')
    expect(field.resolveCanAppend?.([])).toEqual({ enabled: true })
    expect(field.resolveCanAppend?.(MOVEMENT_MODES.map((mode) => ({ mode, feet: 30 })))).toEqual({
      enabled: false,
      reason: 'All movement modes have been added.',
    })
  })

  it('accepts in-progress draft rows', () => {
    expect(movementRowDraftFormSchema.parse({ mode: '', feet: undefined })).toEqual({
      mode: '',
      feet: undefined,
    })
  })

  it('requires mode and speed on publish rows', () => {
    const result = movementRowFormSchema.safeParse({ mode: '', feet: undefined })
    expect(result.success).toBe(false)
  })

  it('preview conversion omits incomplete rows', () => {
    expect(
      movementRowsToRecordForPreview([
        { mode: 'walk', feet: 30 },
        { mode: '', feet: undefined },
      ]),
    ).toEqual({ walk: 30 })
    expect(movementRowsToRecordForPreview([{ mode: '', feet: undefined }])).toEqual({})
  })

  it('strict conversion throws on incomplete rows', () => {
    expect(() => movementRowsToRecord([{ mode: '', feet: undefined }])).toThrow(
      'movementRowsToRecord expects validated movement rows.',
    )
  })

  it('reports duplicate modes on publish', () => {
    const rows = [
      { mode: 'walk', feet: 30 },
      { mode: 'walk', feet: 40 },
    ] as const

    const schema = z.array(movementRowDraftFormSchema).superRefine((values, ctx) => {
      refineMovementRows(values, ctx, [])
    })

    const result = schema.safeParse([...rows])
    expect(result.success).toBe(false)
    if (result.success) return

    expect(result.error.issues.some((issue) => issue.path.join('.') === '1.mode')).toBe(true)
  })

  it('optional disclosure seeds empty modes array', () => {
    const group = movementAlternativeGroupField()
    if (!isContainer(group) || group.kind !== 'group') {
      throw new Error('expected movementAlternative group field')
    }
    expect(group.optionalDisclosure?.seedWhen?.()).toEqual({ modes: [], feet: undefined })
  })
})
