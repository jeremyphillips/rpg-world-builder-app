import { describe, expect, it } from 'vitest'
import {
  ORGANIZATION_AUTHORING_PRESET_IDS,
  ORGANIZATION_AUTHORING_PRESETS,
  type OrganizationAuthoringPresetId,
} from '@rpg/contracts'

import { presetMatchesIntentionalQuery } from './__tests__/organization-preset-intentional-matcher'
import {
  ORGANIZATION_PRESET_COVERAGE_FIXTURE,
  ORGANIZATION_PRESET_COVERAGE_OUTCOMES,
  type OrganizationPresetCoverageOutcome,
  type OrganizationPresetCoverageRow,
} from './__tests__/fixtures/organization-preset-coverage.fixture'

const MIN_ELIGIBLE_COVERAGE_RATE = 0.9

function summarizeCoverage(rows: readonly OrganizationPresetCoverageRow[]) {
  const counts = Object.fromEntries(
    ORGANIZATION_PRESET_COVERAGE_OUTCOMES.map((outcome) => [outcome, 0]),
  ) as Record<OrganizationPresetCoverageOutcome, number>

  for (const row of rows) {
    counts[row.outcome] += 1
  }

  const inappropriate = counts.inappropriate
  const eligible = rows.length - inappropriate
  const covered = counts.direct + counts.discoverable
  const coverageRate = eligible === 0 ? 0 : covered / eligible

  return { counts, eligible, covered, coverageRate, inappropriate }
}

describe('organization preset coverage (Phase 4 final)', () => {
  it('freezes exactly 150 unique corpus ids with a closed outcome enum', () => {
    expect(ORGANIZATION_PRESET_COVERAGE_FIXTURE).toHaveLength(150)

    const ids = ORGANIZATION_PRESET_COVERAGE_FIXTURE.map((row) => row.id)
    expect(new Set(ids).size).toBe(150)

    for (const row of ORGANIZATION_PRESET_COVERAGE_FIXTURE) {
      expect(ORGANIZATION_PRESET_COVERAGE_OUTCOMES).toContain(row.outcome)
    }
  })

  it('requires parent ids to be live presets when present', () => {
    for (const row of ORGANIZATION_PRESET_COVERAGE_FIXTURE) {
      if (!('parent' in row) || !row.parent) continue
      expect(ORGANIZATION_AUTHORING_PRESET_IDS).toContain(row.parent)
    }
  })

  it('maps direct rows to live preset ids', () => {
    const directRows = ORGANIZATION_PRESET_COVERAGE_FIXTURE.filter(
      (row) => row.outcome === 'direct',
    )

    expect(directRows).toHaveLength(ORGANIZATION_AUTHORING_PRESET_IDS.length)

    for (const row of directRows) {
      expect(ORGANIZATION_AUTHORING_PRESET_IDS).toContain(row.id as OrganizationAuthoringPresetId)
      expect(ORGANIZATION_AUTHORING_PRESETS[row.id as OrganizationAuthoringPresetId].label).toBe(
        row.query,
      )
    }
  })

  it('matches discoverable rows through label or discoveryTerms only', () => {
    const mismatches: string[] = []

    for (const row of ORGANIZATION_PRESET_COVERAGE_FIXTURE) {
      if (row.outcome !== 'discoverable' || !('parent' in row) || !row.parent) continue

      const preset = ORGANIZATION_AUTHORING_PRESETS[row.parent]
      const matched = presetMatchesIntentionalQuery(row.parent, preset, row.query)
      if (!matched) mismatches.push(`${row.id} → ${row.parent}`)
    }

    expect(mismatches, mismatches.join('\n')).toEqual([])
  })

  it('keeps zero undiscoverable rows in the final fixture', () => {
    expect(summarizeCoverage(ORGANIZATION_PRESET_COVERAGE_FIXTURE).counts.undiscoverable).toBe(0)
  })

  it('does not let Trading company match shipping queries', () => {
    const shippingRow = ORGANIZATION_PRESET_COVERAGE_FIXTURE.find(
      (row) => row.id === 'shipping_company',
    )
    expect(shippingRow?.outcome).toBe('direct')

    const tradingCompany = ORGANIZATION_AUTHORING_PRESETS.trading_company
    expect(
      presetMatchesIntentionalQuery('trading_company', tradingCompany, 'Shipping company'),
    ).toBe(false)
    expect(presetMatchesIntentionalQuery('trading_company', tradingCompany, 'shipping')).toBe(false)
  })

  it('meets the v2 eligible coverage bar with zero undiscoverable rows', () => {
    const summary = summarizeCoverage(ORGANIZATION_PRESET_COVERAGE_FIXTURE)

    expect(summary.counts).toEqual({
      direct: 20,
      discoverable: 102,
      undiscoverable: 0,
      weak: 2,
      no_start: 11,
      inappropriate: 15,
    })
    expect(summary.inappropriate).toBe(15)
    expect(summary.eligible).toBe(135)
    expect(summary.covered).toBe(122)
    expect(summary.coverageRate).toBeGreaterThanOrEqual(MIN_ELIGIBLE_COVERAGE_RATE)
    expect(summary.coverageRate).toBeCloseTo(122 / 135, 5)
  })
})
