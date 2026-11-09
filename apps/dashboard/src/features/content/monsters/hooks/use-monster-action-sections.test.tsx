import { renderHook, act } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { formatCastingSourceDeleteNotice } from '../lib/monster-form-labels'
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

  it('names a first Actions spell and leaves a first bonus spell unnamed', () => {
    const { result } = renderHook(() => useMonsterActionSections(), { wrapper: wrapper() })
    act(() => {
      result.current.addAcquisition('actions', { type: 'create', kind: 'spell' })
    })
    expect(result.current.locate(result.current.selectedActionId)?.action.name).toBe('Spellcasting')

    const bonus = renderHook(() => useMonsterActionSections(), { wrapper: wrapper() })
    act(() => {
      bonus.result.current.addAcquisition('bonusActions', { type: 'create', kind: 'spell' })
    })
    expect(bonus.result.current.locate(bonus.result.current.selectedActionId)?.action.name).toBe(
      undefined,
    )
  })

  it('refuses to delete a casting source that a reaction still shares', () => {
    const { result } = renderHook(() => useMonsterActionSections(), {
      wrapper: wrapper({
        actions: [
          {
            id: 'spellcasting',
            kind: 'spell',
            name: 'Spellcasting',
            castingAbility: { kind: 'ability', ability: 'int' },
            spells: [],
          },
        ],
        bonusActions: [
          {
            id: 'burst',
            kind: 'attack',
            name: 'Arcane Burst',
            bonusSource: {
              kind: 'spell',
              castingAbility: { kind: 'shared', entryId: 'spellcasting' },
            },
          },
        ],
        reactions: [
          {
            id: 'shield',
            kind: 'spell',
            name: 'Protective Magic',
            castingAbility: { kind: 'shared', entryId: 'spellcasting' },
            spells: [],
          },
        ],
      }),
    })
    act(() => {
      result.current.setSelectedActionId('spellcasting')
      result.current.removeAction('spellcasting')
    })
    expect(result.current.notice).toBe(
      formatCastingSourceDeleteNotice(['Arcane Burst', 'Protective Magic']),
    )
    expect(result.current.locate('spellcasting')?.section).toBe('actions')
  })
})
