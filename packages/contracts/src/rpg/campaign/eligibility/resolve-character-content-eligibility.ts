import type { ResolvedContentCampaignAccess } from '../../content/lib/campaign-access'
import {
  isContentDiscoverableForViewer,
  type ContentViewer,
} from '../../content/lib/content-viewer-access'
import type { Character } from '../../runtime/character/sheet'
import type {
  CharacterCampaignBlockingIssue,
  CharacterCampaignWarning,
  CharacterCampaignWarningCategory,
} from './character-campaign-eligibility'

export type CampaignContentEligibilityEntry = {
  access: ResolvedContentCampaignAccess
  label: string
}

export type ResolveCharacterContentEligibilityInput = {
  character: Character
  campaignContentById: ReadonlyMap<string, CampaignContentEligibilityEntry>
  /**
   * Viewer for discovery checks. For existing-character onboarding use the
   * candidate's prospective context: `{ kind: 'pc', characterIds: [character.id] }`.
   * For new-character builder use `{ kind: 'none' }`.
   */
  viewer: ContentViewer
}

export type ResolveCharacterContentEligibilityResult = {
  blockingIssues: CharacterCampaignBlockingIssue[]
  warnings: CharacterCampaignWarning[]
}

type ContentReference =
  | {
      kind: 'blocking'
      code: 'species_unavailable' | 'class_unavailable' | 'subclass_unavailable'
      contentId: string
    }
  | {
      kind: 'warning'
      category: CharacterCampaignWarningCategory
      contentId: string
    }

function collectCharacterContentReferences(character: Character): ContentReference[] {
  const references: ContentReference[] = []

  references.push({
    kind: 'blocking',
    code: 'species_unavailable',
    contentId: character.species.id,
  })

  for (const classEntry of character.classes) {
    references.push({
      kind: 'blocking',
      code: 'class_unavailable',
      contentId: classEntry.classId,
    })

    if (classEntry.subclassId) {
      references.push({
        kind: 'blocking',
        code: 'subclass_unavailable',
        contentId: classEntry.subclassId,
      })
    }
  }

  const equipmentIds = [
    ...character.equipment.weapons.map((entry) => entry.equipmentId),
    ...character.equipment.armor.map((entry) => entry.equipmentId),
    ...character.equipment.gear.map((entry) => entry.equipmentId),
    ...(character.equipment.magicItems ?? []).map((entry) => entry.equipmentId),
  ]

  for (const contentId of equipmentIds) {
    references.push({ kind: 'warning', category: 'equipment', contentId })
  }

  for (const spell of character.spells) {
    references.push({ kind: 'warning', category: 'spells', contentId: spell.spellId })
  }

  for (const feat of character.feats) {
    references.push({ kind: 'warning', category: 'feats', contentId: feat.featId })
  }

  for (const skill of character.proficiencies.skills) {
    references.push({
      kind: 'warning',
      category: 'proficiencies',
      contentId: skill.skill,
    })
  }

  for (const tool of character.proficiencies.tools) {
    if (tool.toolId) {
      references.push({
        kind: 'warning',
        category: 'proficiencies',
        contentId: tool.toolId,
      })
    }
  }

  return references
}

export function resolveCharacterContentEligibility({
  character,
  campaignContentById,
  viewer,
}: ResolveCharacterContentEligibilityInput): ResolveCharacterContentEligibilityResult {
  const blockingIssues: CharacterCampaignBlockingIssue[] = []
  const warnings: CharacterCampaignWarning[] = []
  const seenBlocking = new Set<string>()
  const seenWarnings = new Set<string>()

  for (const reference of collectCharacterContentReferences(character)) {
    const entry = campaignContentById.get(reference.contentId)
    if (!entry) {
      continue
    }

    if (isContentDiscoverableForViewer(entry.access, viewer)) {
      continue
    }

    if (reference.kind === 'blocking') {
      const key = `${reference.code}:${reference.contentId}`
      if (seenBlocking.has(key)) {
        continue
      }
      seenBlocking.add(key)
      blockingIssues.push({
        code: reference.code,
        contentId: reference.contentId,
        label: entry.label,
      })
      continue
    }

    const warningKey = `${reference.category}:${reference.contentId}`
    if (seenWarnings.has(warningKey)) {
      continue
    }
    seenWarnings.add(warningKey)
    warnings.push({
      code: 'content_unavailable',
      category: reference.category,
      contentId: reference.contentId,
      label: entry.label,
    })
  }

  return { blockingIssues, warnings }
}
