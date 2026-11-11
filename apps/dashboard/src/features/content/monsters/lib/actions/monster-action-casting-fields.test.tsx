import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type { MonsterFormValues } from '../monster-form-values'
import { resolveMonsterCreateDefaultValues } from '../monster-form-values'
import {
  MonsterActionCastingAbilityField,
  MonsterLegendarySpellcastingActionField,
} from './monster-action-casting-fields'

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
    expect(
      screen.getByText('Choose an ability or reuse one from an existing action.'),
    ).toBeInTheDocument()
  })

  it('uses the primary hint on the Spellcasting action that defines the ability', () => {
    function Host() {
      const form = useForm<MonsterFormValues>({
        defaultValues: resolveMonsterCreateDefaultValues(),
      })
      return (
        <FormProvider {...form}>
          <MonsterActionCastingAbilityField
            name="actions.0.castingAbility"
            sharedOptions={[]}
            profile="primary"
          />
        </FormProvider>
      )
    }
    render(<Host />)
    expect(
      screen.getByText(
        'Choose the ability used to cast these spells. Other actions can reuse this ability.',
      ),
    ).toBeInTheDocument()
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
    expect(screen.getByText('Choose an ability')).toBeInTheDocument()
    expect(screen.getByText("Use another action's ability")).toBeInTheDocument()
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

  it('stores a shared action and shows its spell count and ability', async () => {
    const user = userEvent.setup()
    const defaults = resolveMonsterCreateDefaultValues()
    defaults.actions = [
      {
        id: 'spellcasting',
        kind: 'spell',
        name: 'Spellcasting',
        castingAbility: { kind: 'ability', ability: 'int' },
        spells: [{ spellId: 'srd:fireball' }, { spellId: 'srd:mage-hand' }],
      },
    ]
    defaults.legendaryActions = [
      {
        id: 'presence',
        kind: 'spell',
        spellInvocation: 'use-entry',
        spells: [{ spellId: undefined }],
      },
    ]
    function Selected() {
      const value = useWatch({ name: 'legendaryActions.0.castingAbility' })
      return <output data-testid="casting-ability">{JSON.stringify(value ?? null)}</output>
    }
    function Host() {
      const form = useForm<MonsterFormValues>({ defaultValues: defaults })
      return (
        <FormProvider {...form}>
          <Selected />
          <MonsterLegendarySpellcastingActionField name="legendaryActions.0.castingAbility" />
        </FormProvider>
      )
    }
    render(<Host />)
    await user.click(screen.getByRole('combobox', { name: 'Source action' }))
    await user.click(
      await screen.findByRole('option', { name: 'Spellcasting · 2 spells · Intelligence' }),
    )
    expect(screen.getByTestId('casting-ability')).toHaveTextContent(
      JSON.stringify({ kind: 'shared', entryId: 'spellcasting' }),
    )
    expect(screen.getByRole('combobox', { name: 'Source action' })).toHaveTextContent(
      'Spellcasting · 2 spells · Intelligence',
    )
  })
})
