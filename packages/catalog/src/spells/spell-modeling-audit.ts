/**
 * Spell modeling audit — operational inventory from seed `modeling` metadata.
 *
 * Replaces ad-hoc coverage inventories and slug maps. Reports effective status,
 * review state, blockers, gaps, and consistency violations for CI and generated docs.
 */
import {
  allModelingLimitations,
  deriveBlockedFrom,
  deriveSpellModelingStatus,
  effectiveSpellModelingStatus,
  hasStructuredSpellResolution,
  isEditorEligible,
  isSpellModelingReviewed,
  meetsBlockedFromThreshold,
  meetsConsumerThreshold,
  type ExplicitModelingStatus,
  type ModelingBlocker,
  type ModelingGapEntry,
  type ModelingStatus,
  type Spell,
  type SystemRulesetId,
} from '@rpg/contracts'

import { loadSeedSpells } from './index'
import { generateSpellModelingReport } from './spell-modeling-audit-report'
import { validateSpellModelingConsistency } from './spell-modeling-audit-validation'

export type SpellModelingViolation = {
  slug: string
  code: string
  message: string
}

export type SpellModelingAuditEntry = {
  slug: string
  reviewed: boolean
  effectiveStatus: ModelingStatus
  explicitStatus?: ExplicitModelingStatus
  blocker?: ModelingBlocker
  /** Derived report field — next status rung blocked when `blocker` is present. */
  blockedFrom?: ExplicitModelingStatus
  gaps: readonly ModelingGapEntry[]
  hasResolution: boolean
  editorEligible: boolean
  displayReady: boolean
  violations: SpellModelingViolation[]
}

export type SpellModelingAudit = {
  rulesetId: SystemRulesetId
  totalSpells: number
  entries: SpellModelingAuditEntry[]
  byEffectiveStatus: Record<ModelingStatus, string[]>
  unreviewed: string[]
  /** Prose-only spells with no documented `modeling.blocker`. */
  proseOnlyWithoutDocumentedBlocker: string[]
  /** @deprecated Use `proseOnlyWithoutDocumentedBlocker`. */
  proseOnlyWithoutDocumentedGaps: string[]
  violationCount: number
}

function toAuditEntry(spell: Spell): SpellModelingAuditEntry {
  const effectiveStatus = effectiveSpellModelingStatus(spell)
  const violations = validateSpellModelingConsistency(spell)
  const blocker = spell.modeling?.blocker

  return {
    slug: spell.slug,
    reviewed: isSpellModelingReviewed(spell.modeling),
    effectiveStatus,
    explicitStatus: spell.modeling?.status,
    blocker,
    blockedFrom: deriveBlockedFrom(effectiveStatus, blocker),
    gaps: spell.modeling?.gaps ?? [],
    hasResolution: hasStructuredSpellResolution(spell),
    editorEligible: isEditorEligible(effectiveStatus),
    displayReady: meetsConsumerThreshold(effectiveStatus, 'sufficient-for-display'),
    violations,
  }
}

function groupByEffectiveStatus(
  entries: SpellModelingAuditEntry[],
): Record<ModelingStatus, string[]> {
  const groups: Record<ModelingStatus, string[]> = {
    'prose-only': [],
    'non-meaningful-partial': [],
    'meaningful-partial': [],
    'sufficient-for-display': [],
    'sufficient-for-character-sheet': [],
    'mechanics-ready': [],
  }

  for (const entry of entries) {
    groups[entry.effectiveStatus].push(entry.slug)
  }

  for (const status of Object.keys(groups) as ModelingStatus[]) {
    groups[status].sort()
  }

  return groups
}

/** Prose-only audit entries with no documented `modeling.blocker`. */
export function proseOnlyWithoutDocumentedBlocker(
  entries: readonly SpellModelingAuditEntry[],
): string[] {
  return entries
    .filter((entry) => entry.effectiveStatus === 'prose-only' && entry.blocker === undefined)
    .map((entry) => entry.slug)
    .sort()
}

/** @deprecated Use `proseOnlyWithoutDocumentedBlocker`. */
export const proseOnlyWithoutDocumentedGaps = proseOnlyWithoutDocumentedBlocker

export function countCodeFrequency(
  entries: readonly SpellModelingAuditEntry[],
  selector: (entry: SpellModelingAuditEntry) => readonly ModelingGapEntry[],
): Map<string, number> {
  const counts = new Map<string, number>()

  for (const entry of entries) {
    for (const limitation of selector(entry)) {
      counts.set(limitation.code, (counts.get(limitation.code) ?? 0) + 1)
    }
  }

  return counts
}

export function blockerFrequency(entries: readonly SpellModelingAuditEntry[]): Map<string, number> {
  return countCodeFrequency(entries, (entry) => (entry.blocker ? [entry.blocker] : []))
}

export function residualGapFrequency(
  entries: readonly SpellModelingAuditEntry[],
): Map<string, number> {
  return countCodeFrequency(entries, (entry) => entry.gaps)
}

export function capabilityUnlockCounts(
  entries: readonly SpellModelingAuditEntry[],
): Map<string, number> {
  const counts = new Map<string, number>()

  for (const entry of entries) {
    const capabilityId = entry.blocker?.capabilityId
    if (!capabilityId) continue
    counts.set(capabilityId, (counts.get(capabilityId) ?? 0) + 1)
  }

  return counts
}

export function isBlockedFromEditorPromotion(entry: SpellModelingAuditEntry): boolean {
  return meetsBlockedFromThreshold(entry.effectiveStatus, entry.blockedFrom, 'meaningful-partial')
}

export function isBlockedFromDisplayPromotion(entry: SpellModelingAuditEntry): boolean {
  return meetsBlockedFromThreshold(
    entry.effectiveStatus,
    entry.blockedFrom,
    'sufficient-for-display',
  )
}

/** Audits spell modeling metadata for a ruleset seed catalog. */
export function buildSpellModelingAudit(rulesetId: SystemRulesetId): SpellModelingAudit {
  const entries = loadSeedSpells(rulesetId).map(toAuditEntry)
  const violationCount = entries.reduce((sum, entry) => sum + entry.violations.length, 0)
  const proseOnlyWithoutBlocker = proseOnlyWithoutDocumentedBlocker(entries)

  return {
    rulesetId,
    totalSpells: entries.length,
    entries,
    byEffectiveStatus: groupByEffectiveStatus(entries),
    unreviewed: entries
      .filter((entry) => !entry.reviewed)
      .map((entry) => entry.slug)
      .sort(),
    proseOnlyWithoutDocumentedBlocker: proseOnlyWithoutBlocker,
    proseOnlyWithoutDocumentedGaps: proseOnlyWithoutBlocker,
    violationCount,
  }
}

export function spellModelingAuditViolations(audit: SpellModelingAudit): SpellModelingViolation[] {
  return audit.entries.flatMap((entry) => entry.violations)
}

export { allModelingLimitations, deriveSpellModelingStatus, generateSpellModelingReport }
export { validateSpellModelingConsistency } from './spell-modeling-audit-validation'
