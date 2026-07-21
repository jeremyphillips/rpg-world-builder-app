import { describe, expect, it } from 'vitest'

import { builderTestContext } from './test-fixtures'
import { createEmptyCharacterBuilderDraft } from './draft'
import {
  getBuilderSelectedStartingLevel,
  getCharacterBuilderTotalLevel,
  resolveBuilderLevelConstraints,
  validateBuilderCharacterLevel,
} from './builder-level'

describe('builder level helpers', () => {
  it('returns draft class level for total and selected starting level', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:fighter', level: 5 },
    }

    expect(getCharacterBuilderTotalLevel(draft)).toBe(5)
    expect(getBuilderSelectedStartingLevel(draft)).toBe(5)
  })

  it('allows selectable levels for standalone PC', () => {
    const constraints = resolveBuilderLevelConstraints(builderTestContext)
    expect(constraints).toMatchObject({
      mode: 'selectable',
      minLevel: 1,
      maxLevel: 20,
    })
  })

  it('rejects levels above campaign maximum', () => {
    const issues = validateBuilderCharacterLevel({
      level: 25,
      characterKind: 'pc',
      rulesScope: { type: 'ruleset', rulesetId: builderTestContext.rulesetId },
      characterCreationRules: builderTestContext.characterCreationRules,
    })

    expect(issues.some((issue) => issue.code === 'level_exceeds_campaign_maximum')).toBe(true)
  })
})
