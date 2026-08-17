import { describe, expect, it } from 'vitest'

import { pickFeat } from '@/test/fixtures/pick'

import {
  buildFeatDetailViewModel,
  formatFeatCategoryTableLabel,
  formatFeatPrerequisiteSummary,
} from './feat-display'

describe('buildFeatDetailViewModel', () => {
  it('includes category and repeatable for Alert', () => {
    const alert = pickFeat('alert')
    const viewModel = buildFeatDetailViewModel(alert)
    expect(viewModel.statRows.map((r) => r.label)).toEqual(['Category', 'Repeatable'])
    expect(viewModel.statRows[0]?.value).toBe('Origin')
    expect(viewModel.statRows[1]?.value).toBe('No')
  })

  it('includes prerequisite for Grappler', () => {
    const grappler = pickFeat('grappler')
    const viewModel = buildFeatDetailViewModel(grappler)
    const prereq = viewModel.statRows.find((r) => r.label === 'Prerequisite')
    expect(prereq?.value).toBe('Level 4+, Strength or Dexterity 13+')
  })

  it('surfaces repeatable notes when present', () => {
    const repeatableFeat = pickFeat('alert')
    expect(buildFeatDetailViewModel(repeatableFeat).repeatableNotes).toBeUndefined()
  })
})

describe('formatFeatCategoryTableLabel', () => {
  it('strips the trailing " Feat" suffix from category labels', () => {
    expect(formatFeatCategoryTableLabel('origin')).toBe('Origin')
    expect(formatFeatCategoryTableLabel('general')).toBe('General')
  })

  it('returns the full label when it does not end with " Feat"', () => {
    expect(
      formatFeatCategoryTableLabel('custom' as Parameters<typeof formatFeatCategoryTableLabel>[0]),
    ).toBe('custom')
  })
})

describe('formatFeatPrerequisiteSummary', () => {
  it('returns an em dash when no prerequisite is set', () => {
    const alert = pickFeat('alert')
    expect(formatFeatPrerequisiteSummary(alert)).toBe('—')
  })

  it('uses uppercase ability ids in overview tables', () => {
    const grappler = pickFeat('grappler')
    expect(formatFeatPrerequisiteSummary(grappler)).toBe('Level 4+, STR or DEX 13+')
  })
})
