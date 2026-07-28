import { describe, expect, it } from 'vitest'

import { NAME_SUBJECT_KIND_ENTRIES } from './index'
import {
  PERSONAL_NAME_COMPONENT_ENTRIES,
  PERSONAL_NAME_COMPONENTS,
} from '../rpg/vocab/personal-name-component'

describe('naming vocabulary single source of truth', () => {
  it('exports labeled personal and subject vocab entries from name-generator index', () => {
    expect(PERSONAL_NAME_COMPONENT_ENTRIES).toBeDefined()
    expect(PERSONAL_NAME_COMPONENTS.length).toBeGreaterThan(0)
    expect(NAME_SUBJECT_KIND_ENTRIES.person.label).toBe('Person')
  })
})
