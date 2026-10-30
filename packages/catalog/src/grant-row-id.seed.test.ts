import { describe, expect, it } from 'vitest'

import type { ContentGrant, GrantGroups } from '@rpg/contracts'
import { loadSeedClasses, loadSeedSubclasses } from './classes'
import { loadSeedSpecies } from './species'

const RULESET = 'srd-cc-5.2.1' as const

function assertUniqueGrantRowIds(ownerLabel: string, groups: GrantGroups | undefined) {
  const ids = (groups ?? []).flatMap((group) => group.grants.map((grant) => grant.id))
  expect(new Set(ids).size, ownerLabel).toBe(ids.length)
}

function walkGrantOwners(
  label: string,
  value: unknown,
  visit: (ownerLabel: string, groups: GrantGroups) => void,
) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => walkGrantOwners(`${label}[${index}]`, entry, visit))
    return
  }
  if (!value || typeof value !== 'object') return

  const record = value as { id?: string; grantGroups?: GrantGroups }
  if (record.grantGroups?.length) {
    visit(`${label}:${record.id ?? 'owner'}`, record.grantGroups)
  }
  for (const [key, child] of Object.entries(value)) {
    if (key === 'grantGroups') continue
    walkGrantOwners(`${label}.${key}`, child, visit)
  }
}

describe('catalog grant row ids', () => {
  it('keeps seed grant row ids unique within each owner', () => {
    const owners: Array<{ label: string; grants: ContentGrant[] }> = []
    const visit = (ownerLabel: string, groups: GrantGroups) => {
      assertUniqueGrantRowIds(ownerLabel, groups)
      owners.push({ label: ownerLabel, grants: groups.flatMap((group) => group.grants) })
    }

    for (const species of loadSeedSpecies(RULESET)) {
      walkGrantOwners(species.id, species, visit)
    }
    for (const characterClass of loadSeedClasses(RULESET)) {
      walkGrantOwners(characterClass.id, characterClass, visit)
    }
    for (const subclass of loadSeedSubclasses(RULESET)) {
      walkGrantOwners(subclass.id, subclass, visit)
    }

    expect(owners.length).toBeGreaterThan(0)
    expect(owners.every((owner) => owner.grants.every((grant) => grant.id.length > 0))).toBe(true)
  })
})
