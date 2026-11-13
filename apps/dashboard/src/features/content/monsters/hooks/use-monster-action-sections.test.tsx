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
      result.current.addAcquisition('actions', {
        type: 'create',
        kind: 'spell',
        spellAcquisition: 'primary',
      })
    })
    expect(result.current.locate(result.current.selectedActionId)?.action.name).toBe('Spellcasting')

    const bonus = renderHook(() => useMonsterActionSections(), { wrapper: wrapper() })
    act(() => {
      bonus.result.current.addAcquisition('bonusActions', {
        type: 'create',
        kind: 'spell',
        spellAcquisition: 'standalone',
      })
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
              kind: 'spellcasting',
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

  it('initializes legendary uses on the first row and clears them when the last row leaves', () => {
    const { result } = renderHook(() => useMonsterActionSections(), { wrapper: wrapper() })
    act(() => {
      result.current.addAcquisition('legendaryActions', { type: 'create', kind: 'special' })
    })
    expect(result.current.values?.legendaryActionUses).toBe(3)
    act(() => {
      result.current.addAcquisition('legendaryActions', { type: 'create', kind: 'special' })
    })
    expect(result.current.values?.legendaryActionUses).toBe(3)
    const ids = (result.current.values?.legendaryActions ?? []).flatMap((action) =>
      action && typeof action === 'object' && 'id' in action && typeof action.id === 'string'
        ? [action.id]
        : [],
    )
    act(() => {
      for (const id of ids) result.current.removeAction(id)
    })
    expect(result.current.values?.legendaryActions).toEqual([])
    expect(result.current.values?.legendaryActionUses).toBeUndefined()
    expect(result.current.values?.legendaryActionUsesInLair).toBeUndefined()
  })

  it('does not move a row into Legendary Actions', () => {
    const { result } = renderHook(() => useMonsterActionSections(), {
      wrapper: wrapper({
        actions: [{ id: 'bite', kind: 'special', name: 'Bite', description: '<p>Bites.</p>' }],
      }),
    })
    act(() => {
      result.current.setSelectedActionId('bite')
      result.current.requestMove('legendaryActions')
    })
    expect(result.current.pending).toBeNull()
    expect(result.current.locate('bite')?.section).toBe('actions')
  })

  it('lists a legendary reference when its Actions target is removed or moved', () => {
    const { result } = renderHook(() => useMonsterActionSections(), {
      wrapper: wrapper({
        actions: [{ id: 'bite', kind: 'special', name: 'Bite', description: '<p>Bites.</p>' }],
        legendaryActionUses: 3,
        legendaryActions: [
          { id: 'pounce', kind: 'action-reference', name: 'Pounce', actionIds: ['bite'] },
        ],
      }),
    })
    act(() => {
      result.current.removeAction('bite')
    })
    expect(result.current.pending).toMatchObject({
      type: 'multiattack-delete',
      names: ['Pounce'],
    })
    act(() => {
      result.current.confirmPending()
    })
    expect(result.current.values?.legendaryActions?.[0]).toMatchObject({ actionIds: [] })

    const move = renderHook(() => useMonsterActionSections(), {
      wrapper: wrapper({
        actions: [{ id: 'bite', kind: 'special', name: 'Bite', description: '<p>Bites.</p>' }],
        legendaryActionUses: 3,
        legendaryActions: [
          { id: 'pounce', kind: 'action-reference', name: 'Pounce', actionIds: ['bite'] },
        ],
      }),
    })
    act(() => {
      move.result.current.setSelectedActionId('bite')
      move.result.current.requestMove('bonusActions')
    })
    expect(move.result.current.pending).toMatchObject({
      type: 'multiattack-move',
      names: ['Pounce'],
      to: 'bonusActions',
    })
  })
})
