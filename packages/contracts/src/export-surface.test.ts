import { describe, expect, it } from 'vitest'

import snapshot from './export-surface.snapshot.json'
import * as contentExports from './rpg/content/index'
import * as rootExports from './index'

function exportNames(moduleExports: Record<string, unknown>): string[] {
  return Object.keys(moduleExports)
    .filter((name) => name !== 'default')
    .sort()
}

describe('@rpg/contracts export surface', () => {
  it('matches the committed root and content barrel snapshots', () => {
    expect(exportNames(rootExports)).toEqual([...snapshot.root])
    expect(exportNames(contentExports)).toEqual([...snapshot.content])
  })

  it('keeps high-risk reorganized symbols on both barrels', () => {
    const symbols = [
      'organizationSchema',
      'grantGroupSchema',
      'resolveLocationConnectionEligibility',
      'buildEquipmentCompactSummary',
      'DEFAULT_CONTENT_CAMPAIGN_ACCESS',
      'getCrossContentRelationshipProjection',
    ] as const

    for (const symbol of symbols) {
      expect(symbol in rootExports, `${symbol} missing from root`).toBe(true)
      expect(symbol in contentExports, `${symbol} missing from content`).toBe(true)
    }
  })
})
