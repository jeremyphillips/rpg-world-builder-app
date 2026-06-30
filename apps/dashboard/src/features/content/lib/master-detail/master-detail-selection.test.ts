import type { FieldErrors } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import {
  autoSelectFirstInvalid,
  findFirstInvalidRowIndex,
  resolveSelectedIndex,
  rowHasError,
} from './master-detail-selection'

describe('resolveSelectedIndex', () => {
  it('returns null for an empty array', () => {
    expect(resolveSelectedIndex(0, 0)).toBeNull()
  })

  it('clamps out-of-range and negative selections', () => {
    expect(resolveSelectedIndex(null, 3)).toBe(0)
    expect(resolveSelectedIndex(-1, 3)).toBe(0)
    expect(resolveSelectedIndex(5, 3)).toBe(2)
  })
})

describe('findFirstInvalidRowIndex', () => {
  it('returns the first index with row errors in an array', () => {
    const errors = {
      features: [{ name: { message: 'Required', type: 'required' } }, undefined],
    } as unknown as FieldErrors

    expect(findFirstInvalidRowIndex(errors, 'features')).toBe(0)
  })

  it('returns null when there are no row errors', () => {
    expect(findFirstInvalidRowIndex({}, 'features')).toBeNull()
  })

  it('returns the first invalid index for nested dot paths', () => {
    const errors = {
      heritage: {
        options: [undefined, { name: { message: 'Required', type: 'required' } }],
      },
    } as unknown as FieldErrors

    expect(findFirstInvalidRowIndex(errors, 'heritage.options')).toBe(1)
  })

  it('returns the first invalid package index for class starting equipment options', () => {
    const errors = {
      characterCreation: {
        startingEquipment: {
          options: [undefined, { label: { message: 'Required', type: 'required' } }],
        },
      },
    } as unknown as FieldErrors

    expect(findFirstInvalidRowIndex(errors, 'characterCreation.startingEquipment.options')).toBe(1)
  })
})

describe('autoSelectFirstInvalid', () => {
  it('selects the first invalid row index', () => {
    const errors = {
      features: [undefined, { name: { message: 'Required', type: 'required' } }],
    } as unknown as FieldErrors
    const select = vi.fn()

    autoSelectFirstInvalid(errors, 'features', select)

    expect(select).toHaveBeenCalledWith(1)
  })
})

describe('rowHasError', () => {
  it('detects row errors for nested dot paths', () => {
    const errors = {
      heritage: {
        options: [undefined, { name: { message: 'Required', type: 'required' } }],
      },
    } as unknown as FieldErrors

    expect(rowHasError(errors, 'heritage.options', 0)).toBe(false)
    expect(rowHasError(errors, 'heritage.options', 1)).toBe(true)
  })
})
