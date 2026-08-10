'use client'

import * as React from 'react'
import type { UseFormReturn } from 'react-hook-form'

import type { CharacterBuildContext, OrganizationKind } from '@rpg/contracts'
import type { TabbedFormTab } from '@rpg/ui/form'

import {
  buildQuickNpcDetailsFields,
  buildQuickNpcRequirementsFields,
  buildQuickNpcTabs,
  type QuickNpcAuthoringTabValues,
  type QuickNpcSetupValues,
} from '../lib/quick-npc-form-fields'
import { buildQuickNpcRequirementOptionSets } from '../lib/quick-npc-requirement-options.lib'
import { useQuickNpcNameTrailingAction } from '../hooks/use-quick-npc-name-trailing-action.client'
import { QuickNpcRequirementsFields } from './quick-npc-requirements-fields.client'

export type QuickNpcAuthoringTabSynchronizerProps = {
  form: UseFormReturn<QuickNpcAuthoringTabValues>
  setup: QuickNpcSetupValues
  buildContext: CharacterBuildContext
  organization: {
    organizationKind: OrganizationKind
    organizationSubtype?: string
  }
  configuredCount: number
  onTabsChange: (tabs: TabbedFormTab[]) => void
}

/** Keeps Details tab name trailing-action config in sync with generation orchestration. */
export function QuickNpcAuthoringTabSynchronizer({
  form,
  setup,
  buildContext,
  organization,
  configuredCount,
  onTabsChange,
}: QuickNpcAuthoringTabSynchronizerProps) {
  const { trailingAction, nameHint } = useQuickNpcNameTrailingAction({
    speciesId: setup.speciesId,
    buildContext,
    form,
  })

  const membership = React.useMemo(
    () => ({
      kind: organization.organizationKind,
      ...(organization.organizationSubtype !== undefined
        ? { subtype: organization.organizationSubtype }
        : {}),
    }),
    [organization.organizationKind, organization.organizationSubtype],
  )

  React.useEffect(() => {
    const optionSets = buildQuickNpcRequirementOptionSets({
      setup,
      context: buildContext,
    })
    const hasRequirements = optionSets.weapons.length > 0 || optionSets.spells.length > 0

    onTabsChange(
      buildQuickNpcTabs({
        detailsFields: buildQuickNpcDetailsFields({
          membership,
          nameTrailingAction: trailingAction,
          nameHint,
        }),
        requirementsFields: hasRequirements ? buildQuickNpcRequirementsFields() : [],
        configuredCount,
        requirementsHeader: hasRequirements ? (
          <QuickNpcRequirementsFields optionSets={optionSets} />
        ) : undefined,
      }),
    )
  }, [buildContext, configuredCount, membership, nameHint, onTabsChange, setup, trailingAction])

  return null
}
