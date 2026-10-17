import { act, renderHook } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { resolveMonsterCreateDefaultValues, type MonsterFormValues } from '../monster-form-values'
import { commitEquipmentEntryRemoval } from './commit-equipment-entry-removal.lib'

describe('commitEquipmentEntryRemoval', () => {
  it('removes equipment and linked actions without resetting unrelated dirty fields', () => {
    const defaultValues = resolveMonsterCreateDefaultValues()
    defaultValues.name = 'Original'
    defaultValues.equipment = [{ entryId: 'd1', equipmentId: 'dagger', quantity: 1 }]
    defaultValues.actions = [{ id: 'stab', kind: 'weapon', equipmentEntryId: 'd1' }]

    const { result } = renderHook(() => useForm<MonsterFormValues>({ defaultValues }))
    const form = result.current

    act(() => {
      form.setValue('name', 'Edited', { shouldDirty: true })
      commitEquipmentEntryRemoval(form, 'd1')
    })

    expect(form.getValues('equipment')).toEqual([])
    expect(form.getValues('actions')).toEqual([])
    expect(form.getValues('name')).toBe('Edited')
    expect(form.getFieldState('name').isDirty).toBe(true)
  })
})
