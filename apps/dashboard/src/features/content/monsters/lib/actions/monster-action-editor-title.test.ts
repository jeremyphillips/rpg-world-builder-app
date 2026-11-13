import { describe, expect, it } from 'vitest'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import type { MonsterFormValues } from '../monster-form-values'
import { monsterActionEditorTitles, monsterActionHeaderName } from './monster-action-editor-title'
import type { MonsterActionDraftRow } from './monster-action-presets'

const ctx = { equipmentCatalogStatus: 'ready' } as ContentFormCtx

function titles(rows: MonsterActionDraftRow[]) {
  return monsterActionEditorTitles(rows, { actions: rows } as MonsterFormValues, ctx)
}

function titlesFor(section: 'reactions' | 'legendaryActions', values: MonsterFormValues) {
  const rows = (values[section] ?? []) as MonsterActionDraftRow[]
  return monsterActionEditorTitles(rows, values, ctx, section)
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

  it('names an action reference from its source without storing that title', () => {
    const antennae = { id: 'antennae', kind: 'natural-weapon', name: 'Antennae' }
    const bite = { id: 'bite', kind: 'natural-weapon', name: 'Bite' }
    const reference = { id: 'reflex', kind: 'action-reference', actionIds: ['antennae'] }
    const values = { actions: [antennae], reactions: [reference] } as MonsterFormValues

    expect(titlesFor('reactions', values).get('reflex')).toBe('Use Antennae')
    expect(reference).not.toHaveProperty('name')
    const unnamedHeader = monsterActionHeaderName({
      action: reference as MonsterActionDraftRow,
      sectionRows: [reference] as MonsterActionDraftRow[],
      values,
      ctx,
      section: 'reactions',
    })
    expect(unnamedHeader).toMatchObject({
      title: 'Use Antennae',
      fallback: 'Use Antennae',
      mode: 'authored',
    })
    expect(unnamedHeader.resetLabel).toBeUndefined()
    expect(unnamedHeader.sourceName).toBeUndefined()

    const renamed = { ...antennae, name: 'Feelers' }
    expect(
      titlesFor('reactions', {
        actions: [renamed],
        reactions: [reference],
      } as MonsterFormValues).get('reflex'),
    ).toBe('Use Feelers')
    expect(reference).not.toHaveProperty('name')

    const replaced = { ...reference, actionIds: ['bite'] }
    expect(
      titlesFor('reactions', {
        actions: [antennae, bite],
        reactions: [replaced],
      } as MonsterFormValues).get('reflex'),
    ).toBe('Use Bite')

    const authored = { ...reference, name: 'Reflexive Antennae' }
    expect(
      titlesFor('reactions', {
        actions: [renamed],
        reactions: [authored],
      } as MonsterFormValues).get('reflex'),
    ).toBe('Reflexive Antennae')
    expect(
      monsterActionHeaderName({
        action: authored as MonsterActionDraftRow,
        sectionRows: [authored] as MonsterActionDraftRow[],
        values: { actions: [renamed], reactions: [authored] } as MonsterFormValues,
        ctx,
        section: 'reactions',
      }),
    ).toMatchObject({
      title: 'Reflexive Antennae',
      fallback: 'Use Feelers',
      resetLabel: 'Use default name',
    })
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
