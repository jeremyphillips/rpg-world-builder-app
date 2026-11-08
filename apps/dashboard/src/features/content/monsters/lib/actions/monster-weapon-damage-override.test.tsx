import { type Equipment } from '@rpg/contracts'
import { FormItems } from '@rpg/ui/form'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { buildMonsterInput, resolveMonsterCreateDefaultValues } from '../monster-form-values'
import { mapWeaponActionDamageToForm } from './monster-weapon-damage-form'
import {
  monsterWeaponDamageOverrideAddDisabled,
  monsterWeaponDamageOverrideField,
  monsterWeaponDamageOverrideSummary,
} from './monster-weapon-damage-override'

const shortsword = {
  id: 'shortsword',
  kind: 'weapon',
  name: 'Shortsword',
  damage: { dice: { count: 1, faces: 6 } },
  damageType: 'piercing',
} as Equipment

const greatsword = {
  id: 'greatsword',
  kind: 'weapon',
  name: 'Greatsword',
  damage: { dice: { count: 2, faces: 6 } },
  damageType: 'slashing',
} as Equipment

const blowgun = {
  id: 'blowgun',
  kind: 'weapon',
  name: 'Blowgun',
  damage: { flat: 1 },
  damageType: 'piercing',
} as Equipment

const club = {
  id: 'club',
  kind: 'weapon',
  name: 'Club',
  damageType: 'bludgeoning',
} as Equipment

const ctx = {
  equipmentCatalogStatus: 'ready',
  equipmentCatalogById: new Map<string, Equipment>([
    [shortsword.id, shortsword],
    [greatsword.id, greatsword],
    [blowgun.id, blowgun],
    [club.id, club],
  ]),
} as ContentFormCtx

const equipment = [
  { entryId: 'sword', equipmentId: 'shortsword' },
  { entryId: 'big', equipmentId: 'greatsword' },
  { entryId: 'puff', equipmentId: 'blowgun' },
  { entryId: 'stick', equipmentId: 'club' },
]

function StateProbe() {
  const { formState, getValues, setValue } = useFormContext()
  return (
    <>
      <output data-testid="state">
        {JSON.stringify({
          dirtyFields: formState.dirtyFields,
          damage: getValues('actions.0.damage') ?? null,
          entry: getValues('actions.0.equipmentEntryId'),
        })}
      </output>
      <button
        type="button"
        onClick={() => {
          const current = getValues('actions.0') as { damage?: unknown } | undefined
          setValue('equipment', equipment, { shouldDirty: false, shouldTouch: false })
          setValue(
            'actions.0',
            { equipmentEntryId: 'big', damage: current?.damage },
            { shouldDirty: false, shouldTouch: false },
          )
        }}
      >
        Switch weapon
      </button>
    </>
  )
}

function OverrideField({ entryId, damage }: { entryId?: string; damage?: unknown }) {
  const watched = useWatch({ name: 'actions.0' }) as
    | { equipmentEntryId?: string; damage?: unknown }
    | undefined
  return (
    <FormItems
      idPrefix="action"
      namePrefix="actions.0"
      items={[
        monsterWeaponDamageOverrideField({
          ctx,
          equipment,
          equipmentEntryId:
            typeof watched?.equipmentEntryId === 'string' ? watched.equipmentEntryId : entryId,
          damage: watched ? watched.damage : damage,
        }),
      ]}
    />
  )
}

function Harness({ entryId, damage }: { entryId?: string; damage?: unknown }) {
  const form = useForm({
    defaultValues: {
      equipment,
      actions: [{ equipmentEntryId: entryId, ...(damage !== undefined ? { damage } : {}) }],
    },
    shouldUnregister: true,
  })
  return (
    <FormProvider {...form}>
      <StateProbe />
      <OverrideField entryId={entryId} damage={damage} />
    </FormProvider>
  )
}

function state() {
  return JSON.parse(screen.getByTestId('state').textContent ?? '{}') as {
    dirtyFields: Record<string, unknown>
    damage: unknown
    entry: string
  }
}

describe('monster weapon damage override', () => {
  it('seeds the catalog roll, keeps it across a weapon change, and clears it cleanly', async () => {
    const user = userEvent.setup()
    render(<Harness entryId="sword" />)

    expect(screen.getByText('Using weapon base damage · 1d6 piercing')).toBeInTheDocument()
    expect(state()).toMatchObject({ dirtyFields: {}, damage: null })

    await user.click(screen.getByRole('button', { name: 'Override' }))
    expect(screen.getByText('Replacing weapon base roll · 1d6')).toBeInTheDocument()
    await waitFor(() => {
      expect(state().dirtyFields).not.toEqual({})
      expect(state().damage).toEqual({ dice: { count: 1, faces: 6 } })
    })

    await user.click(screen.getByRole('button', { name: 'Switch weapon' }))
    expect(screen.getByText('Replacing weapon base roll · 2d6')).toBeInTheDocument()
    expect(state().damage).toEqual({ dice: { count: 1, faces: 6 } })

    await user.click(
      screen.getByRole('button', { name: 'Use weapon default Base damage override' }),
    )
    expect(screen.getByText('Using weapon base damage · 2d6 slashing')).toBeInTheDocument()
    await waitFor(() => {
      expect(state()).toMatchObject({ dirtyFields: {}, damage: null })
    })
  })

  it('seeds a flat catalog roll without inventing dice', async () => {
    const user = userEvent.setup()
    render(<Harness entryId="puff" />)

    await user.click(screen.getByRole('button', { name: 'Override' }))
    expect(state().damage).toEqual({ flatOperator: '+', flatAmount: 1 })
    expect(screen.queryByLabelText('Number of dice')).not.toBeInTheDocument()
  })

  it('opens an empty override when the weapon has no base damage', async () => {
    const user = userEvent.setup()
    render(<Harness entryId="stick" />)

    expect(screen.getByText('This weapon has no base damage.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Override' }))
    expect(state().damage).toEqual({})
  })

  it('disables add when the weapon reference is missing', async () => {
    const user = userEvent.setup()
    render(<Harness entryId="gone" />)
    const add = screen.getByRole('button', { name: 'Override' })
    expect(add).toBeDisabled()
    expect(screen.getByText('Weapon unavailable')).toBeInTheDocument()
    await user.click(add)
    expect(state().damage).toBeNull()
  })

  it('keeps a stored override editable when the weapon reference is missing', async () => {
    const user = userEvent.setup()
    render(<Harness entryId="gone" damage={{ dice: { count: 2, faces: 6 } }} />)
    expect(screen.getByLabelText('Number of dice')).toHaveValue(2)
    expect(screen.getByText('Weapon unavailable')).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Use weapon default Base damage override' }),
    )
    await waitFor(() => {
      expect(state().dirtyFields).not.toEqual({})
      expect(state().damage).toBeNull()
    })
    expect(monsterWeaponDamageOverrideAddDisabled(ctx, equipment, 'gone', undefined)).toBe(true)
    expect(
      monsterWeaponDamageOverrideAddDisabled(ctx, equipment, 'gone', {
        dice: { count: 2, faces: 6 },
      }),
    ).toBe(false)
    expect(
      monsterWeaponDamageOverrideSummary(ctx, { equipmentEntryId: 'big', equipment }, true),
    ).toBe('Replacing weapon base roll · 2d6')
  })

  it('round-trips a flat weapon override without adding dice', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.name = 'Scout'
    values.equipment = [{ entryId: 'puff', equipmentId: 'blowgun', quantity: 1, equipped: true }]
    values.actions = [
      mapWeaponActionDamageToForm({
        id: 'puff',
        kind: 'weapon' as const,
        equipmentEntryId: 'puff',
        damage: { flat: 1 },
      }),
    ]
    expect(values.actions[0]).toMatchObject({
      damage: { flatOperator: '+', flatAmount: 1 },
    })
    expect(values.actions[0]?.damage).not.toHaveProperty('dice')
    const saved = buildMonsterInput(values, undefined, 'draft')
    expect((saved.actions as Array<{ damage?: unknown }>)[0]?.damage).toEqual({ flat: 1 })
  })
})
