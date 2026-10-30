import { describe, expect, it } from 'vitest'

import type { ContentGrant, GrantGroups } from '@rpg/contracts'
import { loadSeedClasses, loadSeedSubclasses } from './classes'
import { loadSeedSpecies } from './species'
import { loadSeedSpells } from './spells'

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

function collectSpellIds(value: unknown, ids: string[]) {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectSpellIds(entry, ids))
    return
  }
  if (!value || typeof value !== 'object') return
  const record = value as { spellIds?: unknown }
  if (Array.isArray(record.spellIds)) {
    for (const spellId of record.spellIds) {
      if (typeof spellId === 'string') ids.push(spellId)
    }
  }
  for (const child of Object.values(value)) collectSpellIds(child, ids)
}

/**
 * Grant and recommendation rows name SRD spells the spell seed does not include yet.
 * A reference leaves this set when its spell is added to the catalog.
 */
const UNSEEDED_SPELL_REFERENCES = new Set([
  'srd-cc-5.2.1:hold-person',
  'srd-cc-5.2.1:power-word-kill',
  'srd-cc-5.2.1:divine-smite',
  'srd-cc-5.2.1:find-steed',
  'srd-cc-5.2.1:protection-from-evil-and-good',
  'srd-cc-5.2.1:zone-of-truth',
  'srd-cc-5.2.1:beacon-of-hope',
  'srd-cc-5.2.1:freedom-of-movement',
  'srd-cc-5.2.1:guardian-of-faith',
  'srd-cc-5.2.1:commune',
  'srd-cc-5.2.1:flame-strike',
  'srd-cc-5.2.1:alter-self',
  'srd-cc-5.2.1:chromatic-orb',
  'srd-cc-5.2.1:command',
  'srd-cc-5.2.1:fear',
  'srd-cc-5.2.1:fly',
  'srd-cc-5.2.1:arcane-eye',
  'srd-cc-5.2.1:charm-monster',
  'srd-cc-5.2.1:legend-lore',
  'srd-cc-5.2.1:scorching-ray',
  'srd-cc-5.2.1:suggestion',
  'srd-cc-5.2.1:stinking-cloud',
  'srd-cc-5.2.1:fire-shield',
  'srd-cc-5.2.1:geas',
  'srd-cc-5.2.1:insect-plague',
  'srd-cc-5.2.1:contact-other-plane',
])

describe('catalog spell references', () => {
  it('stores grant and recommendation spell ids as members of the loaded spell catalog', () => {
    const spellIds = new Set(loadSeedSpells(RULESET).map((spell) => spell.id))
    const refs: string[] = []
    for (const species of loadSeedSpecies(RULESET)) collectSpellIds(species, refs)
    for (const characterClass of loadSeedClasses(RULESET)) collectSpellIds(characterClass, refs)
    for (const subclass of loadSeedSubclasses(RULESET)) collectSpellIds(subclass, refs)

    expect(refs.length).toBeGreaterThan(0)
    for (const ref of refs) {
      if (UNSEEDED_SPELL_REFERENCES.has(ref)) {
        expect(spellIds.has(ref), `${ref} is seeded; remove it from the gap list`).toBe(false)
        continue
      }
      expect(spellIds.has(ref), ref).toBe(true)
    }
  })
})
