import { describe, expect, it } from 'vitest'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import {
  multiattackStepHeaderPrimary,
  multiattackStepHeaderSummary,
} from './monster-multiattack-step-headers'
import type { MonsterActionDraftRow } from '../monster-action-presets'

const ctx = {
  entityCatalogLayer: 'homebrew',
  equipmentCatalogStatus: 'ready',
  equipmentCatalogById: new Map(),
  spellCatalogStatus: 'ready',
  spellCatalogById: new Map(),
  armorClassRules: { mode: 'ascending', base: 10 },
  options: { skills: { visible: [] } },
  rulesetId: 'srd-cc-5.2.1',
} as unknown as ContentFormCtx

const bite = { id: 'bite', kind: 'natural-weapon', name: 'Bite' }
const claw = { id: 'claw', kind: 'natural-weapon', name: 'Claw' }
const breath = { id: 'breath', kind: 'save', name: 'Fire Breath' }
const presence = { id: 'presence', kind: 'special', name: 'Frightful Presence' }
const spell = { id: 'spellcasting', kind: 'spell', name: 'Spellcasting' }
const tail = { id: 'tail', kind: 'save', name: 'Tail' }
const rows = [bite, claw, breath, presence, spell, tail] as MonsterActionDraftRow[]
const headerInput = {
  section: 'actions' as const,
  fallbackRows: rows,
  ctx: {
    ...ctx,
    spellCatalogById: new Map([['mage-hand', { id: 'mage-hand', name: 'Mage Hand', level: 0 }]]),
  },
}
const watched = { '../../../../actions': rows }

describe('multiattackStepHeaderPrimary', () => {
  it('formats attack group counts and combination summaries', () => {
    expect(multiattackStepHeaderPrimary({ actionIds: [] }, 0, watched, headerInput)).toBe(
      'Attack group',
    )
    expect(multiattackStepHeaderSummary({ actionIds: [] }, 0, watched, headerInput)).toBe(
      'Choose attacks',
    )
    expect(
      multiattackStepHeaderSummary({ count: 3, actionIds: ['bite'] }, 0, watched, headerInput),
    ).toBe('Bite')
    expect(
      multiattackStepHeaderSummary(
        { count: 1, actionIds: ['bite', 'claw'] },
        0,
        watched,
        headerInput,
      ),
    ).toBe('Bite or Claw')
    expect(
      multiattackStepHeaderPrimary(
        { count: 2, actionIds: ['bite', 'claw'] },
        0,
        watched,
        headerInput,
      ),
    ).toBe('2 attacks')
    expect(
      multiattackStepHeaderSummary(
        { count: 2, actionIds: ['bite', 'claw'] },
        0,
        watched,
        headerInput,
      ),
    ).toBe('Bite or Claw, in any combination')
    expect(
      multiattackStepHeaderSummary(
        { count: 0, actionIds: ['bite', 'claw'] },
        0,
        watched,
        headerInput,
      ),
    ).toBe('Bite or Claw')
    expect(multiattackStepHeaderSummary({ actionIds: ['missing'] }, 0, watched, headerInput)).toBe(
      'Unresolved reference',
    )
  })

  it('formats single-use repetition, spells, and optional titles', () => {
    expect(
      multiattackStepHeaderPrimary(
        { kind: 'use', mode: 'single', actionId: 'breath', count: 2 },
        0,
        watched,
        headerInput,
      ),
    ).toBe('Use Fire Breath twice')
    expect(
      multiattackStepHeaderSummary(
        { kind: 'use', mode: 'single', actionId: 'breath', count: 2 },
        0,
        watched,
        headerInput,
      ),
    ).toBeUndefined()
    expect(
      multiattackStepHeaderPrimary(
        { kind: 'use', mode: 'single', actionId: 'breath', optional: true },
        0,
        watched,
        headerInput,
      ),
    ).toBe('Can use Fire Breath')
    expect(
      multiattackStepHeaderPrimary(
        { kind: 'use', mode: 'single', actionId: 'spellcasting' },
        0,
        watched,
        headerInput,
      ),
    ).toBe('Use Spellcasting')
    expect(
      multiattackStepHeaderPrimary(
        { kind: 'use', mode: 'single', actionId: 'spellcasting', spellId: 'mage-hand' },
        0,
        watched,
        headerInput,
      ),
    ).toBe('Cast Mage Hand')
    expect(
      multiattackStepHeaderSummary(
        { kind: 'use', mode: 'single', actionId: 'spellcasting', spellId: 'mage-hand' },
        0,
        watched,
        headerInput,
      ),
    ).toBe('Spellcasting')
    expect(
      multiattackStepHeaderSummary(
        { kind: 'use', mode: 'single', actionId: 'spellcasting', spellId: 'missing-spell' },
        0,
        watched,
        headerInput,
      ),
    ).toBe('Unresolved reference')
  })

  it('formats action choices without inventing a trailing name', () => {
    const two = {
      kind: 'use',
      mode: 'choice',
      choices: [{ actionId: 'spellcasting', spellId: 'mage-hand' }, { actionId: 'breath' }],
    }
    expect(multiattackStepHeaderPrimary(two, 0, watched, headerInput)).toBe(
      'Use Spellcasting to cast Mage Hand or Fire Breath',
    )
    expect(multiattackStepHeaderSummary(two, 0, watched, headerInput)).toBeUndefined()
    const four = {
      kind: 'use',
      mode: 'choice',
      choices: [
        { actionId: 'breath' },
        { actionId: 'presence' },
        { actionId: 'tail' },
        { actionId: 'spellcasting', spellId: 'mage-hand' },
      ],
    }
    expect(multiattackStepHeaderPrimary(four, 0, watched, headerInput)).toBe('Use one of 4 actions')
    expect(multiattackStepHeaderSummary(four, 0, watched, headerInput)).toBe(
      'Fire Breath, Frightful Presence, Tail, or Spellcasting to cast Mage Hand',
    )
  })
})
