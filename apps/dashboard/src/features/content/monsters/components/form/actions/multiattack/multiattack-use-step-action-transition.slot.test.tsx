import { act, render, waitFor } from '@testing-library/react'
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { monsterFormTestValues } from '../../../../lib/monster-form-test-values'
import type { MonsterFormValues } from '../../../../lib/monster-form-values'
import { MONSTER_FORM_WRITE_OPTIONS } from '../../../../lib/monster-form-write-options'
import type { MonsterActionDraftRow } from '../../../../lib/actions/monster-action-presets'
import { MonsterMultiattackUseStepActionTransitionSlot } from './multiattack-use-step-action-transition.slot'

const fireBreath = { id: 'fire-breath', kind: 'save', name: 'Fire Breath' } as MonsterActionDraftRow
const spellcasting = {
  id: 'spellcasting',
  kind: 'spell',
  name: 'Spellcasting',
  spells: [{ spellId: 'srd:counterspell' }],
} as MonsterActionDraftRow

const multiattack = {
  id: 'multiattack',
  kind: 'multiattack' as const,
  name: 'Multiattack',
  steps: [
    { count: 1, actionIds: ['bite'] },
    { kind: 'use', mode: 'single', actionId: 'fire-breath', count: 2 },
  ],
}

const rows = [multiattack, fireBreath, spellcasting] as MonsterActionDraftRow[]

function Harness({ onReady }: { onReady: (form: UseFormReturn<MonsterFormValues>) => void }) {
  const form = useForm<MonsterFormValues>({
    defaultValues: monsterFormTestValues({ name: 'Transition slot', actions: rows }),
  })
  onReady(form)
  return (
    <FormProvider {...form}>
      <MonsterMultiattackUseStepActionTransitionSlot
        namePrefix="actions.0.steps.1"
        fallbackActionRows={rows}
      />
    </FormProvider>
  )
}

describe('MonsterMultiattackUseStepActionTransitionSlot', () => {
  it('clears incompatible repetition when actionId changes to Spellcasting', async () => {
    let form!: UseFormReturn<MonsterFormValues>
    render(
      <Harness
        onReady={(ready) => {
          form = ready
        }}
      />,
    )

    await act(async () => {
      form.setValue('actions.0.steps.1.actionId', 'spellcasting', MONSTER_FORM_WRITE_OPTIONS)
    })

    await waitFor(() => {
      const step = form.getValues('actions.0.steps.1') as Record<string, unknown>
      expect(step.actionId).toBe('spellcasting')
      expect(step).not.toHaveProperty('count')
    })
  })
})
