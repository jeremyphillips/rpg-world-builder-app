import type { CharacterRosterStatus } from '@rpg/contracts'
import { resolveContentDisplayFallback } from '@rpg/contracts'

import {
  buildEntitySurfaceLeadingMediaNode,
  type RelationshipListRowProps,
} from '@/features/content'

import { resolveCharacterRosterStatusPresentation } from '../campaign-roster-presentation'
import type { CharacterListCardData } from '../../components/character-list-card.lib'
import {
  buildCharacterEntityCardModel,
  buildCharacterEntitySummaryVmFromTransport,
} from './character-entity-summary.lib'

export type BuildCharacterListRowPresentationInput = {
  card: CharacterListCardData
  detailHref: string
  controllerLine?: string
  rosterStatus?: CharacterRosterStatus
}

export function buildCharacterListRowPresentation(
  input: BuildCharacterListRowPresentationInput,
): Pick<RelationshipListRowProps, 'title' | 'href' | 'description' | 'status' | 'leadingMedia'> {
  const vm = buildCharacterEntitySummaryVmFromTransport({
    id: input.card.id,
    name: input.card.name,
    summary: input.card.summary,
    characterType: 'pc',
    href: input.detailHref,
  })

  const identity = buildCharacterEntityCardModel(vm, {
    displayImage: input.card.displayImagesByRole?.portrait,
    status: input.rosterStatus
      ? (() => {
          const roster = resolveCharacterRosterStatusPresentation(input.rosterStatus)
          return [
            {
              kind: 'badge' as const,
              label: roster.label,
              appearance: roster.appearance,
              tone: roster.tone,
            },
          ]
        })()
      : undefined,
  })

  identity.fallback = resolveContentDisplayFallback({
    domain: 'character',
    surface: 'compact',
    characterType: 'pc',
  })

  const leadingMedia = buildEntitySurfaceLeadingMediaNode(identity, 'compact')

  const description = [input.card.summary, input.controllerLine].filter(Boolean).join(' · ')

  return {
    title: input.card.name,
    href: input.detailHref,
    description: description || undefined,
    status: identity.status,
    leadingMedia,
  }
}
