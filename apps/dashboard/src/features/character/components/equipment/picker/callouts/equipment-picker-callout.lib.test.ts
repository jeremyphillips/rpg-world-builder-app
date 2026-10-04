import { describe, expect, it } from 'vitest'

import {
  grantedByLabel,
  OPTION_PRESENTATION_AVAILABLE_IN_STARTING_OPTION_LABEL,
  OPTION_PRESENTATION_COMMON_FOR_CLASS_LABEL,
  OPTION_PRESENTATION_IN_PACKAGE_LABEL,
  OPTION_PRESENTATION_PROFICIENT_LABEL,
  OPTION_PRESENTATION_SPELLCASTING_FOCUS_LABEL,
  OPTION_PRESENTATION_STARTING_OPTION_LABEL,
  requiredByLabel,
  resolveEquipmentNotProficientMessage,
  type ResolvedEquipmentOption,
} from '@rpg/contracts'

import {
  EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL,
  type EquipmentPickerItem,
} from '../drawer/equipment-picker-drawer.types'
import {
  equipmentPickerItemsFixture,
  equipmentResolvedFixture,
} from '../drawer/equipment-picker-drawer.fixtures'
import { resolveEquipmentOptionRowPresentation } from '../../../../lib/equipment/equipment-option-row-presentation.lib'
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

    function presentedItem(
      resolved: Partial<ResolvedEquipmentOption>,
      state: Partial<EquipmentPickerItem['state']> = {},
    ): EquipmentPickerItem {
      return badgeItem({
        ...state,
        recommendation: state.recommendation ?? {
          tier: 'neutral',
          reasons: [],
          specificity: 'exact',
        },
        resolved: equipmentResolvedFixture(resolved),
      })
    }

    it('maps presentation facts to a single badge', () => {
      const longsword = equipmentPickerItemsFixture[0]!
      expect(getEquipmentPickerCallout(longsword)?.label).toBe(OPTION_PRESENTATION_IN_PACKAGE_LABEL)

      expect(getEquipmentPickerCallout(equipmentPickerItemsFixture[2]!)).toBeUndefined()

      const required = presentedItem({
        requirements: [
          {
            requirementId: 'wizard:spellbook',
            owner: { kind: 'class', id: 'wizard' },
            rule: 'exact',
            optionSatisfies: true,
            role: 'candidate',
          },
        ],
      })
      expect(getEquipmentPickerCallout(required)?.label).toBe(requiredByLabel('Class'))

      const labeledRule = presentedItem(
        {
          requirements: [
            {
              requirementId: 'wizard:spellbook',
              owner: { kind: 'class', id: 'wizard' },
              rule: 'exact',
              optionSatisfies: true,
              role: 'candidate',
            },
          ],
        },
        {
          recommendation: {
            tier: 'essential',
            reasons: ['classRequired'],
            specificity: 'exact',
            label: 'Spellbook',
          },
        },
      )
      expect(getEquipmentPickerCallout(labeledRule)?.label).toBe(requiredByLabel('Class'))
    })

    it('shows an open pool as a starting option and keeps alternative packages on the gold path', () => {
      const openPool = presentedItem(
        {
          state: {
            choice: { inOpenPool: true, inSelectedPackage: false, inAlternativePackage: false },
          },
        },
        { isProficient: false },
      )
      expect(getEquipmentPickerCallout(openPool)?.label).toBe(
        OPTION_PRESENTATION_STARTING_OPTION_LABEL,
      )

      const alternative = presentedItem({
        state: {
          choice: { inOpenPool: false, inSelectedPackage: false, inAlternativePackage: true },
        },
      })
      expect(getEquipmentPickerCallout(alternative, { isGoldShoppingPath: true })?.label).toBe(
        OPTION_PRESENTATION_AVAILABLE_IN_STARTING_OPTION_LABEL,
      )
      expect(getEquipmentPickerCallout(alternative, { isGoldShoppingPath: false })).toBeUndefined()
    })

    it('shows Proficient with grant provenance and Recommended with sources', () => {
      const proficient = presentedItem({
        state: {
          compatibility: {
            proficient: true,
            proficiencySources: [{ kind: 'classFeature', sourceId: 'rogue', grantId: 'tools' }],
          },
        },
      })
      expect(getEquipmentPickerCallout(proficient)).toMatchObject({
        label: OPTION_PRESENTATION_PROFICIENT_LABEL,
        intent: 'compatible',
        title: grantedByLabel('Class'),
      })

      const recommended = presentedItem({
        recommendation: {
          strength: 'compatible',
          signals: [
            {
              strength: 'compatible',
              basis: 'affinity',
              specificity: 'broad_pool',
              source: { kind: 'class', id: 'bard' },
              detail: { kind: 'toolCategory', toolCategory: 'tool' },
            },
          ],
        },
      })
      expect(getEquipmentPickerCallout(recommended)?.label).toBe(
        OPTION_PRESENTATION_COMMON_FOR_CLASS_LABEL,
      )
    })

    it('shows Not proficient for unrelated tools', () => {
      const item = badgeItem({
        isProficient: false,
        isRecommended: false,
        resolved: undefined,
        recommendation: { tier: 'neutral', reasons: [], specificity: 'exact' },
      })

      expect(getEquipmentPickerCallout(item)).toEqual({
        label: resolveEquipmentNotProficientMessage('weapon'),
        intent: 'info',
        importance: 'medium',
        factKind: 'guidance',
      })
    })

    it('prefers a requirement over an open pool', () => {
      const item = presentedItem(
        {
          requirements: [
            {
              requirementId: 'wizard:spellbook',
              owner: { kind: 'class', id: 'wizard' },
              rule: 'exact',
              optionSatisfies: true,
              role: 'candidate',
            },
          ],
          state: {
            choice: { inOpenPool: true, inSelectedPackage: false, inAlternativePackage: false },
          },
        },
        { isProficient: false },
      )

      expect(getEquipmentPickerCallout(item)?.label).toBe(requiredByLabel('Class'))
    })

    it('maps leftover spellcasting focus compatibility to the focus label', () => {
      const item = presentedItem({
        state: { compatibility: { spellcastingFocusFor: { kind: 'class', id: 'wizard' } } },
      })

      expect(getEquipmentPickerCallout(item)).toMatchObject({
        label: OPTION_PRESENTATION_SPELLCASTING_FOCUS_LABEL,
        intent: 'info',
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
        label: resolveEquipmentNotProficientMessage('weapon'),
        intent: 'info',
        importance: 'medium',
        factKind: 'guidance',
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
        factKind: 'blocking',
      })
    })

    it('reads the requirement badge from the shared row projection', () => {
      const base = equipmentPickerItemsFixture[0]!
      const item: EquipmentPickerItem = {
        ...base,
        state: {
          ...base.state,
          resolved: equipmentResolvedFixture({
            requirements: [
              {
                requirementId: 'wizard:spellbook',
                owner: { kind: 'class', id: 'wizard' },
                rule: 'exact',
                optionSatisfies: true,
                role: 'candidate',
              },
            ],
          }),
        },
      }
      const presentation = resolveEquipmentOptionRowPresentation({
        identity: item.equipment.name,
        kindLabel: 'Weapon',
        resolved: item.state.resolved!,
      })
      expect(getEquipmentPickerCallout(item)?.label).toBe(
        presentation.secondaryClauses.find((clause) => clause.kind === 'requirement')?.badgeLabel,
      )
      expect(getEquipmentPickerCallout(equipmentPickerItemsFixture[1]!)?.factKind).toBe('blocking')
    })

    it('prefers a requirement badge over package state', () => {
      const item = {
        ...equipmentPickerItemsFixture[0]!,
        state: {
          ...equipmentPickerItemsFixture[0]!.state,
          resolved: equipmentResolvedFixture({
            requirements: [
              {
                requirementId: 'wizard:spellbook',
                owner: { kind: 'class', id: 'wizard' },
                rule: 'exact',
                optionSatisfies: true,
                role: 'candidate',
              },
            ],
            state: {
              choice: { inOpenPool: false, inSelectedPackage: true, inAlternativePackage: false },
            },
          }),
        },
      }

      expect(getEquipmentPickerCallout(item)?.label).toBe(requiredByLabel('Class'))
    })
  })
})
