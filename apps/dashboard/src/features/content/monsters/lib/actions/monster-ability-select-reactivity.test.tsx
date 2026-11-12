import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { beforeAll, describe, expect, it } from 'vitest'

import type { MonsterFormValues } from '../monster-form-values'
import { resolveMonsterCreateDefaultValues } from '../monster-form-values'
import { MonsterActionAttackAbilityField } from './monster-attack-ability-field'
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

describe('monster ability select reactivity', () => {
  it('updates an attack bonus in a reaction from root scores and proficiency', async () => {
    const user = userEvent.setup()
    const defaults = resolveMonsterCreateDefaultValues()
    defaults.challengeRating = '5'
    defaults.abilityScores.str = 20
    defaults.reactions = [
      {
        id: 'slash',
        kind: 'attack',
        name: 'Slash',
        bonusSource: { kind: 'ability', ability: 'str', proficient: true },
      },
    ]

    function Host() {
      const form = useForm<MonsterFormValues>({ defaultValues: defaults })
      return (
        <FormProvider {...form}>
          <button type="button" onClick={() => form.setValue('abilityScores.str', 10)}>
            Lower strength
          </button>
          <MonsterActionAttackAbilityField
            name="reactions.0.bonusSource.ability"
            proficientName="reactions.0.bonusSource.proficient"
          />
        </FormProvider>
      )
    }

    render(<Host />)
    await user.click(screen.getByRole('combobox', { name: 'Ability' }))
    expect(await screen.findByRole('option', { name: 'Strength +8 to hit' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Constitution/ })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: 'Lower strength' }))
    await user.click(screen.getByRole('combobox', { name: 'Ability' }))
    expect(await screen.findByRole('option', { name: 'Strength +3 to hit' })).toBeInTheDocument()
  })

  it('updates a trait save dc when the referenced spellcasting ability changes', async () => {
    const user = userEvent.setup()
    const defaults = resolveMonsterCreateDefaultValues()
    defaults.challengeRating = '5'
    defaults.abilityScores.int = 16
    defaults.abilityScores.wis = 12
    defaults.actions = [
      {
        id: 'spellcasting',
        kind: 'spell',
        name: 'Spellcasting',
        castingAbility: { kind: 'ability', ability: 'int' },
        spells: [],
      },
    ]

    function Host() {
      const form = useForm<MonsterFormValues>({ defaultValues: defaults })
      return (
        <FormProvider {...form}>
          <button
            type="button"
            onClick={() =>
              form.setValue('actions.0.castingAbility', { kind: 'ability', ability: 'wis' })
            }
          >
            Switch source
          </button>
          <MonsterActionCastingAbilityField
            name="traits.0.savingThrow.dcSource.castingAbility"
            currentActionId="trait"
            preview="save-dc"
            required={false}
          />
        </FormProvider>
      )
    }

    render(<Host />)
    await user.click(screen.getByRole('combobox', { name: 'Spellcasting ability' }))
    expect(await screen.findByRole('option', { name: /Spellcasting.*DC 14/ })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: 'Switch source' }))
    await user.click(screen.getByRole('combobox', { name: 'Spellcasting ability' }))
    expect(await screen.findByRole('option', { name: /Spellcasting.*DC 12/ })).toBeInTheDocument()
  })
})
