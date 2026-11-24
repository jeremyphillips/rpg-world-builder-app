import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { beforeAll, describe, expect, it } from 'vitest'
import { FormItems } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { monsterFormTestValues } from '../../monster-form-test-values'
import type { MonsterFormValues } from '../../monster-form-values'
import { buildMonsterActionMultiattackPreview } from '../previews/monster-action-multiattack-summary'
import type { MonsterActionDraftRow } from '../monster-action-presets'
import { primeMultiattackReplacementActionsSnapshot } from './monster-multiattack-replacement-form-sync'
import { monsterMultiattackMechanicFields } from './monster-multiattack-mechanic-fields'

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

const counterspellId = 'srd:counterspell'

const ctx = {
  entityCatalogLayer: 'homebrew',
  equipmentCatalogStatus: 'ready',
  equipmentCatalogById: new Map(),
  spellCatalogStatus: 'ready',
  spellCatalogById: new Map([[counterspellId, { id: counterspellId, name: 'Counterspell' }]]),
  armorClassRules: { mode: 'ascending', base: 10 },
  options: { skills: { visible: [] } },
  rulesetId: 'srd-cc-5.2.1',
} as unknown as ContentFormCtx

const bite = {
  id: 'bite',
  kind: 'natural-weapon',
  name: 'Bite',
  mode: 'melee',
  damageType: 'piercing',
  damage: { dice: { count: 1, faces: 8 } },
}

const fireBreath = {
  id: 'fire-breath',
  kind: 'save',
  name: 'Fire Breath',
  dcSource: 'constitution',
  resolution: { kind: 'damage', damageType: 'fire', damage: { dice: { count: 2, faces: 6 } } },
}

const multiattack = {
  id: 'multiattack',
  kind: 'multiattack',
  name: 'Multiattack',
  steps: [{ count: 2, actionIds: ['bite'] }],
}

const lichMultiattackStep = {
  count: 3,
  actionIds: ['eldritch-burst', 'paralyzing-touch'],
}

const eldritchBurst = {
  id: 'eldritch-burst',
  kind: 'spell',
  name: 'Eldritch Burst',
  spellId: 'eldritch-burst',
}

const paralyzingTouch = {
  id: 'paralyzing-touch',
  kind: 'natural-weapon',
  name: 'Paralyzing Touch',
  mode: 'melee',
  damageType: 'necrotic',
  damage: { dice: { count: 3, faces: 6 } },
}

const spellcasting = {
  id: 'spellcasting',
  kind: 'spell',
  name: 'Spellcasting',
  spells: [{ spellId: counterspellId }],
}

function Harness({ onReady }: { onReady: (getValues: () => MonsterFormValues) => void }) {
  const defaultValues = monsterFormTestValues({
    name: 'Hell Hound',
    actions: [multiattack, bite, fireBreath] as MonsterFormValues['actions'],
  })
  primeMultiattackReplacementActionsSnapshot(defaultValues.actions as MonsterActionDraftRow[])
  const form = useForm<MonsterFormValues>({ defaultValues, shouldUnregister: true })
  onReady(() => form.getValues())
  const actionRows = defaultValues.actions as MonsterActionDraftRow[]
  return (
    <FormProvider {...form}>
      <FormItems
        idPrefix="multiattack"
        namePrefix="actions.0"
        items={monsterMultiattackMechanicFields({
          namePrefix: 'actions.0',
          section: 'actions',
          action: multiattack as Extract<MonsterActionDraftRow, { kind: 'multiattack' }>,
          ctx,
          attackOptions: [{ value: 'bite', label: 'Bite' }],
          actionRows,
          weapons: [],
          weaponActions: [],
          allowAddWeapon: false,
        })}
      />
    </FormProvider>
  )
}

function LichHarness() {
  const multiattackLich = {
    id: 'multiattack',
    kind: 'multiattack' as const,
    name: 'Multiattack',
    steps: [lichMultiattackStep],
  }
  const defaultValues = monsterFormTestValues({
    name: 'Lich',
    actions: [
      multiattackLich,
      eldritchBurst,
      paralyzingTouch,
      fireBreath,
    ] as MonsterFormValues['actions'],
  })
  primeMultiattackReplacementActionsSnapshot(defaultValues.actions as MonsterActionDraftRow[])
  const form = useForm<MonsterFormValues>({ defaultValues, shouldUnregister: true })
  const actionRows = defaultValues.actions as MonsterActionDraftRow[]
  return (
    <FormProvider {...form}>
      <FormItems
        idPrefix="multiattack"
        namePrefix="actions.0"
        items={monsterMultiattackMechanicFields({
          namePrefix: 'actions.0',
          section: 'actions',
          action: multiattackLich,
          ctx,
          attackOptions: [
            { value: 'eldritch-burst', label: 'Eldritch Burst' },
            { value: 'paralyzing-touch', label: 'Paralyzing Touch' },
          ],
          actionRows,
          weapons: [],
          weaponActions: [],
          allowAddWeapon: false,
        })}
      />
    </FormProvider>
  )
}

describe('multiattack replacement form values', () => {
  it('shows attacks-replaced stepper and add target attack for Lich-like combo sequence', async () => {
    const user = userEvent.setup()
    render(<LichHarness />)

    await user.click(screen.getByRole('button', { name: 'Add action replacement' }))

    expect(screen.getByRole('spinbutton', { name: /Attacks replaced/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Add target attack/i })).toBeInTheDocument()
    expect(screen.queryByText(/Replaces 1 attack/i)).not.toBeInTheDocument()
  })

  it('clears a pinned spell from a replacement choice', async () => {
    const user = userEvent.setup()
    let read: (() => MonsterFormValues) | undefined

    function SpellChoiceHarness({ onReady }: { onReady: (read: () => MonsterFormValues) => void }) {
      const defaultValues = monsterFormTestValues({
        name: 'Lich',
        actions: [multiattack, bite, spellcasting] as MonsterFormValues['actions'],
      })
      primeMultiattackReplacementActionsSnapshot(defaultValues.actions as MonsterActionDraftRow[])
      const form = useForm<MonsterFormValues>({ defaultValues, shouldUnregister: true })
      onReady(() => form.getValues())
      return (
        <FormProvider {...form}>
          <FormItems
            idPrefix="multiattack"
            namePrefix="actions.0"
            items={monsterMultiattackMechanicFields({
              namePrefix: 'actions.0',
              section: 'actions',
              action: multiattack as Extract<MonsterActionDraftRow, { kind: 'multiattack' }>,
              ctx,
              attackOptions: [{ value: 'bite', label: 'Bite' }],
              actionRows: defaultValues.actions as MonsterActionDraftRow[],
              weapons: [],
              weaponActions: [],
              allowAddWeapon: false,
            })}
          />
        </FormProvider>
      )
    }

    render(<SpellChoiceHarness onReady={(getValues) => (read = getValues)} />)

    await user.click(screen.getByRole('button', { name: 'Add action replacement' }))
    await user.click(screen.getByRole('button', { name: 'Add choice' }))
    await user.click(screen.getByRole('combobox', { name: 'Action' }))
    await user.click(screen.getByRole('option', { name: 'Spellcasting' }))
    await user.click(screen.getByRole('button', { name: 'Pin specific spell' }))
    await user.click(screen.getByRole('combobox', { name: 'Spell' }))
    await user.click(screen.getByRole('option', { name: 'Counterspell' }))
    await user.click(screen.getByRole('button', { name: 'Clear spell' }))

    const choice = (
      read?.().actions?.[0] as { replacement?: { choices?: { spellId?: string }[] } } | undefined
    )?.replacement?.choices?.[0]
    expect(choice?.spellId).toBeFalsy()
  })

  it('does not offer attacks already in the primary sequence as replacement choices', async () => {
    const user = userEvent.setup()
    render(<Harness onReady={() => undefined} />)

    await user.click(screen.getByRole('button', { name: 'Add action replacement' }))
    await user.click(screen.getByRole('button', { name: 'Add choice' }))
    await user.click(screen.getByRole('combobox', { name: 'Action' }))

    expect(screen.queryByRole('option', { name: 'Bite' })).not.toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Fire Breath' })).toBeInTheDocument()
  })

  it('stores a completed replacement under the action and previews it', async () => {
    const user = userEvent.setup()
    let read: (() => MonsterFormValues) | undefined
    render(<Harness onReady={(getValues) => (read = getValues)} />)

    await user.click(screen.getByRole('button', { name: 'Add action replacement' }))
    await user.click(screen.getByRole('button', { name: 'Add choice' }))
    await user.click(screen.getByRole('combobox', { name: 'Action' }))
    await user.click(screen.getByRole('option', { name: 'Fire Breath' }))

    const live = read?.()
    const liveAction = live?.actions?.[0] as { replacement?: unknown } | undefined
    expect(liveAction).toMatchObject({
      replacement: {
        count: 1,
        choices: [{ actionId: 'fire-breath' }],
      },
    })
    expect(liveAction).not.toHaveProperty('choices')

    const values = monsterFormTestValues({
      name: 'Hell Hound',
      actions: [
        { ...multiattack, replacement: liveAction?.replacement },
        bite,
        fireBreath,
      ] as MonsterFormValues['actions'],
    })

    const preview = buildMonsterActionMultiattackPreview({
      values: values!,
      ctx,
      actionId: 'multiattack',
    })
    expect(preview?.status).toBe('ready')
    if (!preview || preview.status !== 'ready') return
    expect(preview.prose).toMatch(/makes two bite attacks/i)
    expect(preview.prose).toMatch(/replace one attack with a use of fire breath/i)
  })
})
