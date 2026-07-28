import type { CharacterClass } from '../../../content/classes/class'
import type { SpellsContentGrant } from '../../../content/lib/grants'
import type { CharacterSpellAccess, CharacterSpellEntry } from '../../character/spells'
import type { CharacterSelectionSource } from '../../character/selection-sources'
import type { CharacterBuildCatalogIndex } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'
import { collectSourcedGrants } from './collect-sourced-grants'

// ---------------------------------------------------------------------------
// Granted spell assembly — merges trait/feature spell grants by spellId.
// ---------------------------------------------------------------------------

function isSpellsGrant(grant: { kind: string }): grant is SpellsContentGrant {
  return grant.kind === 'spells'
}

function mergeSources(
  existing: CharacterSelectionSource[] | undefined,
  incoming: CharacterSelectionSource[],
): CharacterSelectionSource[] {
  const merged = [...(existing ?? [])]
  for (const source of incoming) {
    const duplicate = merged.some(
      (entry) =>
        entry.kind === source.kind &&
        entry.sourceId === source.sourceId &&
        entry.grantId === source.grantId,
    )
    if (!duplicate) merged.push(source)
  }
  return merged
}

function mergeCastingEntitlements(
  existing: CharacterSpellEntry['castingEntitlements'],
  incoming: NonNullable<CharacterSpellEntry['castingEntitlements']>[number],
): NonNullable<CharacterSpellEntry['castingEntitlements']> {
  const entitlements = [...(existing ?? [])]
  const duplicate = entitlements.some(
    (entry) =>
      entry.mode === incoming.mode &&
      entry.frequency === incoming.frequency &&
      entry.allowsSlotCasting === incoming.allowsSlotCasting &&
      JSON.stringify(entry.sources) === JSON.stringify(incoming.sources),
  )
  if (!duplicate) entitlements.push(incoming)
  return entitlements
}

function buildSpellAccess(
  existing: CharacterSpellAccess | undefined,
  grant: SpellsContentGrant,
): CharacterSpellAccess {
  const access = { ...(existing ?? {}) }

  if (grant.availability === 'always_prepared') {
    access.alwaysPrepared = true
  }

  if (grant.casting && !grant.availability) {
    access.granted = true
  }

  return access
}

function buildCastingEntitlement(
  grant: SpellsContentGrant,
  sources: CharacterSelectionSource[],
): NonNullable<CharacterSpellEntry['castingEntitlements']>[number] | undefined {
  if (!grant.casting) return undefined

  return {
    mode: 'free_cast',
    frequency: grant.casting.frequency,
    allowsSlotCasting: grant.casting.allowsSlotCasting ?? false,
    sources,
  }
}

function mergeSpellEntry(
  existing: CharacterSpellEntry | undefined,
  spellId: string,
  grant: SpellsContentGrant,
  sources: CharacterSelectionSource[],
): CharacterSpellEntry {
  const castingEntitlement = buildCastingEntitlement(grant, sources)

  return {
    spellId,
    sources: mergeSources(existing?.sources, sources),
    access: buildSpellAccess(existing?.access, grant),
    selection: existing?.selection,
    castingEntitlements: castingEntitlement
      ? mergeCastingEntitlements(existing?.castingEntitlements, castingEntitlement)
      : existing?.castingEntitlements,
    notes: existing?.notes,
  }
}

function applySpellsGrant(
  entries: Map<string, CharacterSpellEntry>,
  grant: SpellsContentGrant,
  sources: CharacterSelectionSource[],
): void {
  for (const spellId of grant.spellIds) {
    entries.set(spellId, mergeSpellEntry(entries.get(spellId), spellId, grant, sources))
  }
}

/** Assembles spell rows from species, heritage, and class feature spell grants. */
export function assembleGrantedSpells(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  characterClass?: CharacterClass,
): CharacterSpellEntry[] {
  const entries = new Map<string, CharacterSpellEntry>()

  for (const { grant, sources } of collectSourcedGrants(draft, catalogIndex, characterClass)) {
    if (!isSpellsGrant(grant)) continue
    applySpellsGrant(entries, grant, sources)
  }

  return Array.from(entries.values())
}

/** Merges class spellcasting rows with grant-derived rows by spellId. */
export function mergeCharacterSpellEntries(
  classSpells: readonly CharacterSpellEntry[],
  grantedSpells: readonly CharacterSpellEntry[],
): CharacterSpellEntry[] {
  const entries = new Map<string, CharacterSpellEntry>()

  for (const entry of classSpells) {
    entries.set(entry.spellId, { ...entry, access: { ...entry.access } })
  }

  for (const granted of grantedSpells) {
    const existing = entries.get(granted.spellId)
    if (!existing) {
      entries.set(granted.spellId, granted)
      continue
    }

    entries.set(granted.spellId, {
      spellId: granted.spellId,
      sources: mergeSources(existing.sources, granted.sources ?? []),
      access: { ...existing.access, ...granted.access },
      selection: existing.selection ?? granted.selection,
      castingEntitlements: granted.castingEntitlements?.length
        ? granted.castingEntitlements.reduce(
            (acc, entitlement) => mergeCastingEntitlements(acc, entitlement),
            existing.castingEntitlements,
          )
        : existing.castingEntitlements,
      notes: existing.notes ?? granted.notes,
    })
  }

  return Array.from(entries.values())
}
