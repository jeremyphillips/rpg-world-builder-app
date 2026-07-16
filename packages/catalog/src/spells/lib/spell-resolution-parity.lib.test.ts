import { describe, expect, it } from 'vitest'

import { loadSeedSpells } from '../index'
import { findResolutionSeedParityIssues } from './spell-resolution-parity.lib'
import { SRD_521_SPELL_SEED_RESOLUTION_SLUGS } from '../spell-seed-resolution'

const RULESET = 'srd-cc-5.2.1' as const

describe('spell resolution primary-effect parity', () => {
  it('reports no parity issues for applicable resolution seeds', () => {
    const spells = loadSeedSpells(RULESET).filter((spell) =>
      SRD_521_SPELL_SEED_RESOLUTION_SLUGS.includes(
        spell.slug as (typeof SRD_521_SPELL_SEED_RESOLUTION_SLUGS)[number],
      ),
    )

    expect(findResolutionSeedParityIssues(spells)).toEqual([])
  })
})
