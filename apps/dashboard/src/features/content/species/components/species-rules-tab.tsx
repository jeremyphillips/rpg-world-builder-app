import { useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { Link } from 'react-router-dom'
import {
  Heading,
  InsetPanel,
  Text,
  emptyStateWellSupportingClasses,
  emptyStateWellTitleLgClasses,
} from '@rpg/ui'
import { FormItems } from '@rpg/ui/form'

import { AvailabilityAlert, campaignSettingHref, resolveAvailability } from '@/lib/availability'
import { disableFormItems } from '@/lib/disable-form-items'
import { getContentTypeMidSentenceLabel } from '@/features/content/lib/content-type-labels'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { campaignRulesFromCtx } from '../../lib/form-options/content-campaign-rules'
import {
  LEVEL_LIMITS_FIELD_PREFIX,
  multiclassingPolicyFields,
  MULTICLASSING_FIELD_PREFIX,
  speciesLevelLimitsFields,
} from '../lib/species-rules-form-fields'
import { mergeCharacterCreationFormDefaults } from '../lib/species-rules-form-values'
import type { SpeciesCharacterCreationForm } from '../lib/species-rules-form-fields'

export interface SpeciesRulesTabProps {
  formCtx: ContentFormCtx
}

function RulesConfigLink({ campaignId }: { campaignId: string }) {
  return (
    <Link
      to={campaignSettingHref(campaignId, 'characterCreation.multiclassing.enabled')}
      className="text-style-label text-primary underline-offset-4 hover:underline"
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
    <InsetPanel size="lg" className="flex flex-col gap-2">
      <Heading variant="subsection" as="h3" className={emptyStateWellTitleLgClasses}>
        {title}
      </Heading>
      <Text as="p" className={emptyStateWellSupportingClasses}>
        {message}
      </Text>
      <RulesConfigLink campaignId={campaignId} />
    </InsetPanel>
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
      <InsetPanel size="lg" className="flex flex-col gap-3">
        <Text as="p" className={emptyStateWellSupportingClasses}>
          {`Enable ${getContentTypeMidSentenceLabel('species')} multiclass policy or ${getContentTypeMidSentenceLabel('species')} level limits in campaign rules to author ${getContentTypeMidSentenceLabel('species')}-specific multiclass data.`}
        </Text>
        <RulesConfigLink campaignId={campaignId} />
      </InsetPanel>
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
    return (
      <AvailabilityAlert
        availability={resolveAvailability([
          {
            code: 'multiclassing-disabled',
            settingId: 'characterCreation.multiclassing.enabled',
          },
        ])}
        context={{ campaignId: formCtx.campaignId ?? '' }}
      />
    )
  }

  return <SpeciesRulesEditor formCtx={formCtx} />
}
