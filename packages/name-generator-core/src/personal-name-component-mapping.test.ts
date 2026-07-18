import { describe, expect, it } from 'vitest'

import {
  NAME_PART_ROLES,
  PERSONAL_NAME_COMPONENTS,
  type PersonalNameComponent,
} from '@rpg/contracts/name-generator'

import {
  getPartRolesForPersonalNameComponent,
  isValidMappedPartRole,
  PERSONAL_COMPONENT_TO_PART_ROLES,
} from './personal-name-component-mapping'

describe('PERSONAL_COMPONENT_TO_PART_ROLES', () => {
  it('maps every personal name component to at least one valid part role', () => {
    for (const component of PERSONAL_NAME_COMPONENTS) {
      const roles = getPartRolesForPersonalNameComponent(component)
      expect(roles.length).toBeGreaterThan(0)
      for (const role of roles) {
        expect(isValidMappedPartRole(role)).toBe(true)
        expect(NAME_PART_ROLES).toContain(role)
      }
    }
  })

  it('includes house in the mapping', () => {
    expect(PERSONAL_COMPONENT_TO_PART_ROLES.house).toEqual(['house'])
  })

  it('covers every personal name component', () => {
    const mappedComponents = Object.keys(
      PERSONAL_COMPONENT_TO_PART_ROLES,
    ) as PersonalNameComponent[]
    expect(mappedComponents.sort()).toEqual([...PERSONAL_NAME_COMPONENTS].sort())
  })
})
