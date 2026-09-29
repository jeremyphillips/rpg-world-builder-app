import { useMemo } from 'react'
import { FormItems, FormRhythmStack, FormSectionContext, useFormSectionContext } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { buildOrganizationQuickCreateFollowOnFields } from '../../../lib/forms/organization-form-projection'
import type { OrganizationFormPresentation } from '../../lib/organization-form-presentation.lib'
import type { OrganizationPractice } from '@rpg/contracts'

import { useOrganizationAuthoringContext } from '../authoring/organization-authoring-context'

export type OrganizationQuickCreateProfileSectionsProps = {
  prefix?: string
  ctx: ContentFormCtx
  presentation: OrganizationFormPresentation
  selectedMemberClassAffinityIds?: readonly string[]
  selectedMemberSpeciesAffinityIds?: readonly string[]
  recommendedPracticeIds?: readonly OrganizationPractice[]
}

/** Quick-create profile + optional details — hidden until profile setup is entered. */
export function OrganizationQuickCreateProfileSections({
  prefix,
  ctx,
  presentation,
  selectedMemberClassAffinityIds,
  selectedMemberSpeciesAffinityIds,
  recommendedPracticeIds,
}: OrganizationQuickCreateProfileSectionsProps) {
  const { hasEnteredProfileSetup } = useOrganizationAuthoringContext()
  const slotContext = useFormSectionContext()
  const profileFieldsContext = useMemo(
    () => ({ ...slotContext, fieldChromeSuppressed: false }),
    [slotContext],
  )

  const items = useMemo(
    () =>
      buildOrganizationQuickCreateFollowOnFields(ctx, {
        prefix,
        presentation,
        selectedMemberClassAffinityIds,
        selectedMemberSpeciesAffinityIds,
        recommendedPracticeIds,
      }),
    [
      ctx,
      prefix,
      presentation,
      selectedMemberClassAffinityIds,
      selectedMemberSpeciesAffinityIds,
      recommendedPracticeIds,
    ],
  )

  if (presentation !== 'quick' || !hasEnteredProfileSetup) {
    return null
  }

  return (
    <FormSectionContext.Provider value={profileFieldsContext}>
      <FormRhythmStack>
        <FormItems items={items} idPrefix="" namePrefix={prefix} />
      </FormRhythmStack>
    </FormSectionContext.Provider>
  )
}
