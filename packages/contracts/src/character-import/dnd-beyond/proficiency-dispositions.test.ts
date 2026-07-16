import { describe, expect, it } from 'vitest'

import { resolveDndBeyondProficiencyDisposition } from './proficiency-dispositions'

describe('resolveDndBeyondProficiencyDisposition', () => {
  it('ignores saving throw proficiency subtypes', () => {
    const rule = resolveDndBeyondProficiencyDisposition('intelligence-saving-throws')
    expect(rule).toMatchObject({
      disposition: 'ignored',
      reason: 'resolved-from-local-content',
      targetPath: 'proficiencies.savingThrows',
    })
  })

  it('ignores weapon category proficiency subtypes', () => {
    const rule = resolveDndBeyondProficiencyDisposition('simple-weapons')
    expect(rule).toMatchObject({
      disposition: 'ignored',
      reason: 'derived-from-class',
      targetPath: 'proficiencies.weaponCategories',
    })
  })

  it('returns undefined for mappable skill subtypes', () => {
    expect(resolveDndBeyondProficiencyDisposition('persuasion')).toBeUndefined()
  })
})
