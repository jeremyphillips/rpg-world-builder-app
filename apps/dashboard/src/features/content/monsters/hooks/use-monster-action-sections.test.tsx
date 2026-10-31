import { renderHook, act } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../lib/monster-form-values'
import { useMonsterActionSections } from './use-monster-action-sections'

function wrapper(initial?: Partial<MonsterFormValues>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    const form = useForm<MonsterFormValues>({
      defaultValues: { ...resolveMonsterCreateDefaultValues(), ...initial },
    })
    return <FormProvider {...form}>{children}</FormProvider>
  }
}

describe('useMonsterActionSections', () => {
  it('requires confirmation before moving a reaction that drops its trigger', () => {
    const { result } = renderHook(() => useMonsterActionSections(), {
      wrapper: wrapper({
        reactions: [
          {
            id: 'parry',
            kind: 'special',
            name: 'Parry',
            trigger: { text: 'When hit' },
          },
        ],
      }),
    })

    act(() => {
      result.current.setSelectedActionId('parry')
    })

    act(() => {
      result.current.requestMove('actions')
    })

    expect(result.current.pending).toEqual({
      type: 'trigger',
      from: 'reactions',
      to: 'actions',
      index: 0,
    })

    act(() => {
      result.current.confirmPending()
    })

    expect(result.current.pending).toBeNull()
    expect(result.current.locate('parry')?.section).toBe('actions')
  })
})
