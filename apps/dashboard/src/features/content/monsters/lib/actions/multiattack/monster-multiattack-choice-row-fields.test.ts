import { describe, expect, it } from 'vitest'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import type { MonsterActionDraftRow } from '../monster-action-presets'
import {
  multiattackExecutableUseOptionsFromWatched,
  multiattackStepScopeSectionRowsDependsOn,
} from './monster-multiattack-form-options'

const ctx = {
  entityCatalogLayer: 'homebrew',
  rulesetId: 'srd-cc-5.2.1',
} as ContentFormCtx

const rows = [
  { id: 'multiattack', kind: 'multiattack', name: 'Multiattack', steps: [] },
  { id: 'bite', kind: 'natural-weapon', name: 'Bite' },
  {
    id: 'spellcasting',
    kind: 'spell',
    name: 'Spellcasting',
    spells: [{ spellId: 'srd:counterspell' }],
  },
] as MonsterActionDraftRow[]

describe('multiattack choice row options context', () => {
  it('offers executable-use kinds only for single-use step pickers', () => {
    const dependsOn = multiattackStepScopeSectionRowsDependsOn('actions')
    const watched: Record<string, unknown> = {
      actionId: '',
      [dependsOn]: rows,
    }
    const options = multiattackExecutableUseOptionsFromWatched({
      section: 'actions',
      multiattackId: 'multiattack',
      ctx,
      watched,
      sectionRowsDependsOn: dependsOn,
      fallbackRows: rows,
    })
    expect(options.map((option) => option.value)).toEqual(['spellcasting'])
  })
})
