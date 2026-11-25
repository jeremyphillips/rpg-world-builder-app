import {
  createSpellCatalogContext,
  MONSTER_ACTION_UNRESOLVED_REFERENCE,
  SPELL_REFERENCE_DISPLAY_MESSAGES,
} from '@rpg/contracts'
import { describe, expect, it } from 'vitest'
import { resolveDependsOnWatchName } from '@rpg/ui/form'

import { pickMonster, pickSpell } from '@/test/fixtures/pick'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import {
  multiattackExecutableAttackOptionsFromWatched,
  multiattackReplacementChoiceOptionsFromWatched,
  multiattackReplacementChoiceRowSectionRowsDependsOn,
  multiattackSequenceRowsDependsOn,
  multiattackSpellOptionsForAction,
  multiattackTargetAttackOptions,
} from './monster-multiattack-form-options'
import type { MonsterActionDraftRow } from '../monster-action-presets'
import type { MonsterFormValues } from '../../monster-form-values'

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

describe('multiattack reference option labels', () => {
  const fireball = pickSpell('fireball')
  const wrongScopeId = `other:${fireball.slug}`
  const spellAction = {
    id: 'spellcasting',
    kind: 'spell',
    spells: [
      { spellId: fireball.id, castAtLevel: 5 },
      { spellId: wrongScopeId, castAtLevel: 5 },
    ],
  } as MonsterActionDraftRow
  const spellsById = new Map([[fireball.id, fireball]])

  it('uses exact spell ids and retains an unresolved selection with a shared label', () => {
    const catalog = createSpellCatalogContext({ status: 'ready', spellsById })
    expect(multiattackSpellOptionsForAction(spellAction.id, [spellAction], catalog)).toEqual([
      { value: fireball.id, label: 'Fireball (level 5 version)' },
      { value: wrongScopeId, label: SPELL_REFERENCE_DISPLAY_MESSAGES.unknownSpell },
    ])
  })

  it.each([
    ['pending', SPELL_REFERENCE_DISPLAY_MESSAGES.catalogLoading],
    ['error', SPELL_REFERENCE_DISPLAY_MESSAGES.catalogError],
  ] as const)('uses the %s catalog label without inferring a cast level', (status, label) => {
    const catalog = createSpellCatalogContext({ status, spellsById })
    expect(multiattackSpellOptionsForAction(spellAction.id, [spellAction], catalog)).toEqual([
      { value: fireball.id, label },
      { value: wrongScopeId, label },
    ])
  })

  it('keeps the stale attack id as a value while showing unresolved copy', () => {
    const staleId = 'missing-attack'
    const values = pickMonster('hell-hound') as unknown as MonsterFormValues
    expect(
      multiattackTargetAttackOptions([{ count: 1, actionIds: [staleId] }], [], values, ctx),
    ).toEqual([{ value: staleId, label: MONSTER_ACTION_UNRESOLVED_REFERENCE }])
  })
})
