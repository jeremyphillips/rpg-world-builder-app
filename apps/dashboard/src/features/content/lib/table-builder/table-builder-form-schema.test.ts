import { describe, expect, it } from 'vitest'

import { tableBuilderFormSchema, tableBuilderValidationMessages } from './table-builder-form-schema'
import type { TableBuilderFormValues } from './table-builder-draft'

function validDraft(): TableBuilderFormValues {
  return {
    kind: 'levelProgression',
    name: 'Rage progression',
    columns: [
      { key: 'a', id: 'uses', label: 'Rages', valueType: 'number', format: 'plain' },
      { key: 'b', label: 'Note', valueType: 'text', format: 'plain' },
    ],
    rows: [
      { level: '1', cells: { a: '2', b: 'Special' } },
      { level: '3', cells: { a: '3' } },
    ],
  }
}

function issueMessages(values: TableBuilderFormValues): string[] {
  const result = tableBuilderFormSchema.safeParse(values)
  return result.success ? [] : result.error.issues.map((issue) => issue.message)
}

describe('tableBuilderFormSchema', () => {
  it('accepts a complete draft with blank carry-forward cells', () => {
    expect(tableBuilderFormSchema.safeParse(validDraft()).success).toBe(true)
  })

  it('requires a table name', () => {
    const draft = validDraft()
    draft.name = '  '
    expect(issueMessages(draft)).toContain(tableBuilderValidationMessages.tableName())
  })

  it('requires at least one column and one row', () => {
    const draft = validDraft()
    draft.columns = []
    draft.rows = []
    const messages = issueMessages(draft)
    expect(messages).toContain(tableBuilderValidationMessages.minColumns())
    expect(messages).toContain(tableBuilderValidationMessages.minRows())
  })

  it('requires column names', () => {
    const draft = validDraft()
    draft.columns[0]!.label = ''
    expect(issueMessages(draft)).toContain(tableBuilderValidationMessages.columnName())
  })

  it('requires a level on every row', () => {
    const draft = validDraft()
    draft.rows[1]!.level = ''
    expect(issueMessages(draft)).toContain(tableBuilderValidationMessages.chooseLevel())
  })

  it('rejects duplicate levels', () => {
    const draft = validDraft()
    draft.rows[1]!.level = '1'
    expect(issueMessages(draft)).toContain(
      tableBuilderValidationMessages.duplicateLevel({ level: 1 }),
    )
  })

  it('rejects unparseable number cells', () => {
    const draft = validDraft()
    draft.rows[0]!.cells.a = 'not-a-number'
    expect(issueMessages(draft)).toContain(tableBuilderValidationMessages.invalidNumber())
  })

  it('rejects incomplete dice cells', () => {
    const draft = validDraft()
    draft.columns[0]! = { key: 'a', label: 'Die', valueType: 'dice', format: 'plain' }
    draft.rows[0]!.cells.a = { count: '1', faces: '' }
    draft.rows[1]!.cells.a = { count: '1', faces: '6' }
    expect(issueMessages(draft)).toContain(tableBuilderValidationMessages.invalidDice())
  })

  it('requires each named column to have at least one value', () => {
    const draft = validDraft()
    draft.rows[0]!.cells.b = ''
    expect(issueMessages(draft)).toContain(
      tableBuilderValidationMessages.columnNeedsValue({ label: 'Note' }),
    )
  })
})
