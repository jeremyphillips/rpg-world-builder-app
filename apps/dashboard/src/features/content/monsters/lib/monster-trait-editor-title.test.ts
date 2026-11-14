import { describe, expect, it } from 'vitest'

import type { MasterDetailEditorIdentity } from '../../components/master-detail/master-detail-editor-shell'
import {
  monsterCustomTraitFallbacks,
  monsterTraitListTitle,
  resolveMonsterTraitHeaderIdentity,
} from './monster-trait-editor-title'

const identity = {
  title: 'Trait',
  meta: { provenance: 'homebrew', persistence: 'persisted' },
} satisfies MasterDetailEditorIdentity

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
    expect(monsterTraitListTitle(rows[1], rows, 'Owl', 1)).toBe('Trait 2')
    expect(monsterTraitListTitle(rows[2], rows, 'Owl', 2)).toBe('Trait 1')
  })

  it('auto-edits a new empty custom trait and keeps template overrides optional', () => {
    const custom = resolveMonsterTraitHeaderIdentity({
      row: { id: 'new', kind: 'custom', name: '' },
      rows: [{ id: 'new', kind: 'custom', name: '' }],
      monsterName: 'Owl',
      index: 0,
      fieldId: 'field-1',
      lastAddedFieldId: 'field-1',
      identity,
    })
    expect(custom.inlineTitle).toMatchObject({
      field: 'name',
      mode: 'authored',
      fallback: 'Trait 1',
      placeholder: 'Trait 1',
      initialEdit: true,
    })

    const reopened = resolveMonsterTraitHeaderIdentity({
      row: { id: 'new', kind: 'custom', name: '' },
      rows: [{ id: 'new', kind: 'custom', name: '' }],
      monsterName: 'Owl',
      index: 0,
      fieldId: 'field-1',
      lastAddedFieldId: null,
      identity,
    })
    expect(reopened.inlineTitle?.initialEdit).toBeFalsy()

    const template = resolveMonsterTraitHeaderIdentity({
      row: { id: 'pack', kind: 'template', templateId: 'pack-tactics', nameOverride: 'Allies' },
      rows: [{ id: 'pack', kind: 'template', templateId: 'pack-tactics', nameOverride: 'Allies' }],
      monsterName: 'Kobold',
      index: 0,
      fieldId: 'field-2',
      lastAddedFieldId: 'field-2',
      identity,
    })
    expect(template.inlineTitle).toMatchObject({
      field: 'nameOverride',
      mode: 'override',
      resetLabel: 'Use default name',
    })
    expect(template.inlineTitle?.initialEdit).toBeUndefined()
    expect(template.sourceName).toBeTruthy()
    expect(template.title).toBe('Allies')
  })
})
