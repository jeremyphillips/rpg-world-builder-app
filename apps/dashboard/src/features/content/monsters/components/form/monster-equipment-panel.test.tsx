import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form'
import { createMagicPropertyDefinitionProvider } from '@rpg/catalog/magic-properties'
import { describe, expect, it } from 'vitest'

import { pickEquipment } from '@/test/fixtures/pick'

import { mapEquipmentInstanceInventoryStatus } from '@/features/content'
import { resolveEquipmentInstanceSummary } from '@rpg/contracts'
import { MONSTER_REMOVE_EQUIPMENT_CONFIRM_LABEL } from '../../lib/monster-form-labels'
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
    const summary = resolveEquipmentInstanceSummary(entry, dagger, provider)
    const status = mapEquipmentInstanceInventoryStatus(summary)
    expect(
      status.status.some((row) => row.kind === 'text' && row.label.includes('Unknown property')),
    ).toBe(true)

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

  describe('equipment removal confirmation', () => {
    it('removes plain unreferenced equipment without a dialog', async () => {
      const dagger = pickEquipment('dagger')
      const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
      const user = userEvent.setup()
      render(
        <Host
          formRef={formRef}
          defaultValues={{
            ...resolveMonsterCreateDefaultValues(),
            equipment: [{ entryId: 'plain', equipmentId: dagger.id, quantity: 1 }],
          }}
        />,
      )

      await user.click(screen.getByLabelText('Remove Dagger'))
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      expect(formRef.current?.getValues('equipment')).toEqual([])
    })

    it('decrements quantity without a dialog', async () => {
      const dagger = pickEquipment('dagger')
      const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
      const user = userEvent.setup()
      render(
        <Host
          formRef={formRef}
          defaultValues={{
            ...resolveMonsterCreateDefaultValues(),
            equipment: [{ entryId: 'plain', equipmentId: dagger.id, quantity: 2 }],
          }}
        />,
      )

      await user.click(screen.getByLabelText('Decrease Quantity of Dagger'))
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      expect(formRef.current?.getValues('equipment')).toEqual([
        { entryId: 'plain', equipmentId: dagger.id, quantity: 1 },
      ])
    })

    it('does not confirm magical-only rows without properties', async () => {
      const dagger = pickEquipment('dagger')
      const user = userEvent.setup()
      render(
        <Host
          defaultValues={{
            ...resolveMonsterCreateDefaultValues(),
            equipment: [{ entryId: 'mag', equipmentId: dagger.id, quantity: 1, magical: true }],
          }}
        />,
      )

      await user.click(screen.getByLabelText('Remove Dagger'))
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })

    it('confirms customized removal and preserves unrelated dirty fields', async () => {
      const dagger = pickEquipment('dagger')
      const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
      const user = userEvent.setup()
      render(
        <Host
          formRef={formRef}
          defaultValues={{
            ...resolveMonsterCreateDefaultValues(),
            name: 'Original',
            equipment: [
              {
                entryId: 'stack',
                equipmentId: dagger.id,
                quantity: 1,
                customName: 'Shard',
              },
            ],
          }}
        />,
      )

      act(() => {
        formRef.current?.setValue('name', 'Edited', { shouldDirty: true })
      })

      await user.click(screen.getByLabelText('Remove Shard'))
      expect(screen.getByRole('alertdialog')).toBeInTheDocument()
      expect(screen.getByText(/customizations that will be discarded/i)).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(formRef.current?.getValues('equipment')).toHaveLength(1)

      await user.click(screen.getByLabelText('Remove Shard'))
      await user.click(screen.getByRole('button', { name: MONSTER_REMOVE_EQUIPMENT_CONFIRM_LABEL }))
      expect(formRef.current?.getValues('equipment')).toEqual([])
      expect(formRef.current?.getValues('name')).toBe('Edited')
      expect(formRef.current?.getFieldState('name').isDirty).toBe(true)
    })

    it('uses reference-only copy for linked weapon actions', async () => {
      const dagger = pickEquipment('dagger')
      const user = userEvent.setup()
      render(
        <Host
          defaultValues={{
            ...resolveMonsterCreateDefaultValues(),
            equipment: [{ entryId: 'stack', equipmentId: dagger.id, quantity: 1 }],
            actions: [{ id: 'stab', kind: 'weapon', equipmentEntryId: 'stack', name: 'Stab' }],
          }}
        />,
      )

      await user.click(screen.getByLabelText('Remove Dagger'))
      expect(screen.getByText(/is used by Stab/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Remove weapon and action' })).toBeInTheDocument()
    })

    it('shows one combined dialog when customized and referenced', async () => {
      const dagger = pickEquipment('dagger')
      const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
      const user = userEvent.setup()
      render(
        <Host
          formRef={formRef}
          defaultValues={{
            ...resolveMonsterCreateDefaultValues(),
            equipment: [
              { entryId: 'stack', equipmentId: dagger.id, quantity: 1, customName: 'Shard' },
            ],
            actions: [{ id: 'stab', kind: 'weapon', equipmentEntryId: 'stack', name: 'Stab' }],
          }}
        />,
      )

      await user.click(screen.getByLabelText('Remove Shard'))
      expect(screen.getByText(/remove the linked actions/i)).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: MONSTER_REMOVE_EQUIPMENT_CONFIRM_LABEL }))
      expect(formRef.current?.getValues('equipment')).toEqual([])
      expect(formRef.current?.getValues('actions')).toEqual([])
    })

    it('only removes the targeted entryId when two stacks share an equipment id', async () => {
      const dagger = pickEquipment('dagger')
      const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
      const user = userEvent.setup()
      render(
        <Host
          formRef={formRef}
          defaultValues={{
            ...resolveMonsterCreateDefaultValues(),
            equipment: [
              { entryId: 'stack-a', equipmentId: dagger.id, quantity: 1, customName: 'A' },
              { entryId: 'stack-b', equipmentId: dagger.id, quantity: 1 },
            ],
          }}
        />,
      )

      await user.click(screen.getByLabelText('Remove A'))
      await user.click(screen.getByRole('button', { name: MONSTER_REMOVE_EQUIPMENT_CONFIRM_LABEL }))
      expect(formRef.current?.getValues('equipment')).toEqual([
        { entryId: 'stack-b', equipmentId: dagger.id, quantity: 1 },
      ])
    })

    it('confirms cleanup from fresh values when the row is gone but the dialog stays open', async () => {
      const dagger = pickEquipment('dagger')
      const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
      const user = userEvent.setup()
      render(
        <Host
          formRef={formRef}
          defaultValues={{
            ...resolveMonsterCreateDefaultValues(),
            equipment: [{ entryId: 'stack', equipmentId: dagger.id, quantity: 1 }],
            actions: [{ id: 'stab', kind: 'weapon', equipmentEntryId: 'stack', name: 'Stab' }],
          }}
        />,
      )

      await user.click(screen.getByLabelText('Remove Dagger'))
      act(() => {
        formRef.current?.setValue('equipment', [], { shouldDirty: true })
      })
      await user.click(screen.getByRole('button', { name: 'Remove weapon and action' }))
      expect(formRef.current?.getValues('actions')).toEqual([])
    })
  })
})
