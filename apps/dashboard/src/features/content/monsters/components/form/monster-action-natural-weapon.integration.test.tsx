import { useEffect } from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
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
import { createMonsterActionFromAcquisition } from '../../lib/actions/monster-action-acquisition'
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

function biteRow(values: MonsterFormValues): MonsterActionDraftRow | undefined {
  const sections = [values.actions, values.bonusActions, values.reactions]
  for (const rows of sections) {
    const match = rows.find((row) => row.id === 'bite')
    if (match) return match as MonsterActionDraftRow
  }
  return undefined
}

describe('attack default ownership', () => {
  it('keeps created attack damage across selection without storing reach', async () => {
    const user = userEvent.setup()
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    const created = createMonsterActionFromAcquisition({ type: 'create', kind: 'attack' })
    const attack = { ...created, name: 'Slash' }
    const note = { id: 'note', kind: 'special' as const, name: 'Note' }

    render(<Host values={valuesWith([note, attack])} formRef={formRef} />)

    await waitFor(() => {
      const row = formRef.current!.getValues().actions.find((item) => item.id === attack.id)
      expect(row).toMatchObject({ damage: { dice: { count: 1, faces: 6 } } })
      expect(row).not.toHaveProperty('reach')
    })

    await user.click(screen.getByRole('button', { name: /Slash/i }))
    expect(screen.getByLabelText('Number of dice')).toHaveValue(1)
    await user.click(screen.getByRole('button', { name: /Note/i }))

    const after = formRef.current!.getValues().actions.find((item) => item.id === attack.id)
    expect(after).toMatchObject({ damage: { dice: { count: 1, faces: 6 } } })
    expect(after).not.toHaveProperty('reach')
    expect(formRef.current!.getFieldState('actions.1.damage').isDirty).toBe(false)
    expect(formRef.current!.getFieldState('actions.1.reach').isDirty).toBe(false)
  })

  it('leaves an incomplete saved attack incomplete and restores that baseline on reset', async () => {
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    const initial = valuesWith([{ id: 'old', kind: 'attack', name: 'Old', modes: ['melee'] }])
    const baseline = structuredClone(initial)

    render(<Host values={initial} formRef={formRef} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add dice' })).toBeInTheDocument()
    })
    const opened = formRef.current!.getValues().actions[0]
    expect(opened).not.toHaveProperty('damage')
    expect(opened?.reach).toBeUndefined()
    expect(formRef.current!.formState.isDirty).toBe(false)

    act(() => {
      formRef.current!.setValue('actions.0.damage', { dice: { count: 2, faces: 8 } })
      formRef.current!.reset(baseline)
    })
    await waitFor(() => {
      expect(formRef.current!.getValues().actions[0]).not.toHaveProperty('damage')
    })
    expect(formRef.current!.getValues().actions[0]?.reach).toBeUndefined()
  })

  it('duplicates an attack without inventing reach or replacing its roll', async () => {
    const user = userEvent.setup()
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    const created = createMonsterActionFromAcquisition({ type: 'create', kind: 'attack' })
    const attack = { ...created, name: 'Slash', damage: { dice: { count: 2, faces: 8 } } }

    render(<Host values={valuesWith([attack])} formRef={formRef} />)

    await user.click(screen.getByRole('button', { name: 'Actions for Slash' }))
    await user.click(screen.getByRole('menuitem', { name: /Duplicate/i }))

    await waitFor(() => {
      expect(formRef.current!.getValues().actions).toHaveLength(2)
    })
    const [source, copy] = formRef.current!.getValues().actions
    expect(copy?.id).not.toBe(source?.id)
    expect(copy).toMatchObject({ damage: { dice: { count: 2, faces: 8 } } })
    expect(copy).not.toHaveProperty('reach')
    expect(source).toMatchObject({ damage: { dice: { count: 2, faces: 8 } } })
  })
})

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
      const row = biteRow(formRef.current!.getValues())
      expect(row?.kind === 'natural-weapon' ? row.reach : undefined).toBe(15)
    })
    expect(biteRow(formRef.current!.getValues())).toMatchObject({
      properties: ['finesse'],
      limitedUse: { kind: 'recharge', minRoll: 5 },
      damageType: 'fire',
      description: '<p>Venom</p>',
      onHit: {
        additionalDamage: [{ damageType: 'poison', roll: { dice: { count: 1, faces: 6 } } }],
      },
    })
    const onHitHint = screen.getByText(
      'Additional damage dealt when this attack hits, beyond its primary damage.',
    )
    const details = screen.getByRole('button', { name: 'Remove Additional details' })
    expect(
      onHitHint.compareDocumentPosition(details) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()

    await user.click(screen.getByRole('button', { name: /Slam/i }))
    await user.click(screen.getByRole('button', { name: /Bite/i }))
    const reopened = biteRow(formRef.current!.getValues())
    expect(reopened?.kind === 'natural-weapon' ? reopened.reach : undefined).toBe(15)
    const row = biteRow(formRef.current!.getValues())
    expect(row?.kind === 'natural-weapon' ? row.properties : undefined).toEqual(['finesse'])
    expect(row).toMatchObject({
      description: '<p>Venom</p>',
      damage: { dice: { count: 2, faces: 6 } },
      onHit: {
        additionalDamage: [{ damageType: 'poison', roll: { dice: { count: 1, faces: 6 } } }],
      },
    })

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

    await user.click(screen.getByRole('button', { name: 'Edit name' }))
    const name = screen.getByRole('textbox', { name: 'Name' })
    await user.clear(name)
    await user.type(name, 'Fangs')
    await user.keyboard('{Enter}')
    const counts = screen.getAllByRole('spinbutton', { name: 'Damage roll Number of dice' })
    await user.clear(counts[0]!)
    await user.type(counts[0]!, '3')
    expect(formRef.current!.getFieldState('bonusActions.0.damage.dice.count').isDirty).toBe(true)

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
      const bonus = reloadedForm.current!.getValues().bonusActions[0] as
        | MonsterActionDraftRow
        | undefined
      expect(bonus?.kind === 'natural-weapon' ? bonus.reach : undefined).toBe(15)
    })
    await user.click(screen.getByRole('button', { name: /Fangs/i }))
    await user.click(screen.getByRole('button', { name: 'Edit name' }))
    const reloadedName = screen.getByRole('textbox', { name: 'Name' })
    await user.clear(reloadedName)
    await user.type(reloadedName, 'Fangs again')
    await user.keyboard('{Enter}')
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

    await user.click(screen.getByRole('button', { name: 'Edit name' }))
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Claw')
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Change Type' })).toBeInTheDocument()
    })
    expect(screen.queryByRole('combobox', { name: 'Type' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add additional details' })).toBeInTheDocument()
    expect(screen.getByText('Ability modifiers are applied automatically.')).toBeInTheDocument()
    expect(
      screen.getByText('Additional damage dealt when this attack hits, beyond its primary damage.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Mode')).not.toBeInTheDocument()
    expect(screen.queryByText('Limit')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Move to')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Gore/i }))
    expect(screen.queryByRole('button', { name: 'Change Type' })).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Type' })).toBeInTheDocument()
  })
})
