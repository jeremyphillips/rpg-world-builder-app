import type { SpellCastingTime } from '../../vocab/spell/casting-time'

export type MonsterReferencedSpell = {
  name: string
  level?: number
  castingTime: SpellCastingTime
}

export type ReactionTriggerResolution =
  | { kind: 'authored'; text: string }
  | { kind: 'unspecified' }
  | {
      kind: 'spell-choices'
      additionalCondition?: { text: string }
      spells: Array<
        | { spellId: string; status: 'inherited'; trigger: string }
        | {
            spellId: string
            status: 'unresolved'
            reason: 'unknown-spell' | 'catalog-unavailable' | 'not-reaction'
          }
      >
    }

type ReactionLike = {
  kind: string
  trigger?: { text?: string }
  spells?: readonly { spellId?: string }[]
}

/** Resolves a reaction's trigger. An authored trigger never replaces a spell's own trigger. */
export function resolveMonsterReactionTrigger(args: {
  action: ReactionLike
  spellsById?: ReadonlyMap<string, MonsterReferencedSpell>
  catalogStatus: 'ready' | 'unavailable'
}): ReactionTriggerResolution {
  const authored = args.action.trigger?.text
  if (args.action.kind !== 'spell') {
    return authored ? { kind: 'authored', text: authored } : { kind: 'unspecified' }
  }

  const spellIds = (args.action.spells ?? []).flatMap((spell) =>
    spell.spellId ? [spell.spellId] : [],
  )
  const spells = spellIds.map((spellId) => {
    if (args.catalogStatus === 'unavailable') {
      return { spellId, status: 'unresolved' as const, reason: 'catalog-unavailable' as const }
    }
    const spell = args.spellsById?.get(spellId)
    if (!spell) {
      return { spellId, status: 'unresolved' as const, reason: 'unknown-spell' as const }
    }
    if (spell.castingTime.normal.unit !== 'reaction' || !spell.castingTime.normal.trigger) {
      return { spellId, status: 'unresolved' as const, reason: 'not-reaction' as const }
    }
    return {
      spellId,
      status: 'inherited' as const,
      trigger: spell.castingTime.normal.trigger.text,
    }
  })

  return {
    kind: 'spell-choices',
    ...(authored ? { additionalCondition: { text: authored } } : {}),
    spells,
  }
}
