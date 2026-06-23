import { describe, expect, it } from 'vitest'
import { getFeatBySlug } from '@rpg/catalog/feats'

import { buildFeatStatRows, formatFeatPrerequisiteSummary } from './feat-stat-rows'

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

describe('formatFeatPrerequisiteSummary', () => {
  it('returns an em dash when no prerequisite is set', () => {
    const alert = getFeatBySlug('srd-cc-5.2.1', 'alert')
    expect(formatFeatPrerequisiteSummary(alert)).toBe('—')
  })
})
