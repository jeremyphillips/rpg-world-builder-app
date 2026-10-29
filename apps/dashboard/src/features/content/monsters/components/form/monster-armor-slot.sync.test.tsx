import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { buildEquipmentCompactSummary } from '@rpg/contracts'

import { pickEquipment } from '@/test/fixtures/pick'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { createPlainMonsterEquipmentEntry } from '../../lib/equipment/monster-equipment-loadout.lib'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { MonsterEquipmentPanel } from './monster-equipment-panel'
import { MonsterArmorSlotBody } from './monster-armor-slot'

const leather = pickEquipment('leather-armor')

const ctx = {
  equipmentCatalogStatus: 'ready',
  equipmentCatalogById: new Map([[leather.id, leather]]),
  skillCatalogStatus: 'ready',
} satisfies ContentFormCtx

function Host({ equipment }: { equipment?: MonsterFormValues['equipment'] }) {
  const defaults = resolveMonsterCreateDefaultValues()
  if (equipment) defaults.equipment = equipment
  else defaults.equipment = [createPlainMonsterEquipmentEntry(leather.id)]
  const form = useForm<MonsterFormValues>({ defaultValues: defaults })
  return (
    <FormProvider {...form}>
      <MonsterArmorSlotBody slot="body-armor" ctx={ctx} />
      <MonsterEquipmentPanel ctx={ctx} />
    </FormProvider>
  )
}

describe('monster armor slot and equipment tab', () => {
  it('shows equip and remove changes on both surfaces', async () => {
    const user = userEvent.setup()
    render(<Host />)

    const toggles = screen.getAllByRole('checkbox', { name: `Equipped: ${leather.name}` })
    expect(toggles).toHaveLength(2)
    expect(toggles[0]).toBeChecked()
    expect(toggles[1]).toBeChecked()
    for (const segment of buildEquipmentCompactSummary(leather).comparisonGroups) {
      expect(screen.getAllByText(segment).length).toBeGreaterThan(0)
    }

    await user.click(toggles[0]!)
    expect(
      screen.getAllByRole('checkbox', { name: `Equipped: ${leather.name}` })[1],
    ).not.toBeChecked()

    await user.click(screen.getAllByRole('button', { name: `Remove ${leather.name}` })[0]!)
    expect(
      screen.queryByRole('checkbox', { name: `Equipped: ${leather.name}` }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('None selected')).toBeInTheDocument()
  })

  it('shows every owned body armor in the slot and on the equipment tab', () => {
    render(
      <Host
        equipment={[
          createPlainMonsterEquipmentEntry(leather.id),
          createPlainMonsterEquipmentEntry(leather.id),
        ]}
      />,
    )
    expect(screen.getAllByRole('checkbox', { name: `Equipped: ${leather.name}` })).toHaveLength(4)
  })
})
