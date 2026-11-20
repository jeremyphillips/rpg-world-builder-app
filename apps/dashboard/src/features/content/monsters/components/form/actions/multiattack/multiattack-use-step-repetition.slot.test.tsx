import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { MONSTER_MULTIATTACK_ADD_REPETITION_LABEL } from '../../../../lib/monster-form-labels'
import type { MonsterActionDraftRow } from '../../../../lib/actions/monster-action-presets'
import { MonsterMultiattackUseStepRepetitionSlot } from './multiattack-use-step-repetition.slot'

const fireBreath = {
  id: 'fire-breath',
  kind: 'save',
  name: 'Fire Breath',
} as MonsterActionDraftRow

const spellcasting = {
  id: 'spellcasting',
  kind: 'spell',
  name: 'Spellcasting',
  spells: [{ spellId: 'srd:counterspell' }],
} as MonsterActionDraftRow

function Harness({
  step,
  fallbackActionRows,
}: {
  step: Record<string, unknown>
  fallbackActionRows: MonsterActionDraftRow[]
}) {
  const form = useForm({ defaultValues: { step } })
  return (
    <FormProvider {...form}>
      <MonsterMultiattackUseStepRepetitionSlot
        namePrefix="step"
        fallbackActionRows={fallbackActionRows}
      />
    </FormProvider>
  )
}

describe('MonsterMultiattackUseStepRepetitionSlot', () => {
  it('hides Add repetition for spellcasting', () => {
    render(
      <Harness
        step={{ kind: 'use', mode: 'single', actionId: 'spellcasting' }}
        fallbackActionRows={[spellcasting, fireBreath]}
      />,
    )
    expect(
      screen.queryByRole('button', { name: MONSTER_MULTIATTACK_ADD_REPETITION_LABEL }),
    ).not.toBeInTheDocument()
  })

  it('keeps Add repetition for non-spell actions', () => {
    render(
      <Harness
        step={{ kind: 'use', mode: 'single', actionId: 'fire-breath' }}
        fallbackActionRows={[spellcasting, fireBreath]}
      />,
    )
    expect(
      screen.getByRole('button', { name: MONSTER_MULTIATTACK_ADD_REPETITION_LABEL }),
    ).toBeInTheDocument()
  })

  it('shows Times for invalid stored spell repetition', () => {
    render(
      <Harness
        step={{ kind: 'use', mode: 'single', actionId: 'spellcasting', count: 2 }}
        fallbackActionRows={[spellcasting, fireBreath]}
      />,
    )
    expect(
      screen.queryByRole('button', { name: MONSTER_MULTIATTACK_ADD_REPETITION_LABEL }),
    ).not.toBeInTheDocument()
    expect(screen.getByDisplayValue('2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove repetition' })).toBeInTheDocument()
  })
})
