import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form'
import { createMagicPropertyDefinitionProvider } from '@rpg/catalog/magic-properties'
import { describe, expect, it } from 'vitest'

import { pickEquipment } from '@/test/fixtures/pick'

import { formatMonsterEquipmentRowMetadata } from '../../lib/equipment/monster-equipment-entry-display.lib'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { MonsterEquipmentPanel } from './monster-equipment-panel'

function Host({
  defaultValues,
  formRef,
}: {
  defaultValues: MonsterFormValues
  formRef?: { current: UseFormReturn<MonsterFormValues> | null }
}) {
  const dagger = pickEquipment('dagger')
  const form = useForm<MonsterFormValues>({ defaultValues })
  if (formRef) formRef.current = form
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

  it('shows the action-reference notice in one scope when attacks use the source stack', async () => {
    const dagger = pickEquipment('dagger')
    const user = userEvent.setup()
    render(
      <Host
        defaultValues={{
          ...resolveMonsterCreateDefaultValues(),
          equipment: [
            {
              entryId: 'stack',
              equipmentId: dagger.id,
              quantity: 2,
              equipped: true,
            },
          ],
          actions: [{ id: 'stab', kind: 'weapon', equipmentEntryId: 'stack' }],
        }}
      />,
    )

    await user.click(screen.getByLabelText('Customize Dagger'))
    expect(screen.getByText(/attacks will continue using the original Dagger/i)).toBeInTheDocument()
  })

  it('writes customized equipment into the monster form when Done is clicked', async () => {
    const dagger = pickEquipment('dagger')
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    const user = userEvent.setup()
    render(
      <Host
        formRef={formRef}
        defaultValues={{
          ...resolveMonsterCreateDefaultValues(),
          equipment: [
            {
              entryId: 'stack',
              equipmentId: dagger.id,
              quantity: 1,
              equipped: true,
            },
          ],
        }}
      />,
    )

    await user.click(screen.getByLabelText('Customize Dagger'))
    await user.click(screen.getByRole('switch', { name: /magic item/i }))
    await user.click(screen.getByRole('button', { name: 'Done' }))

    expect(formRef.current?.getValues('equipment')).toEqual([
      {
        entryId: 'stack',
        equipmentId: dagger.id,
        quantity: 1,
        equipped: true,
        magical: true,
      },
    ])
  })
})
