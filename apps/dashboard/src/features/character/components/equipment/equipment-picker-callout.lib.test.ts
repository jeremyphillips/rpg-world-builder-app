import { describe, expect, it } from 'vitest'

import {
  EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL,
  EQUIPMENT_PICKER_CLASS_TOOL_LABEL,
  EQUIPMENT_PICKER_COMMON_FOR_CLASS_LABEL,
  EQUIPMENT_PICKER_ESSENTIAL_LABEL,
  EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL,
  EQUIPMENT_PICKER_PROFICIENCY_AVAILABLE_LABEL,
  EQUIPMENT_PICKER_PROFICIENT_LABEL,
  EQUIPMENT_PICKER_SPELLCASTING_FOCUS_LABEL,
  EQUIPMENT_PICKER_STANDARD_GEAR_LABEL,
  EQUIPMENT_PICKER_STARTING_OPTION_LABEL,
  type EquipmentPickerItem,
} from './equipment-picker-drawer.types'
import { equipmentPickerItemsFixture } from './equipment-picker-drawer.fixtures'
import {
  getEquipmentPickerCallout,
  selectHighestPriorityCallout,
  type EquipmentCalloutCandidate,
} from './equipment-picker-callout.lib'

describe('equipment-picker-callout.lib', () => {
  describe('selectHighestPriorityCallout', () => {
    it('returns undefined for an empty candidate list', () => {
      expect(selectHighestPriorityCallout([])).toBeUndefined()
    })

    it('picks the highest priority and keeps the first on ties', () => {
      const low: EquipmentCalloutCandidate = {
        priority: 50,
        callout: { label: 'Low', intent: 'warning', importance: 'medium' },
      }
      const high: EquipmentCalloutCandidate = {
        priority: 400,
        callout: { label: 'High', intent: 'blocking', importance: 'high' },
      }
      const tieFirst: EquipmentCalloutCandidate = {
        priority: 100,
        callout: { label: 'First', intent: 'info', importance: 'low' },
      }
      const tieSecond: EquipmentCalloutCandidate = {
        priority: 100,
        callout: { label: 'Second', intent: 'info', importance: 'low' },
      }

      expect(selectHighestPriorityCallout([low, high])).toEqual(high.callout)
      expect(selectHighestPriorityCallout([tieFirst, tieSecond])).toEqual(tieFirst.callout)
    })
  })

  describe('label registry', () => {
    function badgeItem(
      args: Partial<Omit<EquipmentPickerItem['state'], 'recommendation'>> & {
        recommendation: Pick<EquipmentPickerItem['state']['recommendation'], 'tier' | 'reasons'> &
          Partial<Pick<EquipmentPickerItem['state']['recommendation'], 'specificity' | 'label'>>
      },
    ): EquipmentPickerItem {
      const { recommendation, ...stateOverrides } = args
      const base = equipmentPickerItemsFixture[0]!
      return {
        ...base,
        state: {
          ...base.state,
          ...stateOverrides,
          recommendation: {
            ...recommendation,
            specificity: recommendation.specificity ?? 'exact',
          },
        },
      }
    }

    it('maps recommendation tiers sparsely with intent and importance', () => {
      const longsword = equipmentPickerItemsFixture[0]!
      expect(getEquipmentPickerCallout(longsword)).toEqual({
        label: EQUIPMENT_PICKER_STARTING_OPTION_LABEL,
        intent: 'recommended',
        importance: 'medium',
      })

      expect(getEquipmentPickerCallout(equipmentPickerItemsFixture[2]!)).toBeUndefined()

      const essentialTool = badgeItem({
        recommendation: { tier: 'essential', reasons: ['classToolNeed'] },
      })
      expect(getEquipmentPickerCallout(essentialTool)).toEqual({
        label: EQUIPMENT_PICKER_CLASS_TOOL_LABEL,
        intent: 'recommended',
        importance: 'high',
      })

      const essentialRule = badgeItem({
        recommendation: { tier: 'essential', reasons: ['classRequired'] },
      })
      expect(getEquipmentPickerCallout(essentialRule)).toEqual({
        label: EQUIPMENT_PICKER_ESSENTIAL_LABEL,
        intent: 'recommended',
        importance: 'high',
      })

      const labeledRule = badgeItem({
        recommendation: {
          tier: 'essential',
          reasons: ['classRequired'],
          label: 'Spellbook',
        },
      })
      expect(getEquipmentPickerCallout(labeledRule)?.label).toBe(EQUIPMENT_PICKER_ESSENTIAL_LABEL)
    })

    it('shows Proficiency available for unresolved tool proficiency pools', () => {
      const item = badgeItem({
        isProficient: false,
        isRecommended: true,
        recommendation: {
          tier: 'strong',
          reasons: ['unresolvedToolProficiencyChoice', 'notProficient'],
        },
      })

      expect(getEquipmentPickerCallout(item)).toEqual({
        label: EQUIPMENT_PICKER_PROFICIENCY_AVAILABLE_LABEL,
        intent: 'info',
        importance: 'low',
      })
    })

    it('prefers Proficiency available over Starting option and Not proficient', () => {
      const item = badgeItem({
        isProficient: false,
        isRecommended: true,
        recommendation: {
          tier: 'strong',
          reasons: ['unresolvedToolProficiencyChoice', 'startingEquipmentChoice', 'notProficient'],
        },
      })

      expect(getEquipmentPickerCallout(item)?.label).toBe(
        EQUIPMENT_PICKER_PROFICIENCY_AVAILABLE_LABEL,
      )
    })

    it('shows Proficient only for selected tool proficiency reason', () => {
      const item = badgeItem({
        isProficient: true,
        isRecommended: true,
        recommendation: { tier: 'strong', reasons: ['selectedToolProficiency'] },
      })

      expect(getEquipmentPickerCallout(item)).toEqual({
        label: EQUIPMENT_PICKER_PROFICIENT_LABEL,
        intent: 'compatible',
        importance: 'medium',
      })
    })

    it('shows Common for your class for category siblings', () => {
      const item = badgeItem({
        isProficient: false,
        isRecommended: false,
        recommendation: { tier: 'compatible', reasons: ['classToolCategory'] },
      })

      expect(getEquipmentPickerCallout(item)).toEqual({
        label: EQUIPMENT_PICKER_COMMON_FOR_CLASS_LABEL,
        intent: 'info',
        importance: 'low',
      })
    })

    it('shows Standard gear for gold-path fixed grants', () => {
      const item = badgeItem({
        isProficient: true,
        isRecommended: true,
        recommendation: { tier: 'strong', reasons: ['availableInStartingOption', 'proficient'] },
      })

      expect(getEquipmentPickerCallout(item, { isGoldShoppingPath: true })).toEqual({
        label: EQUIPMENT_PICKER_STANDARD_GEAR_LABEL,
        intent: 'info',
        importance: 'low',
      })
      expect(getEquipmentPickerCallout(item, { isGoldShoppingPath: false })).toBeUndefined()
    })

    it('shows Starting option for unresolved package pools without proficiency overlap', () => {
      const item = badgeItem({
        isProficient: true,
        isRecommended: true,
        recommendation: { tier: 'strong', reasons: ['startingEquipmentChoice', 'proficient'] },
      })

      expect(getEquipmentPickerCallout(item)?.label).toBe(EQUIPMENT_PICKER_STARTING_OPTION_LABEL)
    })

    it('leaves ordinary proficient weapons without a callout', () => {
      const item = badgeItem({
        isProficient: true,
        isRecommended: false,
        recommendation: { tier: 'compatible', reasons: ['proficient'] },
      })

      expect(getEquipmentPickerCallout(item)).toBeUndefined()
    })

    it('shows Not proficient for unrelated tools', () => {
      const item = badgeItem({
        isProficient: false,
        isRecommended: false,
        recommendation: { tier: 'notRecommended', reasons: ['notProficient'] },
      })

      expect(getEquipmentPickerCallout(item)).toEqual({
        label: EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL,
        intent: 'warning',
        importance: 'medium',
      })
    })

    it('prefers essential blockers over proficiency-state copy', () => {
      const item = badgeItem({
        isProficient: false,
        isRecommended: true,
        recommendation: {
          tier: 'essential',
          reasons: ['classToolNeed', 'unresolvedToolProficiencyChoice'],
        },
      })

      expect(getEquipmentPickerCallout(item)?.label).toBe(EQUIPMENT_PICKER_CLASS_TOOL_LABEL)
    })

    it('maps spellcasting focus to recommended medium', () => {
      const item = badgeItem({
        recommendation: { tier: 'essential', reasons: ['spellcastingFocus'] },
      })

      expect(getEquipmentPickerCallout(item)).toEqual({
        label: EQUIPMENT_PICKER_SPELLCASTING_FOCUS_LABEL,
        intent: 'recommended',
        importance: 'medium',
      })
    })
  })

  describe('visibleStatuses filter', () => {
    it('shows only not_proficient when essential would otherwise win', () => {
      const item: EquipmentPickerItem = {
        ...equipmentPickerItemsFixture[0]!,
        state: {
          ...equipmentPickerItemsFixture[0]!.state,
          isProficient: false,
          recommendation: {
            tier: 'essential',
            reasons: ['classToolNeed'],
            specificity: 'exact',
          },
        },
      }

      expect(getEquipmentPickerCallout(item, { visibleStatuses: ['not_proficient'] })).toEqual({
        label: EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL,
        intent: 'warning',
        importance: 'medium',
      })
    })
  })

  describe('priority resolution', () => {
    it('prefers affordability over proficiency caution', () => {
      const chainMail = equipmentPickerItemsFixture[1]!

      expect(getEquipmentPickerCallout(chainMail)).toEqual({
        label: EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL,
        intent: 'blocking',
        importance: 'high',
      })
    })

    it('prefers essential recommendation over general recommendation', () => {
      const item: EquipmentPickerItem = {
        ...equipmentPickerItemsFixture[0]!,
        state: {
          ...equipmentPickerItemsFixture[0]!.state,
          isProficient: false,
          recommendation: {
            tier: 'essential',
            reasons: ['classToolNeed', 'startingEquipmentChoice'],
            specificity: 'exact',
          },
        },
      }

      expect(getEquipmentPickerCallout(item)?.label).toBe(EQUIPMENT_PICKER_CLASS_TOOL_LABEL)
    })
  })
})
