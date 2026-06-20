import { describe, expect, it, beforeEach } from 'vitest'

import {
  buildAccordionBatchKey,
  readAccordionBatchOpen,
  resetAccordionBatchStateForTests,
  writeAccordionBatchOpen,
} from './form-accordion-state'

describe('form-accordion-state', () => {
  beforeEach(() => {
    resetAccordionBatchStateForTests()
  })
  it('buildAccordionBatchKey uses section ids, not React useId prefixes', () => {
    const sections = [
      { item: { kind: 'group' as const, legend: 'A', fields: [] }, index: 0 },
      { item: { kind: 'array' as const, name: 'tags', legend: 'Tags', fields: [] }, index: 1 },
    ]
    const key = buildAccordionBatchKey('_r_8_', sections, (item, index) =>
      item.kind === 'array' ? `array-${item.name}` : `group-${index}`,
    )
    expect(key).toBe('group-0|array-tags')
  })

  it('persists open values across reads', () => {
    writeAccordionBatchOpen('group-0|array-tags', ['array-tags'])
    expect(readAccordionBatchOpen('group-0|array-tags', ['group-0', 'array-tags'])).toEqual([
      'array-tags',
    ])
  })

  it('prefers in-memory map over sessionStorage when both differ', () => {
    writeStorageDirect('group-0|array-tags', ['group-0', 'array-tags'])
    writeAccordionBatchOpen('group-0|array-tags', ['array-tags'])
    expect(readAccordionBatchOpen('group-0|array-tags', ['group-0', 'array-tags'])).toEqual([
      'array-tags',
    ])
  })
})

/** Test-only helper to seed sessionStorage without touching the in-memory map. */
function writeStorageDirect(batchKey: string, values: string[]): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(`rpg-form-accordion:${batchKey}`, JSON.stringify(values))
}
