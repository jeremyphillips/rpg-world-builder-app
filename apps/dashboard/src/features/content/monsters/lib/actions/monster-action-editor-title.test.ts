import { describe, expect, it } from 'vitest'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import type { MonsterFormValues } from '../monster-form-values'
import { monsterActionEditorTitles, monsterActionHeaderName } from './monster-action-editor-title'
import type { MonsterActionDraftRow } from './monster-action-presets'

const ctx = { equipmentCatalogStatus: 'ready' } as ContentFormCtx

function titles(rows: MonsterActionDraftRow[]) {
  return monsterActionEditorTitles(rows, { actions: rows } as MonsterFormValues, ctx)
}

describe('monsterActionEditorTitles', () => {
  it('numbers empty authored actions in section order and skips stored names', () => {
    const rows = [
      { id: 'named', kind: 'attack', name: 'Attack' },
      { id: 'first', kind: 'attack' },
      { id: 'special', kind: 'special', name: 'Special Ability 2' },
      { id: 'empty-special', kind: 'special' },
      { id: 'second', kind: 'attack' },
    ] as MonsterActionDraftRow[]

    expect(titles(rows)).toEqual(
      new Map([
        ['named', 'Attack'],
        ['first', 'Attack 2'],
        ['special', 'Special Ability 2'],
        ['empty-special', 'Special Ability'],
        ['second', 'Attack 3'],
      ]),
    )
  })

  it('keeps a preset name and exposes the source only for a different override', () => {
    const rows = [
      { id: 'bite', kind: 'natural-weapon', preset: 'bite' },
      { id: 'venom', kind: 'natural-weapon', preset: 'bite', name: 'Venomous Bite' },
    ] as MonsterActionDraftRow[]

    expect(titles(rows).get('bite')).toBe('Bite')
    expect(titles(rows).get('venom')).toBe('Venomous Bite')
    expect(
      monsterActionHeaderName({
        action: rows[1]!,
        sectionRows: rows,
        values: { actions: rows } as MonsterFormValues,
        ctx,
      }),
    ).toMatchObject({
      mode: 'override',
      sourceName: 'Bite',
      resetLabel: 'Use default name',
      fallback: 'Bite',
    })
    expect(
      monsterActionHeaderName({
        action: rows[0]!,
        sectionRows: rows,
        values: { actions: rows } as MonsterFormValues,
        ctx,
      }).sourceName,
    ).toBeUndefined()
  })

  it('uses Saving Throw for a general save and the preset name for breath', () => {
    const rows = [
      { id: 'breath', kind: 'save', preset: 'breath-weapon' },
      { id: 'blank', kind: 'save' },
    ] as MonsterActionDraftRow[]
    expect(titles(rows).get('breath')).toBe('Fire Breath')
    expect(titles(rows).get('blank')).toBe('Saving Throw')
  })

  it('keeps the primary Spellcasting name immutable', () => {
    const action = {
      id: 'spellcasting',
      kind: 'spell',
      profile: 'primary',
      name: 'Spellcasting',
    } as MonsterActionDraftRow
    expect(
      monsterActionHeaderName({
        action,
        sectionRows: [action],
        values: { actions: [action] } as MonsterFormValues,
        ctx,
      }),
    ).toMatchObject({
      title: 'Spellcasting',
      editable: false,
    })
  })
})
