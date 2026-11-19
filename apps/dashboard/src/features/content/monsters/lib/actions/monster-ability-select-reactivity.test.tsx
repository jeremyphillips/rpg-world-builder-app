import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { beforeAll, describe, expect, it } from 'vitest'

import { monsterFormTestValues } from '../monster-form-test-values'
import type { MonsterFormValues } from '../monster-form-values'
import { MonsterActionAttackAbilityField } from '../../components/form/actions/shared/bonus-source-ability.slot'
import { MonsterActionCastingAbilityField } from '../../components/form/actions/shared/casting-ability.slot'

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
    const defaultValues = monsterFormTestValues({
      name: 'Reaction ability test',
      challengeRating: '5',
      abilityScores: { str: 20, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      reactions: [
        {
          id: 'slash',
          kind: 'attack',
          name: 'Slash',
          bonusSource: { kind: 'ability', ability: 'str', proficient: true },
        },
      ] as unknown as MonsterFormValues['reactions'],
    })

    function Host() {
      const form = useForm<MonsterFormValues>({ defaultValues })
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

  it('previews the default proficiency bonus before the switch is toggled', async () => {
    const user = userEvent.setup()
    const defaultValues = monsterFormTestValues({
      name: 'Reaction proficiency preview',
      challengeRating: '5',
      abilityScores: { str: 20, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      reactions: [
        {
          id: 'slash',
          kind: 'attack',
          name: 'Slash',
          bonusSource: { kind: 'ability', ability: 'str' },
        },
      ] as unknown as MonsterFormValues['reactions'],
    })

    function Host() {
      const form = useForm<MonsterFormValues>({ defaultValues })
      return (
        <FormProvider {...form}>
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
  })

  it('updates a trait save dc when the referenced spellcasting ability changes', async () => {
    const user = userEvent.setup()
    const defaultValues = monsterFormTestValues({
      name: 'Trait save dc source',
      challengeRating: '5',
      abilityScores: { str: 10, dex: 10, con: 10, int: 16, wis: 12, cha: 10 },
      actions: [
        {
          id: 'spellcasting',
          kind: 'spell',
          name: 'Spellcasting',
          castingAbility: { kind: 'ability', ability: 'int' },
          spells: [],
        },
      ] as MonsterFormValues['actions'],
    })

    function Host() {
      const form = useForm<MonsterFormValues>({ defaultValues })
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
