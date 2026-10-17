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
import {
  MONSTER_EQUIPMENT_EMPTY_MESSAGE,
  MONSTER_EQUIPMENT_PROFICIENCY_RECOMMENDATIONS_SOURCE,
  MONSTER_REMOVE_EQUIPMENT_CONFIRM_LABEL,
} from '../../lib/monster-form-labels'
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

  it('shows Not proficient and an equipped toggle when the weapon is not granted', () => {
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
    expect(screen.queryByText('Equipped')).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Equipped: Greataxe' })).toBeChecked()
  })

  it('omits Not proficient when the creature has martial weapon proficiency', () => {
    const greataxe = pickEquipment('greataxe')
    render(
      <Host
        catalogEquipment={[greataxe]}
        defaultValues={{
          ...resolveMonsterCreateDefaultValues(),
          weaponProficiencyMode: 'categories',
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

  describe('Unmodified supporting metadata', () => {
    it('does not show Unmodified for a lone plain stack', () => {
      const battleaxe = pickEquipment('battleaxe')
      render(
        <Host
          catalogEquipment={[battleaxe]}
          defaultValues={{
            ...resolveMonsterCreateDefaultValues(),
            weaponProficiencyMode: 'categories',
            proficiencies: {
              ...resolveMonsterCreateDefaultValues().proficiencies,
              weapons: { categories: ['martial'], items: [] },
            },
            equipment: [{ entryId: 'plain', equipmentId: battleaxe.id, quantity: 1 }],
          }}
        />,
      )

      expect(screen.getByText('1d8 slashing')).toBeInTheDocument()
      expect(screen.queryByText('Unmodified')).not.toBeInTheDocument()
    })

    it('prepends Unmodified on the plain sibling before calculated weapon metadata', () => {
      const battleaxe = pickEquipment('battleaxe')
      render(
        <Host
          catalogEquipment={[battleaxe]}
          defaultValues={{
            ...resolveMonsterCreateDefaultValues(),
            weaponProficiencyMode: 'categories',
            proficiencies: {
              ...resolveMonsterCreateDefaultValues().proficiencies,
              weapons: { categories: ['martial'], items: [] },
            },
            equipment: [
              { entryId: 'plain', equipmentId: battleaxe.id, quantity: 1, equipped: true },
              { entryId: 'plus', equipmentId: battleaxe.id, quantity: 1, magical: true },
            ],
          }}
        />,
      )

      expect(screen.getAllByText('Unmodified')).toHaveLength(1)
      expect(screen.getAllByText('1d8 slashing').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByRole('checkbox', { name: 'Equipped: Battleaxe' })).toHaveLength(2)
    })

    it('does not label a mechanically adjusted stack Unmodified', () => {
      const battleaxe = pickEquipment('battleaxe')
      render(
        <Host
          catalogEquipment={[battleaxe]}
          defaultValues={{
            ...resolveMonsterCreateDefaultValues(),
            weaponProficiencyMode: 'categories',
            proficiencies: {
              ...resolveMonsterCreateDefaultValues().proficiencies,
              weapons: { categories: ['martial'], items: [] },
            },
            equipment: [
              { entryId: 'plain', equipmentId: battleaxe.id, quantity: 1 },
              {
                entryId: 'adj',
                equipmentId: battleaxe.id,
                quantity: 1,
                adjustments: [{ effectId: 'manual', target: 'attack_roll' as const, bonus: 1 }],
              },
            ],
          }}
        />,
      )

      expect(screen.getByText('Unmodified')).toBeInTheDocument()
      const rows = screen.getAllByText('1d8 slashing')
      expect(rows.length).toBeGreaterThanOrEqual(1)
    })

    it('removes Unmodified when the configured sibling is deleted', async () => {
      const dagger = pickEquipment('dagger')
      const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
      render(
        <Host
          formRef={formRef}
          catalogEquipment={[dagger]}
          defaultValues={{
            ...resolveMonsterCreateDefaultValues(),
            equipment: [
              { entryId: 'plain', equipmentId: dagger.id, quantity: 1 },
              { entryId: 'mag', equipmentId: dagger.id, quantity: 1, magical: true },
            ],
          }}
        />,
      )

      expect(screen.getByText('Unmodified')).toBeInTheDocument()
      act(() => {
        formRef.current?.setValue(
          'equipment',
          [{ entryId: 'plain', equipmentId: dagger.id, quantity: 1 }],
          { shouldDirty: true },
        )
      })
      expect(screen.queryByText('Unmodified')).not.toBeInTheDocument()
    })

    it('does not qualify plain stacks when only a different equipment id is configured', () => {
      const dagger = pickEquipment('dagger')
      const shortsword = pickEquipment('shortsword')
      render(
        <Host
          catalogEquipment={[dagger, shortsword]}
          defaultValues={{
            ...resolveMonsterCreateDefaultValues(),
            equipment: [
              { entryId: 'plain', equipmentId: dagger.id, quantity: 1 },
              { entryId: 'other', equipmentId: shortsword.id, quantity: 1, magical: true },
            ],
          }}
        />,
      )

      expect(screen.queryByText('Unmodified')).not.toBeInTheDocument()
    })
  })

  it('recalculates damage and to-hit from unsaved strength', () => {
    const greataxe = pickEquipment('greataxe')
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    const defaults = resolveMonsterCreateDefaultValues()
    render(
      <Host
        formRef={formRef}
        catalogEquipment={[greataxe]}
        defaultValues={{
          ...defaults,
          challengeRating: '0',
          abilityScores: { ...defaults.abilityScores, str: 16 },
          weaponProficiencyMode: 'categories',
          proficiencies: {
            ...defaults.proficiencies,
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

    expect(screen.getByText('1d12+3 slashing')).toBeInTheDocument()
    expect(screen.getByText('+5 to hit')).toBeInTheDocument()

    act(() => {
      formRef.current?.setValue('abilityScores.str', 10, { shouldDirty: true })
    })

    expect(screen.getByText('1d12 slashing')).toBeInTheDocument()
    expect(screen.getByText('+2 to hit')).toBeInTheDocument()
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
      formRef.current?.setValue('weaponProficiencyMode', 'categories', { shouldDirty: true })
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

    expect(screen.queryByText(MONSTER_EQUIPMENT_EMPTY_MESSAGE)).not.toBeInTheDocument()
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

  it('toggles equipped through updateEquipment and marks equipment dirty', async () => {
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
              entryId: 'd1',
              equipmentId: dagger.id,
              quantity: 2,
              equipped: true,
              customName: 'Shard',
            },
          ],
        }}
      />,
    )

    act(() => {
      formRef.current?.setValue('name', 'Edited', { shouldDirty: true })
    })

    const toggle = screen.getByRole('checkbox', { name: 'Equipped: Shard' })
    await user.click(toggle)

    expect(formRef.current?.getValues('equipment')).toEqual([
      {
        entryId: 'd1',
        equipmentId: dagger.id,
        quantity: 2,
        equipped: false,
        customName: 'Shard',
      },
    ])
    expect(formRef.current?.getFieldState('equipment').isDirty).toBe(true)
    expect(formRef.current?.getFieldState('name').isDirty).toBe(true)
  })

  it('keeps inline toggle state after customize cancel', async () => {
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
              equipped: false,
            },
          ],
        }}
      />,
    )

    await user.click(screen.getByRole('checkbox', { name: 'Equipped: Dagger' }))
    expect(formRef.current?.getValues('equipment.0.equipped')).toBe(true)

    await user.click(screen.getByLabelText('Customize Dagger'))
    await user.click(screen.getByRole('switch', { name: /magical/i }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('heading', { name: 'Discard changes?' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Discard' }))

    expect(formRef.current?.getValues('equipment')).toEqual([
      {
        entryId: 'stack',
        equipmentId: dagger.id,
        quantity: 1,
        equipped: true,
      },
    ])
    expect(formRef.current?.getFieldState('equipment').isDirty).toBe(true)
  })

  it('activates equipped toggle with Space', async () => {
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
              entryId: 'd1',
              equipmentId: dagger.id,
              quantity: 1,
              equipped: false,
            },
          ],
        }}
      />,
    )

    const toggle = screen.getByRole('checkbox', { name: 'Equipped: Dagger' })
    toggle.focus()
    await user.keyboard(' ')
    expect(formRef.current?.getValues('equipment.0.equipped')).toBe(true)
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

  describe('equipment proficiency recommendations', () => {
    it('shows empty-state copy without instructional text', () => {
      render(
        <Host
          defaultValues={{
            ...resolveMonsterCreateDefaultValues(),
          }}
        />,
      )
      expect(screen.getByText(MONSTER_EQUIPMENT_EMPTY_MESSAGE)).toBeInTheDocument()
      expect(screen.queryByText(/Add weapons, armor, or gear/i)).not.toBeInTheDocument()
    })

    it('shows recommendations for missing specific weapon proficiencies', () => {
      const dagger = pickEquipment('dagger')
      const shortsword = pickEquipment('shortsword')
      render(
        <Host
          catalogEquipment={[dagger, shortsword]}
          defaultValues={{
            ...resolveMonsterCreateDefaultValues(),
            proficiencies: {
              ...resolveMonsterCreateDefaultValues().proficiencies,
              weapons: { categories: [], items: [dagger.id, shortsword.id] },
            },
          }}
        />,
      )

      expect(
        screen.getByText(MONSTER_EQUIPMENT_PROFICIENCY_RECOMMENDATIONS_SOURCE),
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Add Dagger' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Add Shortsword' })).toBeInTheDocument()
    })

    it('does not recommend weapons when category proficiency mode is active', () => {
      const greataxe = pickEquipment('greataxe')
      render(
        <Host
          catalogEquipment={[greataxe]}
          defaultValues={{
            ...resolveMonsterCreateDefaultValues(),
            weaponProficiencyMode: 'categories',
            proficiencies: {
              ...resolveMonsterCreateDefaultValues().proficiencies,
              weapons: { categories: ['martial'], items: [greataxe.id] },
            },
          }}
        />,
      )

      expect(
        screen.queryByText(MONSTER_EQUIPMENT_PROFICIENCY_RECOMMENDATIONS_SOURCE),
      ).not.toBeInTheDocument()
    })

    it('shows bulk add when three or more recommendations are available', () => {
      const dagger = pickEquipment('dagger')
      const shortsword = pickEquipment('shortsword')
      const shortbow = pickEquipment('shortbow')
      render(
        <Host
          catalogEquipment={[dagger, shortsword, shortbow]}
          defaultValues={{
            ...resolveMonsterCreateDefaultValues(),
            proficiencies: {
              ...resolveMonsterCreateDefaultValues().proficiencies,
              weapons: { categories: [], items: [dagger.id, shortsword.id, shortbow.id] },
            },
          }}
        />,
      )

      expect(
        screen.getByRole('button', { name: 'Add all 3 recommended weapons' }),
      ).toBeInTheDocument()
    })

    it('adds all recommended weapons in one update', async () => {
      const dagger = pickEquipment('dagger')
      const shortsword = pickEquipment('shortsword')
      const shortbow = pickEquipment('shortbow')
      const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
      const user = userEvent.setup()
      render(
        <Host
          formRef={formRef}
          catalogEquipment={[dagger, shortsword, shortbow]}
          defaultValues={{
            ...resolveMonsterCreateDefaultValues(),
            proficiencies: {
              ...resolveMonsterCreateDefaultValues().proficiencies,
              weapons: { categories: [], items: [dagger.id, shortsword.id, shortbow.id] },
            },
          }}
        />,
      )

      await user.click(screen.getByRole('button', { name: 'Add all 3 recommended weapons' }))
      expect(formRef.current?.getValues('equipment')).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ equipmentId: dagger.id, quantity: 1, equipped: false }),
          expect.objectContaining({ equipmentId: shortsword.id, quantity: 1, equipped: false }),
          expect.objectContaining({ equipmentId: shortbow.id, quantity: 1, equipped: false }),
        ]),
      )
      expect(formRef.current?.getValues('equipment')).toHaveLength(3)
      expect(
        screen.queryByText(MONSTER_EQUIPMENT_PROFICIENCY_RECOMMENDATIONS_SOURCE),
      ).not.toBeInTheDocument()
    })

    it('adds one unequipped item and leaves other recommendations visible', async () => {
      const dagger = pickEquipment('dagger')
      const shortsword = pickEquipment('shortsword')
      const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
      const user = userEvent.setup()
      render(
        <Host
          formRef={formRef}
          catalogEquipment={[dagger, shortsword]}
          defaultValues={{
            ...resolveMonsterCreateDefaultValues(),
            proficiencies: {
              ...resolveMonsterCreateDefaultValues().proficiencies,
              weapons: { categories: [], items: [dagger.id, shortsword.id] },
            },
          }}
        />,
      )

      await user.click(screen.getByRole('button', { name: 'Add Dagger' }))
      expect(formRef.current?.getValues('equipment')).toEqual([
        expect.objectContaining({
          equipmentId: dagger.id,
          quantity: 1,
          equipped: false,
        }),
      ])
      expect(screen.queryByRole('button', { name: 'Add Dagger' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Add Shortsword' })).toBeInTheDocument()
    })

    it('restores a recommendation after the added weapon is removed', async () => {
      const dagger = pickEquipment('dagger')
      const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
      const user = userEvent.setup()
      render(
        <Host
          formRef={formRef}
          catalogEquipment={[dagger]}
          defaultValues={{
            ...resolveMonsterCreateDefaultValues(),
            proficiencies: {
              ...resolveMonsterCreateDefaultValues().proficiencies,
              weapons: { categories: [], items: [dagger.id] },
            },
          }}
        />,
      )

      await user.click(screen.getByRole('button', { name: 'Add Dagger' }))
      const entryId = formRef.current?.getValues('equipment')[0]?.entryId
      expect(entryId).toBeDefined()

      await user.click(screen.getByLabelText('Remove Dagger'))
      act(() => {
        formRef.current?.setValue('equipment', [], { shouldDirty: true })
      })

      expect(screen.getByRole('button', { name: 'Add Dagger' })).toBeInTheDocument()
    })

    it('suppresses recommendations when a magical copy is already owned', () => {
      const dagger = pickEquipment('dagger')
      render(
        <Host
          catalogEquipment={[dagger]}
          defaultValues={{
            ...resolveMonsterCreateDefaultValues(),
            proficiencies: {
              ...resolveMonsterCreateDefaultValues().proficiencies,
              weapons: { categories: [], items: [dagger.id] },
            },
            equipment: [
              {
                entryId: 'magical',
                equipmentId: dagger.id,
                quantity: 1,
                equipped: false,
                magical: true,
              },
            ],
          }}
        />,
      )

      expect(
        screen.queryByText(MONSTER_EQUIPMENT_PROFICIENCY_RECOMMENDATIONS_SOURCE),
      ).not.toBeInTheDocument()
    })
  })
})
