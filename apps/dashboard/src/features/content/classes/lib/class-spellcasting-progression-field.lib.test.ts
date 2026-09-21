import { describe, expect, it } from 'vitest'

import {
  mapClassSpellcastingProgressionDraftToProgression,
  resolveSpellcastingProgressionFixedColumns,
  SPELLCASTING_CANTIPS_COLUMN_KEY,
  SPELLCASTING_REPERTOIRE_COLUMN_KEY,
} from './class-spellcasting-progression-field.lib'
import { createTableBuilderColumnKey } from '../../lib/table-builder/table-builder-draft'

describe('class-spellcasting-progression-field.lib', () => {
  it('increments against the previous nonblank value in the same column', () => {
    const cantripKey = createTableBuilderColumnKey()
    const preparedKey = createTableBuilderColumnKey()

    const progression = mapClassSpellcastingProgressionDraftToProgression(
      {
        kind: 'levelProgression',
        name: 'Spellcasting progression',
        columns: [
          { key: cantripKey, label: 'Cantrips', valueType: 'number', format: 'plain' },
          { key: preparedKey, label: 'Prepared Spells', valueType: 'number', format: 'plain' },
        ],
        rows: [
          { level: '1', cells: { [cantripKey]: '2', [preparedKey]: '4' } },
          { level: '4', cells: { [cantripKey]: '3' } },
          { level: '10', cells: { [preparedKey]: '12' } },
        ],
      },
      { grantsCantrips: true, spellSelectionModel: 'prepareFromClassList' },
    )

    expect(progression.cantrips?.curve.rows).toEqual([
      { level: 1, count: 2 },
      { level: 4, count: 3 },
    ])
    expect(progression.preparedSpells?.curve.rows).toEqual([
      { level: 1, count: 4 },
      { level: 10, count: 12 },
    ])
  })

  it('persists cantrips and prepared curves independently', () => {
    const columns = resolveSpellcastingProgressionFixedColumns({
      grantsCantrips: true,
      spellSelectionModel: 'limitedRepertoire',
    })
    expect(columns.map((column) => column.semanticKey)).toEqual([
      SPELLCASTING_CANTIPS_COLUMN_KEY,
      SPELLCASTING_REPERTOIRE_COLUMN_KEY,
    ])
  })
})
