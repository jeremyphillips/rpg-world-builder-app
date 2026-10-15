import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form'
import { createMagicPropertyDefinitionProvider } from '@rpg/catalog/magic-properties'
import { buildContentPurposeSelectors } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { pickEquipment } from '@/test/fixtures/pick'

import { mapEquipmentInstanceInventoryStatus } from '@/features/content'
import {
  resolveEquipmentInstanceSummary,
  resolveEquipmentNotProficientShortLabel,
} from '@rpg/contracts'
import { EQUIPMENT_CATALOG_REFERENCE_UNAVAILABLE_MESSAGE } from '@/features/content'
import { MONSTER_REMOVE_EQUIPMENT_CONFIRM_LABEL } from '../../lib/monster-form-labels'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { MonsterEquipmentPanel } from './monster-equipment-panel'

function Host({
  defaultValues,
  formRef,
  catalogEquipment = [pickEquipment('dagger')],
}: {
  defaultValues: MonsterFormValues
  formRef?: { current: UseFormReturn<MonsterFormValues> | null }
  catalogEquipment?: ReturnType<typeof pickEquipment>[]
}) {
  const form = useForm<MonsterFormValues>({ defaultValues })
  if (formRef) formRef.current = form
  const equipmentCatalogById = new Map(catalogEquipment.map((item) => [item.id, item]))
  return (
    <FormProvider {...form}>
      <MonsterEquipmentPanel
        ctx={{
          equipmentCatalogStatus: 'ready',
          equipmentCatalogById,
          rulesetId: 'srd-cc-5.2.1',
          options: {
            equipment: buildContentPurposeSelectors(catalogEquipment),
          },
        }}
      />
    </FormProvider>
  )
}

describe('MonsterEquipmentPanel', () => {
  it('shows unavailable status and hides customize when the catalog row is missing', async () => {
    render(
      <Host
        defaultValues={{
          ...resolveMonsterCreateDefaultValues(),
          equipment: [
            {
              entryId: 'gone',
              equipmentId: 'removed-from-catalog',
              quantity: 1,
            },
          ],
        }}
      />,
    )

    expect(screen.getByText(EQUIPMENT_CATALOG_REFERENCE_UNAVAILABLE_MESSAGE)).toBeInTheDocument()
    expect(screen.queryByText(resolveEquipmentNotProficientShortLabel())).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Customize/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Remove removed-from-catalog')).toBeInTheDocument()
  })

  it('shows Not proficient before Equipped when the weapon is not granted', () => {
    const greataxe = pickEquipment('greataxe')
    render(
      <Host
        catalogEquipment={[greataxe]}
        defaultValues={{
          ...resolveMonsterCreateDefaultValues(),
          equipment: [
            {
              entryId: 'g1',
              equipmentId: greataxe.id,
              quantity: 1,
              equipped: true,
            },
          ],
        }}
      />,
    )

    expect(screen.getByText(resolveEquipmentNotProficientShortLabel())).toBeInTheDocument()
    expect(screen.getByText('Equipped')).toBeInTheDocument()
  })

  it('omits Not proficient when the creature has martial weapon proficiency', () => {
    const greataxe = pickEquipment('greataxe')
    render(
      <Host
        catalogEquipment={[greataxe]}
        defaultValues={{
          ...resolveMonsterCreateDefaultValues(),
          proficiencies: {
            ...resolveMonsterCreateDefaultValues().proficiencies,
            weapons: { categories: ['martial'], items: [] },
          },
          equipment: [
            {
              entryId: 'g1',
              equipmentId: greataxe.id,
              quantity: 1,
              equipped: true,
            },
          ],
        }}
      />,
    )

    expect(screen.queryByText(resolveEquipmentNotProficientShortLabel())).not.toBeInTheDocument()
  })

  it('updates inventory and picker badges when weapon proficiencies change', async () => {
    const greataxe = pickEquipment('greataxe')
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    const user = userEvent.setup()
    render(
      <Host
        formRef={formRef}
        catalogEquipment={[greataxe]}
        defaultValues={{
          ...resolveMonsterCreateDefaultValues(),
          equipment: [
            {
              entryId: 'g1',
              equipmentId: greataxe.id,
              quantity: 1,
            },
          ],
        }}
      />,
    )

    expect(screen.getByText(resolveEquipmentNotProficientShortLabel())).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /add equipment/i }))
    expect(screen.getAllByText(resolveEquipmentNotProficientShortLabel()).length).toBeGreaterThan(1)

    act(() => {
      formRef.current?.setValue(
        'proficiencies.weapons',
        { categories: ['martial'], items: [] },
        { shouldDirty: true },
      )
    })

    expect(screen.queryByText(resolveEquipmentNotProficientShortLabel())).not.toBeInTheDocument()
  })

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
    await user.click(screen.getByRole('switch', { name: /magical/i }))
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
