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
})
