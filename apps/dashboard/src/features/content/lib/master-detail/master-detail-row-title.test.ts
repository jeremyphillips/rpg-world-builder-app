import { describe, expect, it } from 'vitest'

import { defineMasterDetailItemNoun } from './master-detail-item-noun'
import { resolveMasterDetailRowTitle } from './master-detail-row-title'

const ITEM_NOUN = defineMasterDetailItemNoun({
  label: 'Trait',
  singular: 'trait',
  plural: 'traits',
})

type SampleRow = { id?: string; name?: string; nameOverride?: string }

function ctx(input: Partial<MasterDetailRowTitleContext<SampleRow>> & { row: SampleRow }): MasterDetailRowTitleContext<SampleRow> {
  return {
    index: 0,
    fieldId: 'field-1',
    rows: [input.row],
    itemNoun: ITEM_NOUN,
    lastAddedFieldId: null,
    rowReady: true,
    ...input,
  }
}

type MasterDetailRowTitleContext<T> = Parameters<typeof resolveMasterDetailRowTitle<T>>[1]

describe('resolveMasterDetailRowTitle', () => {
  it('resolves per-row strategy from resolveRowTitle', () => {
    const resolution = resolveMasterDetailRowTitle(
      {
        resolveRowTitle: (rowCtx) =>
          rowCtx.row.name === 'fixed'
            ? { strategy: 'readonly', resolveTitle: () => 'Preset label' }
            : { strategy: 'authored', field: 'name' },
      },
      ctx({ row: { name: 'fixed' } }),
    )
    expect(resolution.displayTitle).toBe('Preset label')
    expect(resolution.inlineTitle).toBeUndefined()
  })

  it('uses unnamed fallback for empty authored names without persisting', () => {
    const resolution = resolveMasterDetailRowTitle(
      { strategy: 'authored', field: 'name' },
      ctx({ row: { name: '   ' } }),
    )
    expect(resolution.displayTitle).toBe('Unnamed Trait')
    expect(resolution.inlineTitle?.fallback).toBe('Unnamed Trait')
    expect(resolution.inlineTitle?.mode).toBe('authored')
  })

  it('does not initial-edit when the row is not ready', () => {
    const resolution = resolveMasterDetailRowTitle(
      { strategy: 'authored', field: 'name' },
      ctx({ row: { name: '' }, fieldId: 'new', lastAddedFieldId: 'new', rowReady: false }),
    )
    expect(resolution.inlineTitle?.initialEdit).toBeUndefined()
  })

  it('opens initial edit for unnamed rows added via lastAddedFieldId', () => {
    const resolution = resolveMasterDetailRowTitle(
      { strategy: 'authored', field: 'name' },
      ctx({ row: { name: '' }, fieldId: 'new', lastAddedFieldId: 'new' }),
    )
    expect(resolution.inlineTitle?.initialEdit).toBe(true)
  })

  it('suppresses initial edit when allowInitialEditOnAdd is false', () => {
    const resolution = resolveMasterDetailRowTitle(
      { strategy: 'authored', field: 'name', allowInitialEditOnAdd: false },
      ctx({ row: { name: '' }, fieldId: 'new', lastAddedFieldId: 'new' }),
    )
    expect(resolution.inlineTitle?.initialEdit).toBeUndefined()
  })

  it('surfaces override sourceName and never initial-edits on add', () => {
    const resolution = resolveMasterDetailRowTitle(
      {
        strategy: 'override',
        field: 'nameOverride',
        resolveDerived: () => 'Derived',
        resetLabel: 'Use default',
      },
      ctx({
        row: { nameOverride: 'Custom' },
        fieldId: 'new',
        lastAddedFieldId: 'new',
      }),
    )
    expect(resolution.displayTitle).toBe('Custom')
    expect(resolution.sourceName).toBe('Derived')
    expect(resolution.inlineTitle?.initialEdit).toBeUndefined()
    expect(resolution.inlineTitle?.resetLabel).toBe('Use default')
  })

  it('does not double-fallback readonly titles', () => {
    const resolution = resolveMasterDetailRowTitle(
      {
        strategy: 'readonly',
        resolveTitle: () => 'Spellcasting',
      },
      ctx({ row: {} }),
    )
    expect(resolution.displayTitle).toBe('Spellcasting')
    expect(resolution.inlineTitle).toBeUndefined()
  })
})
