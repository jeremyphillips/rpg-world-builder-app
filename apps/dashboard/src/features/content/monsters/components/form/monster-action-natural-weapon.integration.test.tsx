import { useEffect } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useController, FormProvider, useForm, type UseFormReturn } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { buildSeedDamageTypeVocabulary } from '@/features/vocabulary'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  buildMonsterInput,
  monsterToFormValues,
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import type { MonsterActionDraftRow } from '../../lib/actions/monster-action-presets'
import { MonsterActionSections } from './monster-action-sections'

const ctx = {
  entityCatalogLayer: 'homebrew',
  equipmentCatalogStatus: 'ready',
  equipmentCatalogById: new Map(),
  damageTypeVocabulary: buildSeedDamageTypeVocabulary(),
} as ContentFormCtx

const customizedBite: MonsterActionDraftRow = {
  id: 'bite',
  kind: 'natural-weapon',
  name: 'Bite',
  mode: 'melee',
  reach: 15,
  properties: ['finesse'],
  damageType: 'fire',
  damage: { dice: { count: 2, faces: 6 } },
  description: '<p>Venom</p>',
  limitedUse: { kind: 'recharge', minRoll: 5 },
  onHit: {
    additionalDamage: [{ damageType: 'poison', roll: { dice: { count: 1, faces: 6 } } }],
  },
}

function valuesWith(actions: MonsterActionDraftRow[]): MonsterFormValues {
  const values = resolveMonsterCreateDefaultValues()
  values.name = 'Scout'
  values.actions = actions
  return values
}

const RETAINED_FORM_PATHS = [
  'name',
  'sizes',
  'creatureType',
  'alignment',
  'abilityScores',
  'armorClass',
  'hitPoints',
  'movement',
  'senses',
  'communication',
  'proficiencies',
  'weaponProficiencyMode',
  'defenses',
  'equipment',
  'traits',
  'challengeRating',
] as const

function RetainedMonsterPath({ name }: { name: (typeof RETAINED_FORM_PATHS)[number] }) {
  useController({ name, shouldUnregister: false })
  return null
}

/** Inactive tabs stay mounted in the real form. Keep those objects in the value store. */
function RetainMountedMonsterFields() {
  return RETAINED_FORM_PATHS.map((name) => <RetainedMonsterPath key={name} name={name} />)
}

function Host({
  values,
  formRef,
}: {
  values: MonsterFormValues
  formRef?: { current: UseFormReturn<MonsterFormValues> | null }
}) {
  const form = useForm<MonsterFormValues>({
    shouldUnregister: true,
    defaultValues: values,
  })
  useEffect(() => {
    if (formRef) formRef.current = form
  })
  return (
    <FormProvider {...form}>
      <RetainMountedMonsterFields />
      <MonsterActionSections ctx={ctx} />
    </FormProvider>
  )
}

function biteRow(values: MonsterFormValues) {
  const sections = [values.actions, values.bonusActions, values.reactions]
  for (const rows of sections) {
    const match = rows.find((row) => row.id === 'bite')
    if (match) return match
  }
  return undefined
}

describe('natural weapon action round trip', () => {
  it('keeps unmounted mechanics through switch, move, save, reload, and edit', async () => {
    const user = userEvent.setup()
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    const initial = valuesWith([
      customizedBite,
      {
        id: 'slam',
        kind: 'natural-weapon',
        name: 'Slam',
        mode: 'melee',
        damageType: 'bludgeoning',
      },
    ])

    const view = render(<Host values={initial} formRef={formRef} />)

    await waitFor(() => {
      expect(biteRow(formRef.current!.getValues())?.reach).toBe(15)
    })
    expect(biteRow(formRef.current!.getValues())).toMatchObject({
      properties: ['finesse'],
      limitedUse: { kind: 'recharge', minRoll: 5 },
      damageType: 'fire',
      description: '<p>Venom</p>',
    })

    await user.click(screen.getByRole('button', { name: /Slam/i }))
    await user.click(screen.getByRole('button', { name: /Bite/i }))
    expect(biteRow(formRef.current!.getValues())?.reach).toBe(15)
    expect(biteRow(formRef.current!.getValues())?.properties).toEqual(['finesse'])

    await user.click(screen.getByRole('button', { name: 'Actions for Bite' }))
    expect(screen.queryByRole('menuitem', { name: 'Actions' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('menuitem', { name: 'Bonus actions' }))
    await waitFor(() => {
      expect(formRef.current!.getValues().bonusActions[0]?.id).toBe('bite')
    })
    expect(formRef.current!.getValues().bonusActions[0]).toMatchObject({
      reach: 15,
      properties: ['finesse'],
      limitedUse: { kind: 'recharge', minRoll: 5 },
      mode: 'melee',
    })

    const name = screen.getByRole('textbox', { name: 'Name' })
    await user.clear(name)
    await user.type(name, 'Fangs')
    const counts = screen.getAllByRole('spinbutton', { name: 'Damage Number of dice' })
    await user.clear(counts[0]!)
    await user.type(counts[0]!, '3')

    const saved = buildMonsterInput(formRef.current!.getValues(), undefined, 'draft')
    const reloaded = monsterToFormValues({
      ...saved,
      id: 'm1',
      catalogLayer: 'homebrew',
      status: 'draft',
      rulesetId: 'srd',
      slug: 'scout',
    } as never)
    expect(reloaded.bonusActions[0]).toMatchObject({
      id: 'bite',
      name: 'Fangs',
      reach: 15,
      properties: ['finesse'],
      damageType: 'fire',
      damage: { dice: { faces: 6 } },
      limitedUse: { kind: 'recharge', minRoll: 5 },
      description: '<p>Venom</p>',
    })

    view.unmount()
    const reloadedForm: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    render(<Host values={reloaded} formRef={reloadedForm} />)
    await waitFor(() => {
      expect(reloadedForm.current!.getValues().bonusActions[0]?.reach).toBe(15)
    })
    await user.click(screen.getByRole('button', { name: /Fangs/i }))
    const reloadedName = screen.getByRole('textbox', { name: 'Name' })
    await user.clear(reloadedName)
    await user.type(reloadedName, 'Fangs again')
    const again = buildMonsterInput(reloadedForm.current!.getValues(), undefined, 'draft')
    const bonus = (again.bonusActions as Array<Record<string, unknown>>)[0]
    expect(bonus).toMatchObject({
      name: 'Fangs again',
      reach: 15,
      properties: ['finesse'],
      limitedUse: { kind: 'recharge', minRoll: 5 },
      damageType: 'fire',
    })
  })

  it('shows Change for a preset damage type and the select until a custom type is chosen', async () => {
    const user = userEvent.setup()
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    render(
      <Host
        formRef={formRef}
        values={valuesWith([
          {
            id: 'claw',
            kind: 'natural-weapon',
            name: 'Claw',
            mode: 'melee',
            reach: 5,
            damageType: 'piercing',
            damage: { dice: { count: 1, faces: 6 } },
          },
          { id: 'custom', kind: 'natural-weapon', name: 'Gore', mode: 'melee', reach: 5 },
        ])}
      />,
    )

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Claw')
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Change Damage type' })).toBeInTheDocument()
    })
    expect(screen.queryByRole('combobox', { name: 'Damage type' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add custom description' })).toBeInTheDocument()
    expect(screen.getByText('Ability modifiers are applied automatically.')).toBeInTheDocument()
    expect(
      screen.getByText('Additional damage dealt when this attack hits, beyond its primary damage.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Mode')).not.toBeInTheDocument()
    expect(screen.queryByText('Limit')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Move to')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Gore/i }))
    expect(screen.queryByRole('button', { name: 'Change Damage type' })).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Damage type' })).toBeInTheDocument()
  })
})
