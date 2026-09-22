import { createElement } from 'react'

import type { FormItem } from '@rpg/ui/form'

import { CharacterRelationshipApiTrailingControl } from '../../components/relationship/character-relationship-api-trailing-control'
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
import {
  resolveResidenceCanAppend,
  resolveResidenceSectionStatusCopy,
} from './character-residence-can-append.lib'

const RELATIONSHIP_ADAPTERS = {
  [CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY]:
    characterOrganizationMembershipRelationshipAdapter,
  [CHARACTER_RESIDENCE_VOCABULARY]: characterResidenceRelationshipAdapter,
}

export type BuildRelationshipArrayFieldInput = {
  vocabulary: CharacterRelationshipVocabulary
  context: CharacterRelationshipFieldContext
  disabled?: boolean
}

export function buildRelationshipArrayField({
  vocabulary,
  context,
  disabled = false,
}: BuildRelationshipArrayFieldInput): FormItem {
  const config = CHARACTER_RELATIONSHIP_VOCABULARY_CONFIG[vocabulary]
  const adapter = RELATIONSHIP_ADAPTERS[vocabulary]
  const resolvePresentation =
    vocabulary === CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY
      ? resolveOrganizationMembershipPresentationFromValues
      : resolveResidencePresentationFromValues
  const cardinality =
    vocabulary === CHARACTER_RESIDENCE_VOCABULARY ? ('one' as const) : ('many' as const)

  const residenceStatusCopy =
    vocabulary === CHARACTER_RESIDENCE_VOCABULARY
      ? resolveResidenceSectionStatusCopy(context)
      : undefined

  return {
    kind: 'array',
    name: config.fieldName,
    heading: residenceStatusCopy
      ? { ...config.heading, hint: residenceStatusCopy }
      : config.heading,
    addAction: {
      label: config.addActionLabel,
      layout: 'inline',
      relationship: { vocabulary, cardinality },
    },
    resolveCanAppend: (items) => {
      if (disabled) {
        return { enabled: false }
      }
      if (vocabulary === CHARACTER_RESIDENCE_VOCABULARY) {
        return resolveResidenceCanAppend(items as never, context)
      }
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
      defaultCollapsed: true,
      reorder: false,
      removable:
        context.mode === 'api'
          ? vocabulary === CHARACTER_RESIDENCE_VOCABULARY && !disabled
          : undefined,
      ...(context.mode === 'api' &&
      vocabulary === CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY &&
      !disabled
        ? {
            removeSlot: {
              name: '_characterRelationshipApiTrailing',
              render: () => createElement(CharacterRelationshipApiTrailingControl, { vocabulary }),
            },
          }
        : {}),
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
  return buildRelationshipArrayField({
    vocabulary: CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY,
    context,
  })
}

export function buildCharacterResidenceArrayField(
  context: CharacterRelationshipFieldContext,
): FormItem {
  return buildRelationshipArrayField({
    vocabulary: CHARACTER_RESIDENCE_VOCABULARY,
    context,
  })
}
