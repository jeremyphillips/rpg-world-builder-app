import { describe, expect, it } from 'vitest'

import type { CharacterSelectionSource } from '../../../character/sheet/selection-sources'
import { startingEquipmentChoiceSetId } from '../equipment/resolve-starting-equipment-choice-sets'
import {
  isChoiceDerivedProficiencyGrant,
  isFixedProficiencyGrant,
} from './proficiency-grant-classification'
import {
  classifySelectionSourceMechanic,
  resolveSelectionSourceChoiceSetId,
} from './selection-source-mechanic'

describe('proficiency grant classification', () => {
  const choiceSetIds = new Set(['class:srd-cc-5.2.1:rogue:class-skills'])

  it('treats entries whose grantId matches a ChoiceSet as choice-derived', () => {
    const sources: CharacterSelectionSource[] = [
      {
        kind: 'classFeature',
        sourceId: 'srd-cc-5.2.1:rogue',
        grantId: 'class:srd-cc-5.2.1:rogue:class-skills',
      },
    ]

    expect(isChoiceDerivedProficiencyGrant(sources, choiceSetIds)).toBe(true)
    expect(isFixedProficiencyGrant(sources, choiceSetIds)).toBe(false)
  })

  it('treats class fixed grants as fixed when grantId is not a ChoiceSet id', () => {
    const sources: CharacterSelectionSource[] = [
      { kind: 'classFeature', sourceId: 'srd-cc-5.2.1:rogue', grantId: 'skill-proficiencies' },
    ]

    expect(isChoiceDerivedProficiencyGrant(sources, choiceSetIds)).toBe(false)
    expect(isFixedProficiencyGrant(sources, choiceSetIds)).toBe(true)
  })
})

describe('classifySelectionSourceMechanic', () => {
  const classId = 'srd-cc-5.2.1:fighter'
  const packageChoiceSetId = startingEquipmentChoiceSetId(classId)
  const toolChoiceSetId = 'npcTemplate:criminal:tools'
  const resolved = new Set([packageChoiceSetId, toolChoiceSetId])

  it('treats class package items as choice-derived, not fixed', () => {
    const source: CharacterSelectionSource = {
      kind: 'classStartingEquipment',
      sourceId: classId,
      grantId: 'package-a',
    }

    expect(resolveSelectionSourceChoiceSetId(source, resolved)).toBe(packageChoiceSetId)
    expect(classifySelectionSourceMechanic(source, resolved)).toBe('choice-derived')
  })

  it('treats a role-tool inventory row as choice-derived', () => {
    expect(
      classifySelectionSourceMechanic(
        { kind: 'npcTemplate', sourceId: 'criminal', grantId: toolChoiceSetId },
        resolved,
      ),
    ).toBe('choice-derived')
  })

  it('treats grant sources as constraint outcomes and starting gold as a purchase', () => {
    expect(classifySelectionSourceMechanic({ kind: 'grant' }, resolved)).toBe('constraint-outcome')
    expect(classifySelectionSourceMechanic({ kind: 'manual' }, resolved)).toBe('constraint-outcome')
    expect(
      classifySelectionSourceMechanic(
        { kind: 'startingGold', sourceId: classId, grantId: 'gold' },
        resolved,
      ),
    ).toBe('purchase')
  })

  it('keeps kit rows as fixed grants', () => {
    expect(
      classifySelectionSourceMechanic(
        { kind: 'npcTemplate', sourceId: 'guard', grantId: 'kit' },
        resolved,
      ),
    ).toBe('fixed-grant')
  })
})
