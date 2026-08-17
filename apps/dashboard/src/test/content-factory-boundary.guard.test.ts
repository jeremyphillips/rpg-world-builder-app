import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  collectContentFactoryBoundaryViolations,
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

describe('content factory boundary guard', () => {
  it('does not introduce new hand-rolled content entity construction', () => {
    const currentViolations = collectContentFactoryBoundaryViolations()
    const baselineKeys = new Set(baseline.violations.map(violationKey))

    const newViolations = currentViolations.filter(
      (violation) => !baselineKeys.has(violationKey(violation)),
    )

    expect(newViolations).toEqual([])
  })
})
