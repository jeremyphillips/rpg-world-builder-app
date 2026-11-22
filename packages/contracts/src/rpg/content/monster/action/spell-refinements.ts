import { type z } from 'zod'

import { addCustomRefinementIssue } from '../../../../lib/add-custom-refinement-issue'
import {
  monsterActionSectionRowPath,
  monsterActionSectionRows,
  type MonsterActionSectionBody,
} from '../action-section-access'
import { MONSTER_ACTION_SECTIONS, type MonsterActionSection } from '../action-sections'
import {
  refinePrimarySpellcastingDuplicate,
  refinePrimarySpellcastingProfileRow,
  refineReservedSpellcastingName,
} from '../primary-spellcasting-profile'
import {
  findSpellCastingSource,
  isPrimarySpellcastingAction,
  listDirectSpellCastingSources,
} from '../spell-casting-source'

type SpellEntryLike = {
  id: string
  kind: string
  name?: string
  profile?: string
  limitedUse?: unknown
  castingAbility?: { kind: string; entryId?: string; ability?: string }
  spellInvocation?: string
  bonusSource?: { kind?: string; castingAbility?: { kind?: string; entryId?: string } }
  dcSource?: { kind?: string; castingAbility?: { kind?: string; entryId?: string } }
  savingThrow?: {
    dcSource?: { kind?: string; castingAbility?: { kind?: string; entryId?: string } }
  }
  spells?: readonly { spellId?: string; castAtLevel?: number; limitedUse?: unknown }[]
}

export function refineMonsterSpellEntries(
  sections: MonsterActionSectionBody,
  ctx: z.RefinementCtx,
  prefix: (string | number)[] = [],
  options?: { published?: boolean },
): void {
  const located = spellRows(sections)
  const spellsById = new Map(
    located
      .filter((entry) => entry.action.kind === 'spell' && entry.section !== 'legendaryActions')
      .map((entry) => [entry.action.id, entry.action]),
  )

  for (const locatedEntry of located) {
    refineOneSpellEntry(locatedEntry, spellsById, ctx, prefix, options?.published === true)
    if (options?.published) refineNestedSpellSource(locatedEntry, sections, ctx, prefix)
  }
  refinePrimarySpellcastingProfiles(sections, ctx, prefix, options?.published === true)
  if (options?.published) refineUniqueDirectCastingNames(sections, ctx, prefix)
}

type LocatedSpell = { section: MonsterActionSection; index: number; action: SpellEntryLike }

function spellRows(sections: MonsterActionSectionBody): LocatedSpell[] {
  return MONSTER_ACTION_SECTIONS.flatMap((section) =>
    monsterActionSectionRows<SpellEntryLike>(sections, section).map((action, index) => ({
      section,
      index,
      action,
    })),
  )
}

function spellEntryPath(
  prefix: (string | number)[],
  section: MonsterActionSection,
  index: number,
  ...suffix: (string | number)[]
): (string | number)[] {
  return [...prefix, ...monsterActionSectionRowPath(section, index), ...suffix]
}

function refinePrimarySpellcastingProfiles(
  sections: MonsterActionSectionBody,
  ctx: z.RefinementCtx,
  prefix: (string | number)[],
  requireCanonicalName: boolean,
): void {
  const rows = spellRows(sections)
  for (const row of rows) {
    refineReservedSpellcastingName({
      action: row.action,
      path: spellEntryPath(prefix, row.section, row.index),
      ctx,
    })
  }
  const profiles = rows.filter((row) => isPrimarySpellcastingAction(row.action))
  for (const row of profiles) {
    refinePrimarySpellcastingProfileRow({
      section: row.section,
      action: row.action,
      path: spellEntryPath(prefix, row.section, row.index),
      ctx,
      requireCanonicalName,
    })
  }
  refinePrimarySpellcastingDuplicate(
    profiles.map((row) => ({ path: spellEntryPath(prefix, row.section, row.index) })),
    ctx,
  )
}

function refineOneSpellEntry(
  locatedEntry: LocatedSpell,
  spellsById: ReadonlyMap<string, SpellEntryLike>,
  ctx: z.RefinementCtx,
  prefix: (string | number)[],
  published: boolean,
): void {
  const { section, index, action } = locatedEntry
  if (action.kind !== 'spell') return
  const path = spellEntryPath(prefix, section, index)
  refineSpellOwnership(action, ctx, path)
  refineSharedCastingAbility(action, spellsById, ctx, path)
  refineLegendarySpellShape(action, section, ctx, path, published)
  if (published) refineSpellInvocation(action, spellsById, ctx, path, section)
}

function sharedSpellEntryId(action: SpellEntryLike): string | undefined {
  if (action.castingAbility?.kind !== 'shared') return undefined
  return action.castingAbility.entryId
}

function refineInvokedSpell(
  spell: NonNullable<SpellEntryLike['spells']>[number],
  source: NonNullable<SpellEntryLike['spells']>[number] | undefined,
  ctx: z.RefinementCtx,
  path: (string | number)[],
  spellIndex: number,
): void {
  if (!spell.spellId) return
  if (!source) {
    addCustomRefinementIssue(ctx, "This spell isn't on the selected Spellcasting action.", [
      ...path,
      'spells',
      spellIndex,
      'spellId',
    ])
    return
  }
  if (spell.castAtLevel === undefined || spell.castAtLevel === source.castAtLevel) return
  addCustomRefinementIssue(ctx, 'Cast level must match the Spellcasting action.', [
    ...path,
    'spells',
    spellIndex,
    'castAtLevel',
  ])
}

function refineLegendarySpellShape(
  action: SpellEntryLike,
  section: string,
  ctx: z.RefinementCtx,
  path: (string | number)[],
  published: boolean,
): void {
  if (action.spellInvocation === 'use-entry' && section !== 'legendaryActions') {
    addCustomRefinementIssue(ctx, 'Spellcasting references are only valid in Legendary Actions.', [
      ...path,
      'spellInvocation',
    ])
  }
  if (!published || section !== 'legendaryActions') return
  if ((action.spells ?? []).length === 1) return
  addCustomRefinementIssue(ctx, 'Choose one spell.', [...path, 'spells'])
}

function refineSpellInvocation(
  action: SpellEntryLike,
  spellsById: ReadonlyMap<string, SpellEntryLike>,
  ctx: z.RefinementCtx,
  path: (string | number)[],
  section: string,
): void {
  if (action.spellInvocation !== 'use-entry' || section !== 'legendaryActions') return
  const entryId = sharedSpellEntryId(action)
  if (!entryId) {
    addCustomRefinementIssue(ctx, 'Choose a Spellcasting action.', [...path, 'castingAbility'])
    return
  }
  const target = spellsById.get(entryId)
  if (!target) return
  for (const [spellIndex, spell] of (action.spells ?? []).entries()) {
    const source = target.spells?.find((entry) => entry.spellId === spell.spellId)
    refineInvokedSpell(spell, source, ctx, path, spellIndex)
  }
}

function refineSpellOwnership(
  action: SpellEntryLike,
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  const spells = action.spells ?? []
  if (action.limitedUse && spells.some((spell) => spell.limitedUse)) {
    addCustomRefinementIssue(ctx, 'A spell entry cannot limit both the entry and its spells.', [
      ...path,
      'limitedUse',
    ])
  }
  const spellIds = spells.flatMap((spell) => (spell.spellId ? [spell.spellId] : []))
  if (new Set(spellIds).size === spellIds.length) return
  addCustomRefinementIssue(ctx, 'Spell ids must be unique within an entry.', [...path, 'spells'])
}

const DUPLICATE_CASTING_SOURCE_NAME =
  'Spellcasting sources that define an ability must have unique names.'

function nestedSharedEntryId(
  source: { kind?: string; castingAbility?: { kind?: string; entryId?: string } } | undefined,
): string | undefined {
  if (source?.kind !== 'spellcasting' || source.castingAbility?.kind !== 'shared') return undefined
  return source.castingAbility.entryId
}

function refineNestedSpellSource(
  locatedEntry: { section: string; index: number; action: SpellEntryLike },
  sections: MonsterActionSectionBody,
  ctx: z.RefinementCtx,
  prefix: (string | number)[],
): void {
  const { section, index, action } = locatedEntry
  const nested =
    action.kind === 'attack'
      ? { path: ['bonusSource'], entryId: nestedSharedEntryId(action.bonusSource) }
      : action.kind === 'save'
        ? { path: ['dcSource'], entryId: nestedSharedEntryId(action.dcSource) }
        : action.kind === 'special'
          ? {
              path: ['savingThrow', 'dcSource'],
              entryId: nestedSharedEntryId(action.savingThrow?.dcSource),
            }
          : undefined
  if (!nested?.entryId) return
  if (findSpellCastingSource(sections, nested.entryId)) return
  addCustomRefinementIssue(
    ctx,
    'Shared spellcasting must use another spell entry that has its own ability.',
    spellEntryPath(
      prefix,
      section as MonsterActionSection,
      index,
      ...nested.path,
      'castingAbility',
      'entryId',
    ),
  )
}

function refineUniqueDirectCastingNames(
  sections: MonsterActionSectionBody,
  ctx: z.RefinementCtx,
  prefix: (string | number)[],
): void {
  const seen = new Set<string>()
  for (const source of listDirectSpellCastingSources(sections)) {
    const name = source.name?.trim()
    if (!name) continue
    if (seen.has(name)) {
      const index = monsterActionSectionRows(sections, source.section).findIndex(
        (row) => row.id === source.id,
      )
      addCustomRefinementIssue(ctx, DUPLICATE_CASTING_SOURCE_NAME, [
        ...spellEntryPath(prefix, source.section, index, 'name'),
      ])
      continue
    }
    seen.add(name)
  }
}

function refineSharedCastingAbility(
  action: SpellEntryLike,
  spellsById: ReadonlyMap<string, SpellEntryLike>,
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  if (action.castingAbility?.kind !== 'shared' || !action.castingAbility.entryId) return
  const target = spellsById.get(action.castingAbility.entryId)
  const valid = target && target.id !== action.id && target.castingAbility?.kind === 'ability'
  if (valid) return
  addCustomRefinementIssue(
    ctx,
    'Shared spellcasting must use another spell entry that has its own ability.',
    [...path, 'castingAbility', 'entryId'],
  )
}
