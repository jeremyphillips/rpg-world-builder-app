import { describe, expect, it } from 'vitest'

import { TRAIT_MASTER_DETAIL_ITEM_NOUN } from '../../../species/lib/species-trait-form-labels'
import { resolveMasterDetailRowTitle } from '../../../lib/master-detail/master-detail-row-title'
import {
  monsterCustomTraitFallbacks,
  monsterTraitPreviewBaseName,
} from './monster-trait-editor-title'
import { resolveMonsterTraitRowTitleConfig } from './monster-trait-row-title'

describe('monster trait editor titles', () => {
  it('numbers only empty custom traits and leaves presets alone', () => {
    const rows = [
      { id: 'dark', preset: 'darkvision', range: 60 },
      { id: 'first', kind: 'custom', name: '' },
      { id: 'named', kind: 'custom', name: 'Trait 1' },
      { id: 'second', kind: 'custom', name: '   ' },
    ]
    expect(monsterCustomTraitFallbacks(rows, 'Owl')).toEqual(
      new Map([
        ['first', 'Trait 2'],
        ['second', 'Trait 3'],
      ]),
    )

    const config = resolveMonsterTraitRowTitleConfig('Owl')
    expect(
      resolveMasterDetailRowTitle(config, {
        row: rows[1]!,
        rows,
        index: 1,
        fieldId: 'first',
        lastAddedFieldId: null,
        itemNoun: TRAIT_MASTER_DETAIL_ITEM_NOUN,
        rowReady: true,
      }).displayTitle,
    ).toBe('Trait 2')
    expect(
      resolveMasterDetailRowTitle(config, {
        row: rows[2]!,
        rows,
        index: 2,
        fieldId: 'named',
        lastAddedFieldId: null,
        itemNoun: TRAIT_MASTER_DETAIL_ITEM_NOUN,
        rowReady: true,
      }).displayTitle,
    ).toBe('Trait 1')
  })

  it('uses the preset display name for a preview and the editor fallback for an empty custom trait', () => {
    const preset = { id: 'pack', preset: 'pack-tactics' }
    const custom = { id: 'note', kind: 'custom', name: '' }
    const rows = [preset, custom]
    expect(monsterTraitPreviewBaseName(preset, 'Owl', rows)).toBe('Pack Tactics')
    expect(monsterTraitPreviewBaseName(custom, 'Owl', rows)).toBe('Trait 1')
  })

  it('auto-edits a new empty custom trait and keeps template overrides optional', () => {
    const config = resolveMonsterTraitRowTitleConfig('Owl')

    const custom = resolveMasterDetailRowTitle(config, {
      row: { id: 'new', kind: 'custom', name: '' },
      rows: [{ id: 'new', kind: 'custom', name: '' }],
      index: 0,
      fieldId: 'field-1',
      lastAddedFieldId: 'field-1',
      itemNoun: TRAIT_MASTER_DETAIL_ITEM_NOUN,
      rowReady: true,
    })
    expect(custom.inlineTitle).toMatchObject({
      field: 'name',
      mode: 'authored',
      fallback: 'Trait 1',
      placeholder: 'Trait 1',
      initialEdit: true,
    })

    const reopened = resolveMasterDetailRowTitle(config, {
      row: { id: 'new', kind: 'custom', name: '' },
      rows: [{ id: 'new', kind: 'custom', name: '' }],
      index: 0,
      fieldId: 'field-1',
      lastAddedFieldId: null,
      itemNoun: TRAIT_MASTER_DETAIL_ITEM_NOUN,
      rowReady: true,
    })
    expect(reopened.inlineTitle?.initialEdit).toBeFalsy()

    const template = resolveMasterDetailRowTitle(config, {
      row: { id: 'pack', kind: 'template', templateId: 'pack-tactics', nameOverride: 'Allies' },
      rows: [{ id: 'pack', kind: 'template', templateId: 'pack-tactics', nameOverride: 'Allies' }],
      index: 0,
      fieldId: 'field-2',
      lastAddedFieldId: 'field-2',
      itemNoun: TRAIT_MASTER_DETAIL_ITEM_NOUN,
      rowReady: true,
    })
    expect(template.inlineTitle).toMatchObject({
      field: 'nameOverride',
      mode: 'override',
      resetLabel: 'Use default name',
    })
    expect(template.inlineTitle?.initialEdit).toBeUndefined()
    expect(template.sourceName).toBeTruthy()
    expect(template.displayTitle).toBe('Allies')
  })
})
