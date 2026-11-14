import { describe, expect, it } from 'vitest'
import {
  monsterBodySchema,
  updateMonsterInputSchema,
  updateMonsterDraftInputSchema,
} from '../monster'
import {
  collectMonsterClassificationIssues,
  formatMonsterClassification,
} from './monster-classification'
import { MONSTER_TEST_BODY } from './test-fixtures'

const creatureFamilies = new Map([
  ['demon', { id: 'demon', label: 'Demon', allowedCreatureTypes: ['fiend'] }],
  ['retired', { id: 'retired', label: 'Retired', status: 'disabled' }],
])
describe('monster classifications', () => {
  it('round trips optional arrays and rejects duplicates', () => {
    const body = { ...MONSTER_TEST_BODY, creatureFamilyIds: ['demon'], classIds: ['custom:class'] }
    expect(monsterBodySchema.parse(body)).toMatchObject({
      creatureFamilyIds: ['demon'],
      classIds: ['custom:class'],
    })
    expect(monsterBodySchema.safeParse({ ...body, classIds: ['same', 'same'] }).success).toBe(false)
    expect(
      monsterBodySchema.safeParse({ ...body, creatureFamilyIds: ['demon', 'demon'] }).success,
    ).toBe(false)
    for (const schema of [updateMonsterInputSchema, updateMonsterDraftInputSchema]) {
      expect(schema.parse({ creatureFamilyIds: null, classIds: null })).toMatchObject({
        creatureFamilyIds: null,
        classIds: null,
      })
    }
  })
  it('preserves invalid draft refs but rejects missing/disabled/incompatible family refs on publish', () => {
    const body = {
      creatureType: 'humanoid',
      creatureFamilyIds: ['demon', 'retired', 'missing'],
      classIds: ['missing'],
    }
    expect(collectMonsterClassificationIssues(body, {}, 'draft')).toEqual([])
    const issues = collectMonsterClassificationIssues(
      body,
      { creatureFamilies, classesById: new Map() },
      'publish',
    )
    expect(issues.map((issue) => issue.path)).toEqual([
      'classIds.0',
      'creatureFamilyIds.0',
      'creatureFamilyIds.1',
      'creatureFamilyIds.2',
    ])
    expect(
      collectMonsterClassificationIssues(
        { creatureType: 'fiend', creatureFamilyIds: ['demon'] },
        { creatureFamilies },
        'publish',
      ),
    ).toEqual([])
  })
  it('distinguishes unavailable catalogs from missing ids and needs no context for absent classifications', () => {
    expect(collectMonsterClassificationIssues({}, {}, 'publish')).toEqual([])
    const issues = collectMonsterClassificationIssues(
      { classIds: ['wizard'], creatureFamilyIds: ['demon'] },
      {},
      'publish',
    )
    expect(issues).toHaveLength(2)
    expect(issues.every((issue) => issue.message.includes('could not be loaded'))).toBe(true)
  })
  it('formats direct families then classes and preserves unknown references', () => {
    expect(formatMonsterClassification({}, { creatureTypeLabel: 'Humanoid' })).toBe('Humanoid')
    expect(
      formatMonsterClassification(
        { creatureFamilyIds: ['demon', 'titan'], classIds: ['wizard'] },
        {
          creatureTypeLabel: 'Fiend',
          familyLabel: (id) => (id === 'demon' ? 'Demon' : 'Titan'),
          classLabel: () => 'Wizard',
        },
      ),
    ).toBe('Fiend (Demon, Titan, Wizard)')
    expect(
      formatMonsterClassification(
        { creatureFamilyIds: ['unknown'] },
        { creatureTypeLabel: 'Dragon' },
      ),
    ).toContain('unknown · Unresolved reference')
  })
})
