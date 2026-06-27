import { describe, expect, it } from 'vitest'
import type { Feat } from '@rpg/contracts'
import { getFeatBySlug } from '@rpg/catalog/feats'

import {
  buildFeatStatRows,
  formatFeatCategoryTableLabel,
  formatFeatPrerequisiteSummary,
} from './feat-stat-rows'

describe('buildFeatStatRows', () => {
  it('includes category and repeatable for Alert', () => {
    const alert = getFeatBySlug('srd-cc-5.2.1', 'alert')
    const rows = buildFeatStatRows(alert)
    expect(rows.map((r) => r.label)).toEqual(['Category', 'Repeatable'])
    expect(rows[0]?.value).toBe('Origin Feat')
    expect(rows[1]?.value).toBe('No')
  })

  it('includes prerequisite for Grappler', () => {
    const grappler = getFeatBySlug('srd-cc-5.2.1', 'grappler')
    const rows = buildFeatStatRows(grappler)
    const prereq = rows.find((r) => r.label === 'Prerequisite')
    expect(prereq?.value).toBe('Level 4+, Strength or Dexterity 13+')
  })
})

describe('formatFeatCategoryTableLabel', () => {
  it('strips the trailing " Feat" suffix from category labels', () => {
    expect(formatFeatCategoryTableLabel('origin')).toBe('Origin')
    expect(formatFeatCategoryTableLabel('general')).toBe('General')
  })

  it('returns the full label when it does not end with " Feat"', () => {
    expect(formatFeatCategoryTableLabel('custom' as Feat['category'])).toBe('custom')
  })
})

describe('formatFeatPrerequisiteSummary', () => {
  it('returns an em dash when no prerequisite is set', () => {
    const alert = getFeatBySlug('srd-cc-5.2.1', 'alert')
    expect(formatFeatPrerequisiteSummary(alert)).toBe('—')
  })

  it('uses uppercase ability ids in overview tables', () => {
    const grappler = getFeatBySlug('srd-cc-5.2.1', 'grappler')
    expect(formatFeatPrerequisiteSummary(grappler)).toBe('Level 4+, STR or DEX 13+')
  })
})
