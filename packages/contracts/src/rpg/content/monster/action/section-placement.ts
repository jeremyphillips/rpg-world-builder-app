import { z } from 'zod'

import {
  MONSTER_ACTION_KIND_ENTRIES,
  getMonsterActionKindLabel,
  type MonsterActionKind,
} from '../../../vocab/monster-action-kind'
import type { MonsterActionSection } from '../action-sections'

const SECTION_PLACEMENT_LABEL: Record<MonsterActionSection, string> = {
  actions: 'Actions',
  bonusActions: 'Bonus Actions',
  reactions: 'Reactions',
  legendaryActions: 'Legendary Actions',
}

export function monsterActionPlacementMessage(
  kind: MonsterActionKind,
  section: MonsterActionSection,
): string {
  return `${getMonsterActionKindLabel(kind)} can't be placed in ${SECTION_PLACEMENT_LABEL[section]}.`
}

function isMonsterActionKind(value: unknown): value is MonsterActionKind {
  return typeof value === 'string' && value in MONSTER_ACTION_KIND_ENTRIES
}

function readDiscriminatorValue(input: unknown, discriminator: string): unknown {
  if (!input || typeof input !== 'object' || !(discriminator in input)) return undefined
  return (input as Record<string, unknown>)[discriminator]
}

export function monsterSectionPlacementError(
  section: MonsterActionSection,
  discriminator = 'kind',
): z.core.$ZodErrorMap<z.core.$ZodIssueInvalidUnion> {
  return (issue) => {
    if (issue.code !== 'invalid_union' || issue.note !== 'No matching discriminator') {
      return undefined
    }
    const kind = readDiscriminatorValue(issue.input, discriminator)
    const allowed = Array.isArray(issue.options) ? issue.options : []
    if (
      isMonsterActionKind(kind) &&
      typeof kind === 'string' &&
      !allowed.some((option: unknown) => option === kind)
    ) {
      return { message: monsterActionPlacementMessage(kind, section) }
    }
    return undefined
  }
}

type DiscriminableTuple = readonly [
  z.core.$ZodTypeDiscriminable<'kind'>,
  z.core.$ZodTypeDiscriminable<'kind'>,
  ...z.core.$ZodTypeDiscriminable<'kind'>[],
]

export function monsterSectionDiscriminatedUnion<const T extends DiscriminableTuple>(
  section: MonsterActionSection,
  options: T,
) {
  return z.discriminatedUnion('kind', options, { error: monsterSectionPlacementError(section) })
}

/** Kind literals from an explicit section tuple (published and draft tuples must agree). */
export function monsterSectionKindLiterals(options: readonly z.ZodType[]): readonly string[] {
  return options.map((option) => {
    const value = (option as z.ZodObject<{ kind: z.ZodLiteral<string> }>).shape.kind.value
    if (typeof value !== 'string') {
      throw new Error('Section tuple option is missing a string kind literal.')
    }
    return value
  })
}
