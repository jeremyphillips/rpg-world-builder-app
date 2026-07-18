import { describe, expect, it } from 'vitest'

import {
  PERSONAL_NAME_COMPONENT_ENTRIES,
  PERSONAL_NAME_COMPONENTS,
  personalNameComponentSchema,
} from './personal-name-component'

describe('personal name component vocabulary', () => {
  it('keeps entries, const tuple, and schema in parity', () => {
    expect(PERSONAL_NAME_COMPONENTS).toEqual(Object.keys(PERSONAL_NAME_COMPONENT_ENTRIES))
    for (const component of PERSONAL_NAME_COMPONENTS) {
      expect(personalNameComponentSchema.safeParse(component).success).toBe(true)
    }
  })

  it('includes house in the vocabulary', () => {
    expect(PERSONAL_NAME_COMPONENT_ENTRIES.house.label).toBe('House name')
    expect(PERSONAL_NAME_COMPONENTS).toContain('house')
  })
})
