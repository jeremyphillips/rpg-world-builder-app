import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { createMagicPropertyDefinitionProvider } from '@rpg/catalog/magic-properties'
import { describe, expect, it } from 'vitest'

import { pickEquipment } from '@/test/fixtures/pick'

import { formatMonsterEquipmentRowMetadata } from '../../lib/monster-equipment-entry-display.lib'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { MonsterEquipmentPanel } from './monster-equipment-panel'

function Host({ defaultValues }: { defaultValues: MonsterFormValues }) {
  const dagger = pickEquipment('dagger')
  const form = useForm<MonsterFormValues>({ defaultValues })
  return (
    <FormProvider {...form}>
      <MonsterEquipmentPanel
        ctx={{
          equipmentCatalogStatus: 'ready',
          equipmentCatalogById: new Map([[dagger.id, dagger]]),
          rulesetId: 'srd-cc-5.2.1',
        }}
      />
    </FormProvider>
  )
}

describe('MonsterEquipmentPanel', () => {
  it('shows unresolved preset metadata and opens the customize editor', async () => {
    const dagger = pickEquipment('dagger')
    const provider = createMagicPropertyDefinitionProvider('srd-cc-5.2.1')
    const entry = {
      entryId: 'd1',
      equipmentId: dagger.id,
      quantity: 2,
      equipped: true,
      magical: true,
      magicProperties: [{ kind: 'preset' as const, propertyId: 'missing-preset' }],
    }
    expect(formatMonsterEquipmentRowMetadata({ entry, item: dagger, provider })).toContain(
      'unknown property',
    )

    render(
      <Host
        defaultValues={{
          ...resolveMonsterCreateDefaultValues(),
          equipment: [entry],
        }}
      />,
    )

    expect(screen.queryByText('No equipment yet.')).not.toBeInTheDocument()
    const user = userEvent.setup()
    await user.click(screen.getByLabelText('Customize Dagger'))
    expect(screen.getByText(/customize dagger/i)).toBeInTheDocument()
  })
})
