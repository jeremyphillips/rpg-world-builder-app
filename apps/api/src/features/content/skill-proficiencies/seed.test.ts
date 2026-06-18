import { describe, expect, it } from 'vitest'

import { loadSeedSkillProficiencies, seedSkillProficiencySlugs } from './seed'

const RULESET = 'srd-cc-5.2.1'

describe('SRD 5.2.1 skill proficiency seed', () => {
  const skills = loadSeedSkillProficiencies(RULESET)

  it('ships all 18 SRD skills (validated against the schema at load)', () => {
    expect(skills).toHaveLength(18)
  })

  it('uses deterministic system ids and null campaignId', () => {
    for (const skill of skills) {
      expect(skill.id).toBe(`${RULESET}:${skill.slug}`)
      expect(skill.source).toBe('system')
      expect(skill.campaignId).toBeNull()
      expect(skill.rulesetId).toBe(RULESET)
    }
  })

  it('has unique slugs', () => {
    const slugs = skills.map((s) => s.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(seedSkillProficiencySlugs(RULESET).size).toBe(18)
  })

  it('every skill has a valid governing ability', () => {
    const validAbilities = new Set(['str', 'dex', 'con', 'int', 'wis', 'cha'])
    for (const skill of skills) {
      expect(validAbilities.has(skill.ability)).toBe(true)
    }
  })
})
