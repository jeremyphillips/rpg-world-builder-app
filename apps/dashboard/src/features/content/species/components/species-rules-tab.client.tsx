'use client'

import { useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Heading, Text } from '@rpg/ui'
import { FormItems } from '@rpg/ui/form'

import { disableFormItems } from '@/lib/disable-form-items'

import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { campaignRulesFromCtx } from '../../lib/form-options/content-campaign-rules'
import {
  characterConfigurationMulticlassingHref,
  LEVEL_LIMITS_FIELD_PREFIX,
  multiclassingPolicyFields,
  MULTICLASSING_FIELD_PREFIX,
  speciesLevelLimitsFields,
} from '../lib/species-rules-form-fields'
import {
  mergeCharacterCreationFormDefaults,
} from '../lib/species-rules-form-values'
import type { SpeciesCharacterCreationForm } from '../lib/species-rules-form-fields'

export interface SpeciesRulesTabProps {
  formCtx: ContentFormCtx
}

function RulesConfigLink({ campaignId }: { campaignId: string }) {
  return (
    <Link
      to={characterConfigurationMulticlassingHref(campaignId)}
      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
    >
      Campaign Rules → Multiclassing
    </Link>
  )
}

function RulesSectionDisabled({
  title,
  message,
  campaignId,
}: {
  title: string
  message: string
  campaignId: string
}) {
  return (
    <section className="space-y-2 rounded-md border border-border bg-muted/30 p-4">
      <Heading variant="subsection" as="h3">
        {title}
      </Heading>
      <Text variant="muted" className="text-sm">
        {message}
      </Text>
      <RulesConfigLink campaignId={campaignId} />
    </section>
  )
}

function MulticlassingDisabledState({ campaignId }: { campaignId: string }) {
  return (
    <div className="space-y-3 rounded-md border border-border bg-muted/30 p-4">
      <Text variant="muted" className="text-sm">
        Multiclassing is disabled for this campaign. Species multiclass policy and level limits are
        not editable until multiclassing is allowed in campaign rules.
      </Text>
      <RulesConfigLink campaignId={campaignId} />
    </div>
  )
}

function SpeciesRulesEditor({ formCtx }: { formCtx: ContentFormCtx }) {
  const { getValues, setValue } = useFormContext()
  const campaignRules = campaignRulesFromCtx(formCtx)
  const { requirements } = campaignRules.multiclassing
  const policyEnabled = requirements.speciesPolicy.enabled
  const limitsEnabled = requirements.speciesLevelLimits.enabled
  const campaignId = formCtx.campaignId ?? ''

  useEffect(() => {
    const current = getValues('characterCreation') as SpeciesCharacterCreationForm | undefined
    const next = mergeCharacterCreationFormDefaults(current, {
      policyEnabled,
      limitsEnabled,
    })

    if (JSON.stringify(current ?? {}) !== JSON.stringify(next)) {
      setValue('characterCreation', next, { shouldDirty: false })
    }
  }, [getValues, limitsEnabled, policyEnabled, setValue])

  const policyFields = useMemo(
    () => disableFormItems(multiclassingPolicyFields(formCtx), !policyEnabled),
    [formCtx, policyEnabled],
  )
  const levelLimitFields = useMemo(
    () => disableFormItems(speciesLevelLimitsFields(formCtx), !limitsEnabled),
    [formCtx, limitsEnabled],
  )

  if (!policyEnabled && !limitsEnabled) {
    return (
      <div className="space-y-3 rounded-md border border-border bg-muted/30 p-4">
        <Text variant="muted" className="text-sm">
          Enable species multiclass policy or species level limits in campaign rules to author
          species-specific multiclass data.
        </Text>
        <RulesConfigLink campaignId={campaignId} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {policyEnabled ? (
        <section className="space-y-4" aria-labelledby="species-multiclass-policy-heading">
          <Heading variant="subsection" as="h3" id="species-multiclass-policy-heading">
            Multiclass policy
          </Heading>
          <FormItems
            items={policyFields}
            idPrefix="species-multiclass-policy"
            namePrefix={MULTICLASSING_FIELD_PREFIX}
          />
        </section>
      ) : (
        <RulesSectionDisabled
          title="Multiclass policy"
          message="Species multiclass policy is not enabled in this campaign's multiclassing rules."
          campaignId={campaignId}
        />
      )}

      {limitsEnabled ? (
        <section className="space-y-4" aria-labelledby="species-level-limits-heading">
          <Heading variant="subsection" as="h3" id="species-level-limits-heading">
            Level limits
          </Heading>
          <FormItems
            items={levelLimitFields}
            idPrefix="species-level-limits"
            namePrefix={LEVEL_LIMITS_FIELD_PREFIX}
          />
        </section>
      ) : (
        <RulesSectionDisabled
          title="Level limits"
          message="Species level limits are not enabled in this campaign's multiclassing rules."
          campaignId={campaignId}
        />
      )}
    </div>
  )
}

/** Rules tab — species-authored multiclass policy and level limits, gated by campaign rules. */
export function SpeciesRulesTab({ formCtx }: SpeciesRulesTabProps) {
  const campaignRules = campaignRulesFromCtx(formCtx)

  if (!campaignRules.multiclassing.enabled) {
    return <MulticlassingDisabledState campaignId={formCtx.campaignId ?? ''} />
  }

  return <SpeciesRulesEditor formCtx={formCtx} />
}
