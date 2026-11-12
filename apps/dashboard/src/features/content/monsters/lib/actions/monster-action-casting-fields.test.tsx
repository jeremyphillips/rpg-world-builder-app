import { render, screen, within } from '@testing-library/react'
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

function Host({ name, currentActionId }: { name: string; currentActionId?: string }) {
  const form = useForm<MonsterFormValues>({ defaultValues: resolveMonsterCreateDefaultValues() })
  return (
    <FormProvider {...form}>
      <MonsterActionCastingAbilityField name={name} currentActionId={currentActionId} />
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
            currentActionId="actions-0"
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
    defaults.challengeRating = '5'
    defaults.actions = [
      {
        id: 'spellcasting',
        kind: 'spell',
        name: 'Spellcasting',
        castingAbility: { kind: 'ability', ability: 'int' },
        spells: [],
      },
      {
        id: 'hellfire',
        kind: 'spell',
        name: 'Hellfire Spellcasting',
        castingAbility: { kind: 'ability', ability: 'cha' },
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
            currentActionId="spellcasting"
            sourceActionId="spellcasting"
            onBlocked={onBlocked}
          />
        </FormProvider>
      )
    }
    render(<Guarded />)
    await user.click(screen.getByRole('combobox', { name: SPELLCASTING_ABILITY_LABEL }))
    const listbox = screen.getByRole('listbox')
    const groupLabels = within(listbox).getAllByText(
      /^Choose an ability$|^Use another action's ability$/,
    )
    expect(groupLabels[0]).toHaveTextContent("Use another action's ability")
    expect(groupLabels[1]).toHaveTextContent('Choose an ability')
    await user.click(await screen.findByRole('option', { name: 'Wisdom DC 11' }))
    expect(screen.getByRole('combobox', { name: SPELLCASTING_ABILITY_LABEL })).toHaveTextContent(
      'Wisdom',
    )
    expect(screen.getByRole('combobox', { name: SPELLCASTING_ABILITY_LABEL })).toHaveTextContent(
      'DC 11',
    )
    await user.click(screen.getByRole('combobox', { name: SPELLCASTING_ABILITY_LABEL }))
    await user.click(
      await screen.findByRole('option', {
        name: 'Hellfire Spellcasting (Charisma) DC 11',
      }),
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
