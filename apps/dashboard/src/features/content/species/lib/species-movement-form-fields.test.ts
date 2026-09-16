import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { MOVEMENT_MODES } from '@rpg/contracts'
import type { ArrayConfig } from '@rpg/ui/form'

import { speciesCreateDefaultValues } from './species-form-values'
import {
  movementArrayField,
  movementRowDraftFormSchema,
  movementRowFormSchema,
  refineSpeciesMovementRows,
} from './species-movement-form-fields'

describe('species movement form fields', () => {
  it('seeds create forms with Walk 30', () => {
    expect(speciesCreateDefaultValues.movement).toEqual([{ mode: 'walk', feet: 30 }])
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

  it('reports duplicate modes on publish', () => {
    const rows = [
      { mode: 'walk', feet: 30 },
      { mode: 'walk', feet: 40 },
    ] as const

    const schema = z.array(movementRowDraftFormSchema).superRefine((values, ctx) => {
      refineSpeciesMovementRows(values, ctx, [])
    })

    const result = schema.safeParse([...rows])
    expect(result.success).toBe(false)
    if (result.success) return

    expect(result.error.issues.some((issue) => issue.path.join('.') === '1.mode')).toBe(true)
  })
})
