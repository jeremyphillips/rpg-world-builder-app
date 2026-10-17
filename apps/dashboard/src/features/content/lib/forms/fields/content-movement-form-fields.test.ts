import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { MOVEMENT_MODES } from '@rpg/contracts'
import { isContainer, type ArrayConfig } from '@rpg/ui/form'

import { speciesCreateDefaultValues } from '../../../species/lib/species-form-values'
import {
  movementArrayField,
  movementRowDraftFormSchema,
  movementRowFormSchema,
  movementRowsIncludeFly,
  movementRowsToRecord,
  movementRowsToRecordForPreview,
  movementWithHoverGroup,
  refineMovementRows,
} from './content-movement-form-fields'

describe('content movement form fields', () => {
  it('seeds create forms with Walk 30', () => {
    expect(speciesCreateDefaultValues.movement).toEqual([{ mode: 'walk', feet: 30 }])
  })

  it('movementWithHoverGroup includes fly hover switch', () => {
    const group = movementWithHoverGroup()
    expect(isContainer(group) && group.kind === 'group').toBe(true)
    if (!isContainer(group) || group.kind !== 'group') return
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
})
