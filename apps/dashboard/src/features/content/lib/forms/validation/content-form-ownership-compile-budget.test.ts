import { describe, expect, it } from 'vitest'
import { compileFormOwnership, FORM_OWNERSHIP_COMPILE_BUDGET_MS } from '@rpg/ui/form'

import { buildClassTabs } from '../../../classes/lib/class-form-fields'
import { buildMonsterTabs } from '../../../monsters/lib/monster-form-fields'

const PILOT_COMPILE_TARGETS = [
  { name: 'classes', items: buildClassTabs({}) },
  { name: 'monsters', items: buildMonsterTabs({}) },
] as const

describe('content form ownership compile pilot budget', () => {
  it.each(PILOT_COMPILE_TARGETS)(
    'compiles $name static topology within pilot compile budget',
    ({ items }) => {
      const started = performance.now()
      const compiled = compileFormOwnership(items, {})
      const elapsed = performance.now() - started

      expect(compiled.paths.size).toBeGreaterThan(0)
      expect(elapsed).toBeLessThan(FORM_OWNERSHIP_COMPILE_BUDGET_MS)
    },
  )

  it.each(PILOT_COMPILE_TARGETS)(
    'reuses the same static ownership index when $name config identity is unchanged',
    ({ items }) => {
      const first = compileFormOwnership(items, {})
      const second = compileFormOwnership(items, {})

      expect(second.paths.size).toBe(first.paths.size)
      expect([...second.paths].sort()).toEqual([...first.paths].sort())

      const secondStarted = performance.now()
      compileFormOwnership(items, {})
      expect(performance.now() - secondStarted).toBeLessThan(FORM_OWNERSHIP_COMPILE_BUDGET_MS)
    },
  )
})
