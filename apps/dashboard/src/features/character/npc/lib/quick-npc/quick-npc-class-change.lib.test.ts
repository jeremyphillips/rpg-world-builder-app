import { describe, expect, it } from 'vitest'

import {
  buildChoiceSetId,
  nestedStartingEquipmentChoiceSetId,
  toEquipmentContentId,
} from '@rpg/contracts'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '@/features/character/lib/fixtures/character-builder-fixtures'
import { pickEquipment } from '@/test/fixtures/pick'

import { resolveQuickNpcClassChangeAuthoringState } from './quick-npc-class-change.lib'
import { resolveQuickNpcSetupChangeAuthoringState } from './quick-npc-setup-change.lib'

const RULESET = 'srd-cc-5.2.1' as const
const FIGHTER_ID = `${RULESET}:fighter`
const WIZARD_ID = `${RULESET}:wizard`

describe('resolveQuickNpcClassChangeAuthoringState', () => {
  it('drops the previous class package and nested pools and keeps manual equipment', () => {
    const fighterPackageId = buildChoiceSetId('class', FIGHTER_ID, 'starting-equipment')
    const nestedPoolId = nestedStartingEquipmentChoiceSetId(FIGHTER_ID, 'heavy-armor', 0)
    const heritageId = buildChoiceSetId('species', `${RULESET}:human`, 'heritage')

    const next = resolveQuickNpcClassChangeAuthoringState({
      overrides: {
        [fighterPackageId]: ['heavy-armor'],
        [nestedPoolId]: [`${RULESET}:javelin`],
        [heritageId]: [`${RULESET}:heritage`],
      },
      equipmentSelections: [
        {
          equipmentId: toEquipmentContentId(RULESET, 'spear'),
          quantity: 1,
          origin: 'role-default',
        },
        { equipmentId: toEquipmentContentId(RULESET, 'rope'), quantity: 1, origin: 'manual' },
      ],
      previous: { templateId: 'guard', classId: FIGHTER_ID, level: 1 },
      next: {
        templateId: 'guard',
        classId: WIZARD_ID,
        level: 1,
        rulesetId: RULESET,
      },
    })

    expect(next.startingChoiceOverrides).toEqual({
      [heritageId]: [`${RULESET}:heritage`],
    })
    expect(next.equipmentSelections).toEqual([
      { equipmentId: toEquipmentContentId(RULESET, 'rope'), quantity: 1, origin: 'manual' },
    ])
  })

  it('drops a manual item that is not in the next catalog and keeps a valid one', () => {
    const rope = pickEquipment('rope')
    const context = createCampaignNpcBuilderContextFixture({
      catalog: {
        ...populatedBuilderCatalog,
        equipment: [rope],
      },
    })

    const next = resolveQuickNpcSetupChangeAuthoringState({
      classPackage: { state: 'unresolved' },
      overrides: {},
      equipmentSelections: [
        { equipmentId: rope.id, quantity: 2, origin: 'manual' },
        { equipmentId: toEquipmentContentId(RULESET, 'missing'), quantity: 1, origin: 'manual' },
      ],
      previous: { classId: FIGHTER_ID, level: 1 },
      next: { classId: WIZARD_ID, level: 1, rulesetId: RULESET },
      context,
    })

    expect(next.classPackage).toEqual({ state: 'unresolved' })
    expect(next.equipmentSelections).toEqual([
      { equipmentId: rope.id, quantity: 2, origin: 'manual' },
    ])
  })
})
