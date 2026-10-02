import { describe, expect, it } from 'vitest'

import { selectClassPackage, type CharacterBuildContext } from '@rpg/contracts'

import {
  equipmentStepBardClassFixture,
  equipmentStepCatalogFixture,
  equipmentStepContextFixture,
} from '@/features/character/lib/equipment/equipment-step.fixtures'

import {
  buildQuickNpcPackageCustomizationRows,
  formatQuickNpcEffectivePackageDescription,
  quickNpcPackageDraftIsDirty,
  removeQuickNpcPackageDraftEntry,
  resolveQuickNpcEffectiveClassPackage,
  restoreQuickNpcPackageDraftEntry,
  setQuickNpcPackageDraftQuantity,
} from './quick-npc-package-customization.lib'
import { resolveQuickNpcSetupChangeAuthoringState } from './quick-npc-setup-change.lib'

const option = equipmentStepBardClassFixture.characterCreation!.startingEquipment!.options[0]!

describe('quick NPC package customization', () => {
  it('removes and restores a singleton and clamps a stack back to the authored quantity', () => {
    const rows = buildQuickNpcPackageCustomizationRows({
      option,
      orderedItems: [
        {
          kind: 'grant',
          equipmentSlug: 'leather-armor',
          equipmentId: 'leather-armor',
          quantity: 1,
          isMissing: false,
          isUnavailable: false,
        },
        { kind: 'choice', choose: 1, poolLabel: 'Musical instrument', isUnavailable: false },
      ],
      entryQuantities: {},
    })

    expect(rows.map((row) => row.kind)).toEqual(['singleton', 'singleton'])

    const removed = removeQuickNpcPackageDraftEntry({
      entryId: 'leather-armor',
      packageQuantity: 1,
      entryQuantities: {},
    })
    expect(removed).toEqual({ 'leather-armor': 0 })
    expect(
      restoreQuickNpcPackageDraftEntry({
        entryId: 'leather-armor',
        entryQuantities: removed,
      }),
    ).toEqual({})

    const reduced = setQuickNpcPackageDraftQuantity({
      entryId: 'javelin',
      packageQuantity: 8,
      quantity: 6,
      entryQuantities: {},
    })
    expect(reduced).toEqual({ javelin: 6 })
    expect(
      setQuickNpcPackageDraftQuantity({
        entryId: 'javelin',
        packageQuantity: 8,
        quantity: 0,
        entryQuantities: reduced,
      }),
    ).toEqual({ javelin: 0 })
    expect(
      setQuickNpcPackageDraftQuantity({
        entryId: 'javelin',
        packageQuantity: 8,
        quantity: 8,
        entryQuantities: { javelin: 0 },
      }),
    ).toEqual({})
    expect(quickNpcPackageDraftIsDirty({ javelin: 6 }, {})).toBe(true)
    expect(quickNpcPackageDraftIsDirty({}, {})).toBe(false)
  })

  it('describes retained quantities and the all-removed package', () => {
    expect(
      formatQuickNpcEffectivePackageDescription({
        option,
        orderedItems: [
          {
            kind: 'grant',
            equipmentSlug: 'leather-armor',
            equipmentId: 'leather-armor',
            quantity: 1,
            isMissing: false,
            isUnavailable: false,
            equipment: { name: 'Leather Armor' } as never,
          },
        ],
        entryQuantities: {},
      }),
    ).toContain('Leather Armor')

    expect(
      formatQuickNpcEffectivePackageDescription({
        option: { ...option, wealth: undefined },
        orderedItems: [
          {
            kind: 'grant',
            equipmentSlug: 'leather-armor',
            equipmentId: 'leather-armor',
            quantity: 1,
            isMissing: false,
            isUnavailable: false,
          },
        ],
        entryQuantities: { 'leather-armor': 0, 'musical-instrument-choice': 0 },
      }),
    ).toBe('No items kept from this package.')
  })

  it('keeps an explicit package across a role change and resets it on a class change', () => {
    const context = {
      ...equipmentStepContextFixture,
      catalog: equipmentStepCatalogFixture,
    } as CharacterBuildContext
    const explicit = selectClassPackage('standard-equipment', 'explicit')
    const previous = { templateId: 'guard', classId: equipmentStepBardClassFixture.id, level: 1 }
    const preserved = resolveQuickNpcSetupChangeAuthoringState({
      classPackage: explicit,
      overrides: {},
      equipmentSelections: [],
      previous,
      next: { ...previous, templateId: 'scout', rulesetId: context.rulesetId },
      context,
    })
    expect(preserved.classPackage).toMatchObject({
      state: 'selected',
      packageId: 'standard-equipment',
      intent: 'explicit',
    })

    const reset = resolveQuickNpcSetupChangeAuthoringState({
      classPackage: explicit,
      overrides: {},
      equipmentSelections: [],
      previous,
      next: {
        templateId: 'guard',
        classId: 'srd-cc-5.2.1:wizard',
        level: 1,
        rulesetId: context.rulesetId,
      },
      context,
    })
    expect(reset.classPackage).toEqual({ state: 'unresolved' })
  })

  it('shows the automatic package until the form records an explicit choice', () => {
    const context = {
      ...equipmentStepContextFixture,
      catalog: equipmentStepCatalogFixture,
    } as CharacterBuildContext
    const draft = {
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {},
      equipment: {
        mode: 'package' as const,
        purchases: [],
        editedSincePackageSelection: false,
        classPackage: selectClassPackage('standard-equipment', 'automatic'),
      },
    }
    expect(
      resolveQuickNpcEffectiveClassPackage({
        formChoice: { state: 'unresolved' },
        draft: draft as never,
        setup: {
          contextKind: 'standalone',
          speciesId: '',
          classId: equipmentStepBardClassFixture.id,
          level: 1,
        },
        context,
      }).state,
    ).toBe('selected')
  })
})
