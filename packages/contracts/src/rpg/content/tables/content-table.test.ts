import type { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { refineFeatureTablesOnFeature } from '../classes/class-feature-table'
import { reincarnateSpeciesTableFixture } from './general-table-fixtures'
import {
  contentTableSchema,
  isGeneralContentTable,
  isProgressionContentTable,
} from './content-table'

const progressionTableFixture = {
  id: 'rage',
  name: 'Rage',
  kind: 'levelProgression' as const,
  columns: [
    {
      id: 'uses',
      label: 'Rages',
      valueType: 'number' as const,
      entries: [{ level: 1, value: 2 }],
    },
  ],
}

describe('contentTableSchema', () => {
  it('accepts progression and general table shapes', () => {
    expect(contentTableSchema.parse(progressionTableFixture).kind).toBe('levelProgression')
    expect(contentTableSchema.parse(reincarnateSpeciesTableFixture).kind).toBe('general')
  })

  it('narrows by kind helpers', () => {
    const progression = contentTableSchema.parse(progressionTableFixture)
    const general = contentTableSchema.parse(reincarnateSpeciesTableFixture)

    expect(isProgressionContentTable(progression)).toBe(true)
    expect(isGeneralContentTable(progression)).toBe(false)
    expect(isGeneralContentTable(general)).toBe(true)
    expect(isProgressionContentTable(general)).toBe(false)
  })
})

describe('refineFeatureTablesOnFeature', () => {
  it('skips level-entry checks for general tables', () => {
    const result = contentTableSchema.safeParse(reincarnateSpeciesTableFixture)
    expect(result.success).toBe(true)
    if (!result.success) return

    const issues: { path: PropertyKey[] }[] = []
    refineFeatureTablesOnFeature({ level: 5, tables: [result.data] }, {
      value: { level: 5, tables: [result.data] },
      issues: [],
      addIssue: (issue) => {
        if (typeof issue === 'string') return
        issues.push({ path: issue.path ?? [] })
      },
    } as z.RefinementCtx)

    expect(issues).toHaveLength(0)
  })
})
