import { describe, expect, it } from 'vitest'

import type { ContentStatRowData } from '../metadata/content-stat-rows'
import { partitionHeroStatRowGroups } from './partition-hero-stat-row-groups.lib'

function statRow(label: string): ContentStatRowData {
  return { label, value: label }
}

function labels(rows: ContentStatRowData[][]): string[][] {
  return rows.map((group) => group.map((row) => row.label))
}

describe('partitionHeroStatRowGroups', () => {
  it('keeps up to three rows in a single group', () => {
    const rows = ['A', 'B', 'C'].map(statRow)
    expect(labels(partitionHeroStatRowGroups(rows))).toEqual([['A', 'B', 'C']])
  })

  it('balances four rows into two groups of two', () => {
    const rows = ['A', 'B', 'C', 'D'].map(statRow)
    expect(labels(partitionHeroStatRowGroups(rows))).toEqual([
      ['A', 'B'],
      ['C', 'D'],
    ])
  })

  it('splits five rows into three and two', () => {
    const rows = ['1', '2', '3', '4', '5'].map(statRow)
    expect(labels(partitionHeroStatRowGroups(rows))).toEqual([
      ['1', '2', '3'],
      ['4', '5'],
    ])
  })

  it('keeps a large set in the default two columns', () => {
    const rows = Array.from({ length: 7 }, (_, index) => statRow(String(index + 1)))
    expect(labels(partitionHeroStatRowGroups(rows))).toEqual([
      ['1', '2', '3', '4'],
      ['5', '6', '7'],
    ])
  })

  it('balances rows across an explicit column count', () => {
    const rows = Array.from({ length: 7 }, (_, index) => statRow(String(index + 1)))
    expect(labels(partitionHeroStatRowGroups(rows, 3))).toEqual([
      ['1', '2', '3'],
      ['4', '5'],
      ['6', '7'],
    ])
  })
})
