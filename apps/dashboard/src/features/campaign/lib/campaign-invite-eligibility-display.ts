import type {
  CharacterCampaignBlockingIssue,
  CharacterCampaignContentReferenceType,
  CharacterCampaignWarning,
  CharacterCampaignWarningCategory,
} from '@rpg/contracts'
import { primaryBlockingIssue } from '@rpg/contracts'

const CONTENT_REFERENCE_TYPE_LABELS: Record<CharacterCampaignContentReferenceType, string> = {
  species: 'Species',
  class: 'Class',
  subclass: 'Subclass',
  equipment: 'Equipment',
  spells: 'Spells',
  feats: 'Feats',
  proficiencies: 'Proficiencies',
  tools: 'Tools',
  languages: 'Languages',
  heritage: 'Heritage',
}

export function formatBlockingReason(issue: CharacterCampaignBlockingIssue): string {
  switch (issue.code) {
    case 'level_mismatch':
      return `Campaign starts at level ${issue.requiredLevel}`
    case 'conflicting_open_participation':
      return issue.conflictingCampaignName
        ? `Already participating in ${issue.conflictingCampaignName}`
        : 'Already participating in another campaign'
    case 'species_unavailable':
      return `${issue.label} is not available in this campaign`
    case 'class_unavailable':
      return `${issue.label} is not available in this campaign`
    case 'subclass_unavailable':
      return `${issue.label} is not available in this campaign`
    case 'content_missing':
      return `${CONTENT_REFERENCE_TYPE_LABELS[issue.contentType]} is not available in this campaign`
    case 'not_owned_pc':
      return 'You can only bring characters you own'
    case 'structurally_invalid':
      return 'Character data is incomplete or invalid'
    default:
      return 'Not eligible for this campaign'
  }
}

export const WARNING_CATEGORY_LABELS: Record<CharacterCampaignWarningCategory, string> = {
  equipment: 'Equipment',
  spells: 'Spells',
  feats: 'Feats',
  proficiencies: 'Proficiencies',
}

export function groupWarningsByCategory(
  warnings: readonly CharacterCampaignWarning[],
): Partial<Record<CharacterCampaignWarningCategory, CharacterCampaignWarning[]>> {
  return warnings.reduce<
    Partial<Record<CharacterCampaignWarningCategory, CharacterCampaignWarning[]>>
  >((groups, warning) => {
    const current = groups[warning.category] ?? []
    groups[warning.category] = [...current, warning]
    return groups
  }, {})
}

export function formatComboboxBlockingDescription(
  issues: readonly CharacterCampaignBlockingIssue[],
): string | undefined {
  const primary = primaryBlockingIssue(issues)
  if (!primary) return undefined

  const reason = formatBlockingReason(primary)
  const remaining = issues.length - 1
  if (remaining <= 0) return reason
  return `${reason} · ${remaining} more issue${remaining === 1 ? '' : 's'}`
}
