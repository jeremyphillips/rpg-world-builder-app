import { describe, expect, it } from 'vitest'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '../fixtures/character-builder-fixtures'
import { SAMPLE_PC } from '../fixtures/character-fixtures'
import {
  buildCharacterEntitySummaryVmFromCatalog,
  buildCharacterEntitySummaryVmFromTransport,
  formatCharacterInlineSummary,
  formatCharacterMixedHeadingSuffix,
} from './character-entity-summary.lib'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)

describe('buildCharacterEntitySummaryVmFromCatalog', () => {
  it('includes structured parts and identity summary without type in identity', () => {
    const vm = buildCharacterEntitySummaryVmFromCatalog(SAMPLE_PC, catalogIndex, {
      characterType: 'pc',
      href: '/campaigns/camp-1/characters/char-sample-1',
    })

    expect(vm.parts).toBeDefined()
    expect(vm.identitySummary).toBe('Dwarf · Level 1 Fighter')
    expect(vm.characterType).toEqual({ value: 'pc', label: 'PC' })
    expect(vm.identitySummary).not.toContain('PC')
  })
})

describe('buildCharacterEntitySummaryVmFromTransport', () => {
  it('omits parts and preserves the transport summary as identitySummary', () => {
    const vm = buildCharacterEntitySummaryVmFromTransport({
      id: 'npc-1',
      name: 'Envoy',
      summary: 'Human · Level 3 Rogue',
      characterType: 'npc',
    })

    expect(vm.parts).toBeUndefined()
    expect(vm.identitySummary).toBe('Human · Level 3 Rogue')
    expect(vm.characterType).toEqual({ value: 'npc', label: 'NPC' })
  })
})

describe('formatCharacterInlineSummary', () => {
  it('prepends PC/NPC when includeCharacterType is true for transport summaries', () => {
    const vm = buildCharacterEntitySummaryVmFromTransport({
      id: 'npc-1',
      name: 'Envoy',
      summary: 'Human · Level 3 Rogue',
      characterType: 'npc',
    })

    expect(formatCharacterInlineSummary(vm, { includeCharacterType: true })).toBe(
      'NPC · Human · Level 3 Rogue',
    )
    expect(formatCharacterInlineSummary(vm, { includeCharacterType: false })).toBe(
      'Human · Level 3 Rogue',
    )
  })

  it('uses structured segments when parts are known', () => {
    const vm = buildCharacterEntitySummaryVmFromCatalog(SAMPLE_PC, catalogIndex, {
      characterType: 'pc',
    })

    expect(formatCharacterInlineSummary(vm, { includeCharacterType: true })).toBe(
      'PC · Dwarf · Level 1 Fighter',
    )
  })

  it('returns only the type label when identity is unknown', () => {
    const vm = buildCharacterEntitySummaryVmFromTransport({
      id: 'npc-1',
      name: 'Envoy',
      summary: '',
      characterType: 'npc',
    })

    expect(formatCharacterInlineSummary(vm, { includeCharacterType: true })).toBe('NPC')
  })
})

describe('formatCharacterMixedHeadingSuffix', () => {
  it('prefixes the inline mixed summary with the row separator', () => {
    const vm = buildCharacterEntitySummaryVmFromTransport({
      id: 'char-1',
      name: 'Verna',
      summary: 'Dwarf · Level 1 Fighter',
      characterType: 'pc',
    })

    expect(formatCharacterMixedHeadingSuffix(vm)).toBe(' · PC · Dwarf · Level 1 Fighter')
  })
})
