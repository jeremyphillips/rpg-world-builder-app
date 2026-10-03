import type {
  Character,
  CharacterBuildCatalogIndex,
  CharacterSummaryParts,
  CharacterType,
  ContentDisplayImage,
} from '@rpg/contracts'
import { resolveContentDisplayFallback } from '@rpg/contracts'

import type { EntitySurfaceIdentity, EntitySummaryStatusItem } from '@/features/content'
import {
  formatCharacterSummary,
  formatCharacterSummarySegments,
  getCharacterTypeLabel,
} from '@rpg/contracts'
import { joinInlineMetadata } from '@rpg/contracts/primitives'

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
  displayImage?: ContentDisplayImage
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

  return joinInlineMetadata(segments)
}

export function formatCharacterMixedClassification(
  vm: CharacterEntitySummaryVm,
): string | undefined {
  const inlineSummary = formatCharacterInlineSummary(vm, { includeCharacterType: true })
  return inlineSummary || undefined
}

export function buildCharacterEntityContextPresentation(vm: CharacterEntitySummaryVm): {
  heading: string
  classification?: string
  supportingText?: string
  href?: string
} {
  return {
    heading: vm.name,
    classification: vm.characterType.label,
    supportingText: vm.identitySummary || undefined,
    href: vm.href,
  }
}

export function buildCharacterEntitySummarySearchText(vm: CharacterEntitySummaryVm): string {
  return [vm.name, formatCharacterInlineSummary(vm, { includeCharacterType: true })].join(' ')
}

export type BuildCharacterEntityCardModelOptions = {
  /** When true, PC/NPC is part of the metadata line (organization member picker). */
  includeCharacterTypeInMetadata?: boolean
  /** When set, replaces the default metadata line from the VM. */
  metadata?: string
  status?: readonly EntitySummaryStatusItem[]
  displayImage?: ContentDisplayImage
}

export function buildCharacterEntityCardModel(
  vm: CharacterEntitySummaryVm,
  options: BuildCharacterEntityCardModelOptions = {},
): EntitySurfaceIdentity {
  const displayImage = options.displayImage ?? vm.displayImage
  const identity: EntitySurfaceIdentity = {
    heading: vm.name,
    fallback: resolveContentDisplayFallback({
      domain: 'character',
      surface: 'compact',
      characterType: vm.characterType.value,
    }),
    ...(displayImage ? { displayImage } : {}),
  }

  if (options.metadata !== undefined) {
    if (options.metadata) {
      identity.metadata = options.metadata
    }
  } else if (options.includeCharacterTypeInMetadata) {
    const metadata = formatCharacterInlineSummary(vm, { includeCharacterType: true })
    if (metadata) {
      identity.metadata = metadata
    }
  } else {
    identity.classification = vm.characterType.label
    if (vm.identitySummary) {
      identity.metadata = vm.identitySummary
    }
  }

  if (options.status && options.status.length > 0) {
    identity.status = options.status
  }

  return identity
}
