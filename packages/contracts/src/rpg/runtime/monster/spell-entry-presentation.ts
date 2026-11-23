import type { MonsterAction, MonsterReaction } from '../../content/monster/action/index'
import {
  describeLimitedUse,
  formatLimitedUseNotation,
  limitedUseSchema,
  type LimitedUse,
} from '../../primitives/limited-use'
import { getAbilityLabel } from '../../vocab/ability'
import { getResolutionOutcomeResultStatBlockLead } from '../../vocab/resolution'
import {
  formatMonsterSpellComponentOmissionClause,
  joinMonsterSpellCastingIntroSegments,
} from './spell-component-omission'
import type { MonsterReferencedSpell } from './reaction-trigger'
import { type MonsterActionSectionId } from '../../content/spell/casting-economy'
import { formatSpellCastAtLevelName } from '../../content/spell/format-spell-cast-level'
import {
  presentSpellReferenceDisplayName,
  resolveSpellReferenceOutcomeForCatalogStatus,
} from '../../content/spell/spell-reference'
import type { Spell } from '../../content/spell/body'

import {
  joinStatBlockProsePlainText,
  statBlockOutcomeLead,
  type StatBlockProse,
  type StatBlockProseDocument,
  type StatBlockProseSegment,
} from '../prose/stat-block-prose'

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

function spellPlainName(
  spellId: string,
  spellsById: ReadonlyMap<string, MonsterReferencedSpell> | undefined,
  catalogStatus: 'ready' | 'unavailable',
): string {
  return presentSpellReferenceDisplayName(
    resolveSpellReferenceOutcomeForCatalogStatus(spellId, {
      catalogStatus,
      spellsById: spellsById as ReadonlyMap<string, Spell> | undefined,
    }),
  )
}

function listPhraseSegments(
  spellLists: readonly StatBlockProseSegment[][],
): StatBlockProseSegment[] {
  if (spellLists.length === 0) return []
  if (spellLists.length === 1) return [...spellLists[0]!]
  if (spellLists.length === 2) {
    return [...spellLists[0]!, { kind: 'text', value: ' or ' }, ...spellLists[1]!]
  }
  const segments: StatBlockProseSegment[] = []
  for (let index = 0; index < spellLists.length; index += 1) {
    if (index > 0) {
      segments.push(
        index === spellLists.length - 1
          ? { kind: 'text', value: ', or ' }
          : { kind: 'text', value: ', ' },
      )
    }
    segments.push(...spellLists[index]!)
  }
  return segments
}

function spellNamePlain(
  spell: SpellRow,
  spellsById: ReadonlyMap<string, MonsterReferencedSpell> | undefined,
  catalogStatus: 'ready' | 'unavailable',
  castAtLevel: number | undefined = spell.castAtLevel,
): string {
  if (!spell.spellId) {
    return presentSpellReferenceDisplayName({
      status: 'unresolved',
      spellId: '',
      reason: 'unknown-spell',
    })
  }
  const plain = spellPlainName(spell.spellId, spellsById, catalogStatus)
  const level = catalogStatus === 'ready' ? spellsById?.get(spell.spellId)?.level : undefined
  return formatSpellCastAtLevelName({ name: plain, castAtLevel, spellLevel: level })
}

function spellNameSegments(plainFullName: string): StatBlockProseSegment[] {
  const parenIndex = plainFullName.indexOf(' (')
  if (parenIndex === -1) {
    return [{ kind: 'text', value: plainFullName, emphasis: 'italic' }]
  }
  return [
    { kind: 'text', value: plainFullName.slice(0, parenIndex), emphasis: 'italic' },
    { kind: 'text', value: plainFullName.slice(parenIndex) },
  ]
}

function joinCommaSeparatedSpellLists(
  spellLists: readonly StatBlockProseSegment[][],
): StatBlockProseSegment[] {
  const segments: StatBlockProseSegment[] = []
  for (let index = 0; index < spellLists.length; index += 1) {
    if (index > 0) segments.push({ kind: 'text', value: ', ' })
    segments.push(...spellLists[index]!)
  }
  return segments
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

function groupLineProse(
  spells: readonly SpellRow[],
  limitedUse: LimitedUse | undefined,
  spellsById: ReadonlyMap<string, MonsterReferencedSpell> | undefined,
  catalogStatus: 'ready' | 'unavailable',
  entry: SpellEntry,
  spellsInBody: ReadonlyMap<string, SpellEntry>,
): StatBlockProse {
  const spellLists = spells.map((spell) =>
    spellNameSegments(
      spellNamePlain(
        spell,
        spellsById,
        catalogStatus,
        inheritedCastAtLevel(spell, entry, spellsInBody),
      ),
    ),
  )
  const each = limitedUse && spells.length > 1 ? ' Each' : ''
  const label = limitedUse
    ? `${formatLimitedUseNotation(limitedUse, 'stat-block')}${each}`
    : 'At Will'
  return [
    { kind: 'lead', treatment: 'paragraph', label },
    { kind: 'text', value: ' ' },
    ...joinCommaSeparatedSpellLists(spellLists),
  ]
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

function castingSentenceProse(args: {
  entry: SpellEntry
  monsterName: string
  section: MonsterSpellPresentationSection
  spellsById?: ReadonlyMap<string, MonsterReferencedSpell>
  catalogStatus: 'ready' | 'unavailable'
  spellsInBody: ReadonlyMap<string, SpellEntry>
  saveDcSuffix: string
}): StatBlockProse {
  const spellLists = args.entry.spells.map((spell) =>
    spellNameSegments(
      spellNamePlain(
        spell,
        args.spellsById,
        args.catalogStatus,
        inheritedCastAtLevel(spell, args.entry, args.spellsInBody),
      ),
    ),
  )
  const subject = formatMonsterStatBlockSubject(args.monsterName)
  const capitalSubject = subject.charAt(0).toUpperCase() + subject.slice(1)
  const response = args.section === 'reactions' ? " in response to the spell's trigger" : ''
  const omission = formatMonsterSpellComponentOmissionClause(args.entry.omittedComponents)
  const omissionSegment = omission ? `, ${omission}` : ''
  const namePhrase = listPhraseSegments(spellLists)
  if (args.entry.spellInvocation === 'use-entry' && args.entry.castingAbility?.kind === 'shared') {
    const target = args.spellsInBody.get(args.entry.castingAbility.entryId)
    return [
      { kind: 'text', value: `${capitalSubject} uses ${target?.name ?? 'that entry'} to cast ` },
      ...namePhrase,
      { kind: 'text', value: `${omissionSegment}.` },
    ]
  }
  return [
    { kind: 'text', value: `${capitalSubject} casts ` },
    ...namePhrase,
    {
      kind: 'text',
      value: `${response}${omissionSegment}, ${abilityPhrase(args.entry, args.spellsInBody, args.saveDcSuffix)}.`,
    },
  ]
}

export function formatLegendaryActionUsesIntro(args: {
  monsterName: string
  uses: { normal: number; inLair?: number }
  lairEnabled?: boolean
}): string {
  const subject = formatMonsterStatBlockSubject(args.monsterName)
  const capitalSubject = subject.charAt(0).toUpperCase() + subject.slice(1)
  const showInLair = args.lairEnabled === true && args.uses.inLair !== undefined
  const pool = showInLair
    ? `${args.uses.normal} (${args.uses.inLair} in Lair)`
    : String(args.uses.normal)
  return `Legendary Action Uses: ${pool}. Immediately after another creature's turn, ${subject} can expend a use to take one of the following actions. ${capitalSubject} regains all expended uses at the start of each of its turns.`
}

export function formatOnceUntilNextTurnProse(args: {
  monsterName: string
  kind: string
  hasSavingThrow?: boolean
}): StatBlockProse {
  const subject = formatMonsterStatBlockSubject(args.monsterName)
  const capitalSubject = subject.charAt(0).toUpperCase() + subject.slice(1)
  const sentence = `${capitalSubject} can't take this action again until the start of its next turn.`
  if (args.kind === 'save' || args.hasSavingThrow) {
    return statBlockOutcomeLead(
      getResolutionOutcomeResultStatBlockLead('failed-or-successful-save'),
      sentence,
    )
  }
  return [{ kind: 'text', value: sentence }]
}

export function formatOnceUntilNextTurnSentence(args: {
  monsterName: string
  kind: string
  /** Prose saving throw on a custom ability or trait. Structured saves use `kind`. */
  hasSavingThrow?: boolean
}): string {
  return joinStatBlockProsePlainText(formatOnceUntilNextTurnProse(args))
}

export function formatMonsterLimitedUseHeading(name: string, limitedUse?: LimitedUse): string {
  if (!limitedUse) return name
  return formatMonsterQualifiedHeading(name, { limitedUse })
}

/** Limited-use notation, then a form qualifier, joined in one heading parenthesis. */
export function formatMonsterQualifiedHeading(
  name: string,
  options: { limitedUse?: LimitedUse; formQualifier?: string } = {},
): string {
  const notation = options.limitedUse
    ? formatLimitedUseNotation(options.limitedUse, 'stat-block')
    : undefined
  const qualifier = options.formQualifier?.trim()
  const details = [notation, qualifier].filter((part): part is string => Boolean(part))
  if (details.length === 0) return name
  return `${name} (${details.join('; ')})`
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
}): { heading: string; bodyProse: StatBlockProseDocument } {
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
    ? [
        {
          kind: 'text' as const,
          value: `${capitalSubject} casts one of the following spells, ${joinMonsterSpellCastingIntroSegments(omissionClause, abilitySegment)}:`,
        },
      ]
    : undefined
  const bodyProse: StatBlockProseDocument = useGroupLabels
    ? [
        ...(groupedIntro ? [groupedIntro] : []),
        ...groups.map((group) =>
          groupLineProse(
            group.spells,
            group.limitedUse,
            args.spellsById,
            args.catalogStatus,
            args.entry,
            args.spellsInBody,
          ),
        ),
      ]
    : [castingSentenceProse({ ...args, saveDcSuffix })]
  return { heading, bodyProse }
}
