import { describe, expect, it } from 'vitest'

import { REGISTERED_SENSE_TEMPLATE_SENSE_IDS } from '@rpg/contracts'

import senses from './data/srd-cc-5.2.1/senses.json'

describe('sense vocabulary vs template registry', () => {
  it('matches registered sense template ids to catalog seed ids', () => {
    const seedIds = senses.map((entry) => entry.id).sort()
    expect([...REGISTERED_SENSE_TEMPLATE_SENSE_IDS].sort()).toEqual(seedIds)
  })
})
