import { describe, expect, it } from 'vitest'

import {
  formatCharacterClassSegment,
  formatCharacterSpeciesSegment,
  formatCharacterSummary,
  type CharacterSummaryParts,
} from './character-summary-format'

describe('formatCharacterSpeciesSegment', () => {
  it('formats species with and without heritage', () => {
    expect(formatCharacterSpeciesSegment({ name: 'Dwarf' })).toBe('Dwarf')
    expect(formatCharacterSpeciesSegment({ name: 'Elf', heritageName: 'Drow' })).toBe('Elf (Drow)')
  })
})

describe('formatCharacterClassSegment', () => {
  it('omits per-class level when includeLevel is false', () => {
    expect(
      formatCharacterClassSegment(
        { name: 'Fighter', level: 4, subclassName: 'Battle Master' },
        { includeLevel: false },
      ),
    ).toBe('Fighter (Battle Master)')
  })

  it('includes per-class level when includeLevel is true', () => {
    expect(formatCharacterClassSegment({ name: 'Rogue', level: 1 }, { includeLevel: true })).toBe(
      'Rogue 1',
    )
  })
})

describe('formatCharacterSummary', () => {
  it.each<[string, CharacterSummaryParts]>([
    ['Dwarf', { classes: [], species: { name: 'Dwarf' } }],
    ['Elf (Drow)', { classes: [], species: { name: 'Elf', heritageName: 'Drow' } }],
    [
      'Dwarf · Level 4 Fighter',
      {
        species: { name: 'Dwarf' },
        classes: [{ name: 'Fighter', level: 4 }],
      },
    ],
    [
      'Elf (Drow) · Level 4 Fighter',
      {
        species: { name: 'Elf', heritageName: 'Drow' },
        classes: [{ name: 'Fighter', level: 4 }],
      },
    ],
    [
      'Dwarf · Level 4 Fighter (Battle Master)',
      {
        species: { name: 'Dwarf' },
        classes: [{ name: 'Fighter', level: 4, subclassName: 'Battle Master' }],
      },
    ],
    [
      'Elf (Drow) · Level 4 Fighter (Battle Master)',
      {
        species: { name: 'Elf', heritageName: 'Drow' },
        classes: [{ name: 'Fighter', level: 4, subclassName: 'Battle Master' }],
      },
    ],
    [
      'Dwarf · Level 4 · Fighter 3 / Rogue 1',
      {
        species: { name: 'Dwarf' },
        classes: [
          { name: 'Fighter', level: 3 },
          { name: 'Rogue', level: 1 },
        ],
      },
    ],
    [
      'Elf (Drow) · Level 4 · Fighter 3 / Rogue 1',
      {
        species: { name: 'Elf', heritageName: 'Drow' },
        classes: [
          { name: 'Fighter', level: 3 },
          { name: 'Rogue', level: 1 },
        ],
      },
    ],
    [
      'Dwarf · Level 6 · Fighter 4 (Battle Master) / Rogue 2',
      {
        species: { name: 'Dwarf' },
        classes: [
          { name: 'Fighter', level: 4, subclassName: 'Battle Master' },
          { name: 'Rogue', level: 2 },
        ],
      },
    ],
    [
      'Elf (Drow) · Level 8 · Fighter 5 (Battle Master) / Rogue 3 (Assassin)',
      {
        species: { name: 'Elf', heritageName: 'Drow' },
        classes: [
          { name: 'Fighter', level: 5, subclassName: 'Battle Master' },
          { name: 'Rogue', level: 3, subclassName: 'Assassin' },
        ],
      },
    ],
    ['Level 4 Fighter', { classes: [{ name: 'Fighter', level: 4 }] }],
    ['', { classes: [] }],
  ])('formats %s', (expected, parts) => {
    expect(formatCharacterSummary(parts)).toBe(expected)
  })

  it('does not append per-class level for single-class summaries', () => {
    expect(
      formatCharacterSummary({
        species: { name: 'Dwarf' },
        classes: [{ name: 'Fighter', level: 4 }],
      }),
    ).toBe('Dwarf · Level 4 Fighter')
    expect(
      formatCharacterSummary({
        species: { name: 'Dwarf' },
        classes: [{ name: 'Fighter', level: 4 }],
      }),
    ).not.toContain('Fighter 4')
  })

  it('omits blank class names without duplicate separators', () => {
    expect(
      formatCharacterSummary({
        species: { name: 'Dwarf' },
        classes: [{ name: '   ', level: 4 }],
      }),
    ).toBe('Dwarf')
  })
})
