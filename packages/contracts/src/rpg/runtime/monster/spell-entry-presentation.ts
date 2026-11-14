import type { MonsterAction, MonsterReaction } from '../../content/monster/action'
import {
  describeLimitedUse,
  formatLimitedUseNotation,
  limitedUseSchema,
  type LimitedUse,
} from '../../primitives/limited-use'
import { getAbilityLabel } from '../../vocab/ability'
import {
  formatMonsterSpellComponentOmissionClause,
  joinMonsterSpellCastingIntroSegments,
} from './spell-component-omission'
import type { MonsterReferencedSpell } from './reaction-trigger'
import { type MonsterActionSectionId } from '../../content/spell/casting-economy'
import { formatSpellCastAtLevelName } from '../../content/spell/format-spell-cast-level'

type MonsterSpellPresentationSection = MonsterActionSectionId | 'legendaryActions'

type SpellEntry = Extract<MonsterAction | MonsterReaction, { kind: 'spell' }>

type SpellRow = SpellEntry['spells'][number]

function usageKey(use: LimitedUse | undefined): string {
  if (!use) return 'at-will'
  const described = describeLimitedUse(use)
  if (described.rechargeRoll) return `recharge:${described.rechargeRoll.minRoll}`
  const count = described.count
  const countKey = count?.kind === 'fixed' ? `fixed:${count.value}` : (count?.kind ?? 'incomplete')
  return `uses:${countKey}:${described.restRecovery.minimumRest}`
}

export function formatMonsterStatBlockSubject(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return 'the creature'
  const lower = trimmed.toLowerCase()
  if (lower.startsWith('the ')) return lower
  return `the ${lower}`
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function spellLabel(
  spellId: string,
  spellsById: ReadonlyMap<string, MonsterReferencedSpell> | undefined,
  catalogStatus: 'ready' | 'unavailable',
): { html: string; plain: string } {
  const spell = catalogStatus === 'ready' ? spellsById?.get(spellId) : undefined
  if (!spell) return { html: 'Unavailable spell', plain: 'Unavailable spell' }
  const plain = spell.name
  return { html: `<em>${escapeHtml(plain)}</em>`, plain }
}

function listPhrase(labels: string[]): string {
  if (labels.length <= 1) return labels[0] ?? ''
  if (labels.length === 2) return `${labels[0]} or ${labels[1]}`
  return `${labels.slice(0, -1).join(', ')}, or ${labels[labels.length - 1]}`
}

function resolutionMethodKind(
  spellId: string | undefined,
  spellsById: ReadonlyMap<string, MonsterReferencedSpell> | undefined,
  catalogStatus: 'ready' | 'unavailable',
): string | undefined {
  if (catalogStatus !== 'ready' || !spellId) return undefined
  return spellsById?.get(spellId)?.resolution?.method?.kind
}

function directSaveDcSuffix(args: {
  entry: SpellEntry
  spellsById?: ReadonlyMap<string, MonsterReferencedSpell>
  catalogStatus: 'ready' | 'unavailable'
  saveDc?: number
}): string {
  if (args.entry.castingAbility?.kind !== 'ability' || args.saveDc === undefined) return ''
  const hasSavingThrow = args.entry.spells.some(
    (spell) =>
      resolutionMethodKind(spell.spellId, args.spellsById, args.catalogStatus) === 'saving-throw',
  )
  if (!hasSavingThrow) return ''
  return ` as the spellcasting ability (spell save DC ${args.saveDc})`
}

function abilityPhrase(
  entry: SpellEntry,
  spellsInBody: ReadonlyMap<string, SpellEntry>,
  saveDcSuffix: string,
): string {
  if (entry.castingAbility?.kind === 'shared') {
    const target = spellsInBody.get(entry.castingAbility.entryId)
    return `using the same spellcasting ability as ${target?.name ?? 'that entry'}`
  }
  if (entry.castingAbility?.kind === 'ability') {
    return `using ${getAbilityLabel(entry.castingAbility.ability)}${saveDcSuffix}`
  }
  return 'using its spellcasting ability'
}

function spellName(
  spell: SpellRow,
  spellsById: ReadonlyMap<string, MonsterReferencedSpell> | undefined,
  catalogStatus: 'ready' | 'unavailable',
  castAtLevel: number | undefined = spell.castAtLevel,
): string {
  if (!spell.spellId) return 'Unavailable spell'
  const label = spellLabel(spell.spellId, spellsById, catalogStatus).html
  const level = catalogStatus === 'ready' ? spellsById?.get(spell.spellId)?.level : undefined
  return formatSpellCastAtLevelName({ name: label, castAtLevel, spellLevel: level })
}

function groupLine(
  spells: readonly SpellRow[],
  limitedUse: LimitedUse | undefined,
  spellsById: ReadonlyMap<string, MonsterReferencedSpell> | undefined,
  catalogStatus: 'ready' | 'unavailable',
): string {
  const names = spells.map((spell) => spellName(spell, spellsById, catalogStatus))
  const each = limitedUse && spells.length > 1 ? ' Each' : ''
  const label = limitedUse
    ? `${formatLimitedUseNotation(limitedUse, 'stat-block')}${each}`
    : 'At Will'
  return `<p><strong>${label}</strong>: ${names.join(', ')}</p>`
}

function presentationGroups(spells: readonly SpellRow[]): Array<{
  limitedUse?: LimitedUse
  spells: SpellRow[]
}> {
  const groups: Array<{ key: string; limitedUse?: LimitedUse; spells: SpellRow[] }> = []
  for (const spell of spells) {
    const parsed = limitedUseSchema.safeParse(spell.limitedUse)
    const limitedUse = parsed.success ? parsed.data : undefined
    const key = usageKey(limitedUse)
    const existing = groups.find((group) => group.key === key)
    if (existing) existing.spells.push(spell)
    else groups.push({ key, ...(limitedUse ? { limitedUse } : {}), spells: [spell] })
  }
  return groups
}

function inheritedCastAtLevel(
  spell: SpellRow,
  entry: SpellEntry,
  spellsInBody: ReadonlyMap<string, SpellEntry>,
): number | undefined {
  if (spell.castAtLevel !== undefined) return spell.castAtLevel
  if (entry.spellInvocation !== 'use-entry' || entry.castingAbility?.kind !== 'shared') {
    return undefined
  }
  const source = spellsInBody.get(entry.castingAbility.entryId)
  return source?.spells.find((row) => row.spellId === spell.spellId)?.castAtLevel
}

function castingSentence(args: {
  entry: SpellEntry
  monsterName: string
  section: MonsterSpellPresentationSection
  spellsById?: ReadonlyMap<string, MonsterReferencedSpell>
  catalogStatus: 'ready' | 'unavailable'
  spellsInBody: ReadonlyMap<string, SpellEntry>
  saveDcSuffix: string
}): string {
  const labels = args.entry.spells.map((spell) =>
    spellName(
      spell,
      args.spellsById,
      args.catalogStatus,
      inheritedCastAtLevel(spell, args.entry, args.spellsInBody),
    ),
  )
  const subject = formatMonsterStatBlockSubject(args.monsterName)
  const capitalSubject = subject.charAt(0).toUpperCase() + subject.slice(1)
  const response = args.section === 'reactions' ? " in response to the spell's trigger" : ''
  const omission = formatMonsterSpellComponentOmissionClause(args.entry.omittedComponents)
  const omissionSegment = omission ? `, ${omission}` : ''
  if (args.entry.spellInvocation === 'use-entry' && args.entry.castingAbility?.kind === 'shared') {
    const target = args.spellsInBody.get(args.entry.castingAbility.entryId)
    return `<p>${capitalSubject} uses ${target?.name ?? 'that entry'} to cast ${listPhrase(labels)}${omissionSegment}.</p>`
  }
  return `<p>${capitalSubject} casts ${listPhrase(labels)}${response}${omissionSegment}, ${abilityPhrase(args.entry, args.spellsInBody, args.saveDcSuffix)}.</p>`
}

export function formatLegendaryActionUsesIntro(args: {
  monsterName: string
  uses: number
  usesInLair?: number
}): string {
  const subject = formatMonsterStatBlockSubject(args.monsterName)
  const capitalSubject = subject.charAt(0).toUpperCase() + subject.slice(1)
  const pool =
    args.usesInLair === undefined ? String(args.uses) : `${args.uses} (${args.usesInLair} in Lair)`
  return `Legendary Action Uses: ${pool}. Immediately after another creature's turn, ${subject} can expend a use to take one of the following actions. ${capitalSubject} regains all expended uses at the start of each of its turns.`
}

export function formatOnceUntilNextTurnSentence(args: {
  monsterName: string
  kind: string
  /** Prose saving throw on a custom ability or trait. Structured saves use `kind`. */
  hasSavingThrow?: boolean
}): string {
  const subject = formatMonsterStatBlockSubject(args.monsterName)
  const capitalSubject = subject.charAt(0).toUpperCase() + subject.slice(1)
  const sentence = `${capitalSubject} can't take this action again until the start of its next turn.`
  if (args.kind === 'save' || args.hasSavingThrow) return `Failure or Success: ${sentence}`
  return sentence
}

export function formatMonsterLimitedUseHeading(name: string, limitedUse?: LimitedUse): string {
  if (!limitedUse) return name
  return `${name} (${formatLimitedUseNotation(limitedUse, 'stat-block')})`
}

export function formatMonsterSpellEntry(args: {
  entry: SpellEntry
  monsterName: string
  section: MonsterSpellPresentationSection
  spellsById?: ReadonlyMap<string, MonsterReferencedSpell>
  catalogStatus: 'ready' | 'unavailable'
  spellsInBody: ReadonlyMap<string, SpellEntry>
  /** Derived with `abilitySaveDc`. Omitted numbers are not printed. */
  saveDc?: number
}): { heading: string; bodyHtml: string } {
  const entryLimit = limitedUseSchema.safeParse(args.entry.limitedUse)
  const heading = formatMonsterLimitedUseHeading(
    args.entry.name,
    entryLimit.success ? entryLimit.data : undefined,
  )
  const groups = presentationGroups(args.entry.spells)
  const perSpellLimits = args.entry.spells.some((spell) => spell.limitedUse)
  const useGroupLabels =
    args.section !== 'reactions' && (groups.length > 1 || perSpellLimits) && !args.entry.limitedUse
  const saveDcSuffix = directSaveDcSuffix(args)
  const subject = formatMonsterStatBlockSubject(args.monsterName)
  const capitalSubject = subject.charAt(0).toUpperCase() + subject.slice(1)
  const omissionClause = formatMonsterSpellComponentOmissionClause(args.entry.omittedComponents)
  const abilitySegment = abilityPhrase(args.entry, args.spellsInBody, saveDcSuffix)
  const showGroupedIntro = useGroupLabels && (Boolean(saveDcSuffix) || Boolean(omissionClause))
  const groupedIntro = showGroupedIntro
    ? `<p>${capitalSubject} casts one of the following spells, ${joinMonsterSpellCastingIntroSegments(omissionClause, abilitySegment)}:</p>`
    : ''
  const bodyHtml = useGroupLabels
    ? groupedIntro +
      groups
        .map((group) =>
          groupLine(group.spells, group.limitedUse, args.spellsById, args.catalogStatus),
        )
        .join('')
    : castingSentence({ ...args, saveDcSuffix })
  return { heading, bodyHtml }
}
