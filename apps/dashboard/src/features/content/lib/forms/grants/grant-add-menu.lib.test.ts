import { describe, expect, it } from 'vitest'

import { getSenseEntry } from '@rpg/contracts'

import { GRANT_TYPES } from './grant-form-schema'
import { buildGrantArrayAddMenu } from './grant-add-menu.lib'
import { getGrantTemplateById } from './grant-template-registry'

describe('buildGrantArrayAddMenu', () => {
  it('maps every allowed grant type to a menu item with append defaults', () => {
    const menu = buildGrantArrayAddMenu(GRANT_TYPES)

    expect(menu.items).toHaveLength(GRANT_TYPES.length)
    for (const grantType of GRANT_TYPES) {
      const item = menu.items.find(
        (candidate) => getGrantTemplateById(candidate.id)?.grantType === grantType,
      )
      expect(item, grantType).toBeDefined()
      expect(item?.appendDefaults).toBeTypeOf('function')
      expect(
        typeof item?.appendDefaults === 'function' ? item.appendDefaults() : item?.appendDefaults,
      ).toMatchObject({ grantType })
    }
  })

  it('includes only groups that have visible templates', () => {
    const menu = buildGrantArrayAddMenu(['movement', 'languages'])

    expect(menu.groups.map((group) => group.id)).toEqual(['character-options', 'combat-traits'])
    expect(menu.items.map((item) => item.groupId)).toEqual(['character-options', 'combat-traits'])
  })

  it('exposes string discovery fields from template metadata and vocab refs', () => {
    const menu = buildGrantArrayAddMenu(['senses'])
    const senseItem = menu.items.find((item) => item.id === 'special-sense')

    expect(senseItem?.aliases).toEqual(
      expect.arrayContaining(['darkvision', 'blindsight', 'tremorsense', 'truesight']),
    )
    expect(senseItem?.searchTerms).toEqual(
      expect.arrayContaining(['sense', 'vision', getSenseEntry('darkvision')!.label]),
    )
    expect(senseItem?.description).toBe(getGrantTemplateById('special-sense')?.description)
  })
})
