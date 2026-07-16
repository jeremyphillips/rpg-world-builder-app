import { describe, expect, it } from 'vitest'

import {
  PROFICIENCY_DOMAINS,
  formatProficiencyGrantChooseFromAnyScopePhrase,
  formatProficiencyGrantChooseFromSelectedPhrase,
  formatProficiencyGrantChoosePhrase,
  getArmorTrainingCompactSuffix,
  getProficiencyGrantAddLabel,
  getProficiencyGrantCompactSuffix,
  getProficiencyDomainLabel,
  getProficiencyDomainSentenceForm,
  getProficiencyPoolAnyLabel,
  getProficiencyPoolAnyScopePhrase,
  getProficiencyPoolSelectedPhrase,
} from './proficiency'

describe('proficiency grant vocabulary', () => {
  it('exposes every proficiency domain', () => {
    expect(PROFICIENCY_DOMAINS).toEqual(['weapon', 'tool', 'skill', 'armor'])
  })

  it('returns counted domain phrases', () => {
    expect(getProficiencyDomainSentenceForm('weapon', 1)).toBe('weapon proficiency')
    expect(getProficiencyDomainSentenceForm('weapon', 2)).toBe('weapon proficiencies')
    expect(getProficiencyDomainSentenceForm('armor', 2)).toBe('armor training')
  })

  it('returns title-case domain labels', () => {
    expect(getProficiencyDomainLabel('weapon')).toBe('Weapon proficiency')
    expect(getProficiencyDomainLabel('armor')).toBe('Armor training')
  })

  it('returns compact suffixes and pool phrases', () => {
    expect(getProficiencyGrantCompactSuffix(1)).toBe('proficiency')
    expect(getProficiencyGrantCompactSuffix(2)).toBe('proficiencies')
    expect(getArmorTrainingCompactSuffix()).toBe('training')
    expect(getProficiencyPoolAnyLabel('tool')).toBe('any tool')
    expect(getProficiencyPoolAnyScopePhrase('tool')).toBe('any tools')
    expect(getProficiencyPoolSelectedPhrase('weapon')).toBe('selected weapons')
  })

  it('formats authoring fallback phrases', () => {
    expect(formatProficiencyGrantChoosePhrase('skill', 2)).toBe('choose 2 skill proficiencies')
    expect(formatProficiencyGrantChooseFromSelectedPhrase('armor', 1)).toBe(
      'choose 1 from selected armor',
    )
    expect(formatProficiencyGrantChooseFromAnyScopePhrase('skill', 3)).toBe(
      'choose 3 from any skills',
    )
  })

  it('returns builder add labels', () => {
    expect(getProficiencyGrantAddLabel('weapon')).toBe('Add weapon proficiency')
    expect(getProficiencyGrantAddLabel('armor')).toBe('Add armor training')
  })
})
