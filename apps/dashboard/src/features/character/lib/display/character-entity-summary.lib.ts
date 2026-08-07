import type {
  Character,
  CharacterBuildCatalogIndex,
  CharacterSummaryParts,
  CharacterType,
} from '@rpg/contracts'
import {
  CHARACTER_SUMMARY_SEPARATOR,
  formatCharacterSummary,
  formatCharacterSummarySegments,
  getCharacterTypeLabel,
} from '@rpg/contracts'

import { resolveDashboardCharacterSummaryParts } from './character-summary.lib'

export type CharacterEntitySummaryVm = {
  id: string
  name: string
  href?: string
  characterType: {
    value: CharacterType
    label: string
  }
  /**
   * Present only when structured species/classes are known from source.
   * Omitted when adapting from transport `{ summary }` alone.
   */
  parts?: CharacterSummaryParts
  /** Authoritative species/advancement identity string (no PC/NPC). */
  identitySummary: string
}

export type CharacterInlineSummaryOptions = {
  includeCharacterType: boolean
}

export function buildCharacterEntitySummaryVmFromCatalog(
  character: Pick<Character, 'id' | 'name' | 'classes' | 'species'>,
  catalogIndex: CharacterBuildCatalogIndex,
  ctx: {
    characterType: CharacterType
    href?: string
  },
): CharacterEntitySummaryVm {
  const parts = resolveDashboardCharacterSummaryParts(character, catalogIndex)

  return {
    id: character.id,
    name: character.name,
    href: ctx.href,
    characterType: {
      value: ctx.characterType,
      label: getCharacterTypeLabel(ctx.characterType),
    },
    parts,
    identitySummary: formatCharacterSummary(parts),
  }
}

export function buildCharacterEntitySummaryVmFromTransport(input: {
  id: string
  name: string
  summary: string
  characterType: CharacterType
  href?: string
}): CharacterEntitySummaryVm {
  return {
    id: input.id,
    name: input.name,
    href: input.href,
    characterType: {
      value: input.characterType,
      label: getCharacterTypeLabel(input.characterType),
    },
    identitySummary: input.summary,
  }
}

export function formatCharacterInlineSummary(
  vm: CharacterEntitySummaryVm,
  options: CharacterInlineSummaryOptions,
): string {
  const segments: string[] = []

  if (options.includeCharacterType) {
    segments.push(vm.characterType.label)
  }

  if (vm.parts) {
    segments.push(...formatCharacterSummarySegments(vm.parts))
  } else if (vm.identitySummary) {
    segments.push(vm.identitySummary)
  }

  return segments.filter(Boolean).join(CHARACTER_SUMMARY_SEPARATOR)
}

export function formatCharacterMixedHeadingSuffix(
  vm: CharacterEntitySummaryVm,
): string | undefined {
  const inlineSummary = formatCharacterInlineSummary(vm, { includeCharacterType: true })
  return inlineSummary ? ` · ${inlineSummary}` : undefined
}

export function buildCharacterEntityContextPresentation(vm: CharacterEntitySummaryVm): {
  heading: string
  headingSuffix?: string
  href?: string
} {
  return {
    heading: vm.name,
    headingSuffix: formatCharacterMixedHeadingSuffix(vm),
    href: vm.href,
  }
}

export function buildCharacterEntitySummarySearchText(vm: CharacterEntitySummaryVm): string {
  return [vm.name, formatCharacterInlineSummary(vm, { includeCharacterType: true })].join(' ')
}
