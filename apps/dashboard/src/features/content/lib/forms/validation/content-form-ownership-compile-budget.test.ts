import { describe, expect, it } from 'vitest'
import {
  collectRowVariantTopologyFields,
  compileFormOwnership,
  FORM_OWNERSHIP_COMPILE_BUDGET_MS,
  type FormItem,
} from '@rpg/ui/form'

import { buildClassTabs } from '../../../classes/lib/class-form-fields'
import { buildClassFeatureRowVariantTopology } from '../../../classes/lib/class-feature-form-fields'
import { buildEquipmentFields } from '../../../equipment/lib/equipment-form-fields'
import { buildMonsterTabs } from '../../../monsters/lib/monster-form-fields'
import { movementAlternativeGroupField } from '../../../lib/forms/fields/content-movement-form-fields'

const PILOT_COMPILE_TARGETS = [
  { name: 'classes', items: buildClassTabs({}) },
  { name: 'monsters', items: buildMonsterTabs({}) },
] as const

const FV_015_COMPILE_RECORD_PREFIX = 'FV-015-compile-record:'

function recordOwnershipCompile(identity: string, callIndex: number, items: readonly FormItem[]) {
  const started = performance.now()
  const compiled = compileFormOwnership(items, {})
  const elapsedMs = performance.now() - started

  console.log(
    `${FV_015_COMPILE_RECORD_PREFIX} identity=${identity} call=${callIndex} elapsedMs=${elapsedMs.toFixed(3)} pathCount=${compiled.paths.size}`,
  )

  return { compiled, elapsedMs }
}

describe('content form ownership compile pilot budget', () => {
  it.each(PILOT_COMPILE_TARGETS)(
    'compiles $name static topology once per config identity within pilot compile budget',
    ({ name, items }) => {
      const { compiled, elapsedMs } = recordOwnershipCompile(name, 1, items)

      expect(compiled.paths.size).toBeGreaterThan(0)
      expect(elapsedMs).toBeLessThan(FORM_OWNERSHIP_COMPILE_BUDGET_MS)
    },
  )

  it.each(PILOT_COMPILE_TARGETS)(
    'reuses the same static ownership index when $name config identity is unchanged (one compile per identity)',
    ({ name, items }) => {
      const { compiled: first } = recordOwnershipCompile(name, 1, items)
      const { compiled: second, elapsedMs: secondElapsed } = recordOwnershipCompile(name, 2, items)

      expect(second.paths.size).toBe(first.paths.size)
      expect([...second.paths].sort()).toEqual([...first.paths].sort())
      expect(secondElapsed).toBeLessThan(FORM_OWNERSHIP_COMPILE_BUDGET_MS)
    },
  )

  it('compiles monster tab topology once per unchanged config identity (FV-015)', () => {
    const items = buildMonsterTabs({})
    const { compiled: first, elapsedMs: firstElapsed } = recordOwnershipCompile(
      'monsters',
      1,
      items,
    )
    const { compiled: second, elapsedMs: secondElapsed } = recordOwnershipCompile(
      'monsters',
      2,
      items,
    )

    expect(first.paths.size).toBeGreaterThan(0)
    expect([...second.paths].sort()).toEqual([...first.paths].sort())
    expect(firstElapsed).toBeLessThan(FORM_OWNERSHIP_COMPILE_BUDGET_MS)
    expect(secondElapsed).toBeLessThan(FORM_OWNERSHIP_COMPILE_BUDGET_MS)
  })

  it('compiles monster movement alternative modes without validation path metadata', () => {
    const movementField = movementAlternativeGroupField()
    const compiled = compileFormOwnership([movementField], {})

    expect(compiled.paths.has('movementAlternative.modes')).toBe(true)
    expect(
      JSON.stringify(movementField).includes('errorPaths') ||
        JSON.stringify(movementField).includes('resolverFields'),
    ).toBe(false)
  })

  it('compiles equipment weapon and armor kind topologies within the pilot budget', () => {
    for (const kind of ['weapon', 'armor'] as const) {
      const fields = buildEquipmentFields({ equipmentKind: kind })
      const started = performance.now()
      const compiled = compileFormOwnership(fields, {})
      expect(performance.now() - started).toBeLessThan(FORM_OWNERSHIP_COMPILE_BUDGET_MS)
      expect(compiled.paths.size).toBeGreaterThan(0)
      expect(
        JSON.stringify(fields).includes('errorPaths') ||
          JSON.stringify(fields).includes('resolverFields'),
      ).toBe(false)
    }
  })

  it('compiles class feature spellcasting intro from declared variant topology', () => {
    const topology = buildClassFeatureRowVariantTopology({})
    const variantFields = collectRowVariantTopologyFields(topology)
    const compiled = compileFormOwnership(variantFields, {})

    expect(compiled.paths.has('intro')).toBe(true)
    expect(
      variantFields.some(
        (item) =>
          JSON.stringify(item).includes('errorPaths') ||
          JSON.stringify(item).includes('resolverFields'),
      ),
    ).toBe(false)
  })
})
