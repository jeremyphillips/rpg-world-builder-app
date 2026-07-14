import type { Spell, SystemRulesetId } from '@rpg/contracts'

import { loadSeedSpells } from './index'
import { SRD_521_SPELL_SEED_EFFECT_SLUGS } from './spell-seed-effects'
import { SRD_521_SPELL_SEED_RESOLUTION_SLUGS } from './spell-seed-resolution'

export type SpellResolutionCoverageStatus = 'migrated' | 'deferred' | 'hybrid' | 'prose-only'

export type SpellResolutionCoverageEntry = {
  slug: string
  status: SpellResolutionCoverageStatus
  effectCount: number
  hasResolution: boolean
}

export type SpellResolutionCoverageInventory = {
  totalSpells: number
  entries: SpellResolutionCoverageEntry[]
  byStatus: Record<SpellResolutionCoverageStatus, string[]>
}

function groupEntriesByStatus(
  entries: SpellResolutionCoverageEntry[],
): Record<SpellResolutionCoverageStatus, string[]> {
  const byStatus: Record<SpellResolutionCoverageStatus, string[]> = {
    migrated: [],
    deferred: [],
    hybrid: [],
    'prose-only': [],
  }

  for (const entry of entries) {
    byStatus[entry.status].push(entry.slug)
  }

  for (const status of Object.keys(byStatus) as SpellResolutionCoverageStatus[]) {
    byStatus[status].sort()
  }

  return byStatus
}

function deriveResolutionCoverageStatus(spell: Spell): SpellResolutionCoverageStatus {
  if (spell.resolution) {
    const hasExtraEffects = (spell.effects?.length ?? 0) > 1
    return hasExtraEffects ? 'hybrid' : 'migrated'
  }

  if (spell.effects?.length) {
    return 'deferred'
  }

  return 'prose-only'
}

function toCoverageEntry(spell: Spell): SpellResolutionCoverageEntry {
  return {
    slug: spell.slug,
    status: deriveResolutionCoverageStatus(spell),
    effectCount: spell.effects?.length ?? 0,
    hasResolution: Boolean(spell.resolution),
  }
}

/** Audits seed spell resolution migration status for a ruleset. */
export function buildSpellResolutionCoverageInventory(
  rulesetId: SystemRulesetId,
): SpellResolutionCoverageInventory {
  const entries = loadSeedSpells(rulesetId).map(toCoverageEntry)

  return {
    totalSpells: entries.length,
    entries,
    byStatus: groupEntriesByStatus(entries),
  }
}

/** Slugs with structured effects but no resolution envelope yet. */
export function spellSlugsDeferredResolution(
  inventory: SpellResolutionCoverageInventory,
): string[] {
  return inventory.entries
    .filter((entry) => entry.status === 'deferred' || entry.status === 'hybrid')
    .map((entry) => entry.slug)
}

export { SRD_521_SPELL_SEED_EFFECT_SLUGS, SRD_521_SPELL_SEED_RESOLUTION_SLUGS }
