import type { MonsterAction, MonsterReaction } from '../../content/monster/action'
import {
  describeLimitedUse,
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

function spellName(
  spell: SpellRow,
  spellsById: ReadonlyMap<string, MonsterReferencedSpell> | undefined,
  catalogStatus: 'ready' | 'unavailable',
): string {
  if (!spell.spellId) return 'Unavailable spell'
  const label = spellLabel(spell.spellId, spellsById, catalogStatus).html
  const level = catalogStatus === 'ready' ? spellsById?.get(spell.spellId)?.level : undefined
  if (spell.castAtLevel === undefined) return label
  if (level !== undefined && spell.castAtLevel <= level) return label
  return `${label} (level ${spell.castAtLevel} version)`
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
  return `<p>${label}: ${names.join(', ')}</p>`
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

function castingSentence(args: {
  entry: SpellEntry
  monsterName: string
  section: MonsterActionSectionId
  spellsById?: ReadonlyMap<string, MonsterReferencedSpell>
  catalogStatus: 'ready' | 'unavailable'
  spellsInBody: ReadonlyMap<string, SpellEntry>
}): string {
  const labels = args.entry.spells.map((spell) =>
    spellName(spell, args.spellsById, args.catalogStatus),
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
  const groups = presentationGroups(args.entry.spells)
  const perSpellLimits = args.entry.spells.some((spell) => spell.limitedUse)
  const useGroupLabels =
    args.section !== 'reactions' && (groups.length > 1 || perSpellLimits) && !args.entry.limitedUse
  const bodyHtml = useGroupLabels
    ? groups
        .map((group) =>
          groupLine(group.spells, group.limitedUse, args.spellsById, args.catalogStatus),
        )
        .join('')
    : castingSentence(args)
  return { heading, bodyHtml }
}
