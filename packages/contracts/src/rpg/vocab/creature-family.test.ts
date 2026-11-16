import { describe, expect, it } from 'vitest'
import {
  creatureFamilyDefinitionSchema,
  isCreatureFamilyCompatible,
  validateCreatureFamilyDefinitions,
} from './creature-family'

const types = new Set(['dragon', 'fiend', 'monstrosity', 'custom-type'])
describe('creature family definitions', () => {
  it('supports optional metadata and independently compatible children', () => {
    const families = [
      { id: 'root', label: 'Root', allowedCreatureTypes: ['fiend'] },
      { id: 'child', label: 'Child', parentId: 'root', allowedCreatureTypes: ['dragon'] },
    ]
    expect(() => validateCreatureFamilyDefinitions(families, types)).not.toThrow()
    expect(isCreatureFamilyCompatible(families[1]!, 'dragon')).toBe(true)
    expect(isCreatureFamilyCompatible(families[1]!, 'fiend')).toBe(false)
    expect(isCreatureFamilyCompatible({}, 'custom-type')).toBe(true)
  })
  it.each([
    [{ id: 'a', label: 'A', parentId: 'a' }],
    [{ id: 'a', label: 'A', parentId: 'b' }],
    [
      { id: 'a', label: 'A', parentId: 'b' },
      { id: 'b', label: 'B', parentId: 'a' },
    ],
    [{ id: 'a', label: 'A', allowedCreatureTypes: ['missing'] }],
    [
      { id: 'a', label: 'A' },
      { id: 'a', label: 'A' },
    ],
  ])('rejects invalid effective definitions %#', (...families) => {
    expect(() => validateCreatureFamilyDefinitions(families, types)).toThrow()
  })
  it('rejects empty or duplicate compatibility lists', () => {
    expect(
      creatureFamilyDefinitionSchema.safeParse({ id: 'a', label: 'A', allowedCreatureTypes: [] })
        .success,
    ).toBe(false)
    expect(
      creatureFamilyDefinitionSchema.safeParse({
        id: 'a',
        label: 'A',
        allowedCreatureTypes: ['dragon', 'dragon'],
      }).success,
    ).toBe(false)
  })
})
