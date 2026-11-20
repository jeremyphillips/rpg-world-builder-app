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
const rows = [bite, claw] as MonsterActionDraftRow[]
const headerInput = { section: 'actions' as const, fallbackRows: rows, ctx }
const watched = { '../../../../actions': rows }

describe('multiattackStepHeaderPrimary', () => {
  it('formats attack group counts and combination summaries', () => {
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
    ).toBe('Bite · Claw · Any combination')
    expect(
      multiattackStepHeaderSummary(
        { count: 1, actionIds: ['bite', 'claw'] },
        0,
        watched,
        headerInput,
      ),
    ).toBe('Bite · Claw')
  })

  it('formats single-use repetition and optional titles', () => {
    const step = { kind: 'use', mode: 'single', actionId: 'bite', count: 2 }
    expect(multiattackStepHeaderPrimary(step, 0, watched, headerInput)).toBe('Use Bite · twice')
    expect(
      multiattackStepHeaderPrimary(
        { kind: 'use', mode: 'single', actionId: 'bite', optional: true },
        0,
        watched,
        headerInput,
      ),
    ).toBe('Can use Bite')
  })
})
