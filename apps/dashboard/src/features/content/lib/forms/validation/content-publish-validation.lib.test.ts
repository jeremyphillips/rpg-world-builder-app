/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { useForm } from 'react-hook-form'
import { renderHook, act } from '@testing-library/react'
import { z } from 'zod'
import { formatFieldMessage } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import {
  applyValidationIssuesToForm,
  validateContentPublishValues,
  zodIssuesToValidationIssues,
} from './content-publish-validation.lib'

describe('zodIssuesToValidationIssues', () => {
  it('joins issue paths with dots', () => {
    const schema = z.object({ level: z.number().min(1) })
    const result = schema.safeParse({ level: 0 })
    if (result.success) throw new Error('expected failure')

    expect(zodIssuesToValidationIssues(result.error.issues)).toEqual([
      expect.objectContaining({ path: 'level' }),
    ])
  })
})

describe('applyValidationIssuesToForm', () => {
  it('sets field errors for dotted paths', () => {
    const { result } = renderHook(() =>
      useForm<{ name: string; level: number }>({ defaultValues: { name: '', level: 0 } }),
    )

    act(() => {
      applyValidationIssuesToForm(result.current, [
        { path: 'name', message: 'Name is required.' },
        { path: 'level', message: 'Level is required.' },
      ])
    })

    expect(result.current.getFieldState('name').error?.message).toBe('Name is required.')
    expect(result.current.getFieldState('level').error?.message).toBe('Level is required.')
  })
})

describe('validateContentPublishValues', () => {
  it('returns true when publish schema passes', () => {
    const schema = z.object({ name: z.string().min(1) })
    const { result } = renderHook(() => useForm<{ name: string }>({ defaultValues: { name: 'A' } }))

    let valid = false
    act(() => {
      valid = validateContentPublishValues(result.current, schema, { name: 'A' })
    })

    expect(valid).toBe(true)
    expect(result.current.formState.errors).toEqual({})
  })

  it('returns false and sets field errors when publish schema fails', () => {
    const schema = z.object({ name: z.string().min(1) })
    const { result } = renderHook(() => useForm<{ name: string }>({ defaultValues: { name: '' } }))

    let valid = true
    act(() => {
      valid = validateContentPublishValues(result.current, schema, { name: '' })
    })

    expect(valid).toBe(false)
    expect(result.current.getFieldState('name').error?.message).toBeTruthy()
  })

  it('maps empty name, empty chips, and invalid coerce numbers to catalog copy', () => {
    const schema = z.object({
      name: z.string().min(1),
      primaryAbilities: z.array(z.string()).min(1),
      quantity: z.coerce.number(),
    })
    const fields: FormItem[] = [
      { type: 'text', name: 'name', label: 'Name', required: true },
      { type: 'chips', name: 'primaryAbilities', label: 'Primary abilities', options: [] },
      { type: 'number', name: 'quantity', label: 'Quantity' },
    ]
    const { result } = renderHook(() =>
      useForm<{ name: string; primaryAbilities: string[]; quantity: number }>({
        defaultValues: { name: '', primaryAbilities: [], quantity: Number.NaN },
      }),
    )

    let valid = true
    act(() => {
      valid = validateContentPublishValues(
        result.current,
        schema,
        { name: '', primaryAbilities: [], quantity: Number.NaN },
        fields,
      )
    })

    expect(valid).toBe(false)
    expect(formatFieldMessage(result.current.getFieldState('name').error?.message ?? '')).toBe(
      'Name is required.',
    )
    expect(
      formatFieldMessage(result.current.getFieldState('primaryAbilities').error?.message ?? ''),
    ).toBe('Add at least one primary ability.')
    expect(formatFieldMessage(result.current.getFieldState('quantity').error?.message ?? '')).toBe(
      'Enter a valid number.',
    )
    expect(result.current.getFieldState('name').error?.message).not.toMatch(/Too small|NaN/i)
  })
})
