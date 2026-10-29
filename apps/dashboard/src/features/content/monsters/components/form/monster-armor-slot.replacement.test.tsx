import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { pickEquipment } from '@/test/fixtures/pick'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  nextMonsterArmorSlotValues,
  planArmorSlotReplacement,
} from '../../lib/equipment/armor-slot-replacement.lib'
import { createPlainMonsterEquipmentEntry } from '../../lib/equipment/monster-equipment-loadout.lib'
import {
  formatArmorSlotReplacementConfirmCopy,
  getMonsterArmorSlotUiCopy,
  MONSTER_ARMOR_SLOT_REPLACEMENT_SCOPE,
  MONSTER_REMOVE_EQUIPMENT_CONFIRM_LABEL,
} from '../../lib/monster-form-labels'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterEquipmentFormEntry,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import type { EquipmentRemovalDecision } from '../../lib/equipment/resolve-equipment-removal-decision.lib'
import { MonsterArmorSlotAction } from './monster-armor-slot'

const leather = pickEquipment('leather-armor')
const chain = pickEquipment('chain-shirt')
const dagger = pickEquipment('dagger')
const copy = getMonsterArmorSlotUiCopy('body-armor')

const allowed: EquipmentRemovalDecision = { outcome: 'allowed', reasons: [], references: [] }
const confirm: EquipmentRemovalDecision = {
  outcome: 'confirm',
  reasons: ['customized'],
  references: [],
}
const prohibited: EquipmentRemovalDecision = { outcome: 'prohibited', reasons: [], references: [] }

function namedEntry(equipmentId: string, customName?: string): MonsterEquipmentFormEntry {
  return {
    ...createPlainMonsterEquipmentEntry(equipmentId),
    ...(customName ? { customName } : {}),
  }
}

describe('planArmorSlotReplacement', () => {
  it('stops on a prohibited row and does not treat it as confirmable', () => {
    expect(planArmorSlotReplacement([confirm, prohibited, allowed])).toBe('prohibited')
  })

  it('confirms when any row is confirmable and applies when every row is allowed', () => {
    expect(planArmorSlotReplacement([allowed, confirm])).toBe('confirm')
    expect(planArmorSlotReplacement([allowed, allowed])).toBe('apply')
  })
})

describe('formatArmorSlotReplacementConfirmCopy', () => {
  it('names every flagged entry and states that the whole slot is replaced', () => {
    const copy = formatArmorSlotReplacementConfirmCopy({
      flagged: [
        { displayName: 'Aegis', reasons: ['customized'], referencedActionCount: 0 },
        { displayName: 'Wall', reasons: ['referenced'], referencedActionCount: 1 },
      ],
    })
    expect(copy.description).toContain(MONSTER_ARMOR_SLOT_REPLACEMENT_SCOPE)
    expect(copy.description).toContain('Aegis')
    expect(copy.description).toContain('Wall')
    expect(copy.description).not.toContain('Plain leather')
  })

  it('keeps the single-entry removal sentences inside the slot scope', () => {
    const copy = formatArmorSlotReplacementConfirmCopy({
      flagged: [{ displayName: 'Aegis', reasons: ['customized'], referencedActionCount: 0 }],
    })
    expect(copy.headline).toBe('Remove Aegis?')
    expect(copy.description.startsWith(MONSTER_ARMOR_SLOT_REPLACEMENT_SCOPE)).toBe(true)
    expect(copy.description).toContain('customizations')
  })
})

describe('nextMonsterArmorSlotValues', () => {
  it('replaces the slot once and drops actions that referenced a removed piece', () => {
    const aegis = namedEntry(leather.id, 'Aegis')
    const wall = namedEntry(chain.id, 'Wall')
    const knife = createPlainMonsterEquipmentEntry(dagger.id)
    const values = resolveMonsterCreateDefaultValues()
    values.equipment = [aegis, wall, knife]
    values.actions = [
      {
        id: 'stab',
        kind: 'weapon',
        equipmentEntryId: aegis.entryId,
        name: 'Stab',
      } as MonsterFormValues['actions'][number],
    ]
    const catalog = new Map([
      [leather.id, leather],
      [chain.id, chain],
      [dagger.id, dagger],
    ])
    const next = nextMonsterArmorSlotValues(values, 'body-armor', chain.id, catalog)
    expect(next.equipment.map((entry) => entry.equipmentId)).toEqual([knife.equipmentId, chain.id])
    expect(next.equipment.filter((entry) => entry.equipmentId === chain.id)).toHaveLength(1)
    expect(next.actions).toEqual([])
  })
})

function ReplacementHost({ equipment }: { equipment: MonsterEquipmentFormEntry[] }) {
  const defaults = resolveMonsterCreateDefaultValues()
  defaults.equipment = equipment
  const form = useForm<MonsterFormValues>({ defaultValues: defaults })
  const ctx = {
    equipmentCatalogStatus: 'ready',
    equipmentCatalogById: new Map([
      [leather.id, leather],
      [chain.id, chain],
    ]),
    skillCatalogStatus: 'ready',
    options: {
      equipment: {
        forReference: () => [leather, chain],
      },
    },
  } as ContentFormCtx
  return (
    <FormProvider {...form}>
      <MonsterArmorSlotAction slot="body-armor" ctx={ctx} />
    </FormProvider>
  )
}

describe('MonsterArmorSlotAction replacement', () => {
  it('confirms the full slot, leaves it unchanged on cancel, and replaces it once on confirm', async () => {
    const user = userEvent.setup()
    render(
      <ReplacementHost
        equipment={[namedEntry(leather.id, 'Aegis'), namedEntry(chain.id, 'Wall')]}
      />,
    )

    await user.click(screen.getByRole('button', { name: copy.change }))
    const group = screen.getByRole('radiogroup', { name: copy.select })
    await user.click(within(group).getByRole('radio', { name: chain.name }))
    await user.click(screen.getByRole('button', { name: copy.select }))

    const dialog = screen.getByRole('alertdialog')
    expect(
      within(dialog).getByText(MONSTER_ARMOR_SLOT_REPLACEMENT_SCOPE, { exact: false }),
    ).toBeInTheDocument()
    expect(within(dialog).getByText(/Aegis/)).toBeInTheDocument()
    expect(within(dialog).getByText(/Wall/)).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: copy.select }))
    const confirmed = screen.getByRole('alertdialog')
    await user.click(
      within(confirmed).getByRole('button', { name: MONSTER_REMOVE_EQUIPMENT_CONFIRM_LABEL }),
    )
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: copy.change })).toBeInTheDocument()
  })
})
