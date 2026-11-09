import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type { MonsterFormValues } from '../monster-form-values'
import { resolveMonsterCreateDefaultValues } from '../monster-form-values'
import { MonsterActionCastingAbilityField } from './monster-action-casting-fields'

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => {}
    HTMLElement.prototype.releasePointerCapture = () => {}
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {}
  }
})

const SPELLCASTING_ABILITY_LABEL = 'Spellcasting ability'

function Host({ name }: { name: string }) {
  const form = useForm<MonsterFormValues>({ defaultValues: resolveMonsterCreateDefaultValues() })
  return (
    <FormProvider {...form}>
      <MonsterActionCastingAbilityField name={name} sharedOptions={[]} />
    </FormProvider>
  )
}

describe('MonsterActionCastingAbilityField', () => {
  it('renders a schema-styled select for spellcasting ability', () => {
    render(<Host name="actions.0.castingAbility" />)
    expect(screen.getByRole('combobox', { name: SPELLCASTING_ABILITY_LABEL })).toBeInTheDocument()
  })

  it('changes a direct ability and refuses a share while a dependent uses the source', async () => {
    const user = userEvent.setup()
    const onBlocked = vi.fn()
    const defaults = resolveMonsterCreateDefaultValues()
    defaults.actions = [
      {
        id: 'spellcasting',
        kind: 'spell',
        name: 'Spellcasting',
        castingAbility: { kind: 'ability', ability: 'int' },
        spells: [],
      },
    ]
    defaults.bonusActions = [
      {
        id: 'step',
        kind: 'spell',
        name: 'Misty Step',
        castingAbility: { kind: 'shared', entryId: 'spellcasting' },
        spells: [],
      },
    ]
    function Guarded() {
      const form = useForm<MonsterFormValues>({ defaultValues: defaults })
      return (
        <FormProvider {...form}>
          <MonsterActionCastingAbilityField
            name="actions.0.castingAbility"
            sharedOptions={[{ value: 'other', label: 'Hellfire Spellcasting (Charisma)' }]}
            sourceActionId="spellcasting"
            onBlocked={onBlocked}
          />
        </FormProvider>
      )
    }
    render(<Guarded />)
    await user.click(screen.getByRole('combobox', { name: SPELLCASTING_ABILITY_LABEL }))
    await user.click(await screen.findByRole('option', { name: 'Wisdom' }))
    expect(screen.getByRole('combobox', { name: SPELLCASTING_ABILITY_LABEL })).toHaveTextContent(
      'Wisdom',
    )
    await user.click(screen.getByRole('combobox', { name: SPELLCASTING_ABILITY_LABEL }))
    await user.click(
      await screen.findByRole('option', { name: 'Hellfire Spellcasting (Charisma)' }),
    )
    expect(onBlocked).toHaveBeenCalledOnce()
    expect(screen.getByRole('combobox', { name: SPELLCASTING_ABILITY_LABEL })).toHaveTextContent(
      'Wisdom',
    )
  })
})
