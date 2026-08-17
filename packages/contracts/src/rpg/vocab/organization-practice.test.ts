import { describe, expect, it } from 'vitest'

import { getOrganizationFunctionEntry, ORGANIZATION_FUNCTION_IDS } from './organization-function'
import {
  ORGANIZATION_PRACTICE_ENTRIES,
  ORGANIZATION_PRACTICE_IDS,
  getOrganizationPracticeDiscoveryTerms,
  getOrganizationPracticeEntry,
  organizationPracticeSchema,
} from './organization-practice'

const EXPECTED_PRACTICE_IDS = [
  'blacksmithing',
  'brewing',
  'banking',
  'apprenticeship',
  'smuggling',
  'extortion',
  'alchemy',
  'carpentry',
  'shipbuilding',
  'glassmaking',
  'cartography',
  'navigation',
  'hunting',
  'farming',
  'couriering',
  'medicine',
  'apothecary',
  'scribing',
  'theft',
  'assassination',
  'counterfeiting',
  'fencing',
  'piracy',
  'espionage',
  'scouting',
  'performance',
  'masonry',
  'weaving',
  'tailoring',
  'leatherworking',
  'cobbling',
  'mining',
  'logging',
  'milling',
  'distilling',
  'fishing',
  'printing',
  'warehousing',
  'salvage',
  'brokerage',
  'surveying',
  'translation',
  'archiving',
  'engineering',
  'divination',
  'midwifery',
  'kidnapping',
  'poisoning',
  'gambling',
  'bounty_hunting',
  'bodyguarding',
  'siegecraft',
  'tracking',
  'investigation',
  'exorcism',
  'pilgrimage',
  'funerary_rites',
  'publishing',
] as const

describe('Organization Practice vocabulary', () => {
  it('keeps a schema-backed registry with frozen id order', () => {
    expect(ORGANIZATION_PRACTICE_IDS).toEqual(EXPECTED_PRACTICE_IDS)
    expect(Object.keys(ORGANIZATION_PRACTICE_ENTRIES)).toEqual(ORGANIZATION_PRACTICE_IDS)
    expect(organizationPracticeSchema.parse('blacksmithing')).toBe('blacksmithing')
    expect(organizationPracticeSchema.parse('medicine')).toBe('medicine')
    expect(organizationPracticeSchema.parse('theft')).toBe('theft')
  })

  it('defines non-empty labels and descriptions with five member titles each', () => {
    for (const entry of Object.values(ORGANIZATION_PRACTICE_ENTRIES)) {
      expect(entry.label.trim()).not.toBe('')
      expect(entry.description.trim()).not.toBe('')
      expect(entry.memberTitles).toHaveLength(5)
    }
  })

  it('keeps function and practice ids disjoint', () => {
    const overlap = ORGANIZATION_FUNCTION_IDS.filter((id) =>
      (ORGANIZATION_PRACTICE_IDS as readonly string[]).includes(id),
    )
    expect(overlap).toEqual([])
  })

  it('admits v1 criminal Practices while rejecting burglary and robbery as separate ids', () => {
    for (const admitted of [
      'theft',
      'assassination',
      'fencing',
      'counterfeiting',
      'piracy',
      'extortion',
      'smuggling',
    ]) {
      expect(organizationPracticeSchema.parse(admitted)).toBe(admitted)
    }

    for (const rejected of ['burglary', 'robbery']) {
      expect(organizationPracticeSchema.safeParse(rejected)).toMatchObject({ success: false })
    }
  })

  it('surfaces alias terms in discovery without creating duplicate ids', () => {
    expect(getOrganizationPracticeDiscoveryTerms('counterfeiting')).toEqual(
      expect.arrayContaining(['Counterfeiting', 'forgery']),
    )
    expect(getOrganizationPracticeDiscoveryTerms('theft')).toEqual(
      expect.arrayContaining(['burglary', 'robbery', 'larceny']),
    )
    expect(getOrganizationPracticeDiscoveryTerms('alchemy')).toEqual(
      expect.arrayContaining(['potion making', 'potions']),
    )
    expect(getOrganizationPracticeDiscoveryTerms('hunting')).not.toEqual(
      expect.arrayContaining(['tracking']),
    )
    expect(getOrganizationPracticeDiscoveryTerms('fencing')).toEqual(
      expect.arrayContaining(['stolen-goods fencing', 'fence network']),
    )
    expect(ORGANIZATION_PRACTICE_IDS).not.toContain('forgery')
    expect(ORGANIZATION_PRACTICE_IDS).not.toContain('burglary')
    expect(ORGANIZATION_PRACTICE_IDS).not.toContain('robbery')
    expect(ORGANIZATION_PRACTICE_IDS).not.toContain('potion_making')
  })

  it('keeps composition pairs distinct from nearest Functions', () => {
    expect(getOrganizationPracticeEntry('navigation')?.description).not.toBe(
      getOrganizationFunctionEntry('transport')?.description,
    )
    expect(getOrganizationPracticeEntry('espionage')?.description).not.toBe(
      getOrganizationFunctionEntry('intelligence')?.description,
    )
    expect(getOrganizationPracticeEntry('medicine')?.description).not.toBe(
      getOrganizationFunctionEntry('care')?.description,
    )
    expect(getOrganizationPracticeEntry('shipbuilding')?.description).not.toBe(
      getOrganizationFunctionEntry('production')?.description,
    )
    expect(getOrganizationPracticeEntry('banking')?.description).not.toBe(
      getOrganizationFunctionEntry('finance')?.description,
    )
    expect(getOrganizationPracticeEntry('smuggling')?.description).not.toBe(
      getOrganizationPracticeEntry('fencing')?.description,
    )
  })
})
