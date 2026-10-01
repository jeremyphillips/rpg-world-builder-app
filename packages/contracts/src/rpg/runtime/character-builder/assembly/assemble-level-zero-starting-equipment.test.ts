import { describe, expect, it } from 'vitest'

import { resolveLevelZeroNpcWealthTiers } from '../../../campaign/patches/campaign-level-zero-npcs-patch'
import type { Equipment } from '../../../content/equipment'
import { toEquipmentContentId } from '../../creature/equipment'
import { fillChoiceSetWithConstraintAwareSelection } from '../automatic/automatic-npc-build-constraint-selection'
import type { CharacterBuildCatalogIndex } from '../context'
import { createCharacterBuildContext } from '../test-fixtures'
import type { ChoiceSet } from '../choice-set'
import { createEmptyCharacterBuilderDraft } from '../draft/draft'
import { assembleLevelZeroStartingEquipment } from './assemble-level-zero-starting-equipment'

const RULESET = 'srd-cc-5.2.1' as const

function equipmentStub(slug: string): Equipment {
  const id = toEquipmentContentId(RULESET, slug)
  return { id, kind: 'weapon' } as Equipment
}

function catalogWith(slugs: readonly string[]): CharacterBuildCatalogIndex {
  const equipment = new Map(
    slugs.map((slug) => [toEquipmentContentId(RULESET, slug), equipmentStub(slug)]),
  )
  return { equipment } as unknown as CharacterBuildCatalogIndex
}

describe('assembleLevelZeroStartingEquipment', () => {
  const wealthTiers = resolveLevelZeroNpcWealthTiers()

  it('gives a templateless classless NPC the modest purse and no kit', () => {
    const assembled = assembleLevelZeroStartingEquipment(createEmptyCharacterBuilderDraft(), {
      rulesetId: RULESET,
      levelZeroRules: { wealthTiers },
      catalogIndex: catalogWith([]),
    })
    expect(assembled.wealth.gp).toBe(10)
    expect(assembled.equipment.weapons).toEqual([])
  })

  it('uses the role wealth tier and records kit provenance', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      npcTemplateId: 'commoner' as const,
    }
    const assembled = assembleLevelZeroStartingEquipment(draft, {
      rulesetId: RULESET,
      levelZeroRules: { wealthTiers },
      catalogIndex: catalogWith(['club']),
    })
    expect(assembled.wealth.gp).toBe(1)
    expect(assembled.equipment.weapons).toEqual([
      {
        equipmentId: toEquipmentContentId(RULESET, 'club'),
        quantity: 1,
        sources: [{ kind: 'npcTemplate', sourceId: 'commoner', grantId: 'kit' }],
      },
    ])
  })

  it('uses merchant comfortable wealth and keeps a campaign override', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      npcTemplateId: 'merchant' as const,
    }
    const comfortable = resolveLevelZeroNpcWealthTiers({ comfortable: { gp: 40 } })
    const assembled = assembleLevelZeroStartingEquipment(draft, {
      rulesetId: RULESET,
      levelZeroRules: { wealthTiers: comfortable },
      catalogIndex: catalogWith([]),
    })
    expect(assembled.wealth.gp).toBe(40)
  })
})

describe('fillChoiceSetWithConstraintAwareSelection held skills', () => {
  it('skips a skill the character already holds and takes the next preference', () => {
    const choiceSet: ChoiceSet = {
      id: 'npcTemplate:guard:skills',
      sourceType: 'npcTemplate',
      sourceId: 'guard',
      choiceType: 'skillProficiency',
      label: 'Skills',
      min: 1,
      max: 1,
      required: true,
      options: [
        { id: 'srd-cc-5.2.1:athletics', label: 'Athletics' },
        { id: 'srd-cc-5.2.1:perception', label: 'Perception' },
      ],
    }
    const filled = fillChoiceSetWithConstraintAwareSelection({
      draft: createEmptyCharacterBuilderDraft(),
      choiceSet,
      constraints: undefined,
      preferences: {
        skills: [
          { id: 'athletics', sources: [] },
          { id: 'perception', sources: [] },
        ],
      },
      heldKeys: new Set(['athletics']),
      characterClass: undefined,
      catalogIndex: {} as unknown as CharacterBuildCatalogIndex,
      context: createCharacterBuildContext(),
    })
    expect(filled?.draft.choiceSelections[choiceSet.id]).toEqual(['srd-cc-5.2.1:perception'])
  })
})
