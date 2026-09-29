import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'

import {
  collectContentFactoryBoundaryViolations,
  collectProtectedContentTypeNames,
  getContentFactoryBoundaryAnalysis,
  violationKey,
  type ContentFactoryBoundaryViolation,
} from './content-factory-boundary.lib'

type BaselineFile = {
  violations: Array<{
    file: string
    kind: ContentFactoryBoundaryViolation['kind']
    type: string
    line: number
    fingerprint: string
  }>
}

const baselinePath = join(import.meta.dirname, 'content-factory-boundary.baseline.json')
const baseline = JSON.parse(readFileSync(baselinePath, 'utf8')) as BaselineFile

const EXPECTED_PROTECTED_TYPES = [
  'Campaign',
  'CampaignListItem',
  'CampaignNpcDetail',
  'CampaignNpcListItem',
  'CharacterBuildCatalog',
  'CharacterClass',
  'ClassStored',
  'Equipment',
  'Feat',
  'Location',
  'Organization',
  'PcCharacter',
  'SkillProficiency',
  'Species',
  'Spell',
  'Subclass',
] as const

describe('content factory boundary', () => {
  beforeAll(() => {
    getContentFactoryBoundaryAnalysis()
  }, 60_000)

  it('resolves protected content type names from factory return types', () => {
    expect(collectProtectedContentTypeNames()).toEqual([...EXPECTED_PROTECTED_TYPES].sort())
  })

  it('does not flag locations/fixtures.ts after makeLocation migration', () => {
    const violations = collectContentFactoryBoundaryViolations()
    expect(
      violations.some((violation) => violation.file === 'features/content/locations/fixtures.ts'),
    ).toBe(false)
  })

  it('does not introduce new hand-rolled content entity construction', () => {
    const currentViolations = collectContentFactoryBoundaryViolations()
    const baselineKeys = new Set(baseline.violations.map(violationKey))

    const newViolations = currentViolations.filter(
      (violation) => !baselineKeys.has(violationKey(violation)),
    )

    expect(newViolations).toEqual([])
  })
})
