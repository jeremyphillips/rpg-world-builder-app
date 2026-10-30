import type { MonsterAction, MonsterReaction } from '../../content/monster/action'
import {
  formatLimitedUseNotation,
  limitedUseSchema,
  type LimitedUse,
} from '../../primitives/limited-use'
import { getAbilityLabel } from '../../vocab/ability'
import { SPELL_COMPONENT_ENTRIES, type SpellComponentId } from '../../vocab/spell/components'
import type { MonsterReferencedSpell } from './reaction-trigger'
import {
  MONSTER_SECTION_ECONOMY,
  type MonsterActionSectionId,
} from '../../content/spell/casting-economy'

type SpellEntry = Extract<MonsterAction | MonsterReaction, { kind: 'spell' }>

export function formatMonsterStatBlockSubject(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return 'the creature'
  return `the ${trimmed.toLowerCase()}`
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

function abilityPhrase(entry: SpellEntry, spellsInBody: ReadonlyMap<string, SpellEntry>): string {
  if (entry.castingAbility?.kind === 'shared') {
    const target = spellsInBody.get(entry.castingAbility.entryId)
    return `using the same spellcasting ability as ${target?.name ?? 'that entry'}`
  }
  if (entry.castingAbility?.kind === 'ability') {
    return `using ${getAbilityLabel(entry.castingAbility.ability)}`
  }
  return 'using its spellcasting ability'
}

function componentPhrase(omitted: readonly SpellComponentId[] | undefined): string {
  if (!omitted?.length) return ''
  const labels = omitted.map((id) => SPELL_COMPONENT_ENTRIES[id].label)
  return ` without ${listPhrase(labels)} components`
}

function groupLine(
  group: SpellEntry['spellGroups'][number],
  spellsById: ReadonlyMap<string, MonsterReferencedSpell> | undefined,
  catalogStatus: 'ready' | 'unavailable',
): string {
  const names = group.spellIds.map((spellId) => spellLabel(spellId, spellsById, catalogStatus).html)
  const each = group.limitedUse && group.spellIds.length > 1 ? ' Each' : ''
  const parsedLimit = limitedUseSchema.safeParse(group.limitedUse)
  const label = parsedLimit.success
    ? `${formatLimitedUseNotation(parsedLimit.data, 'stat-block')}${each}`
    : 'At Will'
  return `<p>${label}: ${names.join(', ')}</p>`
}

function castingSentence(args: {
  entry: SpellEntry
  monsterName: string
  section: MonsterActionSectionId
  spellsById?: ReadonlyMap<string, MonsterReferencedSpell>
  catalogStatus: 'ready' | 'unavailable'
  spellsInBody: ReadonlyMap<string, SpellEntry>
}): string {
  const labels = args.entry.spellGroups.flatMap((group) =>
    group.spellIds.map((spellId) => spellLabel(spellId, args.spellsById, args.catalogStatus).html),
  )
  const subject = formatMonsterStatBlockSubject(args.monsterName)
  const capitalSubject = subject.charAt(0).toUpperCase() + subject.slice(1)
  const response =
    MONSTER_SECTION_ECONOMY[args.section] === 'reaction'
      ? " in response to the spell's trigger"
      : ''
  return `<p>${capitalSubject} casts ${listPhrase(labels)}${response}, ${abilityPhrase(args.entry, args.spellsInBody)}${componentPhrase(args.entry.omittedComponents)}.</p>`
}

export function formatMonsterLimitedUseHeading(name: string, limitedUse?: LimitedUse): string {
  if (!limitedUse) return name
  return `${name} (${formatLimitedUseNotation(limitedUse, 'stat-block')})`
}

export function formatMonsterSpellEntry(args: {
  entry: SpellEntry
  monsterName: string
  section: MonsterActionSectionId
  spellsById?: ReadonlyMap<string, MonsterReferencedSpell>
  catalogStatus: 'ready' | 'unavailable'
  spellsInBody: ReadonlyMap<string, SpellEntry>
}): { heading: string; bodyHtml: string } {
  const entryLimit = limitedUseSchema.safeParse(args.entry.limitedUse)
  const heading = formatMonsterLimitedUseHeading(
    args.entry.name,
    entryLimit.success ? entryLimit.data : undefined,
  )
  const perSpellLimits = args.entry.spellGroups.some((group) => group.limitedUse)
  const useGroupLabels =
    args.section !== 'reactions' &&
    (args.entry.spellGroups.length > 1 || perSpellLimits) &&
    !args.entry.limitedUse
  const bodyHtml = useGroupLabels
    ? args.entry.spellGroups
        .map((group) => groupLine(group, args.spellsById, args.catalogStatus))
        .join('')
    : castingSentence(args)
  return { heading, bodyHtml }
}
