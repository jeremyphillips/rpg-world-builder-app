import { useEffect } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormItems } from '@rpg/ui/form'
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form'
import { beforeAll, describe, expect, it } from 'vitest'

import { buildSeedDamageTypeVocabulary } from '@/features/vocabulary'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  MONSTER_ABILITY_SOURCE_KIND_ABILITY_LABEL,
  MONSTER_ABILITY_SOURCE_KIND_SPELL_LABEL,
  MONSTER_ATTACK_BONUS_SOURCE_ABILITY_HINT,
  MONSTER_ATTACK_BONUS_SOURCE_ABILITY_LABEL,
  MONSTER_ATTACK_BONUS_SOURCE_SPELL_HINT,
  MONSTER_ATTACK_BONUS_SOURCE_SPELL_LABEL,
  MONSTER_ATTACK_BONUS_INCLUDE_PROFICIENCY_LABEL,
  MONSTER_SAVE_DC_LABEL,
  MONSTER_SAVE_DC_PROFICIENCY_LABEL,
} from '../monster-form-labels'
import { resolveMonsterCreateDefaultValues, type MonsterFormValues } from '../monster-form-values'
import { monsterActionDetailFields } from './monster-action-detail-fields'
import type { MonsterActionDraftRow } from './monster-action-presets'
import { monsterSaveDcAbilityHintWhen } from './monster-action-save-field-hints'

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
const SHARED_CASTING_LABEL = 'Shared Fire Breath'
const CONSTITUTION_DC_HINT = monsterSaveDcAbilityHintWhen({ 'dcSource.ability': 'con' })

const ctx = {
  damageTypeVocabulary: buildSeedDamageTypeVocabulary(),
} as ContentFormCtx

const sharedCastingOptions = [{ value: 'breath', label: SHARED_CASTING_LABEL }]

function draftAction(action: {
  id: string
  kind: MonsterActionDraftRow['kind']
  name: string
  spells?: []
}): MonsterActionDraftRow {
  return action as unknown as MonsterActionDraftRow
}

function Host({
  action,
  formRef,
}: {
  action: MonsterActionDraftRow
  formRef: { current: UseFormReturn<MonsterFormValues> | null }
}) {
  const defaults = resolveMonsterCreateDefaultValues()
  defaults.actions = [action]
  const form = useForm<MonsterFormValues>({
    defaultValues: defaults,
    shouldUnregister: true,
  })
  useEffect(() => {
    formRef.current = form
  })
  return (
    <FormProvider {...form}>
      <FormItems
        items={monsterActionDetailFields({
          ctx,
          action,
          section: 'actions',
          namePrefix: 'actions.0',
          equipmentOptions: [],
          sharedCastingOptions,
        })}
        idPrefix="action"
        namePrefix="actions.0"
      />
    </FormProvider>
  )
}

async function choose(
  user: ReturnType<typeof userEvent.setup>,
  comboboxName: string,
  optionName: string,
) {
  await user.click(screen.getByRole('combobox', { name: comboboxName }))
  await user.click(await screen.findByRole('option', { name: optionName }))
}

describe('monster ability source fields', () => {
  it('switches an attack bonus between ability and spellcasting', async () => {
    const user = userEvent.setup()
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    render(
      <Host
        action={draftAction({ id: 'acid', kind: 'attack', name: 'Acid spit' })}
        formRef={formRef}
      />,
    )

    expect(
      screen.queryByRole('switch', { name: MONSTER_ATTACK_BONUS_INCLUDE_PROFICIENCY_LABEL }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('combobox', { name: SPELLCASTING_ABILITY_LABEL }),
    ).not.toBeInTheDocument()

    await choose(user, 'Attack bonus', MONSTER_ATTACK_BONUS_SOURCE_ABILITY_LABEL)
    expect(screen.getByText(MONSTER_ATTACK_BONUS_SOURCE_ABILITY_HINT)).toBeInTheDocument()
    expect(
      screen.getByRole('switch', { name: MONSTER_ATTACK_BONUS_INCLUDE_PROFICIENCY_LABEL }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('combobox', { name: SPELLCASTING_ABILITY_LABEL }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText(CONSTITUTION_DC_HINT)).not.toBeInTheDocument()

    await choose(user, 'Ability', 'Constitution')
    expect(
      screen.getByRole('switch', { name: MONSTER_ATTACK_BONUS_INCLUDE_PROFICIENCY_LABEL }),
    ).toBeChecked()
    expect(formRef.current?.getValues('actions.0.bonusSource')).toEqual({
      kind: 'ability',
      ability: 'con',
      proficient: true,
    })
    await user.click(
      screen.getByRole('switch', { name: MONSTER_ATTACK_BONUS_INCLUDE_PROFICIENCY_LABEL }),
    )
    expect(formRef.current?.getValues('actions.0.bonusSource.proficient')).toBe(false)

    await choose(user, 'Attack bonus', MONSTER_ATTACK_BONUS_SOURCE_SPELL_LABEL)
    expect(screen.getByText(MONSTER_ATTACK_BONUS_SOURCE_SPELL_HINT)).toBeInTheDocument()
    expect(
      screen.queryByRole('switch', { name: MONSTER_ATTACK_BONUS_INCLUDE_PROFICIENCY_LABEL }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: SPELLCASTING_ABILITY_LABEL })).toBeInTheDocument()

    await choose(user, SPELLCASTING_ABILITY_LABEL, 'Intelligence')
    expect(formRef.current?.getValues('actions.0.bonusSource.castingAbility')).toEqual({
      kind: 'ability',
      ability: 'int',
    })

    await choose(user, 'Attack bonus', MONSTER_ATTACK_BONUS_SOURCE_ABILITY_LABEL)
    expect(screen.getByText(MONSTER_ATTACK_BONUS_SOURCE_ABILITY_HINT)).toBeInTheDocument()
    expect(
      screen.getByRole('switch', { name: MONSTER_ATTACK_BONUS_INCLUDE_PROFICIENCY_LABEL }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('combobox', { name: SPELLCASTING_ABILITY_LABEL }),
    ).not.toBeInTheDocument()
  })

  it('switches a save DC between ability and spellcasting', async () => {
    const user = userEvent.setup()
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    render(
      <Host
        action={draftAction({ id: 'breath', kind: 'save', name: 'Fire breath' })}
        formRef={formRef}
      />,
    )

    expect(
      screen.queryByRole('switch', { name: MONSTER_SAVE_DC_PROFICIENCY_LABEL }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('combobox', { name: SPELLCASTING_ABILITY_LABEL }),
    ).not.toBeInTheDocument()

    await choose(user, MONSTER_SAVE_DC_LABEL, MONSTER_ABILITY_SOURCE_KIND_ABILITY_LABEL)
    expect(
      screen.getByRole('switch', { name: MONSTER_SAVE_DC_PROFICIENCY_LABEL }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('combobox', { name: SPELLCASTING_ABILITY_LABEL }),
    ).not.toBeInTheDocument()

    await choose(user, 'DC ability', 'Constitution')
    expect(screen.getByText(CONSTITUTION_DC_HINT)).toBeInTheDocument()
    await user.click(screen.getByRole('switch', { name: MONSTER_SAVE_DC_PROFICIENCY_LABEL }))
    expect(formRef.current?.getValues('actions.0.dcSource')).toEqual({
      kind: 'ability',
      ability: 'con',
      proficient: true,
    })

    await choose(user, MONSTER_SAVE_DC_LABEL, MONSTER_ABILITY_SOURCE_KIND_SPELL_LABEL)
    expect(
      screen.queryByRole('switch', { name: MONSTER_SAVE_DC_PROFICIENCY_LABEL }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: SPELLCASTING_ABILITY_LABEL })).toBeInTheDocument()

    await choose(user, SPELLCASTING_ABILITY_LABEL, 'Intelligence')
    expect(formRef.current?.getValues('actions.0.dcSource.castingAbility')).toEqual({
      kind: 'ability',
      ability: 'int',
    })

    await choose(user, MONSTER_SAVE_DC_LABEL, MONSTER_ABILITY_SOURCE_KIND_ABILITY_LABEL)
    expect(
      screen.getByRole('switch', { name: MONSTER_SAVE_DC_PROFICIENCY_LABEL }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('combobox', { name: SPELLCASTING_ABILITY_LABEL }),
    ).not.toBeInTheDocument()
  })

  it('renders a spell action casting slot without a kind select', () => {
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    render(
      <Host
        action={draftAction({ id: 'cast', kind: 'spell', name: 'Spellcasting', spells: [] })}
        formRef={formRef}
      />,
    )

    expect(screen.getByRole('combobox', { name: SPELLCASTING_ABILITY_LABEL })).toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'Attack bonus' })).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: MONSTER_SAVE_DC_LABEL })).not.toBeInTheDocument()
    expect(screen.queryByText(MONSTER_ABILITY_SOURCE_KIND_ABILITY_LABEL)).not.toBeInTheDocument()
  })
})
