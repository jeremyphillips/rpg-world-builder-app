import { describe, expect, it } from 'vitest'

import { resolveCatalog } from './resolve-catalog'

interface Record_ {
  id: string
  name: string
  hitDie?: number
}

const system: Record_[] = [
  { id: 'sys:a', name: 'A', hitDie: 8 },
  { id: 'sys:b', name: 'B', hitDie: 10 },
]

describe('resolveCatalog', () => {
  it('returns the system catalog unchanged when there are no patches or homebrew', () => {
    expect(resolveCatalog(system, [], [])).toEqual(system)
  })

  it('deep-merges an overlay patch onto its target by id', () => {
    const result = resolveCatalog(system, [{ targetId: 'sys:b', patch: { hitDie: 12 } }], [])
    expect(result.find((r) => r.id === 'sys:b')?.hitDie).toBe(12)
    expect(result.find((r) => r.id === 'sys:a')?.hitDie).toBe(8)
  })

  it('appends homebrew records after the resolved system records', () => {
    const homebrew: Record_[] = [{ id: 'hb:1', name: 'Homebrew' }]
    const result = resolveCatalog(system, [], homebrew)
    expect(result).toHaveLength(3)
    expect(result.at(-1)).toEqual({ id: 'hb:1', name: 'Homebrew' })
  })

  it('ignores patches whose target is not in the system catalog', () => {
    const result = resolveCatalog(system, [{ targetId: 'sys:gone', patch: { hitDie: 4 } }], [])
    expect(result).toEqual(system)
  })

  it('does not mutate the system seed', () => {
    resolveCatalog(system, [{ targetId: 'sys:a', patch: { hitDie: 99 } }], [])
    expect(system[0]?.hitDie).toBe(8)
  })
})
