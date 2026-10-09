import { describe, expect, it } from 'vitest'

import { NEUTRAL_OPTION_RECOMMENDATION, resolveEquipmentPresentationFacts } from '@rpg/contracts'

import { pickArmor, pickWeapon } from '@/test/fixtures/pick'

import {
  fighterGoldPathPickerItemsFixture,
  wizardGoldPathPickerItemsFixture,
  type BuilderPathPickerSlug,
} from '../../components/equipment/picker/drawer/equipment-picker-builder-path.fixtures'
import type { EquipmentPickerItem } from '../../components/equipment/picker/drawer/equipment-picker-drawer.types'
import {
  resolveSelectionRowStatusItems,
  selectionBlocker,
  type SelectionRowContext,
} from '../selection-row-status'
import { resolveEquipmentSelectionRowPresentation } from './equipment-selection-row-presentation.lib'

/** `[Badge]` for badges, bare text for guidance — mirrors the rendered line. */
function rowLine(item: EquipmentPickerItem, context: SelectionRowContext = 'picker'): string {
  return resolveSelectionRowStatusItems(
    resolveEquipmentSelectionRowPresentation({
      equipment: item.equipment,
      resolved: item.state.resolved,
      purchaseAvailability: item.state.purchaseAvailability,
      isGoldShoppingPath: true,
      isProficient: item.state.isProficient,
    }),
    { context },
  )
    .map((entry) => {
      if (entry.kind === 'badge') return `[${entry.label}]`
      return 'label' in entry ? entry.label : entry.kind
    })
    .join(' · ')
}

describe('Wizard gold-path picker rows (STR 8)', () => {
  it.each<[BuilderPathPickerSlug, string]>([
    ['wand', '[Cannot afford] · Matches focus requirement'],
    ['component-pouch', 'Recommended by class'],
    ['spellbook', '[Cannot afford] · Required by class · Included in package option'],
    ['greataxe', '[Cannot afford] · [Not proficient]'],
    ['greatsword', '[Not proficient]'],
    ['dagger', 'Included in package option'],
    ['plate-armor', '[Cannot afford] · [Not proficient] · [Requires STR 15]'],
  ])('%s → %s', (slug, line) => {
    expect(rowLine(wizardGoldPathPickerItemsFixture[slug])).toBe(line)
  })

  it('names the requirement owner in the guidance title', () => {
    const items = resolveSelectionRowStatusItems(
      resolveEquipmentSelectionRowPresentation({
        equipment: wizardGoldPathPickerItemsFixture.spellbook.equipment,
        resolved: wizardGoldPathPickerItemsFixture.spellbook.state.resolved,
      }),
      { context: 'picker' },
    )
    expect(items).toContainEqual({
      kind: 'text',
      variant: 'guidance',
      label: 'Required by class',
      title: 'Wizard class',
    })
  })

  it('keeps compatibility warnings and drops guidance in the review context', () => {
    expect(rowLine(wizardGoldPathPickerItemsFixture['plate-armor'], 'review')).toBe(
      '[Not proficient] · [Requires STR 15]',
    )
    expect(rowLine(wizardGoldPathPickerItemsFixture.spellbook, 'review')).toBe('')
  })
})

describe('Fighter gold-path armor rows (STR 12)', () => {
  it.each<[BuilderPathPickerSlug, string]>([
    ['plate-armor', '[Requires STR 15]'],
    ['splint', '[Cannot afford] · [Requires STR 15]'],
    ['chain-mail', '[Cannot afford] · [Requires STR 13] · Included in package option'],
  ])('%s → %s', (slug, line) => {
    expect(rowLine(fighterGoldPathPickerItemsFixture[slug])).toBe(line)
  })
})

describe('resolveEquipmentSelectionRowPresentation', () => {
  const plateArmor = pickArmor('plate-armor')

  it('keeps an unmet requirement beside recommendation guidance', () => {
    const resolved = {
      requirements: [],
      recommendation: {
        strength: 'strong' as const,
        signals: [
          {
            strength: 'strong' as const,
            basis: 'authored' as const,
            specificity: 'exact' as const,
            source: { kind: 'class' as const, id: 'fighter' },
          },
        ],
      },
      state: {
        compatibility: {
          proficient: true,
          unmetAbilityScoreRequirements: [{ ability: 'str' as const, required: 15, actual: 12 }],
        },
      },
    }
    const presentation = resolveEquipmentSelectionRowPresentation({
      equipment: plateArmor,
      resolved: {
        ...resolved,
        presentation: resolveEquipmentPresentationFacts({ resolved, equipment: plateArmor }),
      },
    })

    expect(
      resolveSelectionRowStatusItems(presentation, { context: 'picker' }).map((item) =>
        'label' in item ? item.label : item.kind,
      ),
    ).toEqual(['Requires STR 15', 'Recommended by class'])
  })

  it('drops alternative-package guidance off the gold path', () => {
    const item = fighterGoldPathPickerItemsFixture['chain-mail']
    const presentation = resolveEquipmentSelectionRowPresentation({
      equipment: item.equipment,
      resolved: item.state.resolved,
      isGoldShoppingPath: false,
    })
    expect(presentation.guidance).toEqual([])
  })

  it('falls back to proficiency state when no facts were resolved', () => {
    const presentation = resolveEquipmentSelectionRowPresentation({
      equipment: pickWeapon('greatsword'),
      isProficient: false,
    })
    expect(presentation.status).toEqual([
      expect.objectContaining({
        reason: 'not_proficient',
        label: 'Not proficient',
        detail: 'Not proficient with this weapon',
      }),
    ])
    expect(
      resolveEquipmentSelectionRowPresentation({
        equipment: pickWeapon('greatsword'),
        resolved: { requirements: [], recommendation: NEUTRAL_OPTION_RECOMMENDATION, state: {} },
        isProficient: false,
      }).status,
    ).toEqual([])
  })

  it('dedupes the affordability overlay against a header unaffordable blocker', () => {
    const presentation = resolveEquipmentSelectionRowPresentation({
      equipment: plateArmor,
      purchaseAvailability: { status: 'unaffordable', shortfallCp: 1 },
      blockers: [selectionBlocker('unaffordable', 'Cannot afford')],
    })
    expect(
      resolveSelectionRowStatusItems(presentation, { context: 'picker' }).map((item) =>
        'label' in item ? item.label : item.kind,
      ),
    ).toEqual(['Cannot afford'])
  })

  it('prefers Exceeds starting budget when the price is above the ceiling', () => {
    const presentation = resolveEquipmentSelectionRowPresentation({
      equipment: plateArmor,
      purchaseAvailability: { status: 'unaffordable', shortfallCp: 1 },
      exceedsPurchaseBudgetCeiling: true,
    })
    expect(presentation.status.map((entry) => entry.label)).toEqual(['Exceeds starting budget'])
  })
})
