/**
 * Effects-layer migration coverage audit for catalog seed spells.
 *
 * Tracks how many SRD slugs have structured root `effects[]` versus prose-only
 * descriptions. Status comes from `deriveEffectsModelingStatus()` in
 * `@rpg/contracts` (`partially-modeled` when any atomic effects exist).
 *
 * Companion to `spell-resolution-coverage-inventory.ts`, which audits the optional
 * `resolution` envelope on top of those effects. Use in tests to monitor atomic
 * effects seed progress; not persisted on spell records.
 */
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
