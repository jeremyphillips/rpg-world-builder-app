import { createElement } from 'react'

import type { ArrayItemShellRenderProps } from '@rpg/ui/form'
import { useRelationshipFieldContext } from '@rpg/ui/form'

import type { CharacterRelationshipFieldContext } from './character-relationship-field-context.types'

import { EntityDisclosureArrayItemShell } from '@/features/content/lib/entity/surfaces/cards/disclosure/entity-disclosure-array-item-shell'

import {
  resolveOrganizationMembershipPresentationFromValues,
  resolveResidencePresentationFromValues,
} from './character-relationship-presentation.lib'
import { CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY } from './character-relationship-vocabulary'
import type { CharacterRelationshipVocabulary } from './character-relationship-vocabulary'

function resolveRelationshipArrayPresentation(
  vocabulary: CharacterRelationshipVocabulary,
  values: Record<string, unknown>,
  context: CharacterRelationshipFieldContext,
) {
  if (vocabulary === CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY) {
    return resolveOrganizationMembershipPresentationFromValues(values, context)
  }

  return resolveResidencePresentationFromValues(values, context)
}

export function createCharacterRelationshipArrayItemShell(
  vocabulary: CharacterRelationshipVocabulary,
) {
  return function renderCharacterRelationshipArrayItemShell(props: ArrayItemShellRenderProps) {
    const { context } = useRelationshipFieldContext()
    const relationshipContext = context as CharacterRelationshipFieldContext
    const presentation = resolveRelationshipArrayPresentation(
      vocabulary,
      props.itemValues,
      relationshipContext,
    )
    const heading = presentation?.heading ?? props.header.fallback

    return createElement(EntityDisclosureArrayItemShell, {
      ...props,
      header: {
        ...props.header,
        primary: typeof heading === 'string' ? heading : props.header.primary,
      },
      classification: presentation?.classification,
      status: presentation?.status,
      headingHref: presentation?.headingHref,
      toolbarAriaLabel: presentation?.toolbarAriaLabel ?? props.header.ariaLabel,
    })
  }
}
