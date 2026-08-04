import type { GlobalSearchDocument, GlobalSearchField } from '@rpg/contracts'
import {
  formatCharacterSummary,
  getGlobalSearchFilterGroupTypeLabel,
  resolveCharacterSummaryParts,
} from '@rpg/contracts'

import { createCharacterSummaryLabelLookup } from '../../character'
import { buildCampaignContentEligibilityIndex } from '../../campaign-invite'
import { listCampaignCharactersForViewer } from '../../campaign'
import { listCampaignNpcs } from '../../campaign'
import type { SearchSource } from '../lib/search-source.types'

const CHARACTER_TYPE_LABEL = getGlobalSearchFilterGroupTypeLabel('characters')

function labelField(text: string): GlobalSearchField {
  return { text, weight: 1, role: 'label' }
}

function keywordField(text: string): GlobalSearchField {
  return { text, weight: 0.5, role: 'keyword' }
}

function buildPcDocument(
  title: string,
  secondary: string,
  characterId: string,
  fields: GlobalSearchField[],
): GlobalSearchDocument {
  return {
    id: `character:pc:${characterId}`,
    filterGroup: 'characters',
    typeLabel: CHARACTER_TYPE_LABEL,
    title,
    secondary,
    target: {
      kind: 'character',
      id: characterId,
      characterType: 'pc',
    },
    fields,
  }
}

function buildNpcDocument(
  character: { id: string; name: string },
  secondary: string,
  fields: GlobalSearchField[],
): GlobalSearchDocument {
  return {
    id: `character:npc:${character.id}`,
    filterGroup: 'characters',
    typeLabel: CHARACTER_TYPE_LABEL,
    title: character.name,
    secondary,
    target: {
      kind: 'character',
      id: character.id,
      characterType: 'npc',
    },
    fields,
  }
}

export const charactersSearchSource: SearchSource = {
  id: 'characters',
  async collect(ctx) {
    // Authoritative list paths only — destinations must stay navigable for this viewer
    // (PC list visibility + campaign NPC list; related sheet reads use participant access).
    const [pcs, npcs, contentIndex] = await Promise.all([
      listCampaignCharactersForViewer({
        campaignId: ctx.campaignId,
        viewerRole: ctx.viewerRole,
        viewerControlledCharacterIds: ctx.viewerControlledCharacterIds,
      }),
      listCampaignNpcs(ctx.campaignId),
      buildCampaignContentEligibilityIndex(ctx.campaignId),
    ])

    const lookup = createCharacterSummaryLabelLookup(contentIndex)
    const documents: GlobalSearchDocument[] = []

    for (const entry of pcs) {
      const summary = entry.character.summary
      documents.push(
        buildPcDocument(entry.character.name, summary, entry.character.id, [
          labelField(entry.character.name),
          keywordField(summary),
        ]),
      )
    }

    for (const entry of npcs) {
      const parts = resolveCharacterSummaryParts(entry.character, lookup)
      const secondary = formatCharacterSummary(parts)
      documents.push(
        buildNpcDocument(entry.character, secondary, [
          labelField(entry.character.name),
          keywordField(secondary),
        ]),
      )
    }

    return documents
  },
}
