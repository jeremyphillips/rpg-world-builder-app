import { abilitySchema, type Ability } from '../../vocab/ability'
import { MONSTER_ACTION_SECTIONS, type MonsterActionSection } from './action-sections'

/** Conventional Actions-block name. Other spell rows do not use it by default. */
export const MONSTER_SPELLCASTING_ACTION_NAME = 'Spellcasting'

export type SpellCastingSourceRow = {
  id: string
  kind: string
  name?: string
  castingAbility?: { kind?: string; ability?: string; entryId?: string }
}

export type SpellCastingSections = {
  [K in MonsterActionSection]?: readonly SpellCastingSourceRow[]
}

export type ResolvedSpellCastingSource = {
  id: string
  section: MonsterActionSection
  ability: Ability
  name?: string
}

function directAbility(row: SpellCastingSourceRow): Ability | undefined {
  if (row.kind !== 'spell') return undefined
  const casting = row.castingAbility
  if (casting?.kind !== 'ability') return undefined
  const parsed = abilitySchema.safeParse(casting.ability)
  return parsed.success ? parsed.data : undefined
}

/** Spell rows that define an ability. Shared rows and attacks are not sources. */
export function listDirectSpellCastingSources(
  sections: SpellCastingSections,
): ResolvedSpellCastingSource[] {
  const sources: ResolvedSpellCastingSource[] = []
  for (const section of MONSTER_ACTION_SECTIONS) {
    if (section === 'legendaryActions') continue
    for (const row of sections[section] ?? []) {
      const ability = directAbility(row)
      if (!ability) continue
      sources.push({
        id: row.id,
        section,
        ability,
        ...(row.name !== undefined ? { name: row.name } : {}),
      })
    }
  }
  return sources
}

/** The spell row `entryId` points at, when that row defines its own ability. */
export function findSpellCastingSource(
  sections: SpellCastingSections,
  entryId: string,
): ResolvedSpellCastingSource | undefined {
  return listDirectSpellCastingSources(sections).find((source) => source.id === entryId)
}
