import { describe, expect, it } from 'vitest'

import { MONSTER_ACTION_UNRESOLVED_REFERENCE } from '@rpg/contracts'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { monsterActionEditorTitles } from './monster-action-editor-title'
import { presentActionReference } from './monster-action-reference-presentation'
import type { MonsterActionDraftRow } from './monster-action-presets'
import type { MonsterFormValues } from '../monster-form-values'

const ctx = { equipmentCatalogStatus: 'ready' } as ContentFormCtx
const sources = new Map([
  ['antennae', 'Antennae'],
  ['bite', 'Bite'],
])

describe('presentActionReference', () => {
  it('keeps the kind caption when an unnamed reference has a source', () => {
    expect(
      presentActionReference({ actionIds: ['antennae'], sourceTitles: sources }),
    ).toMatchObject({
      title: 'Use Antennae',
      fallbackTitle: 'Use Antennae',
      sourceState: 'resolved',
      sourceNames: ['Antennae'],
    })
    expect(
      presentActionReference({ actionIds: ['antennae'], sourceTitles: sources }).summary,
    ).toBeUndefined()
  })

  it('summarizes several sources only after the entry is named', () => {
    expect(
      presentActionReference({ actionIds: ['antennae', 'bite'], sourceTitles: sources }).title,
    ).toBe('Use Antennae or Bite')
    expect(
      presentActionReference({
        name: 'Reflexive Attacks',
        actionIds: ['antennae', 'bite'],
        sourceTitles: sources,
      }),
    ).toMatchObject({
      title: 'Reflexive Attacks',
      summary: 'Uses Antennae or Bite',
    })
  })

  it('distinguishes an unselected source from a missing one and hides ids', () => {
    expect(presentActionReference({ actionIds: [], sourceTitles: sources })).toMatchObject({
      title: 'Use action',
      summary: 'Choose a source action',
      sourceState: 'none',
    })
    expect(
      presentActionReference({
        name: 'Reflexive Antennae',
        actionIds: ['antennae'],
        sourceTitles: sources,
      }).summary,
    ).toBe('Uses Antennae')
    expect(presentActionReference({ actionIds: ['gone'], sourceTitles: sources })).toMatchObject({
      title: 'Use action',
      summary: 'Source action unavailable',
      sourceState: 'missing',
      sourceNames: [],
    })
    expect(
      presentActionReference({
        name: 'Reflexive Antennae',
        actionIds: ['antennae', 'gone'],
        sourceTitles: sources,
      }),
    ).toMatchObject({
      title: 'Reflexive Antennae',
      summary: 'Source action unavailable',
      sourceState: 'missing',
    })
    expect(
      presentActionReference({
        actionIds: ['raw'],
        sourceTitles: new Map([['raw', 'raw']]),
      }).summary,
    ).toBe('Source action unavailable')
    expect(
      presentActionReference({
        actionIds: ['raw'],
        sourceTitles: new Map([['raw', MONSTER_ACTION_UNRESOLVED_REFERENCE]]),
      }).title,
    ).toBe('Use action')
  })
})

describe('action reference editor titles', () => {
  it('numbers colliding derived titles and leaves the list phrase unnumbered', () => {
    const actions = [{ id: 'antennae', kind: 'natural-weapon', name: 'Antennae' }]
    const rows = [
      { id: 'one', kind: 'action-reference', actionIds: [] },
      { id: 'two', kind: 'action-reference', actionIds: [] },
    ] as MonsterActionDraftRow[]
    expect(
      monsterActionEditorTitles(
        rows,
        { actions, reactions: rows } as MonsterFormValues,
        ctx,
        'reactions',
      ),
    ).toEqual(
      new Map([
        ['one', 'Use action'],
        ['two', 'Use action 2'],
      ]),
    )
    expect(
      presentActionReference({
        actionIds: ['antennae'],
        sourceTitles: new Map([['antennae', 'Antennae']]),
      }).summary,
    ).toBeUndefined()
  })
})
