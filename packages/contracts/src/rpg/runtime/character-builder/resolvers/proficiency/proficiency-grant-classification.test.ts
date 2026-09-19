import { describe, expect, it } from 'vitest'

import type { CharacterSelectionSource } from '../../../character/sheet/selection-sources'
import {
  isChoiceDerivedProficiencyGrant,
  isFixedProficiencyGrant,
} from './proficiency-grant-classification'

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
