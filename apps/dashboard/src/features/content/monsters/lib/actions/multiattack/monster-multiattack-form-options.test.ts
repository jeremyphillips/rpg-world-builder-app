import { describe, expect, it } from 'vitest'
import { resolveDependsOnWatchName } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import {
  multiattackExecutableAttackOptionsFromWatched,
  multiattackReplacementChoiceOptionsFromWatched,
  multiattackReplacementChoiceRowSectionRowsDependsOn,
  multiattackSequenceRowsDependsOn,
} from './monster-multiattack-form-options'
import type { MonsterActionDraftRow } from '../monster-action-presets'

const ctx = {
  entityCatalogLayer: 'homebrew',
  equipmentCatalogStatus: 'ready',
  spellCatalogStatus: 'ready',
  spellCatalogById: new Map(),
  armorClassRules: { mode: 'ascending', base: 10 },
  options: { skills: { visible: [] } },
  rulesetId: 'srd-cc-5.2.1',
} as unknown as ContentFormCtx

const bite = { id: 'bite', kind: 'natural-weapon', name: 'Bite' }
const fireBreath = { id: 'fire-breath', kind: 'save', name: 'Fire Breath' }
const multiattack = {
  id: 'multiattack',
  kind: 'multiattack',
  name: 'Multiattack',
  steps: [{ count: 2, actionIds: ['bite'] }],
}

describe('multiattack sequence dependsOn hops', () => {
  it('matches the prefixes that resolve to root actions', () => {
    expect(multiattackSequenceRowsDependsOn('actions', 'primary', 'step')).toBe(
      '../../../../actions',
    )
    expect(multiattackSequenceRowsDependsOn('actions', 'alternative', 'step')).toBe(
      '../../../../../actions',
    )
    expect(multiattackSequenceRowsDependsOn('actions', 'primary', 'choice')).toBe(
      '../../../../../../actions',
    )
    expect(multiattackSequenceRowsDependsOn('actions', 'alternative', 'choice')).toBe(
      '../../../../../../../actions',
    )
    expect(multiattackSequenceRowsDependsOn('actions', 'primary', 'menu')).toBe('../../../actions')
    expect(multiattackSequenceRowsDependsOn('actions', 'alternative', 'menu')).toBe(
      '../../../../actions',
    )
  })

  it('resolves configured hops from multiattack array item prefixes', () => {
    const section = 'actions'
    expect(
      resolveDependsOnWatchName(
        multiattackSequenceRowsDependsOn(section, 'primary', 'step'),
        `${section}.0.steps.0`,
      ),
    ).toBe(section)
    expect(
      resolveDependsOnWatchName(
        multiattackSequenceRowsDependsOn(section, 'alternative', 'step'),
        `${section}.0.alternative.steps.0`,
      ),
    ).toBe(section)
    expect(
      resolveDependsOnWatchName(
        multiattackSequenceRowsDependsOn(section, 'primary', 'choice'),
        `${section}.0.steps.0.choices.0`,
      ),
    ).toBe(section)
    expect(
      resolveDependsOnWatchName(
        multiattackSequenceRowsDependsOn(section, 'alternative', 'choice'),
        `${section}.0.alternative.steps.0.choices.0`,
      ),
    ).toBe(section)
    expect(
      resolveDependsOnWatchName(
        multiattackSequenceRowsDependsOn(section, 'primary', 'menu'),
        `${section}.0.steps`,
      ),
    ).toBe(section)
    expect(
      resolveDependsOnWatchName(
        multiattackSequenceRowsDependsOn(section, 'alternative', 'menu'),
        `${section}.0.alternative.steps`,
      ),
    ).toBe(section)
  })

  it('resolves replacement choice row watches', () => {
    const section = 'actions'
    const choiceRowPrefix = `${section}.0.replacement.choices.0`
    expect(
      resolveDependsOnWatchName(
        multiattackReplacementChoiceRowSectionRowsDependsOn(section),
        choiceRowPrefix,
      ),
    ).toBe(section)
    expect(resolveDependsOnWatchName('../../../steps', choiceRowPrefix)).toBe(`${section}.0.steps`)
  })
})

describe('multiattack live option resolution', () => {
  it('offers replacement choices from watched section rows', () => {
    const actions = [multiattack, bite, fireBreath] as MonsterActionDraftRow[]
    const sectionRowsKey = multiattackReplacementChoiceRowSectionRowsDependsOn('actions')
    const options = multiattackReplacementChoiceOptionsFromWatched({
      rows: actions,
      section: 'actions',
      sectionRowsDependsOn: sectionRowsKey,
      multiattackId: 'multiattack',
      ctx,
      watched: {
        [sectionRowsKey]: actions,
        '../../../steps': multiattack.steps,
        '../../choices': [],
        '../../replacesActionId': undefined,
      },
    })

    expect(options.map((option) => option.value)).toEqual(['fire-breath'])
  })

  it('falls back to snapshot rows when the section watch is not ready', () => {
    const actions = [multiattack, bite, fireBreath] as MonsterActionDraftRow[]
    const sectionRowsKey = multiattackReplacementChoiceRowSectionRowsDependsOn('actions')
    const options = multiattackReplacementChoiceOptionsFromWatched({
      rows: actions,
      section: 'actions',
      sectionRowsDependsOn: sectionRowsKey,
      multiattackId: 'multiattack',
      ctx,
      watched: {
        '../../../steps': multiattack.steps,
        '../../choices': [],
      },
    })

    expect(options.map((option) => option.value)).toEqual(['fire-breath'])
  })

  it('offers attack chips from watched section rows', () => {
    const actions = [multiattack, bite, fireBreath] as MonsterActionDraftRow[]
    const options = multiattackExecutableAttackOptionsFromWatched({
      section: 'actions',
      multiattackId: 'multiattack',
      ctx,
      watched: {
        '../../../../actions': actions,
      },
    })

    expect(options.map((option) => option.value).sort()).toEqual(['bite'])
  })
})
