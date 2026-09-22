import type { FormItem } from '@rpg/ui/form'

import type { CharacterRelationshipFieldContext } from './character-relationship-field-context.types'
import { createCharacterRelationshipArrayItemShell } from './character-relationship-array-item-shell.lib'
import {
  CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY,
  CHARACTER_RESIDENCE_VOCABULARY,
  type CharacterRelationshipVocabulary,
} from './character-relationship-vocabulary'
import { CHARACTER_RELATIONSHIP_VOCABULARY_CONFIG } from './character-relationship-vocabulary-config'
import {
  resolveOrganizationMembershipPresentationFromValues,
  resolveResidencePresentationFromValues,
} from './character-relationship-presentation.lib'
import { characterOrganizationMembershipRelationshipAdapter } from './character-organization-membership-relationship.adapter'
import { characterResidenceRelationshipAdapter } from './character-residence-relationship.adapter'

const RELATIONSHIP_ADAPTERS = {
  [CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY]:
    characterOrganizationMembershipRelationshipAdapter,
  [CHARACTER_RESIDENCE_VOCABULARY]: characterResidenceRelationshipAdapter,
}

function buildCharacterRelationshipArrayField(
  vocabulary: CharacterRelationshipVocabulary,
  context: CharacterRelationshipFieldContext,
): FormItem {
  const config = CHARACTER_RELATIONSHIP_VOCABULARY_CONFIG[vocabulary]
  const adapter = RELATIONSHIP_ADAPTERS[vocabulary]
  const resolvePresentation =
    vocabulary === CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY
      ? resolveOrganizationMembershipPresentationFromValues
      : resolveResidencePresentationFromValues

  return {
    kind: 'array',
    name: config.fieldName,
    heading: config.heading,
    addAction: {
      label: config.addActionLabel,
      layout: 'inline',
      intercept: vocabulary,
    },
    resolveCanAppend: (items) => {
      const canAdd = adapter.canAdd?.(items as never, context) ?? true
      if (typeof canAdd === 'boolean') {
        return canAdd
          ? { enabled: true }
          : { enabled: false, reason: 'No more items can be added.' }
      }
      return canAdd
    },
    item: {
      collapsible: true,
      header: {
        fallback: (index) => `${config.emptyItemLabel} ${index + 1}`,
        primary: (values) => {
          const heading = resolvePresentation(values, context)?.heading
          return typeof heading === 'string' ? heading : undefined
        },
        summary: (values) => resolvePresentation(values, context)?.classification ?? '',
      },
      renderShell: createCharacterRelationshipArrayItemShell(vocabulary),
    },
    fields: [],
  }
}

export function buildCharacterOrganizationMembershipArrayField(
  context: CharacterRelationshipFieldContext,
): FormItem {
  return buildCharacterRelationshipArrayField(CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY, context)
}

export function buildCharacterResidenceArrayField(
  context: CharacterRelationshipFieldContext,
): FormItem {
  return buildCharacterRelationshipArrayField(CHARACTER_RESIDENCE_VOCABULARY, context)
}
