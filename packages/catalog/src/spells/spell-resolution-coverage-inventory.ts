/**
 * Resolution migration coverage audit for catalog seed spells.
 *
 * Reports how far optional `spell.resolution` envelopes have landed relative to
 * structured root `effects[]`. Status is derived at read time via
 * `deriveResolutionModelingStatus()` from `@rpg/contracts` (mapped to catalog
 * labels: `modeled` → `migrated`).
 *
 * Status meanings:
 * - `migrated` — resolution present, single primary effect in `effects[]`
 * - `hybrid` — resolution present alongside extra root effects (e.g. Eldritch Blast beams)
 * - `deferred` — `effects[]` only; no resolution on the read model
 * - `prose-only` — neither structured effects nor resolution
 *
 * Explicit manifest deferrals (`kind: 'defer'` in `spell-seed-resolution.ts`) attach
 * a `deferReason` and appear in `byDeferReason`. Temporary migration tooling for
 * tests and dashboards; not persisted on spell records.
 */
import { deriveResolutionModelingStatus, type Spell, type SystemRulesetId } from '@rpg/contracts'

import { loadSeedSpells } from './index'
import type { SpellResolutionDeferReason } from './spell-resolution-defer-reasons'
import { SRD_521_SPELL_SEED_EFFECT_SLUGS } from './spell-seed-effects'
import {
  spellSeedResolutionDeferReason,
  SRD_521_SPELL_SEED_RESOLUTION_SLUGS,
} from './spell-seed-resolution'

export type SpellResolutionCoverageStatus = 'migrated' | 'deferred' | 'hybrid' | 'prose-only'

export type SpellResolutionCoverageEntry = {
  slug: string
  status: SpellResolutionCoverageStatus
  effectCount: number
  hasResolution: boolean
  /** Present when manifest explicitly defers resolution for this slug. */
  deferReason?: SpellResolutionDeferReason
}

export type SpellResolutionCoverageInventory = {
  totalSpells: number
  entries: SpellResolutionCoverageEntry[]
  byStatus: Record<SpellResolutionCoverageStatus, string[]>
  /** Slugs grouped by documented defer reason (manifest `kind: 'defer'` only). */
  byDeferReason: Partial<Record<SpellResolutionDeferReason, string[]>>
}

function mapModelingStatusToCoverageStatus(
  status: ReturnType<typeof deriveResolutionModelingStatus>,
): SpellResolutionCoverageStatus {
  if (status === 'modeled') return 'migrated'
  return status
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

function groupEntriesByDeferReason(
  entries: SpellResolutionCoverageEntry[],
): Partial<Record<SpellResolutionDeferReason, string[]>> {
  const byDeferReason: Partial<Record<SpellResolutionDeferReason, string[]>> = {}

  for (const entry of entries) {
    if (!entry.deferReason) continue
    const slugs = byDeferReason[entry.deferReason] ?? []
    slugs.push(entry.slug)
    byDeferReason[entry.deferReason] = slugs
  }

  for (const reason of Object.keys(byDeferReason) as SpellResolutionDeferReason[]) {
    byDeferReason[reason]?.sort()
  }

  return byDeferReason
}

function toCoverageEntry(spell: Spell): SpellResolutionCoverageEntry {
  const deferReason =
    !spell.resolution && (spell.effects?.length ?? 0) > 0
      ? spellSeedResolutionDeferReason(spell.slug)
      : undefined

  return {
    slug: spell.slug,
    status: mapModelingStatusToCoverageStatus(deriveResolutionModelingStatus(spell)),
    effectCount: spell.effects?.length ?? 0,
    hasResolution: Boolean(spell.resolution),
    deferReason,
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
    byDeferReason: groupEntriesByDeferReason(entries),
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
