import { describe, expect, it } from 'vitest'

import { composeMonsterSystemPatch, reconcileStickyRows } from './system-patch-sticky-arrays'

const seedTraits = [
  { id: 'swarm', preset: 'swarm', noun: 'insect' },
  { id: 'spider-climb', preset: 'spider-climb' },
]
const seedBody = {
  name: 'Swarm of Insects',
  movement: { walk: 20 },
  movementAlternative: { modes: ['climb', 'fly'], feet: 20 },
  traits: seedTraits,
  actions: [] as unknown[],
}

const stickyArrayKeys = ['traits', 'actions', 'bonusActions', 'reactions']

describe('reconcileStickyRows', () => {
  it('keeps request order and appends missing seed rows in seed order', () => {
    const homebrew = { id: 'stinger', kind: 'custom', name: 'Stinger' }
    const edited = { id: 'swarm', preset: 'swarm', noun: 'beetle' }
    expect(reconcileStickyRows(seedTraits, seedTraits, [homebrew, edited])).toEqual([
      homebrew,
      edited,
      seedTraits[1],
    ])
  })

  it('drops duplicate ids and leaves an empty seed list empty', () => {
    expect(reconcileStickyRows([], [], [])).toEqual([])
    expect(
      reconcileStickyRows(seedTraits, seedTraits, [seedTraits[0], { ...seedTraits[0], noun: 'x' }]),
    ).toEqual([seedTraits[0], seedTraits[1]])
  })
})

describe('composeMonsterSystemPatch', () => {
  it('omitting traits keeps a homebrew row and does not invent an empty list', () => {
    const homebrew = { id: 'stinger', kind: 'custom', name: 'Stinger' }
    const existingTraits = [...seedTraits, homebrew]
    const result = composeMonsterSystemPatch({
      seedBody,
      existingPatch: { traits: existingTraits },
      update: { movement: { walk: 30 } },
      replaceKeys: ['movement'],
      tombstoneKeys: ['movementAlternative'],
      stickyArrayKeys,
    })
    expect(result.mergedBody.traits).toEqual(existingTraits)
    expect(result.cumulativePatch.traits).toEqual(existingTraits)
    expect(result.cumulativePatch.movement).toEqual({ walk: 30 })
  })

  it('treats an explicit empty array as a replacement that restores seed rows only', () => {
    const homebrew = { id: 'stinger', kind: 'custom', name: 'Stinger' }
    const result = composeMonsterSystemPatch({
      seedBody,
      existingPatch: { traits: [...seedTraits, homebrew] },
      update: { traits: [] },
      stickyArrayKeys,
    })
    expect(result.mergedBody.traits).toEqual(seedTraits)
    expect(result.cumulativePatch.traits).toBeUndefined()
  })

  it('stores a whole traits array when one seed row changes, pinning the other row', () => {
    const edited = { ...seedTraits[0], noun: 'beetle' }
    const result = composeMonsterSystemPatch({
      seedBody,
      existingPatch: {},
      update: { traits: [edited, seedTraits[1]] },
      stickyArrayKeys,
    })
    expect(result.cumulativePatch.traits).toEqual([edited, seedTraits[1]])
    expect(result.mergedBody.traits).toEqual([edited, seedTraits[1]])
  })

  it('removes a stale movement override when the value returns to the seed', () => {
    const restored = composeMonsterSystemPatch({
      seedBody,
      existingPatch: { movement: { walk: 30 }, traits: seedTraits },
      update: { movement: { walk: 20 } },
      replaceKeys: ['movement'],
      stickyArrayKeys,
    })
    expect(restored.cumulativePatch.movement).toBeUndefined()
    expect(restored.cumulativePatch.traits).toBeUndefined()
  })

  it('keeps a seed movementAlternative tombstone across an unrelated save and drops an overlay-only clear', () => {
    const cleared = composeMonsterSystemPatch({
      seedBody,
      existingPatch: {},
      update: { movementAlternative: null },
      tombstoneKeys: ['movementAlternative'],
      stickyArrayKeys,
    })
    expect(cleared.mergedBody.movementAlternative).toBeUndefined()
    expect(cleared.cumulativePatch.movementAlternative).toBeNull()

    const unrelated = composeMonsterSystemPatch({
      seedBody,
      existingPatch: cleared.cumulativePatch,
      update: { name: 'Swarm of Insects' },
      tombstoneKeys: ['movementAlternative'],
      stickyArrayKeys,
    })
    expect(unrelated.cumulativePatch.movementAlternative).toBeNull()
    expect(unrelated.mergedBody.movementAlternative).toBeUndefined()

    const overlayOnly = composeMonsterSystemPatch({
      seedBody: { ...seedBody, movementAlternative: undefined },
      existingPatch: { movementAlternative: { modes: ['fly', 'swim'], feet: 10 } },
      update: { movementAlternative: null },
      tombstoneKeys: ['movementAlternative'],
      stickyArrayKeys,
    })
    expect(overlayOnly.cumulativePatch.movementAlternative).toBeUndefined()
  })

  it('read-repairs a poisoned traits array on the response without clearing it from the stored patch', () => {
    const result = composeMonsterSystemPatch({
      seedBody,
      existingPatch: { traits: [] },
      update: { movement: { walk: 30 } },
      replaceKeys: ['movement'],
      stickyArrayKeys,
    })
    expect(result.mergedBody.traits).toEqual(seedTraits)
    expect(result.cumulativePatch.traits).toEqual([])
    expect(result.cumulativePatch.movement).toEqual({ walk: 30 })
  })
})
