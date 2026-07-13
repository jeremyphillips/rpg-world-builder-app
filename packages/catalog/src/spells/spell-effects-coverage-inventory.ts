import {
  deriveEffectsModelingStatus,
  type EffectsModelingStatus,
  type Spell,
  type SystemRulesetId,
} from '@rpg/contracts'

import { loadSeedSpells } from './index'

export type SpellEffectsCoverageEntry = {
  slug: string
  status: EffectsModelingStatus
  effectCount: number
}

export type SpellEffectsCoverageInventory = {
  totalSpells: number
  entries: SpellEffectsCoverageEntry[]
  byStatus: Record<EffectsModelingStatus, string[]>
}

function groupEntriesByStatus(
  entries: SpellEffectsCoverageEntry[],
): Record<EffectsModelingStatus, string[]> {
  const byStatus: Record<EffectsModelingStatus, string[]> = {
    'prose-only': [],
    'partially-modeled': [],
    modeled: [],
  }

  for (const entry of entries) {
    byStatus[entry.status].push(entry.slug)
  }

  for (const status of Object.keys(byStatus) as EffectsModelingStatus[]) {
    byStatus[status].sort()
  }

  return byStatus
}

function toCoverageEntry(spell: Spell): SpellEffectsCoverageEntry {
  return {
    slug: spell.slug,
    status: deriveEffectsModelingStatus(spell),
    effectCount: spell.effects?.length ?? 0,
  }
}

/** Audits seed spell effects modeling status for a ruleset. */
export function buildSpellEffectsCoverageInventory(
  rulesetId: SystemRulesetId,
): SpellEffectsCoverageInventory {
  const entries = loadSeedSpells(rulesetId).map(toCoverageEntry)

  return {
    totalSpells: entries.length,
    entries,
    byStatus: groupEntriesByStatus(entries),
  }
}

/** Returns spell slugs that are not prose-only — empty when seed data has no structured effects. */
export function spellSlugsNotProseOnly(inventory: SpellEffectsCoverageInventory): string[] {
  return inventory.entries
    .filter((entry) => entry.status !== 'prose-only')
    .map((entry) => entry.slug)
}
