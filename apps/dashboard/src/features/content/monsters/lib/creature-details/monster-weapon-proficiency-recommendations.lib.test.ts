import { describe, expect, it } from 'vitest'
import { loadSeedEquipment } from '@rpg/catalog/equipment'
import { buildContentPurposeSelectors } from '@rpg/contracts'

import { referenceWeaponComboboxFieldOptions } from '../../../lib/form-options/content-field-option.lib'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { pickEquipment } from '@/test/fixtures/pick'
import { resolveMonsterCreateDefaultValues } from '../monster-form-values'
import type { MonsterFormValues } from '../monster-form-values'
import {
  MONSTER_WEAPON_OWNED_PROFICIENCY_RECOMMENDATIONS_SOURCE,
  formatMonsterWeaponProficiencyBulkAddAriaLabel,
} from '../monster-form-labels'
import { resolveMonsterWeaponProficiencyRecommendationGroup } from './monster-weapon-proficiency-recommendations.lib'

const catalog = loadSeedEquipment('srd-cc-5.2.1')
const itemOptions = referenceWeaponComboboxFieldOptions(buildContentPurposeSelectors(catalog))

const ctx: ContentFormCtx = {
  campaignId: 'campaign-1',
  rulesetId: 'srd-cc-5.2.1',
  skillCatalogStatus: 'ready',
  equipmentCatalogStatus: 'ready',
  equipmentCatalogById: new Map(catalog.map((row) => [row.id, row])),
  options: { equipment: buildContentPurposeSelectors(catalog) },
}

function formStub(values: MonsterFormValues) {
  const state = structuredClone(values)
  return {
    getValues: (name?: string) => {
      if (name === undefined) return state
      if (name === 'proficiencies.weapons.items') return state.proficiencies.weapons.items ?? []
      return undefined
    },
    setValue: (name: string, value: unknown) => {
      if (name === 'proficiencies.weapons.items') {
        state.proficiencies = {
          ...state.proficiencies,
          weapons: {
            ...state.proficiencies.weapons,
            items: value as string[],
          },
        }
      }
    },
  }
}

describe('resolveMonsterWeaponProficiencyRecommendationGroup', () => {
  it('returns recommendations for owned weapons missing specific proficiency', () => {
    const dagger = pickEquipment('dagger')
    const values: MonsterFormValues = {
      ...resolveMonsterCreateDefaultValues(),
      weaponProficiencyMode: 'specific',
      equipment: [{ entryId: 'w1', equipmentId: dagger.id, quantity: 1, equipped: true }],
      proficiencies: {
        ...resolveMonsterCreateDefaultValues().proficiencies,
        weapons: { categories: [], items: [] },
      },
    }

    const group = resolveMonsterWeaponProficiencyRecommendationGroup(
      values,
      ctx,
      itemOptions,
      formStub(values),
    )

    expect(group?.sourceLabel).toBe(MONSTER_WEAPON_OWNED_PROFICIENCY_RECOMMENDATIONS_SOURCE)
    expect(group?.items.some((item) => item.label === 'Dagger')).toBe(true)
  })

  it('returns null when weapon proficiency mode is not specific', () => {
    const dagger = pickEquipment('dagger')
    const values: MonsterFormValues = {
      ...resolveMonsterCreateDefaultValues(),
      weaponProficiencyMode: 'categories',
      equipment: [{ entryId: 'w1', equipmentId: dagger.id, quantity: 1 }],
      proficiencies: {
        ...resolveMonsterCreateDefaultValues().proficiencies,
        weapons: { categories: ['simple'], items: [] },
      },
    }

    expect(
      resolveMonsterWeaponProficiencyRecommendationGroup(
        values,
        ctx,
        itemOptions,
        formStub(values),
      ),
    ).toBeNull()
  })

  it('append action adds a grant id via form context', () => {
    const dagger = pickEquipment('dagger')
    const values: MonsterFormValues = {
      ...resolveMonsterCreateDefaultValues(),
      weaponProficiencyMode: 'specific',
      equipment: [{ entryId: 'w1', equipmentId: dagger.id, quantity: 1 }],
      proficiencies: {
        ...resolveMonsterCreateDefaultValues().proficiencies,
        weapons: { categories: [], items: [] },
      },
    }
    const form = formStub(values)
    const group = resolveMonsterWeaponProficiencyRecommendationGroup(values, ctx, itemOptions, form)
    const daggerItem = group?.items.find((item) => item.label === 'Dagger')
    expect(daggerItem).toBeDefined()
    daggerItem?.action.onClick()

    const grantId = itemOptions.find((option) => option.label === 'Dagger')?.value
    expect(grantId).toBeDefined()
    expect(form.getValues('proficiencies.weapons.items')).toEqual([grantId])
  })

  it('includes bulk action metadata when three or more recommendations are available', () => {
    const dagger = pickEquipment('dagger')
    const shortsword = pickEquipment('shortsword')
    const shortbow = pickEquipment('shortbow')
    const values: MonsterFormValues = {
      ...resolveMonsterCreateDefaultValues(),
      weaponProficiencyMode: 'specific',
      equipment: [
        { entryId: 'w1', equipmentId: dagger.id, quantity: 1 },
        { entryId: 'w2', equipmentId: shortsword.id, quantity: 1 },
        { entryId: 'w3', equipmentId: shortbow.id, quantity: 1 },
      ],
      proficiencies: {
        ...resolveMonsterCreateDefaultValues().proficiencies,
        weapons: { categories: [], items: [] },
      },
    }

    const group = resolveMonsterWeaponProficiencyRecommendationGroup(
      values,
      ctx,
      itemOptions,
      formStub(values),
    )

    expect(group?.bulkAction?.ariaLabel).toBe(formatMonsterWeaponProficiencyBulkAddAriaLabel(3))
  })
})
